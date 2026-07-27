import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { EmptyState } from '@/components/StateBlocks';
import {
  applyDay5ModerationDecision,
  listDay5ModerationCases,
  moderatorDay5Context,
} from '@/lib/day3-community-repository';
import { tokens } from '@/theme/tokens';
import type { Day5ModerationCase, Day5ModerationDecision } from '@/types/day3';

function targetLabel(item: Day5ModerationCase) {
  if (item.targetType === 'agency_broadcast') return 'Agency broadcast';
  return 'Group post';
}

function decisionLabel(decision: Day5ModerationDecision | undefined) {
  if (decision === 'hide_content') return 'Hidden';
  if (decision === 'keep_content') return 'Kept visible';
  return 'Awaiting review';
}

export default function ModerationQueueScreen() {
  const [items, setItems] = useState<Day5ModerationCase[]>([]);
  const [notice, setNotice] = useState<string>();

  const refreshItems = useCallback(() => {
    setItems(listDay5ModerationCases(moderatorDay5Context));
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshItems();
    }, [refreshItems]),
  );

  function decide(caseId: string, decision: Day5ModerationDecision) {
    const result = applyDay5ModerationDecision(caseId, moderatorDay5Context, decision);

    if (result.accepted) {
      setNotice(decision === 'hide_content' ? 'Content hidden from resident screens.' : 'Content kept visible.');
      refreshItems();
      return;
    }

    if (result.reason === 'already_resolved') {
      setNotice('This case has already been resolved.');
      refreshItems();
      return;
    }

    if (result.reason === 'not_moderator') {
      setNotice('Moderator access is required.');
      return;
    }

    setNotice('This moderation case is no longer available.');
    refreshItems();
  }

  return (
    <Screen title="Moderation queue">
      {notice ? <Text style={styles.notice}>{notice}</Text> : null}

      {items.length === 0 ? (
        <EmptyState title="No open cases" body="Reported group posts and agency broadcasts will appear here." />
      ) : (
        <View style={styles.list}>
          {items.map((item) => {
            const isResolved = item.status === 'resolved';

            return (
              <View key={item.id} style={styles.card}>
                <View style={styles.headerRow}>
                  <View style={styles.headerText}>
                    <Text style={styles.eyebrow}>{targetLabel(item)}</Text>
                    <Text style={styles.title}>{item.targetTitle}</Text>
                  </View>
                  <Text style={[styles.status, isResolved ? styles.resolvedStatus : styles.openStatus]}>
                    {decisionLabel(item.decision)}
                  </Text>
                </View>

                <Text style={styles.body}>{item.targetBody}</Text>

                <View style={styles.reportBox}>
                  <Text style={styles.label}>Report reason</Text>
                  <Text style={styles.note}>{item.reportReason}</Text>
                  <Text style={styles.note}>{new Date(item.createdAt).toLocaleString('en-GH')}</Text>
                </View>

                {isResolved ? (
                  <Text style={styles.note}>
                    Resolved by moderator ·{' '}
                    {item.resolvedAt ? new Date(item.resolvedAt).toLocaleString('en-GH') : 'Time unavailable'}
                  </Text>
                ) : (
                  <View style={styles.actions}>
                    <Pressable onPress={() => decide(item.id, 'keep_content')} style={styles.secondaryButton}>
                      <Text style={styles.secondaryButtonText}>Keep visible</Text>
                    </Pressable>
                    <Pressable onPress={() => decide(item.id, 'hide_content')} style={styles.dangerButton}>
                      <Text style={styles.dangerButtonText}>Hide content</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing.sm,
  },
  body: {
    color: tokens.color.textPrimary,
    fontSize: tokens.type.body,
  },
  card: {
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    gap: tokens.spacing.md,
    padding: tokens.spacing.lg,
  },
  dangerButton: {
    backgroundColor: tokens.color.error,
    borderRadius: tokens.radius.md,
    justifyContent: 'center',
    minHeight: tokens.touch.min,
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.md,
  },
  dangerButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
  },
  eyebrow: {
    color: tokens.color.textSecondary,
    fontSize: tokens.type.support,
    fontWeight: '700',
  },
  headerRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: tokens.spacing.md,
    justifyContent: 'space-between',
  },
  headerText: {
    flex: 1,
    gap: tokens.spacing.xs,
  },
  label: {
    color: tokens.color.textPrimary,
    fontSize: tokens.type.label,
    fontWeight: '700',
  },
  list: {
    gap: tokens.spacing.md,
  },
  note: {
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
  openStatus: {
    backgroundColor: '#FFF7E6',
    borderColor: tokens.color.warning,
    color: tokens.color.textPrimary,
  },
  reportBox: {
    backgroundColor: '#FFFFFF',
    borderColor: tokens.color.border,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    gap: tokens.spacing.xs,
    padding: tokens.spacing.md,
  },
  resolvedStatus: {
    backgroundColor: '#EEF7F4',
    borderColor: tokens.color.success,
    color: tokens.color.primary,
  },
  secondaryButton: {
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.primary,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: tokens.touch.min,
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.md,
  },
  secondaryButtonText: {
    color: tokens.color.primary,
    fontWeight: '700',
    textAlign: 'center',
  },
  status: {
    borderRadius: tokens.radius.pill,
    borderWidth: 1,
    fontSize: tokens.type.minimum,
    fontWeight: '700',
    overflow: 'hidden',
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: tokens.spacing.xs,
  },
  title: {
    color: tokens.color.textPrimary,
    fontSize: tokens.type.card,
    fontWeight: '700',
  },
});
