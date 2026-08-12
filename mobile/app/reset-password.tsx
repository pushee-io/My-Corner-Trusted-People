import { Link, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { createPasswordRecoverySession, updateRecoveredPassword } from '@/lib/auth';
import { tokens } from '@/theme/tokens';

type RecoveryState = 'loading' | 'ready' | 'invalid' | 'complete';

export default function ResetPasswordScreen() {
  const [state, setState] = useState<RecoveryState>('loading');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const disabled = submitting || state !== 'ready' || !password || !confirmation;

  useEffect(() => {
    let active = true;

    async function acceptRecoveryUrl(url: string | null) {
      if (!active || !url) {
        if (active) setState('invalid');
        return;
      }

      try {
        await createPasswordRecoverySession(url);
        if (active) setState('ready');
      } catch {
        if (active) setState('invalid');
      }
    }

    void Linking.getInitialURL().then(acceptRecoveryUrl);
    const subscription = Linking.addEventListener('url', ({ url }) => {
      void acceptRecoveryUrl(url);
    });

    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  async function updatePassword() {
    setError(undefined);

    if (password !== confirmation) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await updateRecoveredPassword(password);
      setState('complete');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not update your password.');
    } finally {
      setSubmitting(false);
    }
  }

  if (state === 'loading') {
    return (
      <Screen title="Reset password" showBottomNavigation={false}>
        <Text accessibilityLiveRegion="polite" style={styles.text}>
          Validating your recovery link...
        </Text>
      </Screen>
    );
  }

  if (state === 'invalid') {
    return (
      <Screen title="Recovery link unavailable" showBottomNavigation={false}>
        <View style={styles.panel}>
          <Text accessibilityRole="alert" style={styles.text}>
            This password recovery link is invalid or has expired.
          </Text>
          <Link href="/forgot-password" asChild>
            <Pressable accessibilityRole="button" style={styles.button}>
              <Text style={styles.buttonText}>Request another link</Text>
            </Pressable>
          </Link>
        </View>
      </Screen>
    );
  }

  if (state === 'complete') {
    return (
      <Screen title="Password updated" showBottomNavigation={false}>
        <View accessibilityLiveRegion="polite" style={styles.panel}>
          <Text style={styles.text}>Your password was updated. Sign in again with the new password.</Text>
          <Pressable accessibilityRole="button" onPress={() => router.replace('/sign-in')} style={styles.button}>
            <Text style={styles.buttonText}>Sign in</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  return (
    <Screen title="Choose a new password" showBottomNavigation={false}>
      <Text style={styles.text}>Use at least 10 characters. Do not reuse a password from another account.</Text>
      <View style={styles.field}>
        <Text style={styles.label}>New password</Text>
        <TextInput
          accessibilityLabel="New password"
          autoCapitalize="none"
          autoComplete="new-password"
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          textContentType="newPassword"
          value={password}
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Confirm new password</Text>
        <TextInput
          accessibilityLabel="Confirm new password"
          autoCapitalize="none"
          autoComplete="new-password"
          onChangeText={setConfirmation}
          secureTextEntry
          style={styles.input}
          textContentType="newPassword"
          value={confirmation}
        />
      </View>
      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={updatePassword}
        style={[styles.button, disabled ? styles.disabled : null]}
      >
        <Text style={styles.buttonText}>{submitting ? 'Updating...' : 'Update password'}</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: tokens.color.primary,
    borderRadius: tokens.radius.md,
    justifyContent: 'center',
    minHeight: tokens.touch.min,
    padding: tokens.spacing.md,
  },
  buttonText: { color: '#FFFFFF', fontWeight: '700', textAlign: 'center' },
  disabled: { opacity: 0.5 },
  error: { color: tokens.color.error, fontSize: tokens.type.support },
  field: { gap: tokens.spacing.xs },
  input: {
    borderColor: tokens.color.border,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    color: tokens.color.textPrimary,
    fontSize: tokens.type.body,
    minHeight: tokens.touch.min,
    padding: tokens.spacing.md,
  },
  label: { color: tokens.color.textPrimary, fontSize: tokens.type.label, fontWeight: '700' },
  panel: {
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    gap: tokens.spacing.md,
    padding: tokens.spacing.lg,
  },
  text: { color: tokens.color.textPrimary, fontSize: tokens.type.body },
});
