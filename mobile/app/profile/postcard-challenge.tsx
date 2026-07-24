import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '@/components/Screen';
import {
  completeResidenceVerificationFromPostcard,
  createDay2BPostcardChallenge,
  day2bTestCode,
} from '@/lib/day2b-verification';
import type { TestResidenceChallengeSummary } from '@/lib/day2b-live-repository';
import { tokens } from '@/theme/tokens';

export default function PostcardChallengeScreen() {
  const [code, setCode] = useState(day2bTestCode);
  const [challenge, setChallenge] = useState<TestResidenceChallengeSummary>();
  const [error, setError] = useState('');
  const [working, setWorking] = useState(false);

  async function createChallenge() {
    setWorking(true);
    setError('');

    const result = await createDay2BPostcardChallenge();
    if (result.data) {
      setChallenge(result.data);
    }
    setError(result.error ?? '');
    setWorking(false);
  }

  async function confirmCode() {
    if (!challenge) {
      setError('Create a test postcard challenge first.');
      return;
    }

    setWorking(true);
    setError('');

    const result = await completeResidenceVerificationFromPostcard({ challengeId: challenge.id, code });
    if (result.data?.canRead) {
      router.replace('/community');
      return;
    }

    setError(result.error ?? 'The postcard challenge could not be verified.');
    setWorking(false);
  }

  return (
    <Screen title="Postcard challenge">
      <View style={styles.notice}>
        <Text style={styles.noticeText}>
          Test mode only. Supabase stores the postcard code as a salted hash and creates verified membership through the
          database RPC.
        </Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable style={styles.button} onPress={createChallenge} disabled={working}>
        <Text style={styles.buttonText}>{working ? 'Working...' : 'Create test postcard challenge'}</Text>
      </Pressable>

      {challenge ? (
        <View style={styles.card}>
          <Text style={styles.title}>Status: {challenge.status}</Text>
          <Text style={styles.body}>Challenge ID: {challenge.id}</Text>
          <Text style={styles.meta}>Test code: {challenge.challengeCode}</Text>
          <Text style={styles.meta}>Code stored as hash: Yes</Text>
          <Text style={styles.meta}>Exact address public: No</Text>
          <Text style={styles.meta}>AI final decision: No</Text>
        </View>
      ) : null}

      <Text style={styles.label}>Postcard code</Text>
      <TextInput value={code} onChangeText={setCode} autoCapitalize="characters" style={styles.input} />

      <Pressable style={styles.secondary} onPress={confirmCode} disabled={working}>
        <Text style={styles.secondaryText}>Confirm code and unlock feed</Text>
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
  error: {
    color: tokens.color.error,
    fontSize: tokens.type.support,
    fontWeight: '700',
  },
});
