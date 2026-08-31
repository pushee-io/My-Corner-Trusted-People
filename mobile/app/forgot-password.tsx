import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { WebSafeLink } from '@/components/WebSafeLink';
import { Screen } from '@/components/Screen';
import { requestPasswordReset } from '@/lib/auth';
import { tokens } from '@/theme/tokens';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const disabled = submitting || !email.trim();

  async function submit() {
    setError(undefined);
    setSubmitting(true);

    try {
      await requestPasswordReset(email);
      setSubmitted(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'We could not send recovery instructions.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen title="Reset password" showBottomNavigation={false}>
      {submitted ? (
        <View accessibilityLiveRegion="polite" style={styles.success}>
          <Text style={styles.title}>Check your email</Text>
          <Text style={styles.text}>
            If an account matches that address, My Corner sent a password recovery link. The link expires and can only
            be used to reset access.
          </Text>
          <WebSafeLink href="/sign-in" asChild>
            <Pressable accessibilityRole="button" style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Back to sign in</Text>
            </Pressable>
          </WebSafeLink>
        </View>
      ) : (
        <>
          <Text style={styles.text}>Enter the email address used for your My Corner pilot account.</Text>
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              accessibilityLabel="Email"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="name@example.com"
              placeholderTextColor={tokens.color.textSecondary}
              style={styles.input}
              textContentType="emailAddress"
              value={email}
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
            onPress={submit}
            style={[styles.button, disabled ? styles.disabled : null]}
          >
            <Text style={styles.buttonText}>{submitting ? 'Sending...' : 'Send recovery link'}</Text>
          </Pressable>
          <WebSafeLink href="/sign-in" asChild>
            <Pressable accessibilityRole="button" style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Back to sign in</Text>
            </Pressable>
          </WebSafeLink>
        </>
      )}
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
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: tokens.touch.min,
    padding: tokens.spacing.md,
  },
  secondaryButtonText: { color: tokens.color.primary, fontWeight: '700', textAlign: 'center' },
  success: {
    backgroundColor: '#EEF7F4',
    borderColor: tokens.color.success,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    gap: tokens.spacing.md,
    padding: tokens.spacing.lg,
  },
  text: { color: tokens.color.textPrimary, fontSize: tokens.type.body },
  title: { color: tokens.color.textPrimary, fontSize: tokens.type.card, fontWeight: '700' },
});
