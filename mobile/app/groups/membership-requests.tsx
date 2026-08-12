import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { EmptyState, ErrorState, LoadingState } from '@/components/StateBlocks';
import { getGroupMembershipRepository } from '@/lib/group-membership-repository';
import { tokens } from '@/theme/tokens';
import type { SocialGroupMembershipDecision, SocialGroupMembershipRequest } from '@/types/day3';

export default function GroupMembershipRequestsScreen() {
  const [requests, setRequests] = useState<SocialGroupMembershipRequest[]>([]);
  const [workingId, setWorkingId] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    setError(undefined);

    try {
      setRequests(await getGroupMembershipRepository().listPendingMemberships());
    } catch {
      setError('Could not load membership requests. Try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh(true);
    }, [refresh]),
  );

  async function decide(request: SocialGroupMembershipRequest, decision: SocialGroupMembershipDecision) {
    setWorkingId(request.membershipId);
    setError(undefined);

    try {
      const result = await getGroupMembershipRepository().decideMembership(request.membershipId, decision);
      if (!result.accepted) {
        setNotice('This membership request is no longer pending.');
      } else {
        setNotice(decision === 'accepted' ? 'Membership approved.' : 'Membership request declined.');
      }
      await refresh();
    } catch {
      setNotice(undefined);
      setError('Could not save this membership decision. Try again.');
    } finally {
      setWorkingId(undefined);
    }
  }

  if (isLoading) {
    return (
      <Screen title="Membership requests">
        <LoadingState title="Loading membership requests" />
      </Screen>
    );
  }

  if (error && requests.length === 0) {
    return (
      <Screen title="Membership requests">
        <ErrorState title="Membership requests unavailable" body={error} onRetry={() => void refresh(true)} />
      </Screen>
    );
  }

  return (
    <Screen title="Membership requests">
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

      {requests.length === 0 ? (
        <EmptyState title="No pending requests" body="New group join requests will appear here for review." />
      ) : (
        <View style={styles.list}>
          {requests.map((request) => {
            const busy = workingId === request.membershipId;
            return (
              <View key={request.membershipId} style={styles.card}>
                <Text style={styles.title}>{request.applicantName}</Text>
                <Text style={styles.body}>Requested to join {request.groupName}</Text>
                <Text style={styles.meta}>{new Date(request.requestedAt).toLocaleString('en-GH')}</Text>
                <View style={styles.actions}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ busy }}
                    disabled={Boolean(workingId)}
                    onPress={() => void decide(request, 'accepted')}
                    style={[styles.approveButton, busy ? styles.disabled : null]}
                  >
                    <Text style={styles.approveText}>{busy ? 'Saving...' : 'Approve'}</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ busy }}
                    disabled={Boolean(workingId)}
                    onPress={() => void decide(request, 'rejected')}
                    style={[styles.rejectButton, busy ? styles.disabled : null]}
                  >
                    <Text style={styles.rejectText}>Decline</Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.spacing.sm },
  approveButton: {
    backgroundColor: tokens.color.primary,
    borderRadius: tokens.radius.md,
    justifyContent: 'center',
    minHeight: tokens.touch.min,
    paddingHorizontal: tokens.spacing.lg,
  },
  approveText: { color: '#FFFFFF', fontWeight: '700' },
  body: { color: tokens.color.textPrimary, fontSize: tokens.type.body },
  card: {
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    gap: tokens.spacing.sm,
    padding: tokens.spacing.lg,
  },
  disabled: { opacity: 0.5 },
  error: {
    backgroundColor: '#FDECEA',
    borderColor: tokens.color.error,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    color: tokens.color.error,
    padding: tokens.spacing.md,
  },
  list: { gap: tokens.spacing.md },
  meta: { color: tokens.color.textSecondary, fontSize: tokens.type.support },
  notice: {
    backgroundColor: '#EEF7F4',
    borderColor: tokens.color.success,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    color: tokens.color.textPrimary,
    padding: tokens.spacing.md,
  },
  rejectButton: {
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.error,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: tokens.touch.min,
    paddingHorizontal: tokens.spacing.lg,
  },
  rejectText: { color: tokens.color.error, fontWeight: '700' },
  title: { color: tokens.color.textPrimary, fontSize: tokens.type.card, fontWeight: '700' },
});
