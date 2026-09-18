import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { mediaLimits, validateMediaDrafts, type MediaDraft, type MediaParent } from '@/lib/media-contract';
import { pickMedia } from '@/lib/media-picker';
import { releaseLocalMedia } from '@/lib/media-local-files';
import { attachMedia, mediaEnabled, removeMedia, uploadMediaDraft } from '@/lib/media-repository';
import { assertMediaSession, mediaSessionRevision, subscribeMediaSession } from '@/lib/media-session';
import { tokens } from '@/theme/tokens';

export function useMediaComposer(parent: MediaParent, scope: string | null = '') {
  const revision = useSyncExternalStore(subscribeMediaSession, mediaSessionRevision, mediaSessionRevision);
  // Object identity also rejects a delayed operation after A → B → A routing.
  const key = useMemo(() => ({ revision, parent, scope }), [revision, parent, scope]);
  const activeKey = useRef(key);
  activeKey.current = key;
  const [enabled, setEnabled] = useState(false);
  const [drafts, setDrafts] = useState<MediaDraft[]>([]);
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const current = useRef(drafts);
  const working = useRef(false);
  const mounted = useRef(false);
  const [draftKey, setDraftKey] = useState(key);
  const isCurrent = () =>
    mounted.current && activeKey.current === key && mediaSessionRevision() === revision && scope !== null;
  const assertCurrent = () => {
    assertMediaSession(revision);
    if (!isCurrent()) throw new Error('The media form was closed.');
  };
  const finish = () => {
    if (!isCurrent()) return;
    working.current = false;
    setBusy(false);
  };
  const update = (next: MediaDraft[]) => {
    void releaseLocalMedia(
      current.current.filter((item) => !next.some((other) => other.id === item.id)).map((item) => item.id),
    );
    current.current = next;
    setDrafts(next);
  };
  useEffect(() => {
    let live = true;
    mounted.current = true;
    void releaseLocalMedia(current.current.map((item) => item.id));
    current.current = [];
    setDrafts([]);
    setError(undefined);
    setDraftKey(key);
    setEnabled(false);
    working.current = false;
    setBusy(false);
    if (scope !== null)
      void mediaEnabled()
        .then((value) => {
          if (live) setEnabled(value);
        })
        .catch(() => {});
    return () => {
      live = false;
      mounted.current = false;
      void releaseLocalMedia(current.current.map((item) => item.id));
      current.current = [];
    };
  }, [key, scope]);
  const patch = (id: string, change: Partial<MediaDraft>) => {
    if (!isCurrent()) return;
    update(current.current.map((item) => (item.id === id ? { ...item, ...change } : item)));
  };
  async function choose(source: 'camera' | 'library', kind: 'image' | 'video', replaceId?: string) {
    if (!isCurrent() || working.current) return;
    working.current = true;
    setBusy(true);
    setError(undefined);
    let selected: MediaDraft | null = null;
    try {
      const draft = await pickMedia(parent, source, kind);
      selected = draft;
      assertCurrent();
      if (!draft) return;
      const next = replaceId
        ? current.current.map((item) => (item.id === replaceId ? draft : item))
        : [...current.current, draft];
      const validation = validateMediaDrafts(parent, next);
      if (validation) throw new Error(validation);
      if (replaceId && current.current.find((x) => x.id === replaceId)?.status !== 'selected')
        await removeMedia(replaceId);
      assertCurrent();
      update(next);
      selected = null;
    } catch (caught) {
      if (selected) void releaseLocalMedia([selected.id]);
      if (isCurrent()) setError(caught instanceof Error ? caught.message : 'Could not select media.');
    } finally {
      finish();
    }
  }
  async function upload(item: MediaDraft) {
    try {
      assertCurrent();
      await uploadMediaDraft(parent, item, (change) => patch(item.id, change));
      assertCurrent();
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Upload failed. Tap Retry.';
      if (isCurrent()) patch(item.id, { status: 'failed', error: message });
      throw caught;
    }
  }
  async function uploadAll(): Promise<string[]> {
    assertCurrent();
    if (working.current) throw new Error('Wait for media preparation to finish.');
    if (!current.current.length) return [];
    if (!enabled) throw new Error('Media is temporarily unavailable. Your text is safe.');
    working.current = true;
    setBusy(true);
    setError(undefined);
    try {
      for (const item of current.current) if (item.status !== 'ready') await upload(item);
      assertCurrent();
      return current.current.map((item) => item.id);
    } finally {
      finish();
    }
  }
  async function retry(id: string) {
    const item = current.current.find((item) => item.id === id);
    if (!isCurrent() || !item || working.current) return;
    working.current = true;
    setBusy(true);
    try {
      await upload(item);
    } catch {
      /* The item displays the retryable error. */
    } finally {
      finish();
    }
  }
  async function remove(id: string) {
    if (!isCurrent() || working.current) return;
    working.current = true;
    setBusy(true);
    try {
      // A selection that has never uploaded has no server record to remove.
      if (current.current.find((item) => item.id === id)?.status !== 'selected') await removeMedia(id);
      assertCurrent();
      update(current.current.filter((item) => item.id !== id));
      setError(undefined);
    } catch (caught) {
      if (isCurrent()) setError(caught instanceof Error ? caught.message : 'Could not remove media.');
    } finally {
      finish();
    }
  }
  function move(id: string, direction: -1 | 1) {
    if (!isCurrent() || working.current) return;
    const next = [...current.current];
    const from = next.findIndex((item) => item.id === id);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= next.length) return;
    [next[from], next[to]] = [next[to], next[from]];
    update(next);
  }
  return {
    parent,
    enabled: scope !== null && key === draftKey && enabled,
    drafts: key === draftKey ? drafts : [],
    error: key === draftKey ? error : undefined,
    busy: key === draftKey && busy,
    choose,
    retry,
    remove,
    move,
    uploadAll,
    attach: async (id: string, ids: string[], replace = false) => {
      assertCurrent();
      await attachMedia(parent, id, ids, replace);
      assertCurrent();
    },
    clear: () => {
      if (!isCurrent()) return;
      update([]);
      setError(undefined);
    },
  };
}
export type MediaComposerController = ReturnType<typeof useMediaComposer>;
export function MediaComposer({
  controller,
  title = 'Add media',
  disabled = false,
}: {
  controller: MediaComposerController;
  title?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  if (!controller.enabled) return null;
  const policy = mediaLimits[controller.parent];
  const busy = controller.busy || disabled;
  return (
    <View style={styles.panel}>
      <Text accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      <Text style={styles.help}>
        {policy.images ? `Up to ${policy.images} ${policy.images === 1 ? 'photo' : 'photos'}` : ''}
        {policy.videos ? `${policy.images ? ' and ' : ''}one video · 30 seconds · 20 MB` : ''}. Avoid showing private
        addresses or personal documents.
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open, disabled: busy }}
        disabled={busy}
        onPress={() => setOpen(!open)}
        style={styles.button}
      >
        <Text style={styles.buttonText}>{controller.busy ? 'Preparing media…' : 'Add media'}</Text>
      </Pressable>
      {open ? (
        <View style={styles.actions}>
          {policy.images > 0 ? (
            <>
              <MediaAction label="Take photo" disabled={busy} action={() => controller.choose('camera', 'image')} />
              <MediaAction label="Choose photo" disabled={busy} action={() => controller.choose('library', 'image')} />
            </>
          ) : null}
          {policy.videos > 0 ? (
            <>
              <MediaAction label="Record video" disabled={busy} action={() => controller.choose('camera', 'video')} />
              <MediaAction label="Choose video" disabled={busy} action={() => controller.choose('library', 'video')} />
            </>
          ) : null}
        </View>
      ) : null}
      {controller.drafts.map((item, index) => (
        <View key={item.id} style={styles.attachment}>
          <Image
            source={{ uri: item.posterUri ?? item.uri }}
            style={styles.preview}
            resizeMode="cover"
            accessibilityLabel={`${item.kind === 'video' ? 'Video' : 'Photo'} preview ${index + 1}`}
          />
          <Text accessibilityLiveRegion="polite" style={styles.help}>
            {item.kind === 'video' ? 'Video' : 'Photo'} {index + 1} ·{' '}
            {item.status === 'selected'
              ? 'Ready to upload'
              : item.status === 'uploading'
                ? `Uploading ${Math.round(item.progress * 100)}%`
                : item.status === 'processing'
                  ? 'Processing…'
                  : item.status === 'ready'
                    ? 'Uploaded'
                    : item.error}
          </Text>
          <View style={styles.actions}>
            <MediaAction label={`Remove ${index + 1}`} disabled={busy} action={() => controller.remove(item.id)} />
            <MediaAction
              label={`Replace ${index + 1}`}
              disabled={busy}
              action={() => controller.choose('library', item.kind, item.id)}
            />
            {index > 0 ? (
              <MediaAction label="Move earlier" disabled={busy} action={() => controller.move(item.id, -1)} />
            ) : null}
            {index < controller.drafts.length - 1 ? (
              <MediaAction label="Move later" disabled={busy} action={() => controller.move(item.id, 1)} />
            ) : null}
            {item.status === 'failed' ? (
              <MediaAction label="Retry upload" disabled={busy} action={() => controller.retry(item.id)} />
            ) : null}
          </View>
        </View>
      ))}
      {controller.error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {controller.error}
        </Text>
      ) : null}
    </View>
  );
}
export function MediaAction({
  label,
  action,
  disabled = false,
}: {
  label: string;
  action: () => unknown;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={() => {
        void action();
      }}
      style={[styles.action, disabled && { opacity: 0.5 }]}
    >
      <Text style={styles.actionText}>{label}</Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  panel: { gap: 12 },
  title: { fontSize: 18, fontWeight: '700', color: tokens.color.textPrimary },
  help: { fontSize: 14, color: tokens.color.textSecondary },
  button: {
    minHeight: 48,
    backgroundColor: tokens.color.primary,
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '700', textAlign: 'center' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  action: {
    minHeight: 48,
    padding: 12,
    borderWidth: 1,
    borderColor: tokens.color.border,
    borderRadius: 8,
    justifyContent: 'center',
  },
  actionText: { color: tokens.color.primary, fontWeight: '600' },
  attachment: { gap: 8, padding: 12, borderWidth: 1, borderColor: tokens.color.border, borderRadius: 8 },
  preview: { width: '100%', height: 160, borderRadius: 8 },
  error: { color: tokens.color.error, fontSize: 14 },
});
