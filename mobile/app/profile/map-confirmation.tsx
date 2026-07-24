import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { createMapConfirmation, getMapConfirmation } from '@/lib/map-confirmation';
import { tokens } from '@/theme/tokens';

export default function MapConfirmationScreen() {
  const [neighborhood, setNeighborhood] = useState('East Legon');
  const [city, setCity] = useState('Accra');
  const [approximateAreaLabel, setApproximateAreaLabel] = useState('East Legon general area');
  const [record, setRecord] = useState(getMapConfirmation());
  const [errors, setErrors] = useState<string[]>([]);

  function confirm() {
    const result = createMapConfirmation({
      neighborhood,
      city,
      approximateAreaLabel,
    });

    setErrors(result.errors);
    if (result.record) {
      setRecord(result.record);
    }
  }

  return (
    <Screen title="Map confirmation">
      <View style={styles.notice}>
        <Text style={styles.noticeText}>
          Confirm only your broad neighborhood area. My Corner does not show an exact home pin or public residential
          coordinates.
        </Text>
      </View>

      <View style={styles.mapBox}>
        <Text style={styles.mapTitle}>Approximate area</Text>
        <Text style={styles.mapText}>{approximateAreaLabel}</Text>
        <Text style={styles.mapText}>No exact home pin</Text>
      </View>

      <Text style={styles.label}>Neighborhood</Text>
      <TextInput value={neighborhood} onChangeText={setNeighborhood} style={styles.input} />

      <Text style={styles.label}>City</Text>
      <TextInput value={city} onChangeText={setCity} style={styles.input} />

      <Text style={styles.label}>Broad area label</Text>
      <TextInput value={approximateAreaLabel} onChangeText={setApproximateAreaLabel} style={styles.input} />

      {errors.map((error) => (
        <Text key={error} style={styles.error}>
          {error}
        </Text>
      ))}

      <Pressable style={styles.button} onPress={confirm}>
        <Text style={styles.buttonText}>Confirm approximate area</Text>
      </Pressable>

      {record ? (
        <View style={styles.card}>
          <Text style={styles.title}>Map area confirmed</Text>
          <Text style={styles.body}>{record.approximateAreaLabel}</Text>
          <Text style={styles.meta}>Provider: {record.mapProvider}</Text>
          <Text style={styles.meta}>Mode: {record.confirmationMode}</Text>
          <Text style={styles.meta}>Exact home pin shown: No</Text>
          <Text style={styles.meta}>Exact coordinates stored: No</Text>
          <Text style={styles.meta}>Exact coordinates public: No</Text>
          <Text style={styles.meta}>Proof of residence: No</Text>
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
  mapBox: {
    minHeight: 180,
    justifyContent: 'center',
    backgroundColor: '#EEF7F4',
    borderColor: tokens.color.primary,
    borderWidth: 1,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
    gap: tokens.spacing.sm,
  },
  mapTitle: {
    color: tokens.color.textPrimary,
    fontSize: tokens.type.section,
    fontWeight: '800',
    textAlign: 'center',
  },
  mapText: {
    color: tokens.color.textPrimary,
    fontSize: tokens.type.body,
    textAlign: 'center',
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
