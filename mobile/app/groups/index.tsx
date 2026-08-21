import { Link, router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { EmptyState, ErrorState, LoadingState } from '@/components/StateBlocks';
import { getCurrentProfile } from '@/lib/auth';
import {
  communityActionsRepository,
  getCommunityActionsReadRepository,
  type SocialGroupScreenSection,
} from '@/lib/community-actions-repository';
import { getGroupMembershipRepository } from '@/lib/group-membership-repository';
import { tokens } from '@/theme/tokens';

function membershipLabel(status: SocialGroupScreenSection['membershipStatus']) {
  if (status === 'accepted') return 'Member';
  if (status === 'pending') return 'Join request pending';
  if (status === 'rejected') return 'Join request not approved';
  if (status === 'removed') return 'Membership removed';
  return 'Not a member';
}

function canRequestMembership(status: SocialGroupScreenSection['membershipStatus']) {
  return status === 'none' || status === 'rejected' || status === 'removed';
}

function requestButtonLabel(status: SocialGroupScreenSection['membershipStatus'], isRequesting: boolean) {
  if (isRequesting) return 'Sending request...';
  return status === 'none' ? 'Request to join' : 'Request again';
}

export default function GroupsScreen() {
  const { width } = useWindowDimensions();
  const [sections, setSections] = useState<SocialGroupScreenSection[]>([]);
  const [notice, setNotice] = useState<string>();
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);
  const [requestingGroupId, setRequestingGroupId] = useState<string>();

  const refreshSections = useCallback(async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    setError(undefined);

    try {
      const defaultViewer = communityActionsRepository.defaultViewer;
      const viewer =
        communityActionsRepository.mode === 'supabase'
          ? { ...defaultViewer, profileId: (await getCurrentProfile()).id }
          : defaultViewer;
      const nextSections = await getCommunityActionsReadRepository().listSocialGroupScreenSections(viewer);
      setSections(nextSections);
    } catch {
      setError('Could not load groups. Try again later.');
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refreshSections(true);
    }, [refreshSections]),
  );

  async function requestJoin(groupId: string) {
    setRequestingGroupId(groupId);
    setError(undefined);

    try {
      const result = await getGroupMembershipRepository().requestMembership(groupId);

      if (result.created) {
        setNotice('Join request sent for moderator review.');
      } else if (result.status === 'accepted') {
        setNotice('You are already a member of this group.');
      } else if (result.status === 'pending') {
        setNotice('Your join request is already pending.');
      } else {
        setNotice('This group is not available for your verified neighborhood.');
      }

      await refreshSections();
    } catch {
      setNotice(undefined);
      setError('Could not send your join request. Check your connection and try again.');
    } finally {
      setRequestingGroupId(undefined);
    }
  }

  if (isLoading) {
    return (
      <Screen title="Groups">
        <LoadingState title="Loading groups" />
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen title="Groups">
        <ErrorState title="Groups unavailable" body={error} onRetry={() => void refreshSections(true)} />
      </Screen>
    );
  }

  return (
    <Screen title="Groups">
      <View style={styles.actionRow}>
        <Link href="/groups/new" asChild>
          <Pressable accessibilityRole="button" style={styles.createButton}>
            <Text style={styles.createButtonText}>Create group</Text>
          </Pressable>
        </Link>
        <Link href="/groups/membership-requests" asChild>
          <Pressable accessibilityRole="button" style={styles.reviewButton}>
            <Text style={styles.reviewButtonText}>Review membership requests</Text>
          </Pressable>
        </Link>
      </View>

      <Text style={styles.helper}>Open a group to read posts and take part in the conversation.</Text>
      {notice ? <Text style={styles.notice}>{notice}</Text> : null}

      {sections.length === 0 ? (
        <EmptyState title="No groups yet" body="No groups are visible for your verified neighborhood yet." />
      ) : (
        <View style={styles.list}>
          {sections.map((section) => (
            <View key={section.group.id} style={[styles.card, width >= 600 ? styles.cardMedium : null]}>
              <Pressable
                accessibilityHint="Opens group posts and actions"
                accessibilityLabel={`${section.group.name}, ${section.group.memberCount} members`}
                accessibilityRole="button"
                onPress={() => router.push({ pathname: '/groups/[groupId]', params: { groupId: section.group.id } })}
                style={({ pressed }) => [styles.destination, pressed ? styles.destinationPressed : null]}
              >
                <View style={styles.headerRow}>
                  <View style={styles.headerText}>
                    <Text numberOfLines={2} style={styles.title}>
                      {section.group.name}
                    </Text>
                    <Text numberOfLines={2} style={styles.body}>
                      {section.group.description}
                    </Text>
                  </View>
                  <Text style={styles.status}>{membershipLabel(section.membershipStatus)}</Text>
                </View>
                <Text style={styles.meta}>
                  {section.group.memberCount} members |{' '}
                  {section.group.visibility === 'verified_neighborhood_members'
                    ? 'Verified neighborhood group'
                    : 'Immediate cluster group'}
                </Text>
                <Text style={styles.viewText}>View group</Text>
              </Pressable>

              {canRequestMembership(section.membershipStatus) ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ busy: requestingGroupId === section.group.id }}
                  disabled={Boolean(requestingGroupId)}
                  onPress={() => void requestJoin(section.group.id)}
                  style={[
                    styles.secondaryButton,
                    requestingGroupId === section.group.id ? styles.disabledButton : null,
                  ]}
                >
                  <Text style={styles.secondaryButtonText}>
                    {requestButtonLabel(section.membershipStatus, requestingGroupId === section.group.id)}
                  </Text>
                </Pressable>
              ) : section.membershipStatus === 'pending' ? (
                <Text style={styles.meta}>Your request is waiting for moderator review.</Text>
              ) : null}
            </View>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.spacing.sm },
  body: { color: tokens.color.textPrimary, fontSize: tokens.type.body, lineHeight: 23 },
  card: {
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    gap: tokens.spacing.sm,
    overflow: 'hidden',
    padding: tokens.spacing.sm,
    width: '100%',
  },
  cardMedium: { flexBasis: '48%', flexGrow: 1, width: 'auto' },
  createButton: {
    backgroundColor: tokens.color.primary,
    borderRadius: tokens.radius.md,
    justifyContent: 'center',
    minHeight: tokens.touch.min,
    paddingHorizontal: tokens.spacing.lg,
  },
  createButtonText: { color: '#FFFFFF', fontWeight: '700', textAlign: 'center' },
  destination: { gap: tokens.spacing.sm, minHeight: 132, padding: tokens.spacing.sm },
  destinationPressed: { backgroundColor: '#EEF7F4' },
  disabledButton: { opacity: 0.5 },
  headerRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: tokens.spacing.sm,
    justifyContent: 'space-between',
  },
  headerText: { flex: 1, gap: tokens.spacing.xs },
  helper: { color: tokens.color.textSecondary, fontSize: tokens.type.support },
  list: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.spacing.md },
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
  reviewButton: {
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.primary,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: tokens.touch.min,
    paddingHorizontal: tokens.spacing.lg,
  },
  reviewButtonText: { color: tokens.color.primary, fontWeight: '700', textAlign: 'center' },
  secondaryButton: {
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.primary,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: tokens.touch.min,
    paddingHorizontal: tokens.spacing.lg,
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
  title: { color: tokens.color.textPrimary, fontSize: tokens.type.card, fontWeight: '700', lineHeight: 24 },
  viewText: { color: tokens.color.primary, fontSize: tokens.type.support, fontWeight: '700' },
});
