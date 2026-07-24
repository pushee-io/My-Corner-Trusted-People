import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { verificationItems } from '@/lib/account';
import { getDay2BFeedUnlockStatus } from '@/lib/day2b-verification';
import { tokens } from '@/theme/tokens';

const steps = [
  {
    href: '/profile/phone-verification',
    label: 'Phone verification',
    detail: 'Use the Ghana test phone provider.',
  },
  {
    href: '/profile/legal-name',
    label: 'Private legal name',
    detail: 'Stored separately from public display name.',
  },
  {
    href: '/profile/manual-biometric',
    label: 'Test identity assurance',
    detail: 'Clearly labeled test mode. No Ghana Card image collection.',
  },
  {
    href: '/profile/address',
    label: 'Ghana address',
    detail: 'Ghana-compatible address fields and private GhanaPost GPS support.',
  },
  {
    href: '/profile/map-confirmation',
    label: 'Map confirmation',
    detail: 'Confirm a general residential point, not a public pin.',
  },
  {
    href: '/profile/location-consistency',
    label: 'Location check',
    detail: 'Foreground-only check with fallback.',
  },
  {
    href: '/profile/postcard-challenge',
    label: 'Postcard code',
    detail: 'Test challenge assigns verified neighborhood membership.',
  },
] as const;

function statusLabel(status: string) {
  if (status === 'verified') return 'Verified';
  if (status === 'needs_review') return 'Needs review';
  if (status === 'not_available') return 'Not available';
  return 'Not started';
}

export default function VerificationScreen() {
  const unlock = getDay2BFeedUnlockStatus();

  return (
    <Screen title="Resident verification">
      <View style={unlock.status === 'unlocked' ? styles.unlocked : styles.notice}>
        <Text style={styles.noticeText}>{unlock.title}</Text>
        <Text style={styles.body}>{unlock.message}</Text>
      </View>

      <Text style={styles.sectionTitle}>Day 2B flow</Text>

      {steps.map((step) => (
        <Link key={step.href} href={step.href} asChild>
          <Pressable style={styles.card}>
            <Text style={styles.title}>{step.label}</Text>
            <Text style={styles.body}>{step.detail}</Text>
          </Pressable>
        </Link>
      ))}

      <Text style={styles.sectionTitle}>Existing account signals</Text>

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
    gap: tokens.spacing.sm,
    padding: tokens.spacing.lg,
  },
  unlocked: {
    backgroundColor: '#EEF7F4',
    borderColor: tokens.color.success,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    gap: tokens.spacing.sm,
    padding: tokens.spacing.lg,
  },
  noticeText: {
    color: tokens.color.textPrimary,
    fontSize: tokens.type.support,
    fontWeight: '700',
  },
  sectionTitle: {
    color: tokens.color.textPrimary,
    fontSize: tokens.type.card,
    fontWeight: '800',
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
