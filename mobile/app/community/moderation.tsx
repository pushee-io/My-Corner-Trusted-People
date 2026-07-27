import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { EmptyState, LoadingState } from '@/components/StateBlocks';
import { applyModerationAction, listModerationQueue } from '@/lib/community-repository';
import { supabase } from '@/lib/supabase';
import { tokens } from '@/theme/tokens';
import type { ModerationQueueItem } from '@/types/contracts';

type ModerationAction = 'keep_content' | 'hide_content' | 'resolve_case';

const actionLabels: Record<ModerationAction, string> = {
  keep_content: 'Keep content',
  hide_content: 'Hide content',
  resolve_case: 'Resolve case',
};

export default function ModerationQueueScreen() {
  const [items, setItems] = useState<ModerationQueueItem[]>([]);
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);
  const [busyCaseId, setBusyCaseId] = useState<string>();
  const [signedInEmail, setSignedInEmail] = useState<string>();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setSignedInEmail(data.user?.email));

    listModerationQueue()
      .then(setItems)
      .catch((caught) =>
        setError(
          caught instanceof Error
            ? caught.message
            : 'Could not load moderation queue. Sign in as a moderator or admin.',
        ),
      )
      .finally(() => setIsLoading(false));
  }, []);

  async function resolveCase(item: ModerationQueueItem, action: ModerationAction) {
    setError(undefined);
    setBusyCaseId(item.id);

    try {
      const updated = await applyModerationAction(item.id, action);
      setItems((currentItems) =>
        currentItems.map((currentItem) => (currentItem.id === updated.id ? updated : currentItem)),
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not update moderation case.');
    } finally {
      setBusyCaseId(undefined);
    }
  }

  if (isLoading) {
    return (
      <Screen title="Moderation queue">
        <Text style={styles.note}>Signed in: {signedInEmail ?? 'checking...'}</Text>
        <LoadingState title="Loading reports" />
      </Screen>
    );
  }

  return (
    <Screen title="Moderation queue">
      <Text style={styles.note}>Signed in: {signedInEmail ?? 'unknown'}</Text>
      {error ? <EmptyState title="Moderator access required" body={error} /> : null}
      {!error && items.length === 0 ? <EmptyState title="No open cases" body="Reported feed content will appear here." /> : null}

      <View style={styles.list}>
        {items.map((item) => {
          const isResolved = item.status !== 'open';

          return (
            <View key={item.id} style={styles.card}>
              <Text style={styles.title}>{item.reason}</Text>
              <Text style={styles.body}>{item.sourceTable}</Text>
              <Text style={styles.body}>{item.sourceId}</Text>
              <Text style={styles.note}>
                {item.status} · {new Date(item.createdAt).toLocaleString('en-GH')}
              </Text>

              {item.resolvedAt ? (
                <Text style={styles.note}>
                  {item.resolutionAction ?? 'resolved'} · {new Date(item.resolvedAt).toLocaleString('en-GH')}
                </Text>
              ) : null}

              <View style={styles.actions}>
                {(Object.keys(actionLabels) as ModerationAction[]).map((action) => (
                  <Pressable
                    disabled={isResolved || busyCaseId === item.id}
                    key={action}
                    onPress={() => resolveCase(item, action)}
                    style={[
                      styles.actionButton,
                      action === 'hide_content' ? styles.dangerButton : null,
                      isResolved ? styles.disabledButton : null,
                    ]}
                  >
                    <Text style={[styles.actionText, action === 'hide_content' ? styles.dangerText : null]}>
                      {busyCaseId === item.id ? 'Saving...' : actionLabels[action]}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    borderColor: tokens.color.primary,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: tokens.touch.min,
    paddingHorizontal: tokens.spacing.md,
  },
  actionText: { color: tokens.color.primary, fontSize: tokens.type.support, fontWeight: '700', textAlign: 'center' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.spacing.sm, paddingTop: tokens.spacing.sm },
  body: { color: tokens.color.textPrimary, fontSize: tokens.type.body },
  card: {
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    gap: tokens.spacing.xs,
    padding: tokens.spacing.lg,
  },
  dangerButton: { borderColor: tokens.color.error },
  dangerText: { color: tokens.color.error },
  disabledButton: { opacity: 0.5 },
  list: { gap: tokens.spacing.md },
  note: { color: tokens.color.textSecondary, fontSize: tokens.type.support },
  title: { color: tokens.color.textPrimary, fontSize: tokens.type.card, fontWeight: '700' },
});
