import { router, type Href } from 'expo-router';
import { useEffect, useState, type ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { EventsFeatureGate } from '@/components/events/EventsFeatureGate';
import { eventsRuntimeRepository } from '@/lib/events-runtime-repository';
import { eventErrorMessage } from '@/lib/events-errors';
import { tokens } from '@/theme/tokens';
import type { EventVisibility } from '@/types/events';
import type { EventsRuntimeContext } from '@/lib/events-runtime-contract';

export default function NewEventScreen() {
  return (
    <EventsFeatureGate>
      <NewEventContent />
    </EventsFeatureGate>
  );
}

function NewEventContent() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [capacity, setCapacity] = useState('');
  const [visibility, setVisibility] = useState<EventVisibility>('verified_neighborhood_members');
  const [context, setContext] = useState<EventsRuntimeContext>();
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    eventsRuntimeRepository
      .getContext()
      .then(setContext)
      .catch((caught) => {
        setError(caught instanceof Error ? caught.message : 'Could not load your verified neighborhood.');
      });
  }, []);

  async function submit() {
    setSaving(true);
    setError(undefined);
    try {
      if (!context) throw new Error('Your verified neighborhood is still loading.');
      const startsAt = new Date(`${date}T${time}:00.000Z`);
      if (!date || !time || Number.isNaN(startsAt.getTime())) throw new Error('Enter a valid date and time.');
      if (startsAt.getTime() <= Date.now()) throw new Error('Event time must be in the future.');
      const parsedCapacity = capacity ? Number(capacity) : undefined;
      if (parsedCapacity !== undefined && (!Number.isInteger(parsedCapacity) || parsedCapacity < 1)) {
        throw new Error('Capacity must be a whole number greater than zero.');
      }
      await eventsRuntimeRepository.createEvent({
        neighborhoodId: context.neighborhoodId,
        title,
        description,
        startsAt: startsAt.toISOString(),
        timezone: 'Africa/Accra',
        areaLabel: `${context.neighborhoodName}, general area only`,
        visibility,
        capacity: parsedCapacity,
      });
      router.replace('/events' as Href);
    } catch (caught) {
      setError(eventErrorMessage(caught));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen title="Create event" showBottomNavigation={false}>
      <Text style={styles.notice}>Use a general area here. Do not enter a private residential address.</Text>
      <Field label="Event title" value={title} onChangeText={setTitle} />
      <Field label="Description" value={description} onChangeText={setDescription} multiline />
      <Field
        label="Date"
        accessibilityHint="Use year dash month dash day"
        placeholder="YYYY-MM-DD"
        value={date}
        onChangeText={setDate}
        autoCapitalize="none"
      />
      <Field
        label="Time"
        accessibilityHint="Use 24-hour time in Ghana"
        placeholder="HH:MM"
        value={time}
        onChangeText={setTime}
        autoCapitalize="none"
      />
      <View style={styles.field}>
        <Text style={styles.label}>Who can see this event?</Text>
        {(
          [
            ['verified_neighborhood_members', 'Verified neighborhood'],
            ['immediate_cluster_members', 'Nearby cluster'],
            ['invite_only', 'Invite only'],
          ] as const
        ).map(([value, label]) => (
          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ checked: visibility === value }}
            key={value}
            onPress={() => setVisibility(value)}
            style={[styles.choice, visibility === value ? styles.choiceSelected : null]}
          >
            <Text style={visibility === value ? styles.choiceSelectedText : styles.choiceText}>{label}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.area}>General area: {context?.neighborhoodName ?? 'Loading verified neighborhood...'}</Text>
      <Field label="Capacity (optional)" value={capacity} onChangeText={setCapacity} keyboardType="number-pad" />
      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}
      <View style={styles.actions}>
        <Pressable
          accessibilityLabel="Cancel event draft"
          accessibilityRole="button"
          onPress={() => router.back()}
          style={styles.secondary}
        >
          <Text style={styles.secondaryText}>Cancel</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Save event draft"
          accessibilityState={{ disabled: saving }}
          disabled={saving}
          onPress={submit}
          style={styles.primary}
        >
          <Text style={styles.primaryText}>{saving ? 'Saving...' : 'Save draft'}</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

type FieldProps = ComponentProps<typeof TextInput> & { label: string };
function Field({ label, ...props }: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={tokens.color.textSecondary}
        style={[styles.input, props.multiline ? styles.multiline : null]}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  notice: {
    color: tokens.color.textPrimary,
    backgroundColor: tokens.color.secondary,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.md,
    fontSize: tokens.type.support,
  },
  area: { color: tokens.color.textSecondary, fontSize: tokens.type.support },
  field: { gap: tokens.spacing.xs },
  label: { color: tokens.color.textPrimary, fontSize: tokens.type.label, fontWeight: '700' },
  input: {
    minHeight: tokens.touch.min,
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderWidth: 1,
    borderRadius: tokens.radius.md,
    color: tokens.color.textPrimary,
    fontSize: tokens.type.body,
    padding: tokens.spacing.md,
  },
  multiline: { minHeight: 112, textAlignVertical: 'top' },
  choice: {
    minHeight: tokens.touch.min,
    justifyContent: 'center',
    borderColor: tokens.color.border,
    borderWidth: 1,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.md,
  },
  choiceSelected: { backgroundColor: tokens.color.primary, borderColor: tokens.color.primary },
  choiceText: { color: tokens.color.textPrimary, fontSize: tokens.type.body },
  choiceSelectedText: { color: '#FFFFFF', fontSize: tokens.type.body, fontWeight: '700' },
  error: { color: tokens.color.error, fontSize: tokens.type.body },
  actions: { flexDirection: 'row', gap: tokens.spacing.md },
  primary: {
    flex: 1,
    minHeight: tokens.touch.min,
    justifyContent: 'center',
    backgroundColor: tokens.color.primary,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.md,
  },
  primaryText: { color: '#FFFFFF', fontWeight: '700', textAlign: 'center' },
  secondary: {
    flex: 1,
    minHeight: tokens.touch.min,
    justifyContent: 'center',
    borderColor: tokens.color.primary,
    borderWidth: 1,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.md,
  },
  secondaryText: { color: tokens.color.primary, fontWeight: '700', textAlign: 'center' },
});
