import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '@/components/Screen';
import {
  getForegroundLocationConsistencyCheck,
  runForegroundLocationConsistencyCheck,
} from '@/lib/location-consistency';
import { tokens } from '@/theme/tokens';

export default function LocationConsistencyScreen() {
  const [confirmedNeighborhood, setConfirmedNeighborhood] = useState('East Legon');
  const [confirmedCity, setConfirmedCity] = useState('Accra');
  const [observedAreaLabel, setObservedAreaLabel] = useState('Near East Legon, Accra');
  const [check, setCheck] = useState(getForegroundLocationConsistencyCheck());
  const [errors, setErrors] = useState<string[]>([]);

  function runCheck() {
    const result = runForegroundLocationConsistencyCheck({
      confirmedNeighborhood,
      confirmedCity,
      observedAreaLabel,
    });

    setErrors(result.errors);
    if (result.check) {
      setCheck(result.check);
    }
  }

  return (
    <Screen title="Location consistency">
      <View style={styles.notice}>
        <Text style={styles.noticeText}>
          This is a foreground, user-triggered consistency check. It does not track you in the background and does not
          prove residence.
        </Text>
      </View>

      <Text style={styles.label}>Confirmed neighborhood</Text>
      <TextInput value={confirmedNeighborhood} onChangeText={setConfirmedNeighborhood} style={styles.input} />

      <Text style={styles.label}>Confirmed city</Text>
      <TextInput value={confirmedCity} onChangeText={setConfirmedCity} style={styles.input} />

      <Text style={styles.label}>Observed broad area label</Text>
      <TextInput value={observedAreaLabel} onChangeText={setObservedAreaLabel} style={styles.input} />

      {errors.map((error) => (
        <Text key={error} style={styles.error}>
          {error}
        </Text>
      ))}

      <Pressable style={styles.button} onPress={runCheck}>
        <Text style={styles.buttonText}>Run foreground check</Text>
      </Pressable>

      {check ? (
        <View style={styles.card}>
          <Text style={styles.title}>Status: {check.status}</Text>
          <Text style={styles.body}>Observed area: {check.observedAreaLabel}</Text>
          <Text style={styles.meta}>Mode: foreground user-triggered</Text>
          <Text style={styles.meta}>Background tracking: No</Text>
          <Text style={styles.meta}>Exact coordinates stored: No</Text>
          <Text style={styles.meta}>Exact coordinates public: No</Text>
          <Text style={styles.meta}>Proof of residence: No</Text>
          <Text style={styles.meta}>AI final decision: No</Text>
          <Text style={styles.meta}>Human review required: {check.humanReviewRequired ? 'Yes' : 'No'}</Text>
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
