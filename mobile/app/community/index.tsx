import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { WebSafeLink } from '@/components/WebSafeLink';
import { Screen } from '@/components/Screen';
import { EmptyState, LoadingState, OfflineBanner } from '@/components/StateBlocks';
import {
  createNeighborhoodFeedComment,
  createNeighborhoodFeedPost,
  getCurrentNeighborhood,
  listNeighborhoodFeedPosts,
  reportNeighborhoodFeedComment,
  reportNeighborhoodFeedPost,
  subscribeToNeighborhoodFeedPosts,
  toggleNeighborhoodFeedLike,
  type CurrentNeighborhood,
} from '@/lib/community-repository';
import { tokens } from '@/theme/tokens';
import type { NeighborhoodFeedComment, NeighborhoodFeedPost } from '@/types/contracts';

type RealtimeStatus = 'live' | 'reconnecting' | 'paused';

export default function CommunityFeedScreen() {
  const [neighborhood, setNeighborhood] = useState<CurrentNeighborhood>();
  const [posts, setPosts] = useState<NeighborhoodFeedPost[]>([]);
  const [body, setBody] = useState('');
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [busyId, setBusyId] = useState<string>();
  const [realtimeStatus, setRealtimeStatus] = useState<RealtimeStatus>('reconnecting');

  useEffect(() => {
    let unsubscribe: undefined | (() => void);
    let isMounted = true;

    async function loadFeed() {
      try {
        const currentNeighborhood = await getCurrentNeighborhood();
        const feedPosts = await listNeighborhoodFeedPosts(currentNeighborhood.id);

        if (!isMounted) return;
        setNeighborhood(currentNeighborhood);
        setPosts(feedPosts);
        unsubscribe = subscribeToNeighborhoodFeedPosts(
          currentNeighborhood.id,
          (post) => {
            setPosts((currentPosts) => {
              if (currentPosts.some((currentPost) => currentPost.id === post.id)) return currentPosts;
              return [post, ...currentPosts];
            });
          },
          (comment) => {
            setPosts((currentPosts) =>
              currentPosts.map((post) => {
                if (post.id !== comment.postId || post.comments.some((item) => item.id === comment.id)) return post;
                return { ...post, comments: [...post.comments, comment] };
              }),
            );
          },
          (postId) => {
            setPosts((currentPosts) => currentPosts.filter((post) => post.id !== postId));
          },
          (commentId) => {
            setPosts((currentPosts) =>
              currentPosts.map((post) => ({
                ...post,
                comments: post.comments.filter((comment) => comment.id !== commentId),
              })),
            );
          },
          setError,
          setRealtimeStatus,
        );
      } catch (caught) {
        if (isMounted) setError(caught instanceof Error ? caught.message : 'Could not load neighborhood feed.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadFeed();

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  async function publishPost() {
    if (!neighborhood || !body.trim()) return;

    setError(undefined);
    setIsPosting(true);

    try {
      const post = await createNeighborhoodFeedPost(neighborhood.id, body);
      setBody('');
      setPosts((currentPosts) => {
        if (currentPosts.some((currentPost) => currentPost.id === post.id)) return currentPosts;
        return [post, ...currentPosts];
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not publish post.');
    } finally {
      setIsPosting(false);
    }
  }

  async function publishReply(postId: string) {
    const reply = replyDrafts[postId]?.trim();
    if (!reply) return;

    setError(undefined);
    setBusyId(`reply-${postId}`);

    try {
      const comment = await createNeighborhoodFeedComment(postId, reply);
      setReplyDrafts((drafts) => ({ ...drafts, [postId]: '' }));
      setPosts((currentPosts) =>
        currentPosts.map((post) =>
          post.id === postId && !post.comments.some((item) => item.id === comment.id)
            ? { ...post, comments: [...post.comments, comment] }
            : post,
        ),
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not publish reply.');
    } finally {
      setBusyId(undefined);
    }
  }

  async function toggleLike(post: NeighborhoodFeedPost) {
    setError(undefined);
    setBusyId(`like-${post.id}`);

    try {
      const next = await toggleNeighborhoodFeedLike(post);
      setPosts((currentPosts) => currentPosts.map((item) => (item.id === post.id ? { ...item, ...next } : item)));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not update like.');
    } finally {
      setBusyId(undefined);
    }
  }

  async function reportPost(postId: string) {
    setError(undefined);
    setBusyId(`report-${postId}`);

    try {
      await reportNeighborhoodFeedPost(postId);
      setPosts((currentPosts) =>
        currentPosts.map((post) => (post.id === postId ? { ...post, isReported: true } : post)),
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not report post.');
    } finally {
      setBusyId(undefined);
    }
  }

  async function reportComment(comment: NeighborhoodFeedComment) {
    setError(undefined);
    setBusyId(`report-${comment.id}`);

    try {
      await reportNeighborhoodFeedComment(comment.id);
      setPosts((currentPosts) =>
        currentPosts.map((post) =>
          post.id === comment.postId
            ? {
                ...post,
                comments: post.comments.map((item) => (item.id === comment.id ? { ...item, isReported: true } : item)),
              }
            : post,
        ),
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not report reply.');
    } finally {
      setBusyId(undefined);
    }
  }

  if (isLoading) {
    return (
      <Screen title="Neighborhood feed">
        <LoadingState title="Loading neighborhood feed" />
      </Screen>
    );
  }

  return (
    <Screen title={neighborhood ? `${neighborhood.name} feed` : 'Neighborhood feed'}>
      <OfflineBanner />
      <View style={styles.topRow}>
        <View style={[styles.statusPill, styles[`${realtimeStatus}Status`]]}>
          <View style={[styles.statusDot, styles[`${realtimeStatus}Dot`]]} />
          <Text style={styles.statusText}>
            {realtimeStatus === 'live'
              ? 'Live updates on'
              : realtimeStatus === 'reconnecting'
                ? 'Reconnecting'
                : 'Live updates paused'}
          </Text>
        </View>
        <View style={styles.queueLinks}>
          <WebSafeLink href="/groups/membership-requests" asChild>
            <Pressable accessibilityRole="button" style={styles.queueButton}>
              <Text style={styles.queueText}>Membership requests</Text>
            </Pressable>
          </WebSafeLink>
          <WebSafeLink href="/community/moderation" asChild>
            <Pressable accessibilityRole="button" style={styles.queueButton}>
              <Text style={styles.queueText}>Content reports</Text>
            </Pressable>
          </WebSafeLink>
        </View>
      </View>
      {error ? <EmptyState title="Feed notice" body={error} /> : null}

      <View style={styles.composer}>
        <Text style={styles.label}>Share a local update</Text>
        <TextInput
          value={body}
          onChangeText={setBody}
          multiline
          maxLength={500}
          placeholder="Example: The water pressure is low near Lagos Avenue this morning."
          style={styles.input}
          accessibilityLabel="Neighborhood feed post"
        />
        <Text style={styles.helper}>Keep exact addresses and private contact details out of public posts.</Text>
        <Pressable disabled={isPosting || body.trim().length < 2} onPress={publishPost} style={styles.button}>
          <Text style={styles.buttonText}>{isPosting ? 'Posting...' : 'Post to feed'}</Text>
        </Pressable>
      </View>

      {posts.length === 0 ? (
        <EmptyState title="No posts yet" body="Verified neighborhood posts will appear here live." />
      ) : (
        <View style={styles.list}>
          {posts.map((post) => (
            <View key={post.id} style={styles.card}>
              <Text style={styles.author}>{post.authorName}</Text>
              <Text style={styles.body}>{post.body}</Text>
              <Text style={styles.time}>{new Date(post.createdAt).toLocaleString('en-GH')}</Text>

              <View style={styles.actions}>
                <Pressable
                  disabled={busyId === `like-${post.id}`}
                  onPress={() => toggleLike(post)}
                  style={styles.actionButton}
                >
                  <Text style={styles.actionText}>
                    {post.likedByMe ? 'Unlike' : 'Like'} · {post.likeCount}
                  </Text>
                </Pressable>
                <Pressable
                  disabled={post.isReported || busyId === `report-${post.id}`}
                  onPress={() => reportPost(post.id)}
                  style={styles.reportButton}
                >
                  <Text style={styles.reportText}>{post.isReported ? 'Reported' : 'Report'}</Text>
                </Pressable>
              </View>

              {post.comments.length ? (
                <View style={styles.replies}>
                  {post.comments.map((comment) => (
                    <View key={comment.id} style={styles.reply}>
                      <Text style={styles.author}>{comment.authorName}</Text>
                      <Text style={styles.body}>{comment.body}</Text>
                      <Pressable
                        disabled={comment.isReported || busyId === `report-${comment.id}`}
                        onPress={() => reportComment(comment)}
                      >
                        <Text style={styles.reportText}>{comment.isReported ? 'Reply reported' : 'Report reply'}</Text>
                      </Pressable>
                    </View>
                  ))}
                </View>
              ) : null}

              <View style={styles.replyBox}>
                <TextInput
                  value={replyDrafts[post.id] ?? ''}
                  onChangeText={(value) => setReplyDrafts((drafts) => ({ ...drafts, [post.id]: value }))}
                  placeholder="Write a reply"
                  style={styles.replyInput}
                  accessibilityLabel="Reply to feed post"
                />
                <Pressable
                  disabled={busyId === `reply-${post.id}` || !(replyDrafts[post.id] ?? '').trim()}
                  onPress={() => publishReply(post.id)}
                  style={styles.replyButton}
                >
                  <Text style={styles.replyButtonText}>{busyId === `reply-${post.id}` ? 'Replying...' : 'Reply'}</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  actionButton: { minHeight: 40, justifyContent: 'center', paddingHorizontal: tokens.spacing.sm },
  actionText: { color: tokens.color.primary, fontSize: tokens.type.support, fontWeight: '700' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.spacing.md },
  author: { color: tokens.color.textPrimary, fontSize: tokens.type.label, fontWeight: '700' },
  body: { color: tokens.color.textPrimary, fontSize: tokens.type.body },
  button: {
    backgroundColor: tokens.color.primary,
    borderRadius: tokens.radius.md,
    justifyContent: 'center',
    minHeight: tokens.touch.min,
    padding: tokens.spacing.lg,
  },
  buttonText: { color: '#FFFFFF', fontWeight: '700', textAlign: 'center' },
  card: {
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    gap: tokens.spacing.sm,
    padding: tokens.spacing.lg,
  },
  composer: {
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    gap: tokens.spacing.sm,
    padding: tokens.spacing.lg,
  },
  helper: { color: tokens.color.textSecondary, fontSize: tokens.type.support },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: tokens.color.border,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    color: tokens.color.textPrimary,
    fontSize: tokens.type.body,
    minHeight: 104,
    padding: tokens.spacing.md,
    textAlignVertical: 'top',
  },
  label: { color: tokens.color.textPrimary, fontSize: tokens.type.label, fontWeight: '700' },
  list: { gap: tokens.spacing.md },
  liveDot: { backgroundColor: tokens.color.success },
  liveStatus: { backgroundColor: '#EEF7F4', borderColor: tokens.color.success },
  pausedDot: { backgroundColor: tokens.color.error },
  pausedStatus: { backgroundColor: '#FDECEC', borderColor: tokens.color.error },
  queueLinks: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.spacing.sm },
  queueButton: {
    borderColor: tokens.color.primary,
    borderRadius: tokens.radius.pill,
    borderWidth: 1,
    minHeight: 32,
    justifyContent: 'center',
    paddingHorizontal: tokens.spacing.md,
  },
  queueText: { color: tokens.color.primary, fontSize: tokens.type.support, fontWeight: '700' },
  reconnectingDot: { backgroundColor: tokens.color.warning },
  reconnectingStatus: { backgroundColor: '#FFF4D6', borderColor: tokens.color.warning },
  replies: {
    borderLeftColor: tokens.color.border,
    borderLeftWidth: 2,
    gap: tokens.spacing.sm,
    paddingLeft: tokens.spacing.md,
  },
  reply: { gap: tokens.spacing.xs },
  replyBox: { flexDirection: 'row', gap: tokens.spacing.sm },
  replyButton: {
    backgroundColor: tokens.color.primary,
    borderRadius: tokens.radius.md,
    justifyContent: 'center',
    minHeight: tokens.touch.min,
    paddingHorizontal: tokens.spacing.md,
  },
  replyButtonText: { color: '#FFFFFF', fontWeight: '700' },
  replyInput: {
    backgroundColor: '#FFFFFF',
    borderColor: tokens.color.border,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    color: tokens.color.textPrimary,
    flex: 1,
    fontSize: tokens.type.body,
    minHeight: tokens.touch.min,
    padding: tokens.spacing.md,
  },
  reportButton: { minHeight: 40, justifyContent: 'center', paddingHorizontal: tokens.spacing.sm },
  reportText: { color: tokens.color.error, fontSize: tokens.type.support, fontWeight: '700' },
  statusDot: { borderRadius: 5, height: 10, width: 10 },
  statusPill: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: tokens.radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: tokens.spacing.xs,
    minHeight: 32,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.xs,
  },
  statusText: { color: tokens.color.textPrimary, fontSize: tokens.type.support, fontWeight: '700' },
  time: { color: tokens.color.textSecondary, fontSize: tokens.type.support },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing.sm,
    justifyContent: 'space-between',
  },
});
