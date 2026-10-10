import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import type { TrustSignal } from '@/types/contracts';
import { tokens } from '@/theme/tokens';

export function VerifiedProviderBadge({ phoneVerified }: { phoneVerified: boolean }) {
  if (!phoneVerified) return null;
  return (
    <View accessibilityLabel="Phone verified" style={styles.badge}>
      <Ionicons name="shield-checkmark" size={15} color={tokens.color.primary} accessible={false} />
      <Text style={styles.badgeLabel}>Phone verified</Text>
    </View>
  );
}

function signalIcon(label: string): keyof typeof Ionicons.glyphMap {
  if (/phone/i.test(label)) return 'call-outline';
  if (/response|speed/i.test(label)) return 'flash-outline';
  if (/job|work/i.test(label)) return 'construct-outline';
  if (/recommend|review/i.test(label)) return 'star-outline';
  return 'shield-checkmark-outline';
}

export function TrustSignals({ signals }: { signals: TrustSignal[] }) {
  return (
    <View style={styles.grid}>
      {signals.map((signal) => (
        <View key={signal.id} style={styles.card} accessible accessibilityLabel={`${signal.label}: ${signal.value}`}>
          <View style={styles.icon}>
            <Ionicons name={signalIcon(signal.label)} size={21} color={tokens.color.primary} accessible={false} />
          </View>
          <Text style={styles.signal}>{signal.label}: {signal.value}</Text>
        </View>
      ))}
    </View>
  );
}
const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  card: { flexGrow: 1, flexBasis: 136, borderRadius: 14, padding: 12, gap: 8, backgroundColor: tokens.color.successSurface, borderWidth: 1, borderColor: tokens.color.borderSubtle },
  icon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#E1EDE5', alignItems: 'center', justifyContent: 'center' },
  signal: { color: tokens.color.textPrimary, fontSize: 14, lineHeight: 21, fontWeight: '700' },
  badge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 4, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: tokens.color.successSurface },
  badgeLabel: { color: tokens.color.primary, fontSize: 12, lineHeight: 18, fontWeight: '700' },
});
