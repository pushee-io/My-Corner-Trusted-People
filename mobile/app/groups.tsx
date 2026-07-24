import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { tokens } from '@/theme/tokens';

export default function GroupsScreen() {
  return (
    <Screen title="Groups">
      <View style={styles.card}>
        <Text style={styles.title}>East Legon Home Maintenance</Text>
        <Text style={styles.body}>A private neighborhood group for repair tips and provider recommendations.</Text>
        <Text style={styles.meta}>24 members · Verified neighborhood group</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: tokens.color.surface, borderColor: tokens.color.border, borderWidth: 1, borderRadius: tokens.radius.md, padding: tokens.spacing.lg, gap: tokens.spacing.xs },
  title: { color: tokens.color.textPrimary, fontSize: tokens.type.card, fontWeight: '700' },
  body: { color: tokens.color.textPrimary, fontSize: tokens.type.body },
  meta: { color: tokens.color.textSecondary, fontSize: tokens.type.support },
});
