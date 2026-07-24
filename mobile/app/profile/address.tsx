import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { AddressProvider, addressProviderOptions, getGhanaAddressRecord, saveGhanaAddress } from '@/lib/ghana-address';
import { tokens } from '@/theme/tokens';

export default function GhanaAddressScreen() {
  const [neighborhood, setNeighborhood] = useState('East Legon');
  const [city, setCity] = useState('Accra');
  const [areaLabel, setAreaLabel] = useState('East Legon general area');
  const [ghanaPostGps, setGhanaPostGps] = useState('GA-123-4567');
  const [provider, setProvider] = useState<AddressProvider>('ghana_post_gps');
  const [record, setRecord] = useState(getGhanaAddressRecord());
  const [errors, setErrors] = useState<string[]>([]);

  function save() {
    const result = saveGhanaAddress({
      neighborhood,
      city,
      areaLabel,
      ghanaPostGps,
      provider,
    });

    setErrors(result.errors);
    if (result.record) {
      setRecord(result.record);
    }
  }

  return (
    <Screen title="Ghana address">
      <View style={styles.notice}>
        <Text style={styles.noticeText}>
          Address is private. Public views show only neighborhood and broad area labels. This does not prove residence.
        </Text>
      </View>

      <Text style={styles.label}>Neighborhood</Text>
      <TextInput value={neighborhood} onChangeText={setNeighborhood} style={styles.input} />

      <Text style={styles.label}>City</Text>
      <TextInput value={city} onChangeText={setCity} style={styles.input} />

      <Text style={styles.label}>Broad public area label</Text>
      <TextInput value={areaLabel} onChangeText={setAreaLabel} style={styles.input} />

      <Text style={styles.label}>GhanaPost GPS optional private field</Text>
      <TextInput value={ghanaPostGps} onChangeText={setGhanaPostGps} style={styles.input} />

      <Text style={styles.label}>Provider abstraction</Text>
      <View style={styles.providerList}>
        {addressProviderOptions.map((option) => (
          <Pressable
            key={option.provider}
            style={[styles.providerCard, provider === option.provider && styles.providerCardSelected]}
            onPress={() => setProvider(option.provider)}
          >
            <Text style={styles.providerTitle}>{option.label}</Text>
            <Text style={styles.meta}>{option.purpose}</Text>
            <Text style={styles.meta}>Proof of residence: No</Text>
          </Pressable>
        ))}
      </View>

      {errors.map((error) => (
        <Text key={error} style={styles.error}>
          {error}
        </Text>
      ))}

      <Pressable style={styles.button} onPress={save}>
        <Text style={styles.buttonText}>Save private address</Text>
      </Pressable>

      {record ? (
        <View style={styles.card}>
          <Text style={styles.title}>Private address saved</Text>
          <Text style={styles.body}>Public label: {record.publicLabel}</Text>
          <Text style={styles.meta}>Provider: {record.provider}</Text>
          <Text style={styles.meta}>Visibility: {record.visibility}</Text>
          <Text style={styles.meta}>Exact address public: No</Text>
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
  providerList: {
    gap: tokens.spacing.sm,
  },
  providerCard: {
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderWidth: 1,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
    gap: tokens.spacing.xs,
  },
  providerCardSelected: {
    borderColor: tokens.color.primary,
    backgroundColor: '#EEF7F4',
  },
  providerTitle: {
    color: tokens.color.textPrimary,
    fontSize: tokens.type.body,
    fontWeight: '700',
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
