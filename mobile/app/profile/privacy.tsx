import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { tokens } from '@/theme/tokens';

export default function ProfilePrivacyScreen() {
  return (
    <Screen title="Map privacy">
      <View style={styles.card}>
        <Text style={styles.title}>Masked profile</Text>
        <Text style={styles.body}>
          Your public profile shows a name initial and verified neighborhood only.
        </Text>
        <Text style={styles.meta}>Visible area: East Legon, Accra</Text>
      </View>

      <View style={styles.mapBox}>
        <Text style={styles.mapText}>Approximate neighborhood area</Text>
        <Text style={styles.meta}>
          No exact home address or exact residential coordinates are exposed.
        </Text>
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
  mapBox: {
    minHeight: 180,
    justifyContent: 'center',
    backgroundColor: '#EEF7F4',
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
    gap: tokens.spacing.sm,
  },
  mapText: {
    color: tokens.color.textPrimary,
    fontSize: tokens.type.section,
    fontWeight: '800',
    textAlign: 'center',
  },
  title: {
    color: tokens.color.textPrimary,
    fontSize: tokens.type.card,
    fontWeight: '700',
  },
  body: {
    color: tokens.color.textPrimary,
    fontSize: tokens.type.body,
  },
  meta: {
    color: tokens.color.textSecondary,
    fontSize: tokens.type.support,
  },
});
