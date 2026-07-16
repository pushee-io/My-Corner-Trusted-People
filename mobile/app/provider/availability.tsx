import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { tokens } from '@/theme/tokens';

export default function ProviderAvailabilityScreen() {
  return (
    <Screen title="Availability">
      <View style={styles.panel}>
        <Text style={styles.title}>Accepting requests</Text>
        <Text style={styles.body}>Today after 3:00 PM · Weekdays preferred</Text>
      </View>
      <Text style={styles.note}>This prototype shows availability as seeded profile data. Editing availability will connect to Supabase in the next backend pass.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  panel: { backgroundColor: tokens.color.surface, borderColor: tokens.color.border, borderWidth: 1, borderRadius: tokens.radius.md, padding: tokens.spacing.lg, gap: tokens.spacing.sm },
  title: { color: tokens.color.textPrimary, fontSize: tokens.type.card, fontWeight: '700' },
  body: { color: tokens.color.textPrimary, fontSize: tokens.type.body },
  note: { color: tokens.color.textSecondary, fontSize: tokens.type.support },
});
