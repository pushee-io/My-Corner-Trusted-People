import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { eventOrganizerActions } from '@/lib/events-organizer-actions';
import { eventsRepository } from '@/lib/events-runtime-repository';
import { tokens } from '@/theme/tokens';
import { organizerCan, type EventOrganizerRole, type EventRsvp } from '@/types/events';

export default function ManageEventScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const [role, setRole] = useState<EventOrganizerRole>();
  const [title, setTitle] = useState('');
  const [invitee, setInvitee] = useState('');
  const [commentId, setCommentId] = useState('');
  const [attendees, setAttendees] = useState<EventRsvp[]>([]);
  const [notice, setNotice] = useState<string>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!eventId) return;
    eventsRepository
      .getEventForViewer(eventId, eventsRepository.defaultViewer)
      .then((event) => {
        if (!event?.currentUserOrganizerRole) throw new Error('You do not have organizer access to this event.');
        setRole(event.currentUserOrganizerRole);
        setTitle(event.title);
      })
      .catch((caught) => setError(caught instanceof Error ? caught.message : 'Could not load organizer controls.'));
  }, [eventId]);

  async function act(action: () => Promise<unknown>, success: string) {
    setError(undefined);
    setNotice(undefined);
    try {
      await action();
      setNotice(success);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Event action failed.');
    }
  }

  if (!eventId || (!role && !error))
    return (
      <Screen title="Manage event" showBottomNavigation={false}>
        <Text accessibilityRole="alert" style={styles.meta}>Loading organizer permissions...</Text>
      </Screen>
    );

  return (
    <Screen title="Manage event" showBottomNavigation={false}>
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      {notice ? <Text accessibilityRole="alert" style={styles.success}>{notice}</Text> : null}

      {organizerCan(role, 'edit_event') ? (
        <View style={styles.section}>
          <Text style={styles.heading}>Event details</Text>
          <TextInput accessibilityLabel="Event title" value={title} onChangeText={setTitle} style={styles.input} />
          <Action
            label="Save title"
            onPress={() => act(() => eventOrganizerActions.update(eventId, { title }), 'Event updated.')}
          />
        </View>
      ) : null}

      {organizerCan(role, 'manage_attendees') ? (
        <View style={styles.section}>
          <Text style={styles.heading}>Attendees</Text>
          <Action
            label="Load attendees"
            onPress={() =>
              act(async () => setAttendees(await eventOrganizerActions.listAttendees(eventId)), 'Attendees loaded.')
            }
          />
          {attendees.map((attendee) => (
            <Text key={attendee.id} style={styles.body}>
              {attendee.attendeeDisplayName}
            </Text>
          ))}
        </View>
      ) : null}

      {organizerCan(role, 'invite_attendees') ? (
        <View style={styles.section}>
          <Text style={styles.heading}>Invitation</Text>
          <TextInput
            accessibilityLabel="Invitee profile ID"
            autoCapitalize="none"
            value={invitee}
            onChangeText={setInvitee}
            style={styles.input}
          />
          <Action
            label="Send invitation"
            onPress={() => act(() => eventOrganizerActions.invite(eventId, invitee), 'Invitation sent.')}
          />
        </View>
      ) : null}

      {organizerCan(role, 'send_reminders') ? (
        <Action
          label="Send attendee reminder"
          onPress={() =>
            act(
              () => eventOrganizerActions.sendReminder(eventId, new Date().toISOString()),
              'Reminder queued.',
            )
          }
        />
      ) : null}

      {organizerCan(role, 'moderate_content') ? (
        <View style={styles.section}>
          <Text style={styles.heading}>Comment moderation</Text>
          <TextInput
            accessibilityLabel="Comment ID"
            autoCapitalize="none"
            value={commentId}
            onChangeText={setCommentId}
            style={styles.input}
          />
          <View style={styles.row}>
            <Action
              label="Approve"
              onPress={() =>
                act(() => eventOrganizerActions.moderateComment(eventId, commentId, 'approved'), 'Comment approved.')
              }
            />
            <Action
              label="Reject"
              onPress={() =>
                act(() => eventOrganizerActions.moderateComment(eventId, commentId, 'rejected'), 'Comment rejected.')
              }
            />
            <Action
              label="Remove"
              onPress={() =>
                act(() => eventOrganizerActions.moderateComment(eventId, commentId, 'removed'), 'Comment removed.')
              }
            />
          </View>
        </View>
      ) : null}

      {organizerCan(role, 'cancel_event') ? (
        <Action
          label="Cancel event"
          destructive
          onPress={() => Alert.alert('Cancel event?', 'Attendees will be notified.', [
            { text: 'Keep event', style: 'cancel' },
            {
              text: 'Cancel event',
              style: 'destructive',
              onPress: () => void act(() => eventOrganizerActions.cancel(eventId), 'Event cancelled.'),
            },
          ])}
        />
      ) : null}
      <Action label="Back" onPress={() => router.back()} />
    </Screen>
  );
}

function Action({
  label,
  onPress,
  destructive = false,
}: {
  label: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.action, destructive ? styles.destructive : null]}
    >
      <Text style={destructive ? styles.destructiveText : styles.actionText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: { gap: tokens.spacing.sm },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.spacing.sm },
  heading: { color: tokens.color.textPrimary, fontSize: tokens.type.card, fontWeight: '700' },
  body: { color: tokens.color.textPrimary, fontSize: tokens.type.body },
  meta: { color: tokens.color.textSecondary, fontSize: tokens.type.body },
  error: { color: tokens.color.error, fontSize: tokens.type.body, fontWeight: '700' },
  success: { color: tokens.color.success, fontSize: tokens.type.body, fontWeight: '700' },
  input: {
    minHeight: tokens.touch.min,
    borderColor: tokens.color.border,
    borderWidth: 1,
    borderRadius: tokens.radius.md,
    color: tokens.color.textPrimary,
    fontSize: tokens.type.body,
    padding: tokens.spacing.md,
  },
  action: {
    minHeight: tokens.touch.min,
    justifyContent: 'center',
    borderColor: tokens.color.primary,
    borderWidth: 1,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.md,
  },
  actionText: { color: tokens.color.primary, fontSize: tokens.type.body, fontWeight: '700', textAlign: 'center' },
  destructive: { borderColor: tokens.color.error },
  destructiveText: { color: tokens.color.error, fontSize: tokens.type.body, fontWeight: '700', textAlign: 'center' },
});
