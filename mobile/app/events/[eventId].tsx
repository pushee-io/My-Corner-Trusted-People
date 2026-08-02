import { Link, router, type Href, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { eventsRepository } from '@/lib/events-runtime-repository';
import { tokens } from '@/theme/tokens';
import type { EventRuntimeDetails } from '@/types/events-runtime';
import { getEventLifecycleState, organizerCan } from '@/types/events';

export default function EventDetailsScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const [event, setEvent] = useState<EventRuntimeDetails>();
  const [message, setMessage] = useState<string>();
  const [error, setError] = useState<string>();

  const load = useCallback(async () => {
    if (!eventId) return;
    const item = await eventsRepository.getEventForViewer(
      eventId,
      eventsRepository.defaultViewer ?? {
        profileId: 'profile-akosua',
        displayName: 'Akosua M.',
        neighborhoodId: 'east-legon',
        clusterId: 'accra-east',
        isVerifiedNeighborhoodMember: true,
      },
    );
    if (!item) setError('This event is unavailable or outside your verified area.');
    else setEvent(item);
  }, [eventId]);

  useEffect(() => {
    load().catch((caught) => setError(caught instanceof Error ? caught.message : 'Could not load event.'));
  }, [load]);

  async function act(action: () => Promise<unknown>, success: string) {
    setError(undefined);
    setMessage(undefined);
    try {
      await action();
      setMessage(success);
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Action failed.');
    }
  }

  async function setGoing() {
    setError(undefined);
    setMessage(undefined);
    try {
      const result = await eventsRepository.setGoing(event!.id, eventsRepository.defaultViewer);
      setMessage(
        result.interestStatus === 'waitlisted' ? 'This event is full. You are on the waitlist.' : 'You are going.',
      );
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not update attendance.');
    }
  }

  function confirmCancellation() {
    Alert.alert('Cancel this event?', 'Attendees will see that the event was cancelled.', [
      { text: 'Keep event', style: 'cancel' },
      {
        text: 'Cancel event',
        style: 'destructive',
        onPress: () =>
          void act(
            () => eventsRepository.cancelEventForViewer(event!.id, eventsRepository.defaultViewer),
            'Event cancelled.',
          ),
      },
    ]);
  }

  if (!event)
    return (
      <Screen title="Event" showBottomNavigation={false}>
        <Text style={error ? styles.error : styles.meta}>{error ?? 'Loading event...'}</Text>
        <Pressable onPress={() => router.back()} style={styles.secondary}>
          <Text style={styles.secondaryText}>Back</Text>
        </Pressable>
      </Screen>
    );

  return (
    <Screen title={event.title} showBottomNavigation={false}>
      <Text style={styles.body}>{event.description}</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Status</Text>
        <Text style={styles.body}>{getEventLifecycleState(event)}</Text>
        <Text style={styles.label}>When</Text>
        <Text style={styles.body}>
          {new Date(event.startsAt).toLocaleString('en-GH', { timeZone: event.timezone })}
        </Text>
        <Text style={styles.label}>General area</Text>
        <Text style={styles.body}>{event.areaLabel}</Text>
        {event.preciseLocation ? (
          <>
            <Text style={styles.label}>Confirmed-attendee location</Text>
            <Text style={styles.body}>{event.preciseLocation}</Text>
          </>
        ) : (
          <Text style={styles.meta}>A precise private location is not available before a confirmed RSVP.</Text>
        )}
        <Text style={styles.label}>Attendance</Text>
        <Text style={styles.body}>
          {event.attendeeCount}
          {event.capacity ? ` of ${event.capacity}` : ''} going
        </Text>
        {event.currentUserInterestStatus ? (
          <Text style={styles.status}>Your response: {event.currentUserInterestStatus.replace('_', ' ')}</Text>
        ) : null}
      </View>
      {message ? (
        <Text accessibilityRole="alert" style={styles.success}>
          {message}
        </Text>
      ) : null}
      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}
      {event.status === 'scheduled' ? (
        <View style={styles.actions}>
          <Pressable onPress={() => void setGoing()} style={styles.primary}>
            <Text style={styles.primaryText}>Going</Text>
          </Pressable>
          <Pressable
            onPress={() =>
              act(() => eventsRepository.setInterest(event.id, eventsRepository.defaultViewer), 'Marked interested.')
            }
            style={styles.secondary}
          >
            <Text style={styles.secondaryText}>Interested</Text>
          </Pressable>
        </View>
      ) : null}
      <Pressable
        onPress={() =>
          act(
            () => eventsRepository.scheduleReminder(event.id, event.startsAt, eventsRepository.defaultViewer!),
            'Reminder saved.',
          )
        }
        style={styles.secondary}
      >
        <Text style={styles.secondaryText}>
          {organizerCan(event.currentUserOrganizerRole, 'send_reminders') ? 'Send attendee reminder' : 'Remind me'}
        </Text>
      </Pressable>
      {organizerCan(event.currentUserOrganizerRole, 'edit_event') ? (
        <Link href={{ pathname: '/events/[eventId]/manage', params: { eventId: event.id } } as unknown as Href} asChild>
          <Pressable accessibilityRole="button" accessibilityLabel="Manage this event" style={styles.secondary}>
            <Text style={styles.secondaryText}>Manage event</Text>
          </Pressable>
        </Link>
      ) : null}
      <Pressable
        onPress={() =>
          act(
            () => eventsRepository.report(event.id, 'Reported from event details', eventsRepository.defaultViewer!),
            'Report submitted for human review.',
          )
        }
        style={styles.report}
      >
        <Text style={styles.reportText}>Report event</Text>
      </Pressable>
      {organizerCan(event.currentUserOrganizerRole, 'cancel_event') && event.status !== 'cancelled' ? (
        <Pressable onPress={confirmCancellation} style={styles.report}>
          <Text style={styles.reportText}>Cancel event</Text>
        </Pressable>
      ) : null}
      <Pressable onPress={() => router.back()} style={styles.secondary}>
        <Text style={styles.secondaryText}>Back</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderWidth: 1,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
    gap: tokens.spacing.xs,
  },
  label: {
    color: tokens.color.textPrimary,
    fontSize: tokens.type.label,
    fontWeight: '700',
    marginTop: tokens.spacing.sm,
  },
  body: { color: tokens.color.textPrimary, fontSize: tokens.type.body, lineHeight: 24 },
  meta: { color: tokens.color.textSecondary, fontSize: tokens.type.support },
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
  report: {
    minHeight: tokens.touch.min,
    justifyContent: 'center',
    borderColor: tokens.color.error,
    borderWidth: 1,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.md,
  },
  reportText: { color: tokens.color.error, fontWeight: '700', textAlign: 'center' },
  status: { color: tokens.color.information, fontSize: tokens.type.support, fontWeight: '700' },
  success: { color: tokens.color.success, fontSize: tokens.type.body, fontWeight: '700' },
  error: { color: tokens.color.error, fontSize: tokens.type.body, fontWeight: '700' },
});
