import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { completeDay2BLegalName } from '@/lib/day2b-verification';
import type { SafeIdentitySummary } from '@/lib/day2b-live-repository';
import { tokens } from '@/theme/tokens';

export default function LegalNameScreen() {
  const [givenNames, setGivenNames] = useState('Akosua');
  const [familyName, setFamilyName] = useState('Mensah');
  const [record, setRecord] = useState<SafeIdentitySummary>();
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    setError('');

    const result = await completeDay2BLegalName({ givenNames, familyName });
    if (result.data) {
      setRecord(result.data);
    }
    setError(result.error ?? '');
    setSaving(false);
  }

  return (
    <Screen title="Legal name">
      <View style={styles.notice}>
        <Text style={styles.noticeText}>
          Legal name is written to the private identity table. The app reads back only the safe identity summary allowed
          by RLS and column grants.
        </Text>
      </View>

      <Text style={styles.label}>Legal given name or names</Text>
      <TextInput
        value={givenNames}
        onChangeText={setGivenNames}
        style={styles.input}
        accessibilityLabel="Legal given names"
      />

      <Text style={styles.label}>Legal family name</Text>
      <TextInput
        value={familyName}
        onChangeText={setFamilyName}
        style={styles.input}
        accessibilityLabel="Legal family name"
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable style={styles.button} onPress={save} disabled={saving}>
        <Text style={styles.buttonText}>{saving ? 'Saving...' : 'Save private legal name'}</Text>
      </Pressable>

      {record ? (
        <View style={styles.card}>
          <Text style={styles.title}>Private identity saved</Text>
          <Text style={styles.body}>Public display name: {record.publicDisplayName}</Text>
          <Text style={styles.meta}>Assurance status: {record.assuranceStatus}</Text>
          <Text style={styles.meta}>Provider: {record.assuranceProvider}</Text>
          <Text style={styles.meta}>Legal name visible here: No</Text>
          <Text style={styles.meta}>AI verified: No</Text>
        </View>
      ) : null}
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
