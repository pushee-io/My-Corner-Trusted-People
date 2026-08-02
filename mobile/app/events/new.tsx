import { router, type Href } from 'expo-router';
import { useState, type ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { eventsRepository } from '@/lib/events-repository';
import { tokens } from '@/theme/tokens';

export default function NewEventScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startsAt, setStartsAt] = useState('2026-09-12T09:00:00.000Z');
  const [areaLabel, setAreaLabel] = useState('East Legon, general area only');
  const [capacity, setCapacity] = useState('');
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);

  async function submit() {
    setSaving(true); setError(undefined);
    try {
      await eventsRepository.createEvent({ neighborhoodId: 'east-legon', title, description, startsAt, timezone: 'Africa/Accra', areaLabel, visibility: 'verified_neighborhood_members', capacity: capacity ? Number(capacity) : undefined });
      router.replace('/events' as Href);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not save the event.');
    } finally { setSaving(false); }
  }

  return (
    <Screen title="Create event" showBottomNavigation={false}>
      <Text style={styles.notice}>Use a general area here. Do not enter a private residential address.</Text>
      <Field label="Event title" value={title} onChangeText={setTitle} />
      <Field label="Description" value={description} onChangeText={setDescription} multiline />
      <Field label="Start time (ISO)" value={startsAt} onChangeText={setStartsAt} autoCapitalize="none" />
      <Field label="General area" value={areaLabel} onChangeText={setAreaLabel} />
      <Field label="Capacity (optional)" value={capacity} onChangeText={setCapacity} keyboardType="number-pad" />
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      <View style={styles.actions}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.secondary}><Text style={styles.secondaryText}>Cancel</Text></Pressable>
        <Pressable accessibilityRole="button" accessibilityState={{ disabled: saving }} disabled={saving} onPress={submit} style={styles.primary}><Text style={styles.primaryText}>{saving ? 'Saving...' : 'Save draft'}</Text></Pressable>
      </View>
    </Screen>
  );
}

type FieldProps = ComponentProps<typeof TextInput> & { label: string };
function Field({ label, ...props }: FieldProps) {
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput accessibilityLabel={label} placeholderTextColor={tokens.color.textSecondary} style={[styles.input, props.multiline ? styles.multiline : null]} {...props} /></View>;
}

const styles = StyleSheet.create({
  notice: { color: tokens.color.textPrimary, backgroundColor: tokens.color.secondary, borderRadius: tokens.radius.md, padding: tokens.spacing.md, fontSize: tokens.type.support },
  field: { gap: tokens.spacing.xs }, label: { color: tokens.color.textPrimary, fontSize: tokens.type.label, fontWeight: '700' },
  input: { minHeight: tokens.touch.min, backgroundColor: tokens.color.surface, borderColor: tokens.color.border, borderWidth: 1, borderRadius: tokens.radius.md, color: tokens.color.textPrimary, fontSize: tokens.type.body, padding: tokens.spacing.md },
  multiline: { minHeight: 112, textAlignVertical: 'top' }, error: { color: tokens.color.error, fontSize: tokens.type.body },
  actions: { flexDirection: 'row', gap: tokens.spacing.md },
  primary: { flex: 1, minHeight: tokens.touch.min, justifyContent: 'center', backgroundColor: tokens.color.primary, borderRadius: tokens.radius.md, padding: tokens.spacing.md },
  primaryText: { color: '#FFFFFF', fontWeight: '700', textAlign: 'center' },
  secondary: { flex: 1, minHeight: tokens.touch.min, justifyContent: 'center', borderColor: tokens.color.primary, borderWidth: 1, borderRadius: tokens.radius.md, padding: tokens.spacing.md },
  secondaryText: { color: tokens.color.primary, fontWeight: '700', textAlign: 'center' },
});
