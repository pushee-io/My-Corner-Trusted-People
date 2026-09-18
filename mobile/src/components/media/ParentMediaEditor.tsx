import { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { MediaAction, MediaComposer, useMediaComposer } from './MediaComposer';
import { MediaGallery, useParentMedia } from './MediaGallery';
import { AvatarImage } from './MediaAvatar';
import { removeMedia } from '@/lib/media-repository';
import { assertMediaSession, mediaSessionRevision } from '@/lib/media-session';
import type { MediaParent } from '@/lib/media-contract';
import { tokens } from '@/theme/tokens';

/** Edit media on an existing, server-authorized parent without recreating it. */
export function ParentMediaEditor({
  parent,
  parentId,
  title,
  name = 'Your',
}: {
  parent: MediaParent;
  parentId: string;
  title: string;
  name?: string;
}) {
  const media = useMediaComposer(parent);
  const mounted = useRef(false);
  const identity = `${parent}:${parentId}:${mediaSessionRevision()}`;
  const currentIdentity = useRef(identity);
  currentIdentity.current = identity;
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const [refresh, setRefresh] = useState(0);
  const existing = useParentMedia(parent, parentId, refresh);
  const [busy, setBusy] = useState(false);
  const working = useRef(false);
  const [notice, setNotice] = useState<string>();
  async function change(operation: (assertCurrent: () => void) => Promise<void>) {
    if (working.current) return;
    working.current = true;
    const revision = mediaSessionRevision();
    setBusy(true);
    setNotice(undefined);
    const assertCurrent = () => {
      assertMediaSession(revision);
      if (!mounted.current || currentIdentity.current !== identity) throw new Error('The media editor was closed.');
    };
    try {
      assertCurrent();
      await operation(assertCurrent);
      assertCurrent();
      setRefresh((value) => value + 1);
      setNotice('Media saved.');
    } catch (error) {
      if (mounted.current && currentIdentity.current === identity && revision === mediaSessionRevision())
        setNotice(error instanceof Error ? error.message : 'Could not save media. Retry.');
    } finally {
      working.current = false;
      if (mounted.current && currentIdentity.current === identity) setBusy(false);
    }
  }
  return (
    <View style={{ gap: 12 }}>
      <Text accessibilityRole="header" style={{ fontSize: 18, fontWeight: '700', color: tokens.color.textPrimary }}>
        {title}
      </Text>
      {parent === 'profile' || parent === 'group_avatar' ? (
        <AvatarImage asset={existing.items[0]} name={name} size={96} />
      ) : (
        <MediaGallery parent={parent} parentId={parentId} refreshKey={refresh} />
      )}
      {existing.error ? <Text accessibilityRole="alert">{existing.error}</Text> : null}
      {media.enabled
        ? existing.items.map((item, index) => (
            <MediaAction
              key={item.id}
              label={`Remove saved ${item.media_type === 'image' ? 'photo' : 'video'} ${index + 1}`}
              disabled={busy || media.busy}
              action={() => change(() => removeMedia(item.id))}
            />
          ))
        : null}
      <MediaComposer
        controller={media}
        title={parent === 'profile' ? 'Add or change profile picture' : `Add or change ${title.toLowerCase()}`}
        disabled={busy}
      />
      {media.enabled && media.drafts.length ? (
        <MediaAction
          label="Save media"
          disabled={busy || media.busy}
          action={() =>
            change(async (assertCurrent) => {
              const ids = await media.uploadAll();
              assertCurrent();
              await media.attach(parentId, ids);
              assertCurrent();
              media.clear();
            })
          }
        />
      ) : null}
      {notice ? (
        <Text accessibilityLiveRegion="polite" style={{ color: tokens.color.textSecondary }}>
          {notice}
        </Text>
      ) : null}
    </View>
  );
}
