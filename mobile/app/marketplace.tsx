import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { tokens } from '@/theme/tokens';

export default function MarketplaceScreen() {
  return (
    <Screen title="Marketplace">
      <Text style={styles.meta}>Listings use broad pickup areas only. Exact residential addresses are not shown.</Text>
      <View style={styles.card}>
        <Text style={styles.title}>Folding table for sale</Text>
        <Text style={styles.body}>Clean folding table. Pickup arranged in a public nearby spot.</Text>
        <Text style={styles.meta}>Home goods · GHS 180</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderWidth: 1,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
    gap: tokens.spacing.xs,
  },
  title: { color: tokens.color.textPrimary, fontSize: tokens.type.card, fontWeight: '700' },
  body: { color: tokens.color.textPrimary, fontSize: tokens.type.body },
  meta: { color: tokens.color.textSecondary, fontSize: tokens.type.support },
});
