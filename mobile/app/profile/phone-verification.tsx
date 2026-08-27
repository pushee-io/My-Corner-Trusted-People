import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '@/components/Screen';
import {
  confirmPhoneVerification,
  getPhoneVerificationSession,
  isTestPhoneVerificationEnabled,
  startPhoneVerification,
} from '@/lib/phone-verification';
import { tokens } from '@/theme/tokens';

export default function PhoneVerificationScreen() {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const testProviderEnabled = isTestPhoneVerificationEnabled();
  const [session, setSession] = useState(getPhoneVerificationSession());

  function sendCode() {
    setSession(startPhoneVerification(phone));
  }

  function confirmCode() {
    setSession(confirmPhoneVerification(code));
  }

  return (
    <Screen title="Phone verification">
      <View style={styles.notice}>
        <Text style={styles.noticeText}>
{testProviderEnabled
            ? 'Local development test provider. No real SMS is sent.'
            : 'Real SMS verification is not active. Test codes are disabled in Preview and Production.'}
        </Text>
      </View>

      <Text style={styles.label}>Ghana phone number</Text>
      <TextInput
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        placeholder="0240000000 or +233240000000"
        style={styles.input}
        accessibilityLabel="Ghana phone number"
      />

      <Pressable
        disabled={!testProviderEnabled}
        style={[styles.button, !testProviderEnabled ? styles.disabled : null]}
        onPress={sendCode}
      >
        <Text style={styles.buttonText}>Send test code</Text>
      </Pressable>

      {session ? (
        <View style={styles.card}>
          <Text style={styles.title}>Provider: {session.provider}</Text>
          <Text style={styles.body}>Status: {session.status}</Text>
          <Text style={styles.body}>Normalized phone: {session.phoneE164 || 'Invalid Ghana phone number'}</Text>
          {testProviderEnabled && session.status === 'code_sent' && session.testCode ? (
            <Text style={styles.meta}>Use local test code: {session.testCode}</Text>
          ) : null}
        </View>
      ) : null}

      <Text style={styles.label}>Verification code</Text>
      <TextInput
        value={code}
        onChangeText={setCode}
        keyboardType="number-pad"
        style={styles.input}
        accessibilityLabel="Verification code"
      />

      <Pressable
        disabled={!testProviderEnabled}
        style={[styles.secondary, !testProviderEnabled ? styles.disabled : null]}
        onPress={confirmCode}
      >
        <Text style={styles.secondaryText}>Confirm code</Text>
      </Pressable>
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
  label: {
    color: tokens.color.textPrimary,
    fontSize: tokens.type.label,
    fontWeight: '700',
  },
  input: {
    minHeight: tokens.touch.min,
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderWidth: 1,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
    color: tokens.color.textPrimary,
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
  disabled: { opacity: 0.5 },
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
  body: {
    color: tokens.color.textPrimary,
    fontSize: tokens.type.body,
  },
  meta: {
    color: tokens.color.textSecondary,
    fontSize: tokens.type.support,
  },
});
