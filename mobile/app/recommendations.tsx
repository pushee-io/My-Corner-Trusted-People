import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { tokens } from '@/theme/tokens';

export default function RecommendationsScreen() {
  return (
    <Screen title="Recommendations">
      <Text style={styles.meta}>AI does not calculate recommendation votes.</Text>
      <View style={styles.card}>
        <Text style={styles.title}>Kwame PipeCare</Text>
        <Text style={styles.body}>Helped with a leaking sink and explained the repair clearly.</Text>
        <Text style={styles.meta}>3 community recommendations</Text>
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
