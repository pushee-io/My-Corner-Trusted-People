import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { requesterProfile, verificationItems } from '@/lib/account';
import { tokens } from '@/theme/tokens';

export default function ProfileScreen() {
  const verifiedCount = verificationItems.filter((item) => item.status === 'verified').length;

  return (
    <Screen title="Profile">
      <View style={styles.panel}>
        <Text style={styles.name}>{requesterProfile.name}</Text>
        <Text style={styles.body}>{requesterProfile.role}</Text>
        <Text style={styles.body}>
          {requesterProfile.neighborhood} · {requesterProfile.city}, {requesterProfile.country}
        </Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.title}>Account details</Text>
        <Text style={styles.body}>Phone: {requesterProfile.phone}</Text>
        <Text style={styles.body}>Email: {requesterProfile.email}</Text>
        <Text style={styles.body}>Language: {requesterProfile.language}</Text>
        <Text style={styles.body}>Data saver: {requesterProfile.dataSaver ? 'On' : 'Off'}</Text>
      </View>

      <Link href="/profile/verification" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>
            Verification status: {verifiedCount} of {verificationItems.length}
          </Text>
        </Pressable>
      </Link>

      <Link href="/profile/phone-verification" asChild>
        <Pressable style={styles.secondary}>
          <Text style={styles.secondaryText}>Phone verification</Text>
        </Pressable>
      </Link>

      <Link href="/profile/legal-name" asChild>
        <Pressable style={styles.secondary}>
          <Text style={styles.secondaryText}>Legal name</Text>
        </Pressable>
      </Link>

      <Link href={{ pathname: '/profile/address' }} asChild>
        <Pressable style={styles.secondary}>
          <Text style={styles.secondaryText}>Ghana address</Text>
        </Pressable>
      </Link>

      <Link href={{ pathname: '/profile/map-confirmation' }} asChild>
        <Pressable style={styles.secondary}>
          <Text style={styles.secondaryText}>Map confirmation</Text>
        </Pressable>
      </Link>

      <Link href="/profile/manual-biometric" asChild>
        <Pressable style={styles.secondary}>
          <Text style={styles.secondaryText}>Manual biometric review</Text>
        </Pressable>
      </Link>

      <Link href={{ pathname: '/profile/privacy' }} asChild>
        <Pressable style={styles.secondary}>
          <Text style={styles.secondaryText}>Masked profile and map privacy</Text>
        </Pressable>
      </Link>

      <Link href={{ pathname: '/location-privacy' }} asChild>
        <Pressable style={styles.secondary}>
          <Text style={styles.secondaryText}>Address and identity providers</Text>
        </Pressable>
      </Link>

      <Link href="/report/evidence" asChild>
        <Pressable style={styles.secondary}>
          <Text style={styles.secondaryText}>Report evidence</Text>
        </Pressable>
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderWidth: 1,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
    gap: tokens.spacing.sm,
  },
  name: {
    color: tokens.color.textPrimary,
    fontSize: tokens.type.section,
    fontWeight: '800',
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
  button: {
    minHeight: tokens.touch.min,
    justifyContent: 'center',
    backgroundColor: tokens.color.primary,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
  },
  buttonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '700',
  },
  secondary: {
    minHeight: tokens.touch.min,
    justifyContent: 'center',
    borderColor: tokens.color.primary,
    borderWidth: 1,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
  },
  secondaryText: {
    color: tokens.color.primary,
    textAlign: 'center',
    fontWeight: '700',
  },
});