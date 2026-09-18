import { Image, Text, View } from 'react-native';
import { useParentMedia } from './MediaGallery';
import type { MediaParent } from '@/lib/media-contract';

/** Noninteractive preview inside a parent card; playback belongs to its detail. */
export function MediaThumbnail({
  parent,
  parentId,
  round = false,
}: {
  parent: MediaParent;
  parentId?: string;
  round?: boolean;
}) {
  const media = useParentMedia(parent, parentId);
  const first = media.items[0];
  if (!first) return null;
  return (
    <View>
      <Image
        source={{ uri: first.posterUrl ?? first.url }}
        style={round ? { width: 64, height: 64, borderRadius: 32 } : { width: '100%', height: 160, borderRadius: 12 }}
        resizeMode="cover"
        accessibilityLabel={first.media_type === 'video' ? 'Video preview. Open for playback.' : 'Cover photo'}
      />
      {first.media_type === 'video' ? <Text>Video · tap to open</Text> : null}
    </View>
  );
}
