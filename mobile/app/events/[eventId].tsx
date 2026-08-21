import { router, type Href, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { EventsFeatureGate } from '@/components/events/EventsFeatureGate';
import { eventsRuntimeRepository } from '@/lib/events-runtime-repository';
import { eventStatusLabel, formatEventDate } from '@/lib/events-format';
import { eventErrorMessage } from '@/lib/events-errors';
import { tokens } from '@/theme/tokens';
import type { EventRuntimeDetails } from '@/types/events-runtime';

export default function EventDetailsScreen() {
  return (
    <EventsFeatureGate>
      <EventDetailsContent />
    </EventsFeatureGate>
  );
}

function EventDetailsContent() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const [event, setEvent] = useState<EventRuntimeDetails>();
  const [message, setMessage] = useState<string>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [commentBody, setCommentBody] = useState('');
  const [inviteeProfileId, setInviteeProfileId] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const [isStaff, setIsStaff] = useState(false);

  const load = useCallback(async () => {
    if (!eventId) return;
    setLoading(true);
    setError(undefined);
    try {
      const item = await eventsRuntimeRepository.getEvent(eventId);
      if (!item) setError('This event is unavailable or outside your verified area.');
      else setEvent(item);
    } catch (caught) {
      setError(eventErrorMessage(caught));
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    void load();
    eventsRuntimeRepository
      .getContext()
      .then((context) => setIsStaff(context.isStaff))
      .catch(() => setIsStaff(false));
  }, [load]);

  async function act(action: () => Promise<unknown>, success: string) {
    setBusy(true);
    setError(undefined);
    setMessage(undefined);
    try {
      await action();
      setMessage(success);
      await load();
    } catch (caught) {
      setError(eventErrorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  async function report() {
    if (reportReason.trim().length < 3) {
      setError('Add a short reason so the moderation team can review the event.');
      return;
    }
    await act(
      () => eventsRuntimeRepository.report(event!.id, reportReason.trim()),
      'Report submitted for human review.',
    );
    setReportReason('');
  }

  async function remindMe() {
    const start = new Date(event!.startsAt).getTime();
    const oneHourBefore = start - 60 * 60 * 1000;
    const remindAt = new Date(Math.max(Date.now() + 5 * 60 * 1000, oneHourBefore)).toISOString();
    await act(() => eventsRuntimeRepository.scheduleReminder(event!.id, remindAt), 'Reminder saved.');
  }

  async function addComment() {
    const body = commentBody.trim();
    if (body.length < 2) {
      setError('Write a short comment before posting.');
      return;
    }
    await act(() => eventsRuntimeRepository.addComment(event!.id, body), 'Comment submitted for review.');
    setCommentBody('');
  }

  function confirmCancellation() {
    Alert.alert('Cancel this event?', 'Attendees will see that the event was cancelled.', [
      { text: 'Keep event', style: 'cancel' },
      {
        text: 'Cancel event',
        style: 'destructive',
        onPress: () =>
          void act(() => eventsRuntimeRepository.transitionEvent(event!.id, 'cancelled'), 'Event cancelled.'),
      },
    ]);
  }

  if (!event) {
    return (
      <Screen title="Event" showBottomNavigation={false}>
        <Text accessibilityLiveRegion="polite" style={error ? styles.error : styles.meta}>
          {error ?? (loading ? 'Loading event...' : 'Event unavailable.')}
        </Text>
        {error ? (
          <Pressable
            accessibilityLabel="Retry loading event"
            accessibilityRole="button"
            onPress={() => void load()}
            style={styles.secondary}
          >
            <Text style={styles.secondaryText}>Retry</Text>
          </Pressable>
        ) : null}
        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          onPress={() => router.back()}
          style={styles.secondary}
        >
          <Text style={styles.secondaryText}>Back</Text>
        </Pressable>
      </Screen>
    );
  }

  const organizerRole = event.currentUserOrganizerRole;
  const isOwner = organizerRole === 'owner';
  const isOrganizer = Boolean(organizerRole);
  const diagnostics = eventsRuntimeRepository.getDiagnostics();

  return (
    <Screen title={event.title} showBottomNavigation={false}>
      {diagnostics.lastReadUsedCache ? (
        <Text accessibilityRole="alert" style={styles.warning}>
          You are offline. Showing cached event details. Changes will retry when this screen reconnects.
        </Text>
      ) : null}
      <Text style={styles.body}>{event.description}</Text>
      <View accessibilityLabel="Event information" style={styles.card}>
        <Text style={styles.label}>Status</Text>
        <Text style={styles.body}>{eventStatusLabel(event)}</Text>
        <Text style={styles.label}>When</Text>
        <Text style={styles.body}>{formatEventDate(event.startsAt, event.timezone)}</Text>
        <Text style={styles.label}>General area</Text>
        <Text style={styles.body}>{event.areaLabel}</Text>
        {event.preciseLocation ? (
          <>
            <Text style={styles.label}>Confirmed-attendee location</Text>
            <Text style={styles.body}>{event.preciseLocation}</Text>
          </>
        ) : (
          <Text style={styles.meta}>
            The precise location stays private until the approved attendee-release condition is met.
          </Text>
        )}
        <Text style={styles.label}>Attendance</Text>
        <Text style={styles.body}>
          {event.attendeeCount}
          {event.capacity ? ` of ${event.capacity}` : ''} going
        </Text>
        {event.currentUserRsvpStatus || event.currentUserInterestStatus ? (
          <Text style={styles.status}>
            Your response: {(event.currentUserRsvpStatus ?? event.currentUserInterestStatus)?.replace('_', ' ')}
          </Text>
        ) : null}
        {organizerRole ? <Text style={styles.status}>Organizer role: {organizerRole.replace('_', '-')}</Text> : null}
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
          <ActionButton
            label="Going"
            disabled={busy}
            onPress={() => act(() => eventsRuntimeRepository.setGoing(event.id), 'You are going.')}
            primary
          />
          <ActionButton
            label="Interested"
            disabled={busy}
            onPress={() => act(() => eventsRuntimeRepository.setInterest(event.id), 'Marked interested.')}
          />
        </View>
      ) : null}
      {event.currentUserRsvpStatus || event.currentUserInterestStatus ? (
        <ActionButton
          label="Cancel my response"
          disabled={busy}
          onPress={() => act(() => eventsRuntimeRepository.cancelAttendance(event.id), 'Your response was cancelled.')}
        />
      ) : null}
      <ActionButton label="Remind me one hour before" disabled={busy} onPress={remindMe} />

      {event.commentsEnabled ? (
        <View style={styles.section}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            Comments
          </Text>
          {event.comments?.length ? (
            <View style={styles.commentList}>
              {event.comments.map((comment) => (
                <View key={comment.id} style={styles.comment}>
                  <Text style={styles.commentAuthor}>{comment.authorDisplayName}</Text>
                  <Text style={styles.body}>{comment.body}</Text>
                  <Text style={styles.meta}>
                    {new Date(comment.createdAt).toLocaleString('en-GH')}
                    {comment.moderationStatus === 'pending' ? ' · Awaiting review' : ''}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.meta}>No comments yet.</Text>
          )}
          <TextInput
            accessibilityLabel="Event comment"
            maxLength={500}
            multiline
            onChangeText={setCommentBody}
            placeholder="Add a useful neighborhood update"
            placeholderTextColor={tokens.color.textSecondary}
            style={[styles.input, styles.multiline]}
            value={commentBody}
          />
          <ActionButton label="Post comment" disabled={busy || !commentBody.trim()} onPress={() => void addComment()} />
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.label}>Report this event</Text>
        <TextInput
          accessibilityLabel="Reason for reporting event"
          multiline
          onChangeText={setReportReason}
          placeholder="Briefly describe the concern"
          placeholderTextColor={tokens.color.textSecondary}
          style={[styles.input, styles.multiline]}
          value={reportReason}
        />
        <ActionButton label="Submit report" disabled={busy} onPress={() => void report()} destructive />
      </View>

      {isOrganizer ? (
        <View style={styles.section}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            Organizer controls
          </Text>
          <ActionButton
            label="Edit event"
            disabled={busy}
            onPress={() =>
              router.push({ pathname: '/events/[eventId]/edit', params: { eventId: event.id } } as unknown as Href)
            }
          />
          <TextInput
            accessibilityLabel="Profile ID to invite"
            autoCapitalize="none"
            onChangeText={setInviteeProfileId}
            placeholder="Verified neighbor profile ID"
            placeholderTextColor={tokens.color.textSecondary}
            style={styles.input}
            value={inviteeProfileId}
          />
          <ActionButton
            label="Send invitation"
            disabled={busy || !inviteeProfileId.trim()}
            onPress={() =>
              act(() => eventsRuntimeRepository.invite(event.id, inviteeProfileId.trim()), 'Invitation sent.')
            }
          />
          <TextInput
            accessibilityLabel="Organizer announcement"
            multiline
            onChangeText={setAnnouncement}
            placeholder="Message confirmed attendees"
            placeholderTextColor={tokens.color.textSecondary}
            style={[styles.input, styles.multiline]}
            value={announcement}
          />
          <ActionButton
            label="Queue attendee announcement"
            disabled={busy || !announcement.trim()}
            onPress={() =>
              act(
                () => eventsRuntimeRepository.sendOrganizerReminder(event.id, announcement.trim()),
                'Announcement queued.',
              )
            }
          />
          {isOwner && event.status !== 'cancelled' && event.status !== 'archived' ? (
            <>
              <ActionButton
                label="Mark completed"
                disabled={busy}
                onPress={() =>
                  act(() => eventsRuntimeRepository.transitionEvent(event.id, 'completed'), 'Event marked completed.')
                }
              />
              <ActionButton label="Cancel event" disabled={busy} onPress={confirmCancellation} destructive />
            </>
          ) : null}
          {isOwner && ['cancelled', 'completed'].includes(event.status) ? (
            <ActionButton
              label="Archive event"
              disabled={busy}
              onPress={() =>
                act(() => eventsRuntimeRepository.transitionEvent(event.id, 'archived'), 'Event archived.')
              }
            />
          ) : null}
        </View>
      ) : null}

      {isStaff ? (
        <View style={styles.section}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            Moderation
          </Text>
          <ActionButton
            label="Approve event"
            disabled={busy}
            onPress={() =>
              act(
                () =>
                  eventsRuntimeRepository.moderateContent(
                    'event',
                    event.id,
                    'approved',
                    'Approved after moderator review',
                  ),
                'Event approved.',
              )
            }
          />
          <ActionButton
            label="Reject event"
            disabled={busy}
            onPress={() =>
              act(
                () =>
                  eventsRuntimeRepository.moderateContent(
                    'event',
                    event.id,
                    'rejected',
                    'Rejected after moderator review',
                  ),
                'Event rejected.',
              )
            }
            destructive
          />
          <ActionButton
            label="Remove event"
            disabled={busy}
            onPress={() =>
              act(
                () =>
                  eventsRuntimeRepository.moderateContent(
                    'event',
                    event.id,
                    'removed',
                    'Removed after moderator review',
                  ),
                'Event removed.',
              )
            }
            destructive
          />
        </View>
      ) : null}

      <ActionButton label="Back" disabled={busy} onPress={() => router.back()} />
    </Screen>
  );
}

function ActionButton({
  label,
  onPress,
  disabled = false,
  primary = false,
  destructive = false,
}: {
  label: string;
  onPress: () => void | Promise<void>;
  disabled?: boolean;
  primary?: boolean;
  destructive?: boolean;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={() => void onPress()}
      style={[
        styles.secondary,
        primary ? styles.primary : null,
        destructive ? styles.report : null,
        disabled ? styles.disabled : null,
      ]}
    >
      <Text style={[styles.secondaryText, primary ? styles.primaryText : null, destructive ? styles.reportText : null]}>
        {label}
      </Text>
    </Pressable>
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
  section: {
    gap: tokens.spacing.sm,
    borderTopColor: tokens.color.border,
    borderTopWidth: 1,
    paddingTop: tokens.spacing.md,
  },
  sectionTitle: { color: tokens.color.textPrimary, fontSize: tokens.type.card, fontWeight: '700' },
  commentList: { gap: tokens.spacing.md },
  comment: {
    borderLeftColor: tokens.color.primary,
    borderLeftWidth: 2,
    gap: tokens.spacing.xs,
    paddingLeft: tokens.spacing.md,
  },
  commentAuthor: { color: tokens.color.textPrimary, fontSize: tokens.type.support, fontWeight: '700' },
  label: {
    color: tokens.color.textPrimary,
    fontSize: tokens.type.label,
    fontWeight: '700',
    marginTop: tokens.spacing.sm,
  },
  body: { color: tokens.color.textPrimary, fontSize: tokens.type.body, lineHeight: 24 },
  meta: { color: tokens.color.textSecondary, fontSize: tokens.type.support, lineHeight: 20 },
  actions: { flexDirection: 'row', gap: tokens.spacing.md },
  primary: { backgroundColor: tokens.color.primary },
  primaryText: { color: '#FFFFFF' },
  secondary: {
    flex: 1,
    minHeight: tokens.touch.min,
    justifyContent: 'center',
    borderColor: tokens.color.primary,
    borderWidth: 1,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.md,
  },
  secondaryText: { color: tokens.color.primary, fontWeight: '700', textAlign: 'center', fontSize: tokens.type.body },
  report: { borderColor: tokens.color.error },
  reportText: { color: tokens.color.error },
  disabled: { opacity: 0.55 },
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
  multiline: { minHeight: 96, textAlignVertical: 'top' },
  status: { color: tokens.color.information, fontSize: tokens.type.support, fontWeight: '700' },
  success: { color: tokens.color.success, fontSize: tokens.type.body, fontWeight: '700' },
  warning: {
    color: tokens.color.textPrimary,
    backgroundColor: tokens.color.warning,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.md,
    fontSize: tokens.type.support,
    fontWeight: '700',
  },
  error: { color: tokens.color.error, fontSize: tokens.type.body, fontWeight: '700' },
});
