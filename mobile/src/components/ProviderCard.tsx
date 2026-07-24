import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Provider } from '@/types/contracts';
import { tokens } from '@/theme/tokens';

export function ProviderCard({ provider, onPress }: { provider: Provider; onPress: () => void }) {
  const initials = provider.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2);

  return (
    <Pressable
      onPress={onPress}
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={`${provider.name}, ${provider.serviceLabel}, ${provider.areaLabel}`}
    >
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.name}>{provider.name}</Text>
          <Text style={styles.headline}>{provider.headline}</Text>
          <Text style={styles.meta}>
            {provider.serviceLabel} · {provider.areaLabel}
          </Text>
        </View>
      </View>
      <View style={styles.metrics}>
        <Text style={styles.metric}>{provider.rating.toFixed(1)} rating</Text>
        <Text style={styles.metric}>{provider.reviewCount} reviews</Text>
        <Text style={styles.metric}>{provider.completedJobs} jobs</Text>
      </View>
      <View style={styles.signalRow}>
        {provider.trustSignals.map((signal) => (
          <View key={signal.id} style={styles.badge}>
            <Text style={styles.badgeText}>
              {signal.label}: {signal.value}
            </Text>
          </View>
        ))}
      </View>
      <Text style={styles.availability}>{provider.availability}</Text>
      <Text style={styles.disclaimer}>My Corner shows trust evidence but does not guarantee provider performance.</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 48,
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
    gap: tokens.spacing.sm,
    borderWidth: 1,
    borderColor: tokens.color.border,
  },
  header: { flexDirection: 'row', gap: tokens.spacing.md, alignItems: 'center' },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF7F4',
  },
  avatarText: { color: tokens.color.primary, fontSize: tokens.type.card, fontWeight: '800' },
  headerText: { flex: 1, gap: tokens.spacing.xs },
  name: { fontSize: tokens.type.card, fontWeight: '700', color: tokens.color.textPrimary },
  headline: { fontSize: tokens.type.body, color: tokens.color.textPrimary },
  meta: { fontSize: tokens.type.support, color: tokens.color.textSecondary },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.spacing.sm },
  metric: { fontSize: tokens.type.support, color: tokens.color.textPrimary, fontWeight: '700' },
  signalRow: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.spacing.xs },
  badge: { backgroundColor: '#EEF7F4', padding: tokens.spacing.xs, borderRadius: tokens.radius.sm },
  badgeText: { color: tokens.color.textPrimary, fontSize: tokens.type.support },
  availability: { fontSize: tokens.type.support, color: tokens.color.primary, fontWeight: '700' },
  disclaimer: { fontSize: tokens.type.minimum, color: tokens.color.textSecondary },
});
