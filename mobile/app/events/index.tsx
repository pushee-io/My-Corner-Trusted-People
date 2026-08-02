import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { eventsRepository } from '@/lib/events-repository';
import { tokens } from '@/theme/tokens';
import type { Event } from '@/types/events';

export default function EventsScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    eventsRepository.listEvents({ neighborhoodId: 'east-legon', clusterId: 'accra-east' })
      .then(setEvents)
      .catch((caught) => setError(caught instanceof Error ? caught.message : 'Could not load events.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Screen title="Events">
      <Text style={styles.intro}>Plans shared by verified neighbors. Private addresses stay hidden until an organizer allows access for confirmed attendees.</Text>
      <Link href="/events/new" asChild>
        <Pressable accessibilityRole="button" style={styles.primary}><Text style={styles.primaryText}>Create event</Text></Pressable>
      </Link>
      {loading ? <Text style={styles.meta}>Loading local events...</Text> : null}
      {error ? <View style={styles.notice}><Text style={styles.error}>Could not load events</Text><Text style={styles.meta}>{error}</Text></View> : null}
      {!loading && !error && events.length === 0 ? <View style={styles.notice}><Text style={styles.title}>No upcoming events</Text><Text style={styles.meta}>Create the first plan for your neighborhood.</Text></View> : null}
      {events.map((event) => (
        <Link key={event.id} href={{ pathname: '/events/[eventId]', params: { eventId: event.id } }} asChild>
          <Pressable accessibilityRole="button" style={styles.card}>
            <Text style={styles.title}>{event.title}</Text>
            <Text style={styles.meta}>{new Date(event.startsAt).toLocaleString('en-GH', { timeZone: event.timezone })}</Text>
            <Text style={styles.body}>{event.areaLabel}</Text>
            <Text style={styles.meta}>{event.attendeeCount}{event.capacity ? ` of ${event.capacity}` : ''} going</Text>
          </Pressable>
        </Link>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { color: tokens.color.textPrimary, fontSize: tokens.type.body, lineHeight: 24 },
  card: { minHeight: tokens.touch.min, backgroundColor: tokens.color.surface, borderColor: tokens.color.border, borderWidth: 1, borderRadius: tokens.radius.md, padding: tokens.spacing.lg, gap: tokens.spacing.xs },
  notice: { backgroundColor: tokens.color.surface, borderColor: tokens.color.border, borderWidth: 1, borderRadius: tokens.radius.md, padding: tokens.spacing.lg, gap: tokens.spacing.sm },
  title: { color: tokens.color.textPrimary, fontSize: tokens.type.card, fontWeight: '700' },
  body: { color: tokens.color.textPrimary, fontSize: tokens.type.body },
  meta: { color: tokens.color.textSecondary, fontSize: tokens.type.support },
  error: { color: tokens.color.error, fontSize: tokens.type.body, fontWeight: '700' },
  primary: { minHeight: tokens.touch.min, justifyContent: 'center', backgroundColor: tokens.color.primary, borderRadius: tokens.radius.md, padding: tokens.spacing.md },
  primaryText: { color: '#FFFFFF', fontSize: tokens.type.body, fontWeight: '700', textAlign: 'center' },
});
