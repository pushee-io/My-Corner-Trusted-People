import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { signInWithEmailPassword } from '@/lib/auth';
import { tokens } from '@/theme/tokens';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const disabled = submitting || !email.trim() || !password;

  async function signIn() {
    setError(undefined);
    setSubmitting(true);

    try {
      const profile = await signInWithEmailPassword(email, password);
      if (profile.role === 'moderator' || profile.role === 'admin') {
        router.replace('/marketplace/moderation');
      } else {
        router.replace(profile.role === 'provider' ? '/provider/requests' : '/neighborhood');
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not sign in.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen title="Sign in" showBottomNavigation={false}>
      <Text style={styles.text}>Sign in with your My Corner pilot account.</Text>

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

      <View style={styles.field}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          accessibilityLabel="Password"
          autoCapitalize="none"
          autoComplete="password"
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor={tokens.color.textSecondary}
          secureTextEntry
          style={styles.input}
          textContentType="password"
          value={password}
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
        onPress={signIn}
        style={[styles.button, disabled ? styles.disabled : null]}
      >
        <Text style={styles.buttonText}>{submitting ? 'Signing in...' : 'Sign in'}</Text>
      </Pressable>

      <Link href="/forgot-password" asChild>
        <Pressable accessibilityRole="button" style={styles.recoveryButton}>
          <Text style={styles.recoveryButtonText}>Forgot password?</Text>
        </Pressable>
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  text: { fontSize: tokens.type.body, color: tokens.color.textPrimary },
  field: { gap: tokens.spacing.xs },
  label: { color: tokens.color.textPrimary, fontSize: tokens.type.label, fontWeight: '700' },
  input: {
    minHeight: tokens.touch.min,
    borderColor: tokens.color.border,
    borderWidth: 1,
    borderRadius: tokens.radius.md,
    color: tokens.color.textPrimary,
    fontSize: tokens.type.body,
    padding: tokens.spacing.md,
  },
  error: { fontSize: tokens.type.support, color: tokens.color.error },
  recoveryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: tokens.touch.min,
    padding: tokens.spacing.md,
  },
  recoveryButtonText: { color: tokens.color.primary, fontWeight: '700', textAlign: 'center' },
  button: {
    minHeight: tokens.touch.min,
    justifyContent: 'center',
    backgroundColor: tokens.color.primary,
    padding: tokens.spacing.md,
    borderRadius: tokens.radius.md,
  },
  disabled: { opacity: 0.5 },
  buttonText: { color: '#FFFFFF', textAlign: 'center', fontWeight: '700' },
});
