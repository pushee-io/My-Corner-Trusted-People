import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { EventsFeatureGate } from '@/components/events/EventsFeatureGate';
import { eventsRuntimeRepository } from '@/lib/events-runtime-repository';
import { eventErrorMessage } from '@/lib/events-errors';
import { tokens } from '@/theme/tokens';

export default function EditEventScreen() {
  return (
    <EventsFeatureGate>
      <EditEventContent />
    </EventsFeatureGate>
  );
}

function EditEventContent() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!eventId) return;
    eventsRuntimeRepository
      .getEvent(eventId)
      .then((event) => {
        if (!event?.currentUserOrganizerRole) throw new Error('Organizer permission is required.');
        setTitle(event.title);
        setDescription(event.description);
      })
      .catch((caught) => setError(caught instanceof Error ? caught.message : 'Could not load event.'))
      .finally(() => setLoading(false));
  }, [eventId]);

  async function save() {
    if (!eventId) return;
    setSaving(true);
    setError(undefined);
    try {
      if (title.trim().length < 3) throw new Error('Title must contain at least three characters.');
      if (description.trim().length < 10) throw new Error('Description must contain at least ten characters.');
      await eventsRuntimeRepository.updateEvent(eventId, { title: title.trim(), description: description.trim() });
      router.back();
    } catch (caught) {
      setError(eventErrorMessage(caught));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen title="Edit event" showBottomNavigation={false}>
      {loading ? (
        <Text accessibilityLiveRegion="polite" style={styles.meta}>
          Loading event...
        </Text>
      ) : null}
      <View style={styles.field}>
        <Text style={styles.label}>Event title</Text>
        <TextInput
          accessibilityLabel="Event title"
          editable={!loading}
          onChangeText={setTitle}
          style={styles.input}
          value={title}
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          accessibilityLabel="Event description"
          editable={!loading}
          multiline
          onChangeText={setDescription}
          style={[styles.input, styles.multiline]}
          value={description}
        />
      </View>
      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}
      <View style={styles.actions}>
        <Pressable
          accessibilityLabel="Cancel editing"
          accessibilityRole="button"
          onPress={() => router.back()}
          style={styles.secondary}
        >
          <Text style={styles.secondaryText}>Cancel</Text>
        </Pressable>
        <Pressable
          accessibilityLabel="Save event changes"
          accessibilityRole="button"
          accessibilityState={{ disabled: saving || loading }}
          disabled={saving || loading}
          onPress={() => void save()}
          style={styles.primary}
        >
          <Text style={styles.primaryText}>{saving ? 'Saving...' : 'Save'}</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  multiline: { minHeight: 120, textAlignVertical: 'top' },
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
  meta: { color: tokens.color.textSecondary, fontSize: tokens.type.support },
  error: { color: tokens.color.error, fontSize: tokens.type.body, fontWeight: '700' },
});
