import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { tokens } from '@/theme/tokens';

export default function AgencyBroadcastsScreen() {
  return (
    <Screen title="Agency broadcasts">
      <Text style={styles.meta}>
        Greater Accra feed does not automatically expose ordinary private neighborhood posts.
      </Text>
      <View style={styles.card}>
        <Text style={styles.title}>Road maintenance advisory</Text>
        <Text style={styles.body}>Approved agency notice for Greater Accra feed.</Text>
        <Text style={styles.meta}>Accra Roads Desk · Approved regional broadcast</Text>
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
