import { FeedPostActions } from '@/components/FeedPostActions';
import { Ionicons } from '@expo/vector-icons';
import { ActionPill } from '@/components/ActionPill';
import { FeedPostBody } from '@/components/FeedPostBody';
import { useLocalSearchParams } from 'expo-router';
import { CollapsibleComments, dismissCommentKeyboard, useCommentDraft } from '@/components/CollapsibleComments';
import { MediaComposer, useMediaComposer } from '@/components/media/MediaComposer';
import { useMediaSubmission } from '@/components/media/useMediaSubmission';
import { MediaGallery } from '@/components/media/MediaGallery';
import { MediaAvatar, MediaAvatarCollection } from '@/components/media/MediaAvatar';
import { useEffect, useState } from 'react';
import { Keyboard, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
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
  const { postId } = useLocalSearchParams<{ postId?: string }>();
  const [neighborhood, setNeighborhood] = useState<CurrentNeighborhood>();
  const [posts, setPosts] = useState<NeighborhoodFeedPost[]>([]);
  const [body, setBody] = useState('');
  const [composerExpanded, setComposerExpanded] = useState(false);
  const [replyDrafts, setReplyDrafts] = useCommentDraft<Record<string, string>>({});
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);
  const media = useMediaComposer('neighborhood_post');
  const submission = useMediaSubmission<NeighborhoodFeedPost>(media, neighborhood?.id);
  const isPosting = submission.busy || media.busy;
  const [mediaRefresh, setMediaRefresh] = useState(0);
  const [busyId, setBusyId] = useState<string>();
  const [realtimeStatus, setRealtimeStatus] = useState<RealtimeStatus>('reconnecting');

  useEffect(() => {
    let unsubscribe: undefined | (() => void);
    let isMounted = true;

    async function loadFeed() {
      try {
        const currentNeighborhood = await getCurrentNeighborhood();
        const feedPosts = await listNeighborhoodFeedPosts(currentNeighborhood.id, postId);

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
  }, [postId]);

  async function publishPost() {
    if (!neighborhood || !body.trim()) return;

    setError(undefined);

    try {
      const post = await submission.submit((id) => createNeighborhoodFeedPost(neighborhood.id, body, id));
      if (!post) return;
      submission.clear();
      setMediaRefresh((value) => value + 1);
      Keyboard.dismiss();
      setBody('');
      setComposerExpanded(false);
      setPosts((currentPosts) => {
        if (currentPosts.some((currentPost) => currentPost.id === post.id)) return currentPosts;
        return [post, ...currentPosts];
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not publish post.');
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
      dismissCommentKeyboard();
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
      <Screen title="Neighborhood feed" showBottomNavigation={!composerExpanded}>
        <LoadingState title="Loading neighborhood feed" />
      </Screen>
    );
  }

  return (
    <Screen title={neighborhood ? `${neighborhood.name} feed` : 'Neighborhood feed'} showBottomNavigation={!composerExpanded}>
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
      </View>
      {error ? <EmptyState title="Feed notice" body={error} /> : null}

      {composerExpanded ? (
        <View style={styles.composer}>
          <View style={styles.composerHeading}>
            <Text accessibilityRole="header" style={styles.label}>
              What’s happening, neighbor?
            </Text>
            <ActionPill
              label="Close composer"
              disabled={isPosting || submission.locked}
              onPress={() => {
                Keyboard.dismiss();
                setComposerExpanded(false);
              }}
            />
          </View>
          <TextInput
            editable={!isPosting && !submission.locked}
            value={body}
            onChangeText={setBody}
            multiline
            maxLength={500}
            placeholder="Example: The water pressure is low near Lagos Avenue this morning."
            style={styles.input}
            accessibilityLabel="Neighborhood feed post"
          />
          <Text style={styles.helper}>Keep exact addresses and private contact details out of public posts.</Text>
          <MediaComposer controller={media} title="Photos and video" disabled={submission.busy} />
          {submission.locked ? (
            <Text style={styles.helper}>Retry this submission to finish saving the post and its media.</Text>
          ) : null}
          <ActionPill
            label={isPosting ? 'Posting...' : 'Post to feed'}
            disabled={isPosting || body.trim().length < 2}
            onPress={publishPost}
            primary
          />
        </View>
      ) : (
        <ActionPill
          label={body || media.drafts.length ? 'Continue your post' : 'What’s happening, neighbor?'}
          onPress={() => setComposerExpanded(true)}
        />
      )}

      {posts.filter((post) => !postId || post.id === postId).length === 0 ? (
        <EmptyState title="No posts yet" body="Verified neighborhood posts will appear here live." />
      ) : (
        <MediaAvatarCollection
          profileIds={posts.flatMap((post) => [
            post.authorId ?? '',
            ...post.comments.map((comment) => comment.authorId ?? ''),
          ])}
        >
          <View style={styles.list}>
            {posts
              .filter((post) => !postId || post.id === postId)
              .map((post) => (
                <View key={post.id} style={styles.card}>
                  <View style={styles.authorRow}>
                    <MediaAvatar profileId={post.authorId} name={post.authorName} />
                    <View style={styles.authorDetails}>
                      <WebSafeLink
                        href={{ pathname: '/neighbors/[profileId]', params: { profileId: post.authorId } }}
                        asChild
                      >
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`View ${post.authorName}'s profile`}
                          style={styles.authorLink}
                        >
                          <Text style={styles.author}>{post.authorName}</Text>
                        </Pressable>
                      </WebSafeLink>
                      <Text style={styles.time}>{new Date(post.createdAt).toLocaleString('en-GH')}</Text>
                    </View>
                  </View>
                  <FeedPostBody body={post.body} />
                  <MediaGallery parent="neighborhood_post" parentId={post.id} refreshKey={mediaRefresh} />

                  <View style={styles.actions}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`${post.likedByMe ? 'Unlike' : 'Like'} post, ${post.likeCount} likes`}
                      accessibilityState={{ selected: post.likedByMe, disabled: busyId === `like-${post.id}` }}
                      disabled={busyId === `like-${post.id}`}
                      onPress={() => toggleLike(post)}
                      style={({ pressed }) => [
                        styles.actionButton,
                        post.likedByMe && styles.liked,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Ionicons
                        name={post.likedByMe ? 'heart' : 'heart-outline'}
                        size={22}
                        color={tokens.color.primary}
                        accessible={false}
                      />
                      <Text style={styles.actionText}>
                        {post.likedByMe ? 'Unlike' : 'Like'} · {post.likeCount}
                      </Text>
                    </Pressable>
                    <FeedPostActions post={post} reporting={busyId === `report-${post.id}`} onReport={() => void reportPost(post.id)} />
                  </View>

                  <CollapsibleComments
                    id={post.id}
                    count={post.comments.length}
                    busy={busyId === `reply-${post.id}`}
                    error={error}
                  >
                    {({ onFocus, onBlur }) => (
                      <>
                        {post.comments.length ? (
                          <View style={styles.replies}>
                            {post.comments.map((comment) => (
                              <View key={comment.id} style={styles.reply}>
                                <View style={styles.authorRow}>
                                  <MediaAvatar profileId={comment.authorId} name={comment.authorName} size={32} />
                                  <Text style={[styles.author, styles.authorDetails]}>{comment.authorName}</Text>
                                </View>
                                <Text style={styles.body}>{comment.body}</Text>
                                <ActionPill
                                  label={comment.isReported ? 'Reply reported' : 'Report reply'}
                                  disabled={comment.isReported || busyId === `report-${comment.id}`}
                                  onPress={() => reportComment(comment)}
                                />
                              </View>
                            ))}
                          </View>
                        ) : null}

                        <View style={styles.replyBox}>
                          <TextInput
                            multiline
                            editable={busyId !== `reply-${post.id}`}
                            value={replyDrafts[post.id] ?? ''}
                            onChangeText={(value) => setReplyDrafts((drafts) => ({ ...drafts, [post.id]: value }))}
                            placeholder="Write a reply"
                            style={styles.replyInput}
                            accessibilityLabel="Reply to feed post"
                            onFocus={onFocus}
                            onBlur={onBlur}
                          />
                          <ActionPill
                            label={busyId === `reply-${post.id}` ? 'Replying...' : 'Reply'}
                            disabled={busyId === `reply-${post.id}` || !(replyDrafts[post.id] ?? '').trim()}
                            onPress={() => publishReply(post.id)}
                            primary
                          />
                        </View>
                      </>
                    )}
                  </CollapsibleComments>
                </View>
              ))}
          </View>
        </MediaAvatarCollection>
      )}
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    minHeight: tokens.touch.min,
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.md,
    borderRadius: tokens.radius.control,
  },
  liked: { backgroundColor: tokens.color.successSurface },
  pressed: { backgroundColor: tokens.color.surfacePressed },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: tokens.spacing.md },
  authorDetails: { flex: 1, minWidth: 0 },
  authorLink: { minHeight: tokens.touch.min, justifyContent: 'center' },
  composerHeading: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: tokens.spacing.sm },
  actionText: { color: tokens.color.primary, ...tokens.typography.label },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.spacing.md },
  author: { color: tokens.color.textPrimary, ...tokens.typography.button },
  body: { color: tokens.color.textPrimary, ...tokens.typography.body },
  card: {
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.borderSubtle,
    borderRadius: tokens.radius.card,
    borderWidth: 1,
    gap: tokens.spacing.sm,
    padding: tokens.spacing.lg,
  },
  composer: {
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.borderSubtle,
    borderRadius: tokens.radius.card,
    borderWidth: 1,
    gap: tokens.spacing.sm,
    padding: tokens.spacing.lg,
  },
  helper: { color: tokens.color.textSecondary, ...tokens.typography.metadata },
  input: {
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.controlBorder,
    borderRadius: tokens.radius.card,
    borderWidth: 1,
    color: tokens.color.textPrimary,
    fontSize: tokens.type.body,
    minHeight: 72,
    padding: tokens.spacing.md,
    textAlignVertical: 'top',
  },
  label: { color: tokens.color.textPrimary, ...tokens.typography.card, flexShrink: 1 },
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
    minHeight: tokens.touch.min,
    justifyContent: 'center',
    paddingHorizontal: tokens.spacing.md,
  },
  queueText: { color: tokens.color.primary, fontSize: tokens.type.support, fontWeight: '700' },
  reconnectingDot: { backgroundColor: tokens.color.warning },
  reconnectingStatus: { backgroundColor: '#FFF4D6', borderColor: tokens.color.warning },
  replies: { gap: tokens.spacing.md },
  reply: {
    gap: tokens.spacing.sm,
    paddingBottom: tokens.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: tokens.color.borderSubtle,
  },
  replyBox: { gap: tokens.spacing.sm },
  replyInput: {
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.controlBorder,
    borderRadius: tokens.radius.card,
    borderWidth: 1,
    color: tokens.color.textPrimary,
    ...tokens.typography.body,
    minHeight: tokens.touch.min,
    maxHeight: 160,
    textAlignVertical: 'top',
    padding: tokens.spacing.md,
  },
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
  time: { color: tokens.color.textSecondary, ...tokens.typography.caption },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing.sm,
    justifyContent: 'space-between',
  },
});
