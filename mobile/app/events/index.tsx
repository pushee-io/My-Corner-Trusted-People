import { Link, type Href } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { EventsFeatureGate } from '@/components/events/EventsFeatureGate';
import { eventsRuntimeRepository } from '@/lib/events-runtime-repository';
import { eventStatusLabel, formatEventDate } from '@/lib/events-format';
import { eventErrorMessage } from '@/lib/events-errors';
import { tokens } from '@/theme/tokens';
import type { Event } from '@/types/events';

export default function EventsScreen() {
  return (
    <EventsFeatureGate>
      <EventsContent />
    </EventsFeatureGate>
  );
}

function EventsContent() {
  const { width } = useWindowDimensions();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const load = useCallback(() => {
    setLoading(true);
    setError(undefined);
    eventsRuntimeRepository
      .listEvents()
      .then(setEvents)
      .catch((caught) => setError(eventErrorMessage(caught)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const diagnostics = eventsRuntimeRepository.getDiagnostics();
  const pendingEvents = events.filter((event) => event.moderationStatus === 'pending');
  const upcomingEvents = events.filter((event) => event.moderationStatus !== 'pending');

  return (
    <Screen title="Events">
      <Text style={styles.intro}>
        Plans shared by verified neighbors. Private addresses stay hidden until an organizer allows access for confirmed
        attendees.
      </Text>
      <Link href={'/events/new' as Href} asChild>
        <Pressable accessibilityRole="button" style={styles.primary}>
          <Text style={styles.primaryText}>Create event</Text>
        </Pressable>
      </Link>
      {loading ? <Text style={styles.meta}>Loading local events...</Text> : null}
      {diagnostics.lastReadUsedCache ? (
        <Text accessibilityRole="alert" style={styles.offline}>
          You are offline. Showing the most recently loaded Events.
        </Text>
      ) : null}
      {error ? (
        <View style={styles.notice}>
          <Text style={styles.error}>Could not load events</Text>
          <Text style={styles.meta}>{error}</Text>
          <Pressable
            accessibilityLabel="Retry loading Events"
            accessibilityRole="button"
            onPress={load}
            style={styles.secondary}
          >
            <Text style={styles.secondaryText}>Retry</Text>
          </Pressable>
        </View>
      ) : null}
      {!loading && !error && events.length === 0 ? (
        <View style={styles.notice}>
          <Text style={styles.title}>No upcoming events</Text>
          <Text style={styles.meta}>Create the first plan for your neighborhood.</Text>
        </View>
      ) : null}

      {pendingEvents.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pending review</Text>
          <Text style={styles.meta}>Events waiting for moderator approval.</Text>
          <View style={styles.eventGrid}>
            {pendingEvents.map((event) => (
              <Link
                key={event.id}
                href={{ pathname: '/events/[eventId]', params: { eventId: event.id } } as unknown as Href}
                asChild
              >
                <Pressable accessibilityRole="button" style={[styles.card, width >= 600 ? styles.mediumCard : null]}>
                  <Text style={styles.title}>{event.title}</Text>
                  <Text style={styles.meta}>{formatEventDate(event.startsAt, event.timezone)}</Text>
                  <Text style={styles.body}>{event.areaLabel}</Text>
                  <Text style={styles.meta}>Status: Pending review</Text>
                </Pressable>
              </Link>
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.eventGrid}>
        {upcomingEvents.map((event) => (
          <Link
            key={event.id}
            href={{ pathname: '/events/[eventId]', params: { eventId: event.id } } as unknown as Href}
            asChild
          >
            <Pressable accessibilityRole="button" style={[styles.card, width >= 600 ? styles.mediumCard : null]}>
              <Text style={styles.title}>{event.title}</Text>
              <Text style={styles.meta}>{formatEventDate(event.startsAt, event.timezone)}</Text>
              <Text style={styles.body}>{event.areaLabel}</Text>
              <Text style={styles.meta}>Status: {eventStatusLabel(event)}</Text>
              <Text style={styles.meta}>
                {event.attendeeCount}
                {event.capacity ? ` of ${event.capacity}` : ''} going
              </Text>
            </Pressable>
          </Link>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { color: tokens.color.textPrimary, fontSize: tokens.type.body, lineHeight: 24 },
  eventGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.spacing.md },
  section: { gap: tokens.spacing.sm },
  sectionTitle: { color: tokens.color.textPrimary, fontSize: tokens.type.card, fontWeight: '700' },
  card: {
    minHeight: tokens.touch.min,
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderWidth: 1,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
    gap: tokens.spacing.xs,
  },
  mediumCard: { flexBasis: '48%', flexGrow: 1, minWidth: 260 },
  notice: {
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderWidth: 1,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
    gap: tokens.spacing.sm,
  },
  title: { color: tokens.color.textPrimary, fontSize: tokens.type.card, fontWeight: '700' },
  body: { color: tokens.color.textPrimary, fontSize: tokens.type.body },
  meta: { color: tokens.color.textSecondary, fontSize: tokens.type.support },
  error: { color: tokens.color.error, fontSize: tokens.type.body, fontWeight: '700' },
  offline: {
    color: tokens.color.textPrimary,
    backgroundColor: tokens.color.warning,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.md,
    fontSize: tokens.type.support,
    fontWeight: '700',
  },
  primary: {
    minHeight: tokens.touch.min,
    justifyContent: 'center',
    backgroundColor: tokens.color.primary,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.md,
  },
  primaryText: { color: '#FFFFFF', fontSize: tokens.type.body, fontWeight: '700', textAlign: 'center' },
  secondary: {
    minHeight: tokens.touch.min,
    justifyContent: 'center',
    borderColor: tokens.color.primary,
    borderWidth: 1,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.md,
  },
  secondaryText: { color: tokens.color.primary, fontWeight: '700', textAlign: 'center' },
});
