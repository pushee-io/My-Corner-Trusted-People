import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { verificationItems } from '@/lib/account';
import { tokens } from '@/theme/tokens';

function statusLabel(status: string) {
  if (status === 'verified') return 'Verified';
  if (status === 'needs_review') return 'Needs review';
  if (status === 'not_available') return 'Not available';
  return 'Not started';
}

export default function VerificationScreen() {
  return (
    <Screen title="Account verification">
      <View style={styles.notice}>
        <Text style={styles.noticeText}>
          Verification signals are evidence only. My Corner does not guarantee provider or requester conduct.
        </Text>
      </View>

      {verificationItems.map((item) => (
        <View key={item.id} style={styles.card}>
          <Text style={styles.title}>{item.label}</Text>
          <Text style={styles.status}>{statusLabel(item.status)}</Text>
          <Text style={styles.body}>{item.detail}</Text>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  notice: {
    backgroundColor: '#FFF4D6',
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
  },
  noticeText: {
    color: tokens.color.textPrimary,
    fontSize: tokens.type.support,
    fontWeight: '700',
  },
  card: {
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderWidth: 1,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
    gap: tokens.spacing.xs,
  },
  title: {
    color: tokens.color.textPrimary,
    fontSize: tokens.type.card,
    fontWeight: '700',
  },
  status: {
    color: tokens.color.primary,
    fontSize: tokens.type.support,
    fontWeight: '800',
  },
  body: {
    color: tokens.color.textSecondary,
    fontSize: tokens.type.support,
  },
});
