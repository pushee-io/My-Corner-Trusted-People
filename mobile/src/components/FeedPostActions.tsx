import { useState } from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { IconButton } from '@/components/IconButton';
import { feedShareLink } from '@/lib/feed-share';
import type { NeighborhoodFeedPost } from '@/types/contracts';
import { tokens } from '@/theme/tokens';

export function FeedPostActions({
  post,
  reporting,
  onReport,
  liking,
  onLike,
  commentsExpanded,
  onComments,
}: {
  post: NeighborhoodFeedPost;
  reporting: boolean;
  onReport: () => void;
  liking: boolean;
  onLike: () => void;
  commentsExpanded: boolean;
  onComments: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <View style={styles.container}>
      <View testID="feed-action-row" style={styles.row}>
        <FeedCountAction
          icon={post.likedByMe ? 'heart' : 'heart-outline'}
          count={post.likeCount}
          label={`${post.likedByMe ? 'Unlike' : 'Like'} post, ${post.likeCount} likes`}
          selected={post.likedByMe}
          disabled={liking}
          onPress={onLike}
        />
        <FeedCountAction
          icon="chatbubble-outline"
          count={post.comments.length}
          label={`${post.comments.length} comments, ${commentsExpanded ? 'expanded' : 'collapsed'}`}
          expanded={commentsExpanded}
          onPress={onComments}
        />
        <FeedShareAction post={post} compact />
        <View style={styles.iconSlot}>
          <IconButton icon="ellipsis-horizontal" label="Post options" onPress={() => setExpanded(!expanded)} />
        </View>
      </View>
      {expanded ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={post.isReported ? 'Post reported' : 'Report post'}
          disabled={post.isReported || reporting}
          onPress={onReport}
          style={styles.action}
        >
          <Ionicons name="flag-outline" size={18} color={tokens.color.textSecondary} accessible={false} />
          <Text style={styles.label}>{post.isReported ? 'Reported' : 'Report post'}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
function FeedCountAction({
  icon,
  count,
  label,
  selected,
  expanded,
  disabled = false,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  count: number;
  label: string;
  selected?: boolean;
  expanded?: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected, expanded, disabled }}
      disabled={disabled}
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [
        styles.action,
        styles.countAction,
        selected && styles.selected,
        focused && styles.focused,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Ionicons
        name={icon}
        size={22}
        color={disabled ? tokens.color.disabledText : tokens.color.primary}
        accessible={false}
      />
      <Text style={[styles.label, disabled && styles.unavailable]}>{count}</Text>
    </Pressable>
  );
}
/** Keep the affordance consistent while retaining the existing moderation/share gate. */
export function FeedShareAction({ post, compact = false }: { post: NeighborhoodFeedPost; compact?: boolean }) {
  const [focused, setFocused] = useState(false);
  const [notice, setNotice] = useState('');
  const share = feedShareLink(post);
  return (
    <View style={compact ? styles.shareSlot : undefined}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Share post link"
        accessibilityHint={
          share
            ? 'Shares a link only. Recipients must sign in and have neighborhood access.'
            : 'Sharing is not available for this post yet.'
        }
        accessibilityState={{ disabled: !share }}
        disabled={!share}
        onPress={() => {
          if (share) void Share.share(share).catch(() => setNotice('Could not open sharing. Please try again.'));
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={({ pressed }) => [
          styles.action,
          compact && styles.compactShare,
          focused && styles.focused,
          pressed && styles.pressed,
        ]}
      >
        <Ionicons
          name="share-outline"
          size={22}
          color={share ? tokens.color.primary : tokens.color.disabledText}
          accessible={false}
        />
        {!compact ? <Text style={[styles.label, !share && styles.unavailable]}>Share</Text> : null}
      </Pressable>
      {notice ? (
        <Text accessibilityRole="alert" style={styles.notice}>
          {notice}
        </Text>
      ) : null}
    </View>
  );
}
const styles = StyleSheet.create({
  unavailable: { color: tokens.color.disabledText },
  container: { gap: 0 },
  row: { flexDirection: 'row', alignItems: 'flex-start', borderTopWidth: 1, borderTopColor: tokens.color.borderSubtle },
  countAction: { flex: 1, justifyContent: 'center', paddingHorizontal: 4 },
  shareSlot: { flex: 1, minWidth: tokens.touch.min },
  iconSlot: { flex: 1, minWidth: tokens.touch.min, alignItems: 'center' },
  compactShare: { justifyContent: 'center', paddingHorizontal: 4 },
  selected: { backgroundColor: tokens.color.successSurface },
  focused: { borderColor: tokens.color.focusRing },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: tokens.touch.min,
    minWidth: tokens.touch.min,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  label: { color: tokens.color.primary, fontSize: 14, fontWeight: '600' },
  notice: { color: tokens.color.textSecondary, fontSize: 13 },
  pressed: { backgroundColor: tokens.color.surfacePressed },
});
