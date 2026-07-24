import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { tokens } from '@/theme/tokens';

export default function MessagesScreen() {
  return (
    <Screen title="Messages">
      <View style={styles.notice}>
        <Text style={styles.noticeText}>
          Private messaging is access-controlled. It is not described as end-to-end encrypted.
        </Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.body}>Thanks. Please confirm before coming.</Text>
        <Text style={styles.meta}>Private message · Not E2EE</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  notice: { backgroundColor: '#FFF4D6', borderRadius: tokens.radius.md, padding: tokens.spacing.lg },
  noticeText: { color: tokens.color.textPrimary, fontSize: tokens.type.support, fontWeight: '700' },
  card: {
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderWidth: 1,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
    gap: tokens.spacing.xs,
  },
  body: { color: tokens.color.textPrimary, fontSize: tokens.type.body },
  meta: { color: tokens.color.textSecondary, fontSize: tokens.type.support },
});
