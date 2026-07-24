import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { getLegalNameRecord, saveLegalName } from '@/lib/legal-name';
import { tokens } from '@/theme/tokens';

export default function LegalNameScreen() {
  const [givenNames, setGivenNames] = useState('Akosua');
  const [familyName, setFamilyName] = useState('Mensah');
  const [record, setRecord] = useState(getLegalNameRecord());
  const [errors, setErrors] = useState<string[]>([]);

  function save() {
    const result = saveLegalName({ givenNames, familyName });

    setErrors(result.errors);
    if (result.record) {
      setRecord(result.record);
    }
  }

  return (
    <Screen title="Legal name">
      <View style={styles.notice}>
        <Text style={styles.noticeText}>
          Legal name is a private record for human review. It is not shown on your public profile and AI does not verify
          it.
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

      {errors.map((error) => (
        <Text key={error} style={styles.error}>
          {error}
        </Text>
      ))}

      <Pressable style={styles.button} onPress={save}>
        <Text style={styles.buttonText}>Save private legal name</Text>
      </Pressable>

      {record ? (
        <View style={styles.card}>
          <Text style={styles.title}>Private record saved</Text>
          <Text style={styles.body}>{record.fullLegalName}</Text>
          <Text style={styles.meta}>Visibility: private admin review only</Text>
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
