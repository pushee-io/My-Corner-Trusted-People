import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '@/components/Screen';
import {
  confirmPostcardChallengeCode,
  createPostcardChallenge,
  getPostcardChallenge,
} from '@/lib/postcard-challenge';
import { tokens } from '@/theme/tokens';

export default function PostcardChallengeScreen() {
  const [neighborhood, setNeighborhood] = useState('East Legon');
  const [city, setCity] = useState('Accra');
  const [mailingAreaLabel, setMailingAreaLabel] = useState('East Legon general mailing area');
  const [code, setCode] = useState('MC-2468');
  const [challenge, setChallenge] = useState(getPostcardChallenge());
  const [errors, setErrors] = useState<string[]>([]);

  function createChallenge() {
    const result = createPostcardChallenge({
      neighborhood,
      city,
      mailingAreaLabel,
    });

    setErrors(result.errors);
    if (result.challenge) {
      setChallenge(result.challenge);
    }
  }

  function confirmCode() {
    setChallenge(confirmPostcardChallengeCode(code));
  }

  return (
    <Screen title="Postcard challenge">
      <View style={styles.notice}>
        <Text style={styles.noticeText}>
          Test mode only. This fictional postcard challenge uses a broad mailing area and does not expose exact addresses.
        </Text>
      </View>

      <Text style={styles.label}>Neighborhood</Text>
      <TextInput value={neighborhood} onChangeText={setNeighborhood} style={styles.input} />

      <Text style={styles.label}>City</Text>
      <TextInput value={city} onChangeText={setCity} style={styles.input} />

      <Text style={styles.label}>Broad mailing area label</Text>
      <TextInput value={mailingAreaLabel} onChangeText={setMailingAreaLabel} style={styles.input} />

      {errors.map((error) => (
        <Text key={error} style={styles.error}>{error}</Text>
      ))}

      <Pressable style={styles.button} onPress={createChallenge}>
        <Text style={styles.buttonText}>Create test postcard challenge</Text>
      </Pressable>

      {challenge ? (
        <View style={styles.card}>
          <Text style={styles.title}>Status: {challenge.status}</Text>
          <Text style={styles.body}>Provider: {challenge.provider}</Text>
          <Text style={styles.body}>Mailing area: {challenge.mailingAreaLabel}</Text>
          <Text style={styles.meta}>Test code: {challenge.challengeCode}</Text>
          <Text style={styles.meta}>Exact address public: No</Text>
          <Text style={styles.meta}>Exact coordinates stored: No</Text>
          <Text style={styles.meta}>Ghana Card used: No</Text>
          <Text style={styles.meta}>AI final decision: No</Text>
          <Text style={styles.meta}>Automatic residence proof: No</Text>
          <Text style={styles.meta}>Human review required: Yes</Text>
        </View>
      ) : null}

      <Text style={styles.label}>Postcard code</Text>
      <TextInput value={code} onChangeText={setCode} style={styles.input} />

      <Pressable style={styles.secondary} onPress={confirmCode}>
        <Text style={styles.secondaryText}>Confirm test code</Text>
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
