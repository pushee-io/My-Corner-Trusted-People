import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { EmptyState, ErrorState, LoadingState } from '@/components/StateBlocks';
import { communityActionsRepository, getCommunityActionsReadRepository } from '@/lib/community-actions-repository';
import { tokens } from '@/theme/tokens';
import type { AgencyBroadcast } from '@/types/day3';

function scopeLabel(broadcast: AgencyBroadcast) {
  if (broadcast.scope === 'greater_accra') return 'Greater Accra';
  if (broadcast.scope === 'immediate_cluster') return 'Immediate cluster';
  return 'Verified neighborhood';
}

export default function AgencyBroadcastsScreen() {
  const [broadcasts, setBroadcasts] = useState<AgencyBroadcast[]>([]);
  const [notice, setNotice] = useState<string>();
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);

  const refreshBroadcasts = useCallback(async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    setError(undefined);

    try {
      const nextBroadcasts = await getCommunityActionsReadRepository().listAgencyBroadcasts();
      setBroadcasts(nextBroadcasts);
    } catch {
      setError('Could not load agency broadcasts. Try again later.');
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      setIsLoading(true);
      setError(undefined);

      getCommunityActionsReadRepository()
        .listAgencyBroadcasts()
        .then((nextBroadcasts) => {
          if (isActive) setBroadcasts(nextBroadcasts);
        })
        .catch(() => {
          if (isActive) setError('Could not load agency broadcasts. Try again later.');
        })
        .finally(() => {
          if (isActive) setIsLoading(false);
        });

      return () => {
        isActive = false;
      };
    }, []),
  );

  function reportBroadcast(broadcastId: string) {
    const result = communityActionsRepository.reportAgencyBroadcast(broadcastId);

    if (result.accepted) {
      setNotice('Broadcast reported for moderator review.');
      return;
    }

    if (result.reason === 'already_reported') {
      setNotice('You already reported this broadcast.');
      return;
    }

    setNotice('This broadcast is no longer available to report.');
    void refreshBroadcasts();
  }

  if (isLoading) {
    return (
      <Screen title="Agency broadcasts">
        <LoadingState title="Loading agency broadcasts" />
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen title="Agency broadcasts">
        <ErrorState title="Agency broadcasts unavailable" body={error} onRetry={() => void refreshBroadcasts(true)} />
      </Screen>
    );
  }

  return (
    <Screen title="Agency broadcasts">
      {notice ? <Text style={styles.notice}>{notice}</Text> : null}

      {broadcasts.length === 0 ? (
        <EmptyState title="No broadcasts" body="No approved agency broadcasts are visible for your area." />
      ) : (
        <View style={styles.list}>
          {broadcasts.map((broadcast) => (
            <View key={broadcast.id} style={styles.card}>
              <Text style={styles.eyebrow}>{scopeLabel(broadcast)}</Text>
              <Text style={styles.title}>{broadcast.title}</Text>
              <Text style={styles.body}>{broadcast.body}</Text>
              <Text style={styles.meta}>
                {broadcast.agencyName} · {new Date(broadcast.publishedAt).toLocaleString('en-GH')}
              </Text>
              <Pressable onPress={() => reportBroadcast(broadcast.id)} style={styles.reportButton}>
                <Text style={styles.reportButtonText}>Report broadcast</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    color: tokens.color.textPrimary,
    fontSize: tokens.type.body,
  },
  card: {
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    gap: tokens.spacing.sm,
    padding: tokens.spacing.lg,
  },
  eyebrow: {
    color: tokens.color.textSecondary,
    fontSize: tokens.type.support,
    fontWeight: '700',
  },
  list: {
    gap: tokens.spacing.md,
  },
  meta: {
    color: tokens.color.textSecondary,
    fontSize: tokens.type.support,
  },
  notice: {
    backgroundColor: '#EEF7F4',
    borderColor: tokens.color.success,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    color: tokens.color.textPrimary,
    fontSize: tokens.type.support,
    padding: tokens.spacing.md,
  },
  reportButton: {
    alignSelf: 'flex-start',
    borderColor: tokens.color.error,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: tokens.touch.min,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
  },
  reportButtonText: {
    color: tokens.color.error,
    fontWeight: '700',
  },
  title: {
    color: tokens.color.textPrimary,
    fontSize: tokens.type.card,
    fontWeight: '700',
  },
});
