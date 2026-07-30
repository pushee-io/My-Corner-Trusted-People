import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Screen } from '@/components/Screen';
import { signInWithConfiguredTestAccount } from '@/lib/auth';
import { tokens } from '@/theme/tokens';

export default function SignInScreen() {
  const [error, setError] = useState<string>();
  const [loadingRole, setLoadingRole] = useState<'requester' | 'provider'>();

  async function signIn(role: 'requester' | 'provider') {
    setError(undefined);
    setLoadingRole(role);

    try {
      await signInWithConfiguredTestAccount(role);
      router.push(role === 'provider' ? '/provider' : '/neighborhood');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not sign in.');
    } finally {
      setLoadingRole(undefined);
    }
  }

  return (
    <Screen title="Sign in" showBottomNavigation={false}>
      <Text style={styles.text}>Use a safe seeded account to continue this prototype.</Text>
      <Text style={styles.helper}>Requester: Akosua Mensah. Provider: Kwame PipeCare.</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable disabled={loadingRole !== undefined} onPress={() => signIn('requester')} style={styles.button}>
        <Text style={styles.buttonText}>{loadingRole === 'requester' ? 'Signing in...' : 'Continue as requester'}</Text>
      </Pressable>

      <Pressable disabled={loadingRole !== undefined} onPress={() => signIn('provider')} style={styles.secondary}>
        <Text style={styles.secondaryText}>
          {loadingRole === 'provider' ? 'Signing in...' : 'Continue as provider'}
        </Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  text: { fontSize: tokens.type.body, color: tokens.color.textPrimary },
  helper: { fontSize: tokens.type.support, color: tokens.color.textSecondary },
  error: { fontSize: tokens.type.support, color: tokens.color.error },
  button: { backgroundColor: tokens.color.primary, padding: tokens.spacing.lg, borderRadius: tokens.radius.md },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: '700' },
  secondary: {
    borderColor: tokens.color.primary,
    borderWidth: 1,
    padding: tokens.spacing.lg,
    borderRadius: tokens.radius.md,
  },
  secondaryText: { color: tokens.color.primary, textAlign: 'center', fontWeight: '700' },
});
