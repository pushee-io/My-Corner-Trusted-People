import { createContext, useCallback, useContext, useState, useSyncExternalStore, type ReactNode } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useParentMedia } from './MediaGallery';
import { listMedia } from '@/lib/media-repository';
import { mediaSessionRevision, subscribeMediaSession } from '@/lib/media-session';
import type { DisplayMedia } from '@/lib/media-contract';
import { tokens } from '@/theme/tokens';

const AvatarContext = createContext<DisplayMedia[] | null>(null);
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** One authorization/signing request for all authors on a visible feed. */
export function MediaAvatarCollection({ profileIds, children }: { profileIds: string[]; children: ReactNode }) {
  const revision = useSyncExternalStore(subscribeMediaSession, mediaSessionRevision, mediaSessionRevision);
  const ids = JSON.stringify([...new Set(profileIds.filter((id) => uuid.test(id)))].sort());
  const key = `${revision}:${ids}`;
  const [result, setResult] = useState<{ key: string; items: DisplayMedia[] }>({ key: '', items: [] });
  useFocusEffect(
    useCallback(() => {
      let active = true;
      void listMedia('profile', JSON.parse(ids) as string[])
        .then((items) => {
          if (active) setResult({ key, items });
        })
        .catch(() => {
          if (active) setResult({ key, items: [] });
        });
      return () => {
        active = false;
        setResult({ key: '', items: [] });
      };
    }, [ids, key]),
  );
  return <AvatarContext.Provider value={result.key === key ? result.items : []}>{children}</AvatarContext.Provider>;
}

export function AvatarImage({ asset, name, size = 44 }: { asset?: DisplayMedia; name: string; size?: number }) {
  const [failed, setFailed] = useState<string>();
  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || '?';
  const dimensions = { width: size, height: size, borderRadius: size / 2 };
  return asset && failed !== asset.url ? (
    <Image
      source={{ uri: asset.url }}
      style={dimensions}
      resizeMode="cover"
      accessibilityLabel={`${name} profile photo`}
      onError={() => setFailed(asset.url)}
    />
  ) : (
    <View style={[styles.fallback, dimensions]} accessibilityLabel={`${name} avatar`}>
      <Text style={[styles.initials, { fontSize: Math.round(size * 0.36) }]}>{initials}</Text>
    </View>
  );
}

export function MediaAvatar({
  profileId,
  name,
  size,
  refreshKey = 0,
}: {
  profileId?: string;
  name: string;
  size?: number;
  refreshKey?: number;
}) {
  const collection = useContext(AvatarContext);
  const individual = useParentMedia(
    'profile',
    collection === null && profileId && uuid.test(profileId) ? profileId : undefined,
    refreshKey,
  );
  const asset = collection === null ? individual.items[0] : collection.find((item) => item.parent_id === profileId);
  return <AvatarImage asset={asset} name={name} size={size} />;
}

const styles = StyleSheet.create({
  fallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#E8F2EE' },
  initials: { color: tokens.color.primary, fontWeight: '700' },
});
