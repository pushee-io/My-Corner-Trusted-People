import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { AppState, Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { listMedia } from '@/lib/media-repository';
import { mediaSessionRevision, subscribeMediaSession } from '@/lib/media-session';
import type { DisplayMedia, MediaParent } from '@/lib/media-contract';
import { MediaAction } from '@/components/media/MediaComposer';
import { tokens } from '@/theme/tokens';

export function useParentMedia(parent: MediaParent, parentId: string | undefined, refreshKey = 0) {
  parentId =
    parentId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(parentId) ? parentId : undefined;
  const revision = useSyncExternalStore(subscribeMediaSession, mediaSessionRevision, mediaSessionRevision);
  const [reload, setReload] = useState(0);
  const key = `${revision}:${parent}:${parentId ?? ''}:${refreshKey}:${reload}`;
  const [result, setResult] = useState<{ key: string; items: DisplayMedia[]; error?: string }>({ key: '', items: [] });
  useFocusEffect(
    useCallback(() => {
      let active = true;
      if (parentId)
        void listMedia(parent, [parentId])
          .then((items) => {
            if (active) setResult({ key, items });
          })
          .catch(() => {
            if (active) setResult({ key, items: [], error: 'Media could not load. Check your connection and retry.' });
          });
      return () => {
        active = false;
        setResult({ key: '', items: [] });
      };
    }, [key, parent, parentId]),
  );
  return {
    authorizationKey: key,
    items: result.key === key ? result.items : [],
    error: result.key === key ? result.error : undefined,
    reload: () => setReload((value) => value + 1),
  };
}
function PlayingVideo({ uri }: { uri: string }) {
  const player = useVideoPlayer({ uri, useCaching: false }, (value) => {
    value.muted = true;
    value.play();
  });
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') player.pause();
    });
    return () => subscription.remove();
  }, [player]);
  useFocusEffect(useCallback(() => () => player.pause(), [player]));
  return (
    <VideoView
      player={player}
      style={styles.video}
      contentFit="contain"
      nativeControls
      fullscreenOptions={{ enable: true }}
      accessibilityLabel="Video player"
    />
  );
}
export function MediaGallery({
  parent,
  parentId,
  refreshKey = 0,
  coverOnly = false,
}: {
  parent: MediaParent;
  parentId: string | undefined;
  refreshKey?: number;
  coverOnly?: boolean;
}) {
  const media = useParentMedia(parent, parentId, refreshKey);
  const revision = useSyncExternalStore(subscribeMediaSession, mediaSessionRevision, mediaSessionRevision);
  const focusGeneration = useRef(0);
  const [selected, setSelected] = useState<{
    id: string;
    revision: number;
    authorizationKey: string;
    parent: MediaParent;
    parentId: string | undefined;
    url: string;
    kind: 'image' | 'video';
  }>();
  // A viewer belongs to the authorization check that opened it. Hide it in the
  // first refresh render, before effects run, and require current membership in
  // the readable list. Signed URLs alone never keep a removed photo on screen.
  const visible =
    selected?.revision === revision &&
    selected.authorizationKey === media.authorizationKey &&
    selected.parent === parent &&
    selected.parentId === parentId &&
    media.items.some((item) => item.id === selected.id)
      ? selected
      : undefined;
  useFocusEffect(
    useCallback(
      () => () => {
        focusGeneration.current += 1;
        setSelected((current) => (current?.authorizationKey === media.authorizationKey ? undefined : current));
      },
      [media.authorizationKey],
    ),
  );
  async function open(item: DisplayMedia) {
    const generation = focusGeneration.current;
    try {
      const current =
        item.expiresAt > Date.now() ? item : (await listMedia(parent, [parentId!])).find((next) => next.id === item.id);
      if (revision !== mediaSessionRevision() || generation !== focusGeneration.current) return;
      if (!current) {
        media.reload();
        return;
      }
      setSelected({
        id: item.id,
        revision,
        authorizationKey: media.authorizationKey,
        parent,
        parentId,
        url: current.url,
        kind: current.media_type,
      });
    } catch {
      if (revision === mediaSessionRevision() && generation === focusGeneration.current) media.reload();
    }
  }
  if (media.error)
    return (
      <View>
        <Text style={styles.help}>{media.error}</Text>
        <MediaAction label="Retry media" action={media.reload} />
      </View>
    );
  return (
    <View style={styles.gallery}>
      {(coverOnly ? media.items.slice(0, 1) : media.items).map((item, index) => (
        <View key={item.id} style={styles.frame}>
          {visible?.id === item.id && visible.kind === 'video' ? (
            <>
              <PlayingVideo uri={visible.url} />
              <MediaAction label="Close video" action={() => setSelected(undefined)} />
            </>
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                item.media_type === 'video' ? `Play video ${index + 1}, starts muted` : `View photo ${index + 1}`
              }
              onPress={() => void open(item)}
            >
              <Image
                source={{ uri: item.posterUrl ?? item.url }}
                style={[styles.image, { aspectRatio: Math.max(0.7, Math.min(1.8, item.width / item.height)) }]}
                resizeMode="cover"
                accessibilityLabel={
                  item.alt_text || `${item.media_type === 'image' ? 'Photo' : 'Video preview'} ${index + 1}`
                }
              />
              {item.media_type === 'video' ? (
                <View style={styles.play}>
                  <Text style={styles.playText}>▶ Play video · {Math.round(item.duration_seconds ?? 0)}s</Text>
                </View>
              ) : null}
            </Pressable>
          )}
        </View>
      ))}
      <Modal
        visible={visible?.kind === 'image'}
        transparent
        animationType="none"
        onRequestClose={() => setSelected(undefined)}
      >
        <View style={styles.modal}>
          <Pressable accessibilityRole="button" onPress={() => setSelected(undefined)} style={styles.close}>
            <Text style={styles.playText}>Close photo</Text>
          </Pressable>
          {visible?.kind === 'image' ? (
            <Image
              source={{ uri: visible.url }}
              resizeMode="contain"
              style={styles.expanded}
              accessibilityLabel="Expanded photo"
            />
          ) : null}
        </View>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  gallery: { gap: 12 },
  frame: { overflow: 'hidden', borderRadius: 12, backgroundColor: '#E8F2EE' },
  image: { width: '100%', maxHeight: 400 },
  video: { width: '100%', height: 260 },
  play: { padding: 12, minHeight: 48, justifyContent: 'center', backgroundColor: tokens.color.primary },
  playText: { color: '#fff', fontWeight: '700', textAlign: 'center' },
  help: { color: tokens.color.textSecondary },
  modal: { flex: 1, backgroundColor: '#102A43', padding: 24, paddingTop: 60 },
  expanded: { flex: 1, width: '100%' },
  close: { minHeight: 48, padding: 16 },
});
