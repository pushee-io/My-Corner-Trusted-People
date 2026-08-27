import { Link, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { EmptyState, LoadingState } from '@/components/StateBlocks';
import { listMarketplaceModerationQueue } from '@/lib/marketplace-moderation-repository';
import { tokens } from '@/theme/tokens';
import type { MarketplaceModerationQueueItem, MarketplaceModerationReportStatus } from '@/types/contracts';

const filters: Array<{ label: string; value: MarketplaceModerationReportStatus | 'all' }> = [
  { label: 'Open', value: 'open' },
  { label: 'Reviewing', value: 'reviewing' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'All', value: 'all' },
];

function statusLabel(status: MarketplaceModerationReportStatus) {
  if (status === 'reviewing') return 'Under review';
  if (status === 'resolved') return 'Resolved';
  return 'Open';
}

export default function MarketplaceModerationQueueScreen() {
  const [filter, setFilter] = useState<MarketplaceModerationReportStatus | 'all'>('open');
  const [items, setItems] = useState<MarketplaceModerationQueueItem[]>([]);
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(undefined);
    try {
      setItems(await listMarketplaceModerationQueue(filter));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not load Marketplace reports.');
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  return (
    <Screen title="Marketplace reports">
      <Text style={styles.intro}>Review reported listings and record a reason for every decision.</Text>

      <View accessibilityRole="tablist" style={styles.filters}>
        {filters.map((item) => {
          const selected = filter === item.value;
          return (
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              key={item.value}
              onPress={() => setFilter(item.value)}
              style={[styles.filter, selected ? styles.filterSelected : null]}
            >
              <Text style={[styles.filterText, selected ? styles.filterTextSelected : null]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {isLoading ? <LoadingState title="Loading reports" /> : null}
      {!isLoading && error ? (
        <View style={styles.stateBlock}>
          <EmptyState title="Could not load reports" body={error} />
          <Pressable accessibilityRole="button" onPress={() => void load()} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Try again</Text>
          </Pressable>
        </View>
      ) : null}
      {!isLoading && !error && items.length === 0 ? (
        <EmptyState title="No reports in this view" body="Choose another status or check again later." />
      ) : null}

      {!isLoading && !error ? (
        <View style={styles.list}>
          {items.map((item) => (
            <Link
              asChild
              href={{ pathname: '/marketplace/moderation/[reportId]', params: { reportId: item.reportId } }}
              key={item.reportId}
            >
              <Pressable accessibilityRole="button" style={styles.row}>
                {item.imageUrl ? <Image source={{ uri: item.imageUrl }} style={styles.thumbnail} /> : null}
                <View style={styles.rowBody}>
                  <View style={styles.rowHeader}>
                    <Text numberOfLines={2} style={styles.title}>
                      {item.listingTitle}
                    </Text>
                    <View style={styles.status}>
                      <Text style={styles.statusText}>{statusLabel(item.reportStatus)}</Text>
                    </View>
                  </View>
                  <Text numberOfLines={2} style={styles.reason}>
                    {item.reportReason}
                  </Text>
                  <Text style={styles.meta}>
                    {item.neighborhoodName} · {item.sellerName}
                  </Text>
                  <Text style={styles.meta}>Reported {new Date(item.reportedAt).toLocaleDateString('en-GH')}</Text>
                </View>
              </Pressable>
            </Link>
          ))}
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filter: {
    alignItems: 'center',
    borderColor: tokens.color.border,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: tokens.touch.min,
    paddingHorizontal: tokens.spacing.sm,
  },
  filterSelected: { backgroundColor: tokens.color.primary, borderColor: tokens.color.primary },
  filterText: { color: tokens.color.textPrimary, fontSize: tokens.type.label, fontWeight: '700' },
  filterTextSelected: { color: '#FFFFFF' },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.spacing.sm },
  intro: { color: tokens.color.textSecondary, fontSize: tokens.type.body, lineHeight: 23 },
  list: { gap: tokens.spacing.sm },
  meta: { color: tokens.color.textSecondary, fontSize: tokens.type.support, lineHeight: 20 },
  reason: { color: tokens.color.textPrimary, fontSize: tokens.type.body, lineHeight: 22 },
  row: {
    backgroundColor: tokens.color.surface,
    borderBottomColor: tokens.color.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: tokens.spacing.md,
    minHeight: 112,
    paddingVertical: tokens.spacing.md,
  },
  rowBody: { flex: 1, gap: tokens.spacing.xs },
  rowHeader: { alignItems: 'flex-start', flexDirection: 'row', gap: tokens.spacing.sm, justifyContent: 'space-between' },
  secondaryButton: {
    alignItems: 'center',
    borderColor: tokens.color.primary,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: tokens.touch.min,
    padding: tokens.spacing.md,
  },
  secondaryButtonText: { color: tokens.color.primary, fontWeight: '700' },
  stateBlock: { gap: tokens.spacing.md },
  status: { backgroundColor: '#FFF4D6', borderRadius: tokens.radius.md, padding: tokens.spacing.sm },
  statusText: { color: tokens.color.textPrimary, fontSize: tokens.type.minimum, fontWeight: '700' },
  thumbnail: { backgroundColor: tokens.color.border, borderRadius: tokens.radius.md, height: 88, width: 88 },
  title: { color: tokens.color.textPrimary, flex: 1, fontSize: tokens.type.card, fontWeight: '700', lineHeight: 23 },
});
