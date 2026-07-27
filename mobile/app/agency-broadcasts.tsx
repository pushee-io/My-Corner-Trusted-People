import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import {
  defaultDay3NeighborhoodContext,
  getAgencyBroadcastScreenItems,
  reportAgencyBroadcast,
} from '@/lib/day3-community-repository';
import { tokens } from '@/theme/tokens';

function scopeLabel(scope: 'neighborhood' | 'immediate_cluster' | 'greater_accra') {
  if (scope === 'greater_accra') return 'Approved Greater Accra broadcast';
  if (scope === 'immediate_cluster') return 'Approved local cluster broadcast';
  return 'Approved neighborhood broadcast';
}

export default function AgencyBroadcastsScreen() {
  const [reportedIds, setReportedIds] = useState<string[]>([]);
  const [notice, setNotice] = useState<string>();
  const broadcasts = getAgencyBroadcastScreenItems();

  function reportBroadcast(broadcastId: string) {
    const result = reportAgencyBroadcast(broadcastId, defaultDay3NeighborhoodContext);

    if (result.accepted) {
      setReportedIds((currentIds) => [...currentIds, broadcastId]);
      setNotice('Broadcast report sent for review.');
      return;
    }

    if (result.reason === 'already_reported') {
      setNotice('You already reported this broadcast.');
      return;
    }

    setNotice('This broadcast is no longer available to report.');
  }

  return (
    <Screen title="Agency broadcasts">
      <Text style={styles.meta}>
        Greater Accra feed does not automatically expose ordinary private neighborhood posts.
      </Text>

      {notice ? <Text style={styles.notice}>{notice}</Text> : null}

      {broadcasts.length === 0 ? (
        <Text style={styles.meta}>No approved agency broadcasts are visible for your area right now.</Text>
      ) : (
        broadcasts.map((broadcast) => {
          const isReported = reportedIds.includes(broadcast.id);

          return (
            <View key={broadcast.id} style={styles.card}>
              <Text style={styles.title}>{broadcast.title}</Text>
              <Text style={styles.body}>{broadcast.body}</Text>
              <Text style={styles.meta}>
                {broadcast.agencyName} · {scopeLabel(broadcast.scope)}
              </Text>
              <Pressable
                disabled={isReported}
                onPress={() => reportBroadcast(broadcast.id)}
                style={[styles.reportButton, isReported ? styles.disabledButton : null]}
              >
                <Text style={styles.reportText}>{isReported ? 'Reported' : 'Report broadcast'}</Text>
              </Pressable>
            </View>
          );
        })
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { color: tokens.color.textPrimary, fontSize: tokens.type.body },
  card: {
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    gap: tokens.spacing.xs,
    padding: tokens.spacing.lg,
  },
  disabledButton: { borderColor: tokens.color.disabled },
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
  reportButton: {
    alignSelf: 'flex-start',
    borderColor: tokens.color.error,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    marginTop: tokens.spacing.sm,
    minHeight: tokens.touch.min,
    paddingHorizontal: tokens.spacing.lg,
  },
  reportText: { color: tokens.color.error, fontWeight: '700' },
  title: { color: tokens.color.textPrimary, fontSize: tokens.type.card, fontWeight: '700' },
});
