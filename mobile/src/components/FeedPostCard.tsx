import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { WebSafeLink } from '@/components/WebSafeLink';
import { CollapsibleComments } from '@/components/CollapsibleComments';
import { FeedPostActions } from '@/components/FeedPostActions';
import { FeedPostBody } from '@/components/FeedPostBody';
import { MediaAvatar } from '@/components/media/MediaAvatar';
import { MediaGallery } from '@/components/media/MediaGallery';
import { feedTimeLabel } from '@/lib/feed-time';
import type { NeighborhoodFeedPost } from '@/types/contracts';
import { tokens } from '@/theme/tokens';

/** Shared by the live Feed and its visual QA fixture; data and mutations stay with the screen. */
export function FeedPostCard({
  post,
  mediaRefresh,
  liking,
  reporting,
  replying,
  error,
  onLike,
  onReport,
  children,
}: {
  post: NeighborhoodFeedPost;
  mediaRefresh: number;
  liking: boolean;
  reporting: boolean;
  replying: boolean;
  error?: string;
  onLike: () => void;
  onReport: () => void;
  children: ComponentProps<typeof CollapsibleComments>['children'];
}) {
  return (
    <View testID="feed-post-card" style={styles.card}>
      <WebSafeLink href={{ pathname: '/neighbors/[profileId]', params: { profileId: post.authorId } }} asChild>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`View ${post.authorName}'s profile`}
          style={({ pressed }) => [styles.authorRow, pressed && styles.pressed]}
        >
          <MediaAvatar profileId={post.authorId} name={post.authorName} size={40} />
          <View style={styles.authorDetails}>
            <Text style={styles.author}>{post.authorName}</Text>
            <Text style={styles.time}>{feedTimeLabel(post.createdAt)}</Text>
          </View>
        </Pressable>
      </WebSafeLink>
      <FeedPostBody body={post.body} />
      <MediaGallery parent="neighborhood_post" parentId={post.id} refreshKey={mediaRefresh} />
      <CollapsibleComments
        id={post.id}
        count={post.comments.length}
        busy={replying}
        error={error}
        renderTrigger={({ expanded, open }) => (
          <FeedPostActions
            post={post}
            liking={liking}
            reporting={reporting}
            onLike={onLike}
            onReport={onReport}
            commentsExpanded={expanded}
            onComments={open}
          />
        )}
      >
        {children}
      </CollapsibleComments>
    </View>
  );
}
const styles = StyleSheet.create({
  card: {
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.borderSubtle,
    borderRadius: tokens.radius.card,
    borderWidth: 1,
    gap: 6,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 4,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: tokens.touch.min,
    borderRadius: tokens.radius.control,
  },
  authorDetails: { flex: 1, minWidth: 0 },
  author: { color: tokens.color.textPrimary, ...tokens.typography.button },
  time: { color: tokens.color.textSecondary, ...tokens.typography.caption },
  pressed: { backgroundColor: tokens.color.surfacePressed },
});
