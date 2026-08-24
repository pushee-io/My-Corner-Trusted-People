import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { EmptyState, ErrorState, LoadingState } from '@/components/StateBlocks';
import { getCurrentProfile } from '@/lib/auth';
import {
  communityActionsRepository,
  getCommunityActionsReadRepository,
  type SocialGroupScreenSection,
} from '@/lib/community-actions-repository';
import { getGroupMembershipRepository } from '@/lib/group-membership-repository';
import {
  getSocialGroupDetailRepository,
  type SocialGroupPostComment,
  type SocialGroupPostDetail,
} from '@/lib/social-group-detail-repository';
import { tokens } from '@/theme/tokens';

const reportReasons = ['Spam or scam', 'Harassment or abuse', 'Unsafe or inappropriate'];

function membershipLabel(status: SocialGroupScreenSection['membershipStatus']) {
  if (status === 'accepted') return 'Member';
  if (status === 'pending') return 'Join request pending';
  if (status === 'rejected') return 'Join request not approved';
  if (status === 'removed') return 'Membership removed';
  return 'Not a member';
}

export default function GroupDetailScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const [section, setSection] = useState<SocialGroupScreenSection>();
  const [posts, setPosts] = useState<SocialGroupPostDetail[]>([]);
  const [postBody, setPostBody] = useState('');
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [commentingPostId, setCommentingPostId] = useState<string>();
  const [reportingPostId, setReportingPostId] = useState<string>();
  const [busyId, setBusyId] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!groupId) return;

    setIsLoading(true);
    setError(undefined);

    try {
      const defaultViewer = communityActionsRepository.defaultViewer;
      const viewer =
        communityActionsRepository.mode === 'supabase'
          ? { ...defaultViewer, profileId: (await getCurrentProfile()).id }
          : defaultViewer;
      const nextSection = (await getCommunityActionsReadRepository().listSocialGroupScreenSections(viewer)).find(
        (item) => item.group.id === groupId,
      );

      if (!nextSection) {
        setSection(undefined);
        setPosts([]);
        setError('This group is not available for your verified neighborhood.');
        return;
      }

      setSection(nextSection);
      setPosts(
        nextSection.membershipStatus === 'accepted' ? await getSocialGroupDetailRepository().listPosts(groupId) : [],
      );
    } catch {
      setError('Could not load this group. Check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [groupId]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  async function requestJoin() {
    if (!section) return;
    setBusyId('join');
    setError(undefined);

    try {
      const result = await getGroupMembershipRepository().requestMembership(section.group.id);
      if (result.created) {
        setNotice('Join request sent for moderator review.');
      } else if (result.status === 'accepted') {
        setNotice('You are already a member of this group.');
      } else {
        setNotice('Your join request is already pending.');
      }
      await refresh();
    } catch {
      setError('Could not send your join request. Check your connection and try again.');
    } finally {
      setBusyId(undefined);
    }
  }

  async function publishPost() {
    if (!section || postBody.trim().length < 2) return;
    setBusyId('post');
    setError(undefined);

    try {
      const post = await getSocialGroupDetailRepository().createPost(section.group.id, postBody);
      setPosts((current) => (current.some((item) => item.id === post.id) ? current : [post, ...current]));
      setPostBody('');
      setNotice('Group post submitted for moderation.');
    } catch {
      setError('Could not publish this group post. Check your connection and try again.');
    } finally {
      setBusyId(undefined);
    }
  }

  async function publishComment(postId: string) {
    const body = commentDrafts[postId]?.trim();
    if (!body) return;
    setBusyId(`comment-${postId}`);
    setError(undefined);

    try {
      const comment = await getSocialGroupDetailRepository().createComment(postId, body);
      setPosts((current) =>
        current.map((post) =>
          post.id === postId && !post.comments.some((item) => item.id === comment.id)
            ? { ...post, comments: [...post.comments, comment] }
            : post,
        ),
      );
      setCommentDrafts((current) => ({ ...current, [postId]: '' }));
      setCommentingPostId(undefined);
    } catch {
      setError('Could not add your comment. Check your connection and try again.');
    } finally {
      setBusyId(undefined);
    }
  }

  async function toggleLike(post: SocialGroupPostDetail) {
    setBusyId(`like-${post.id}`);
    setError(undefined);

    try {
      const like = await getSocialGroupDetailRepository().toggleLike(post);
      setPosts((current) => current.map((item) => (item.id === post.id ? { ...item, ...like } : item)));
    } catch {
      setError('Could not update this like. Check your connection and try again.');
    } finally {
      setBusyId(undefined);
    }
  }

  function sharePost(post: SocialGroupPostDetail) {
    if (!section) return;

    Alert.alert(
      'Share carefully',
      'This group is limited to verified neighbors. Make sure the author is comfortable with sharing outside it.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () =>
            void Share.share({
              title: section.group.name,
              message: `${post.authorName} in ${section.group.name}: ${post.body}`,
            }).catch(() => setError('Could not open sharing. Try again.')),
        },
      ],
    );
  }

  async function reportPost(postId: string, reason: string) {
    setBusyId(`report-${postId}`);
    setError(undefined);

    try {
      const result = await getSocialGroupDetailRepository().reportPost(postId, reason);
      setPosts((current) => current.map((post) => (post.id === postId ? { ...post, isReported: true } : post)));
      setReportingPostId(undefined);
      setNotice(
        result === 'already_reported' ? 'You already reported this post.' : 'Post reported for moderator review.',
      );
    } catch {
      setError('Could not submit this report. Check your connection and try again.');
    } finally {
      setBusyId(undefined);
    }
  }

  if (isLoading) {
    return (
      <Screen title="Group">
        <LoadingState title="Loading group" />
      </Screen>
    );
  }

  if (!section) {
    return (
      <Screen title="Group unavailable">
        <ErrorState title="Could not open group" body={error ?? 'This group is not available.'} onRetry={refresh} />
      </Screen>
    );
  }

  const acceptedMember = section.membershipStatus === 'accepted';

  return (
    <Screen title={section.group.name}>
      <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>Back to groups</Text>
      </Pressable>

      <View style={styles.groupHeader}>
        <Text style={styles.description}>{section.group.description}</Text>
        <Text style={styles.meta}>
          {section.group.memberCount} members |{' '}
          {section.group.visibility === 'verified_neighborhood_members'
            ? 'Verified neighborhood group'
            : 'Immediate cluster group'}
        </Text>
        <Text style={styles.membership}>{membershipLabel(section.membershipStatus)}</Text>
      </View>

      {notice ? (
        <Text accessibilityLiveRegion="polite" style={styles.notice}>
          {notice}
        </Text>
      ) : null}
      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}

      {!acceptedMember ? (
        <View style={styles.membershipPanel}>
          <Text style={styles.sectionTitle}>Join to participate</Text>
          <Text style={styles.helper}>Posts are available only to accepted group members.</Text>
          {section.membershipStatus === 'pending' ? (
            <Text style={styles.meta}>Your request is waiting for moderator review.</Text>
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ busy: busyId === 'join' }}
              disabled={busyId === 'join'}
              onPress={() => void requestJoin()}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>{busyId === 'join' ? 'Sending...' : 'Request to join'}</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <>
          <View style={styles.composer}>
            <Text style={styles.sectionTitle}>Post to this group</Text>
            <TextInput
              accessibilityLabel={`Post to ${section.group.name}`}
              maxLength={2000}
              multiline
              onChangeText={setPostBody}
              placeholder="Ask for a recommendation or share a useful local update."
              style={styles.postInput}
              textAlignVertical="top"
              value={postBody}
            />
            <View style={styles.composerFooter}>
              <Text style={styles.helper}>{postBody.length}/2000</Text>
              <Pressable
                accessibilityRole="button"
                disabled={busyId === 'post' || postBody.trim().length < 2}
                onPress={() => void publishPost()}
                style={[styles.primaryButton, busyId === 'post' || postBody.trim().length < 2 ? styles.disabled : null]}
              >
                <Text style={styles.primaryButtonText}>{busyId === 'post' ? 'Posting...' : 'Post'}</Text>
              </Pressable>
            </View>
            <Text style={styles.helper}>Do not include exact addresses or private contact details.</Text>
          </View>

          <Text accessibilityRole="header" style={styles.sectionTitle}>
            Recent posts
          </Text>

          {posts.length === 0 ? (
            <EmptyState title="No posts yet" body="Start the conversation with the first group post." />
          ) : (
            <View style={styles.postList}>
              {posts.map((post) => (
                <View key={post.id} style={styles.post}>
                  <Text style={styles.author}>{post.authorName}</Text>
                  <Text style={styles.postBody}>{post.body}</Text>
                  <Text style={styles.meta}>{new Date(post.createdAt).toLocaleString('en-GH')}</Text>

                  <View accessibilityRole="toolbar" style={styles.actions}>
                    <Pressable
                      accessibilityLabel={`${post.likedByMe ? 'Unlike' : 'Like'} post, ${post.likeCount} likes`}
                      disabled={busyId === `like-${post.id}`}
                      onPress={() => void toggleLike(post)}
                      style={styles.actionButton}
                    >
                      <Text style={[styles.actionText, post.likedByMe ? styles.actionTextActive : null]}>
                        {post.likedByMe ? 'Liked' : 'Like'} ({post.likeCount})
                      </Text>
                    </Pressable>
                    <Pressable
                      accessibilityLabel={`Comment on post by ${post.authorName}`}
                      onPress={() => setCommentingPostId(commentingPostId === post.id ? undefined : post.id)}
                      style={styles.actionButton}
                    >
                      <Text style={styles.actionText}>Comment ({post.comments.length})</Text>
                    </Pressable>
                    <Pressable
                      accessibilityLabel={`Share post by ${post.authorName}`}
                      onPress={() => sharePost(post)}
                      style={styles.actionButton}
                    >
                      <Text style={styles.actionText}>Share</Text>
                    </Pressable>
                    <Pressable
                      accessibilityLabel={post.isReported ? 'Post reported' : `Report post by ${post.authorName}`}
                      disabled={post.isReported || busyId === `report-${post.id}`}
                      onPress={() => setReportingPostId(reportingPostId === post.id ? undefined : post.id)}
                      style={styles.actionButton}
                    >
                      <Text style={styles.reportText}>{post.isReported ? 'Reported' : 'Report'}</Text>
                    </Pressable>
                  </View>

                  {reportingPostId === post.id && !post.isReported ? (
                    <View style={styles.reportPanel}>
                      <Text style={styles.reportTitle}>Why are you reporting this post?</Text>
                      {reportReasons.map((reason) => (
                        <Pressable
                          accessibilityRole="button"
                          disabled={busyId === `report-${post.id}`}
                          key={reason}
                          onPress={() => void reportPost(post.id, reason)}
                          style={styles.reportReason}
                        >
                          <Text style={styles.reportReasonText}>{reason}</Text>
                        </Pressable>
                      ))}
                      <Pressable onPress={() => setReportingPostId(undefined)} style={styles.actionButton}>
                        <Text style={styles.actionText}>Cancel</Text>
                      </Pressable>
                    </View>
                  ) : null}

                  {post.comments.length > 0 ? (
                    <View style={styles.comments}>
                      {post.comments.map((comment: SocialGroupPostComment) => (
                        <View key={comment.id} style={styles.comment}>
                          <Text style={styles.commentAuthor}>{comment.authorName}</Text>
                          <Text style={styles.commentBody}>{comment.body}</Text>
                        </View>
                      ))}
                    </View>
                  ) : null}

                  {commentingPostId === post.id ? (
                    <View style={styles.commentComposer}>
                      <TextInput
                        accessibilityLabel={`Comment on post by ${post.authorName}`}
                        maxLength={500}
                        onChangeText={(value) => setCommentDrafts((current) => ({ ...current, [post.id]: value }))}
                        placeholder="Write a comment"
                        style={styles.commentInput}
                        value={commentDrafts[post.id] ?? ''}
                      />
                      <Pressable
                        accessibilityRole="button"
                        disabled={busyId === `comment-${post.id}` || !(commentDrafts[post.id] ?? '').trim()}
                        onPress={() => void publishComment(post.id)}
                        style={styles.commentButton}
                      >
                        <Text style={styles.commentButtonText}>
                          {busyId === `comment-${post.id}` ? 'Sending...' : 'Send'}
                        </Text>
                      </Pressable>
                    </View>
                  ) : null}
                </View>
              ))}
            </View>
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: tokens.touch.min,
    paddingHorizontal: tokens.spacing.sm,
  },
  actions: {
    borderTopColor: tokens.color.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing.xs,
    paddingTop: tokens.spacing.xs,
  },
  actionText: { color: tokens.color.textSecondary, fontSize: tokens.type.support, fontWeight: '700' },
  actionTextActive: { color: tokens.color.primary },
  author: { color: tokens.color.textPrimary, fontSize: tokens.type.body, fontWeight: '700' },
  backButton: { alignSelf: 'flex-start', justifyContent: 'center', minHeight: tokens.touch.min },
  backText: { color: tokens.color.primary, fontSize: tokens.type.support, fontWeight: '700' },
  comment: { gap: tokens.spacing.xs },
  commentAuthor: { color: tokens.color.textPrimary, fontSize: tokens.type.support, fontWeight: '700' },
  commentBody: { color: tokens.color.textPrimary, fontSize: tokens.type.support, lineHeight: 20 },
  commentButton: {
    alignItems: 'center',
    backgroundColor: tokens.color.primary,
    borderRadius: tokens.radius.md,
    justifyContent: 'center',
    minHeight: tokens.touch.min,
    paddingHorizontal: tokens.spacing.md,
  },
  commentButtonText: { color: '#FFFFFF', fontSize: tokens.type.support, fontWeight: '700' },
  commentComposer: { flexDirection: 'row', gap: tokens.spacing.sm },
  commentInput: {
    borderColor: tokens.color.border,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    color: tokens.color.textPrimary,
    flex: 1,
    fontSize: tokens.type.body,
    minHeight: tokens.touch.min,
    paddingHorizontal: tokens.spacing.md,
  },
  comments: {
    borderLeftColor: tokens.color.primary,
    borderLeftWidth: 2,
    gap: tokens.spacing.md,
    paddingLeft: tokens.spacing.md,
  },
  composer: {
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    gap: tokens.spacing.sm,
    padding: tokens.spacing.lg,
  },
  composerFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: tokens.spacing.md,
    justifyContent: 'space-between',
  },
  description: { color: tokens.color.textPrimary, fontSize: tokens.type.body, lineHeight: 24 },
  disabled: { opacity: 0.5 },
  error: {
    backgroundColor: '#FDECEA',
    borderColor: tokens.color.error,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    color: tokens.color.error,
    padding: tokens.spacing.md,
  },
  groupHeader: { gap: tokens.spacing.xs },
  helper: { color: tokens.color.textSecondary, fontSize: tokens.type.support, lineHeight: 20 },
  membership: { color: tokens.color.primary, fontSize: tokens.type.support, fontWeight: '700' },
  membershipPanel: {
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    gap: tokens.spacing.md,
    padding: tokens.spacing.lg,
  },
  meta: { color: tokens.color.textSecondary, fontSize: tokens.type.support },
  notice: {
    backgroundColor: '#EEF7F4',
    borderColor: tokens.color.success,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    color: tokens.color.textPrimary,
    padding: tokens.spacing.md,
  },
  post: {
    backgroundColor: tokens.color.surface,
    borderBottomColor: tokens.color.border,
    borderBottomWidth: 1,
    gap: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.xl,
  },
  postBody: { color: tokens.color.textPrimary, fontSize: tokens.type.body, lineHeight: 24 },
  postInput: {
    borderColor: tokens.color.border,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    color: tokens.color.textPrimary,
    fontSize: tokens.type.body,
    minHeight: 112,
    padding: tokens.spacing.md,
  },
  postList: {
    borderColor: tokens.color.border,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  primaryButton: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: tokens.color.primary,
    borderRadius: tokens.radius.md,
    justifyContent: 'center',
    minHeight: tokens.touch.min,
    paddingHorizontal: tokens.spacing.lg,
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: tokens.type.support, fontWeight: '700' },
  reportPanel: { backgroundColor: '#FFF4D6', gap: tokens.spacing.xs, padding: tokens.spacing.md },
  reportReason: { justifyContent: 'center', minHeight: tokens.touch.min },
  reportReasonText: { color: tokens.color.error, fontSize: tokens.type.support, fontWeight: '700' },
  reportText: { color: tokens.color.error, fontSize: tokens.type.support, fontWeight: '700' },
  reportTitle: { color: tokens.color.textPrimary, fontSize: tokens.type.support, fontWeight: '700' },
  sectionTitle: { color: tokens.color.textPrimary, fontSize: tokens.type.card, fontWeight: '700' },
});
