import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { tokens } from '@/theme/tokens';

export default function ProviderProfilePreviewScreen() {
  return (
    <Screen title="Profile preview">
      <View style={styles.panel}>
        <Text style={styles.title}>Kwame PipeCare</Text>
        <Text style={styles.body}>Fast home plumbing support</Text>
        <Text style={styles.note}>East Legon and nearby</Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.title}>Trust signals</Text>
        <Text style={styles.body}>Phone verified: Yes</Text>
        <Text style={styles.body}>Completed jobs: shown from Supabase provider listings</Text>
        <Text style={styles.body}>Community recommendations: shown as evidence, not a guarantee</Text>
      </View>

      <Text style={styles.note}>
        This is what requesters see. Trust signals are evidence, not a My Corner guarantee.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    gap: tokens.spacing.sm,
    padding: tokens.spacing.lg,
  },
  title: { color: tokens.color.textPrimary, fontSize: tokens.type.card, fontWeight: '700' },
  body: { color: tokens.color.textPrimary, fontSize: tokens.type.body },
  note: { color: tokens.color.textSecondary, fontSize: tokens.type.support },
});
