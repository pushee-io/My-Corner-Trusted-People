import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput } from 'react-native';
import { Screen } from '@/components/Screen';
import { registerWithEmailPassword } from '@/lib/auth';
import { tokens } from '@/theme/tokens';

export default function CreateAccountScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string>();
  const [error, setError] = useState<string>();
  async function submit() {
    if (busy) return;
    setBusy(true);
    setError(undefined);
    try {
      const signedIn = await registerWithEmailPassword(name, email, password);
      setPassword('');
      if (signedIn) router.replace('/neighborhood');
      else setMessage('Check your email for confirmation instructions, then return to sign in.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not create your account.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <Screen title="Create Account" showBottomNavigation={false}>
      <Text style={styles.body}>Join My Corner. Neighborhood access becomes available after verification.</Text>
      <TextInput
        accessibilityLabel="Your name"
        placeholder="Your name"
        value={name}
        onChangeText={setName}
        editable={!busy}
        style={styles.input}
        autoComplete="name"
      />
      <TextInput
        accessibilityLabel="Email"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        editable={!busy}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        style={styles.input}
      />
      <TextInput
        accessibilityLabel="Password"
        placeholder="Password (at least 8 characters)"
        value={password}
        onChangeText={setPassword}
        editable={!busy}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="new-password"
        style={styles.input}
      />
      {error ? (
        <Text accessibilityRole="alert" style={styles.body}>
          {error}
        </Text>
      ) : null}
      {message ? (
        <Text accessibilityLiveRegion="polite" style={styles.body}>
          {message}
        </Text>
      ) : null}
      <Pressable
        accessibilityRole="button"
        disabled={busy || Boolean(message)}
        accessibilityState={{ disabled: busy || Boolean(message) }}
        onPress={() => {
          void submit();
        }}
        style={styles.button}
      >
        <Text style={styles.buttonText}>{busy ? 'Creating account…' : 'Create Account'}</Text>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={() => router.replace('/sign-in')} style={styles.button}>
        <Text style={styles.buttonText}>Already have an account? Sign in</Text>
      </Pressable>
    </Screen>
  );
}
const styles = StyleSheet.create({
  body: { color: tokens.color.textPrimary, fontSize: tokens.type.body },
  input: {
    color: tokens.color.textPrimary,
    fontSize: tokens.type.body,
    minHeight: 48,
    padding: 12,
    borderWidth: 1,
    borderColor: tokens.color.border,
    borderRadius: 12,
  },
  button: {
    minHeight: 48,
    padding: 12,
    backgroundColor: tokens.color.primary,
    borderRadius: 12,
    justifyContent: 'center',
  },
  buttonText: { color: '#FFFFFF', textAlign: 'center', fontWeight: '700' },
});
