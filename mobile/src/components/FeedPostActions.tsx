import { useState } from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { IconButton } from '@/components/IconButton';
import { feedShareLink } from '@/lib/feed-share';
import type { NeighborhoodFeedPost } from '@/types/contracts';
import { tokens } from '@/theme/tokens';

export function FeedPostActions({ post, reporting, onReport }: {
  post: NeighborhoodFeedPost; reporting: boolean; onReport: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [notice, setNotice] = useState('');
  const share = feedShareLink(post);
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {share ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Share post link"
            accessibilityHint="Shares a link only. Recipients must sign in and have neighborhood access."
            onPress={() => { void Share.share(share).catch(() => setNotice('Could not open sharing. Please try again.')); }}
            style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
            <Ionicons name="share-outline" size={22} color={tokens.color.primary} accessible={false} />
            <Text style={styles.label}>Share</Text>
          </Pressable>
        ) : null}
        <IconButton icon="ellipsis-horizontal" label="Post options" onPress={() => setExpanded(!expanded)} />
      </View>
      {expanded ? (
        <Pressable accessibilityRole="button" accessibilityLabel={post.isReported ? 'Post reported' : 'Report post'}
          disabled={post.isReported || reporting} onPress={onReport} style={styles.action}>
          <Ionicons name="flag-outline" size={18} color={tokens.color.textSecondary} accessible={false} />
          <Text style={styles.label}>{post.isReported ? 'Reported' : 'Report post'}</Text>
        </Pressable>
      ) : null}
      {notice ? <Text accessibilityRole="alert" style={styles.notice}>{notice}</Text> : null}
    </View>
  );
}
const styles = StyleSheet.create({
  container: { gap: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 48, paddingHorizontal: 10, borderRadius: 12 },
  label: { color: tokens.color.primary, fontSize: 14, fontWeight: '600' },
  notice: { color: tokens.color.textSecondary, fontSize: 13 },
  pressed: { backgroundColor: tokens.color.surfacePressed },
});
