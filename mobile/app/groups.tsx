import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '@/components/Screen';
import {
  createSocialGroupPostAction,
  defaultDay3NeighborhoodContext,
  getSocialGroupScreenSections,
  requestSocialGroupMembership,
} from '@/lib/day3-community-repository';
import { tokens } from '@/theme/tokens';
import type { SocialGroupScreenSection } from '@/lib/day3-community-repository';

function membershipLabel(status: SocialGroupScreenSection['membershipStatus']) {
  if (status === 'accepted') return 'Member';
  if (status === 'pending') return 'Join request pending';
  if (status === 'rejected') return 'Join request not approved';
  if (status === 'removed') return 'Membership removed';
  return 'Not a member';
}

export default function GroupsScreen() {
  const [sections, setSections] = useState<SocialGroupScreenSection[]>(() => getSocialGroupScreenSections());
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [postSubmitClearKeys, setPostSubmitClearKeys] = useState<Record<string, number>>({});
  const [notice, setNotice] = useState<string>();

  function refreshSections() {
    setSections(getSocialGroupScreenSections());
  }

  function requestJoin(groupId: string) {
    const result = requestSocialGroupMembership(groupId, defaultDay3NeighborhoodContext);

    if (result.created) {
      setNotice('Join request sent for moderator review.');
    } else if (result.status === 'accepted') {
      setNotice('You are already a member of this group.');
    } else if (result.status === 'pending') {
      setNotice('Your join request is already pending.');
    } else {
      setNotice('This group is not available for your verified neighborhood.');
    }

    refreshSections();
  }

  function publishPost(groupId: string) {
    const result = createSocialGroupPostAction({
      groupId,
      profileId: defaultDay3NeighborhoodContext.profileId,
      body: drafts[groupId] ?? '',
    });

    if (result.accepted) {
      setDrafts((currentDrafts) => {
        const nextDrafts = { ...currentDrafts };
        delete nextDrafts[groupId];
        return nextDrafts;
      });
      setPostSubmitClearKeys((currentKeys) => ({
        ...currentKeys,
        [groupId]: (currentKeys[groupId] ?? 0) + 1,
      }));
      setNotice('Group post submitted for moderation.');
      refreshSections();
      return;
    }

    if (result.reason === 'empty_body') {
      setNotice('Write a short group post before submitting.');
      return;
    }

    if (result.reason === 'not_accepted_member') {
      setNotice('Only accepted group members can post.');
      return;
    }

    setNotice('This group is not available for posting.');
  }

  return (
    <Screen title="Groups">
      {notice ? <Text style={styles.notice}>{notice}</Text> : null}

      {sections.length === 0 ? (
        <Text style={styles.meta}>No groups are visible for your verified neighborhood yet.</Text>
      ) : (
        sections.map((section) => (
          <View key={section.group.id} style={styles.card}>
            <View style={styles.headerRow}>
              <View style={styles.headerText}>
                <Text style={styles.title}>{section.group.name}</Text>
                <Text style={styles.body}>{section.group.description}</Text>
              </View>
              <Text style={styles.status}>{membershipLabel(section.membershipStatus)}</Text>
            </View>

            <Text style={styles.meta}>
              {section.group.memberCount} members ·{' '}
              {section.group.visibility === 'verified_neighborhood_members'
                ? 'Verified neighborhood group'
                : 'Immediate cluster group'}
            </Text>

            {section.membershipStatus === 'accepted' ? (
              <View style={styles.composer}>
                <Text style={styles.label}>Post to this group</Text>
                <TextInput
                  key={`${section.group.id}-${postSubmitClearKeys[section.group.id] ?? 0}`}
                  value={drafts[section.group.id] ?? ''}
                  onChangeText={(value) =>
                    setDrafts((currentDrafts) => ({ ...currentDrafts, [section.group.id]: value }))
                  }
                  multiline
                  maxLength={500}
                  placeholder="Ask for a recommendation or share a useful local update."
                  style={styles.input}
                  accessibilityLabel={`Post to ${section.group.name}`}
                />
                <Pressable
                  onPress={() => publishPost(section.group.id)}
                  style={[styles.button, !(drafts[section.group.id] ?? '').trim() ? styles.disabledButton : null]}
                  disabled={!(drafts[section.group.id] ?? '').trim()}
                >
                  <Text style={styles.buttonText}>Submit post</Text>
                </Pressable>
              </View>
            ) : section.membershipStatus === 'none' ? (
              <Pressable onPress={() => requestJoin(section.group.id)} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Request to join</Text>
              </Pressable>
            ) : (
              <Text style={styles.meta}>Posting unlocks after membership is approved.</Text>
            )}

            <View style={styles.posts}>
              <Text style={styles.label}>Visible posts</Text>
              {section.posts.length === 0 ? (
                <Text style={styles.meta}>No visible posts yet.</Text>
              ) : (
                section.posts.map((post) => (
                  <View key={post.id} style={styles.post}>
                    <Text style={styles.body}>{post.body}</Text>
                    <Text style={styles.meta}>
                      {post.moderationStatus === 'not_run' ? 'Pending moderation' : 'Visible to group members'}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </View>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
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
    gap: tokens.spacing.md,
    padding: tokens.spacing.lg,
  },
  composer: {
    borderTopColor: tokens.color.border,
    borderTopWidth: 1,
    gap: tokens.spacing.sm,
    paddingTop: tokens.spacing.md,
  },
  disabledButton: { backgroundColor: tokens.color.disabled },
  headerRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: tokens.spacing.md,
    justifyContent: 'space-between',
  },
  headerText: { flex: 1, gap: tokens.spacing.xs },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: tokens.color.border,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    color: tokens.color.textPrimary,
    fontSize: tokens.type.body,
    minHeight: 96,
    padding: tokens.spacing.md,
    textAlignVertical: 'top',
  },
  label: { color: tokens.color.textPrimary, fontSize: tokens.type.label, fontWeight: '700' },
  meta: { color: tokens.color.textSecondary, fontSize: tokens.type.support },
  notice: {
    backgroundColor: '#EEF7F4',
    borderColor: tokens.color.success,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    color: tokens.color.textPrimary,
    fontSize: tokens.type.support,
    padding: tokens.spacing.md,
  },
  post: { gap: tokens.spacing.xs },
  posts: {
    borderTopColor: tokens.color.border,
    borderTopWidth: 1,
    gap: tokens.spacing.sm,
    paddingTop: tokens.spacing.md,
  },
  secondaryButton: {
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.primary,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: tokens.touch.min,
    padding: tokens.spacing.lg,
  },
  secondaryButtonText: { color: tokens.color.primary, fontWeight: '700', textAlign: 'center' },
  status: {
    backgroundColor: '#EEF7F4',
    borderColor: tokens.color.success,
    borderRadius: tokens.radius.pill,
    borderWidth: 1,
    color: tokens.color.primary,
    fontSize: tokens.type.minimum,
    fontWeight: '700',
    overflow: 'hidden',
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: tokens.spacing.xs,
  },
  title: { color: tokens.color.textPrimary, fontSize: tokens.type.card, fontWeight: '700' },
});
