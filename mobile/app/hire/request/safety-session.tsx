import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { EmptyState } from '@/components/StateBlocks';
import {
  acknowledgeJobSafetyCompletion,
  confirmJobSafetyArrival,
  getJobSafetySession,
  markJobSafetyArrived,
  regenerateJobSafetyCode,
  releaseJobSafetyLocation,
  startJobSafetySession,
} from '@/lib/job-safety-repository';
import { tokens } from '@/theme/tokens';
import type { JobSafetySession } from '@/types/contracts';

const stateLabels: Record<JobSafetySession['state'], string> = {
  awaiting_location: 'Waiting for service pin',
  location_shared: 'Location shared',
  provider_arrived: 'Provider says they have arrived',
  arrival_confirmed: 'Arrival confirmed',
  active: 'Job session active',
  completion_pending: 'Waiting for both completion confirmations',
  completed: 'Completed by both people',
  cancelled: 'Session closed',
};

export default function JobSafetySessionScreen() {
  const { requestId } = useLocalSearchParams<{ requestId?: string }>();
  const [session, setSession] = useState<JobSafetySession>();
  const [latitude, setLatitude] = useState('5.650450');
  const [longitude, setLongitude] = useState('-0.154120');
  const [locationLabel, setLocationLabel] = useState('');
  const [code, setCode] = useState('');
  const [issuedCode, setIssuedCode] = useState<string>();
  const [locationConsentAccepted, setLocationConsentAccepted] = useState(false);
  const [message, setMessage] = useState<string>();
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(Boolean(requestId));
  const [isSaving, setIsSaving] = useState(false);

  const refresh = useCallback(async () => {
    if (!requestId) return;
    const nextSession = await getJobSafetySession(requestId);
    setSession(nextSession);
    if (nextSession?.privateLocationLabel) setLocationLabel(nextSession.privateLocationLabel);
    if (nextSession?.privateLatitude !== undefined) setLatitude(String(nextSession.privateLatitude));
    if (nextSession?.privateLongitude !== undefined) setLongitude(String(nextSession.privateLongitude));
  }, [requestId]);

  useEffect(() => {
    if (!requestId) {
      setError('No request ID was provided.');
      setIsLoading(false);
      return;
    }

    refresh()
      .catch((caught) => setError(errorMessage(caught, 'Could not load the job safety session.')))
      .finally(() => setIsLoading(false));
  }, [refresh, requestId]);

  async function runAction(action: () => Promise<void>, successMessage: string) {
    setError(undefined);
    setMessage(undefined);
    setIsSaving(true);
    try {
      await action();
      await refresh();
      setMessage(successMessage);
    } catch (caught) {
      setError(errorMessage(caught, 'That safety step could not be completed.'));
    } finally {
      setIsSaving(false);
    }
  }

  async function releaseLocation() {
    const parsedLatitude = Number(latitude);
    const parsedLongitude = Number(longitude);
    if (!Number.isFinite(parsedLatitude) || !Number.isFinite(parsedLongitude)) {
      setError('Enter valid latitude and longitude values for the service pin.');
      return;
    }
    if (locationLabel.trim().length < 3) {
      setError('Add a short private description so the provider can recognize the entrance.');
      return;
    }
    if (!locationConsentAccepted) {
      setError('Confirm that you want to release this exact service pin to the assigned provider.');
      return;
    }

    await runAction(async () => {
      const result = await releaseJobSafetyLocation({
        jobRequestId: requestId!,
        latitude: parsedLatitude,
        longitude: parsedLongitude,
        locationLabel: locationLabel.trim(),
        consentVersion: 'job_safety_location_v1',
      });
      setIssuedCode(result.oneTimeCode);
    }, 'The exact service pin is now available to the assigned provider.');
  }

  async function submitCode() {
    if (!/^\d{6}$/.test(code)) {
      setError('Enter the six-digit code shown by the requester.');
      return;
    }

    await runAction(async () => {
      const result = await startJobSafetySession(requestId!, code);
      if (!result.started) {
        const detail =
          result.reason === 'code_expired'
            ? 'The code expired. Ask the requester to issue a replacement code.'
            : result.reason === 'attempt_limit_reached'
              ? 'Too many attempts. Ask the requester to issue a replacement code.'
              : `That code did not match. ${result.attemptsRemaining ?? 0} attempts remain.`;
        throw new Error(detail);
      }
      setCode('');
    }, 'The arrival code matched. The job session is now active.');
  }

  async function replaceCode() {
    await runAction(async () => {
      const result = await regenerateJobSafetyCode(requestId!);
      setIssuedCode(result.oneTimeCode);
    }, 'A new arrival code was issued. The previous code no longer works.');
  }

  if (error && !session && !isLoading) {
    return (
      <Screen title="Job safety session">
        <EmptyState title="Session unavailable" body={error} />
      </Screen>
    );
  }

  if (isLoading || !session) {
    return (
      <Screen title="Job safety session">
        <EmptyState
          title={isLoading ? 'Loading safety session' : 'No session yet'}
          body="A session starts after a provider accepts the request."
        />
      </Screen>
    );
  }

  const isRequester = session.viewerRole === 'requester';
  const mayEditLocation = isRequester && ['awaiting_location', 'location_shared'].includes(session.state);
  const mayConfirmCompletion =
    ['active', 'completion_pending'].includes(session.state) &&
    (isRequester ? !session.requesterCompletedAt : !session.providerCompletedAt);

  return (
    <Screen title="Job safety session">
      <View style={styles.statusPanel}>
        <Text style={styles.eyebrow}>{isRequester ? 'REQUESTER VIEW' : 'PROVIDER VIEW'}</Text>
        <Text accessibilityRole="header" style={styles.sectionTitle}>
          {stateLabels[session.state]}
        </Text>
        <Text style={styles.body}>
          The exact location and session controls are available only to the two people on this job.
        </Text>
      </View>

      {message ? (
        <Text accessibilityLiveRegion="polite" style={styles.success}>
          {message}
        </Text>
      ) : null}
      {error ? (
        <Text accessibilityLiveRegion="assertive" style={styles.error}>
          {error}
        </Text>
      ) : null}

      {mayEditLocation ? (
        <View style={styles.panel}>
          <Text style={styles.sectionTitle}>Private service pin</Text>
          <Text style={styles.body}>You control when the assigned provider receives the exact service location.</Text>
          <Field
            label="Private location description"
            value={locationLabel}
            onChangeText={setLocationLabel}
            placeholder="Gate, building, or entrance details"
          />
          <View style={styles.coordinateRow}>
            <View style={styles.coordinateField}>
              <Field
                label="Latitude"
                value={latitude}
                onChangeText={setLatitude}
                keyboardType="numbers-and-punctuation"
              />
            </View>
            <View style={styles.coordinateField}>
              <Field
                label="Longitude"
                value={longitude}
                onChangeText={setLongitude}
                keyboardType="numbers-and-punctuation"
              />
            </View>
          </View>
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: locationConsentAccepted }}
            onPress={() => setLocationConsentAccepted((accepted) => !accepted)}
            style={styles.consentRow}
          >
            <View style={[styles.checkbox, locationConsentAccepted && styles.checkboxSelected]}>
              <Text style={styles.checkboxText}>{locationConsentAccepted ? '✓' : ''}</Text>
            </View>
            <Text style={styles.consentText}>
              I choose to release this exact service pin to the assigned provider for this accepted job.
            </Text>
          </Pressable>
          <ActionButton
            disabled={isSaving}
            label={session.state === 'location_shared' ? 'Update pin and issue new code' : 'Release pin to provider'}
            onPress={releaseLocation}
          />
        </View>
      ) : null}

      {issuedCode ? (
        <View style={styles.codePanel}>
          <Text style={styles.sectionTitle}>Your one-time arrival code</Text>
          <Text
            selectable
            accessibilityLabel={`One-time arrival code ${issuedCode.split('').join(' ')}`}
            style={styles.code}
          >
            {issuedCode.split('').join(' ')}
          </Text>
          <Text style={styles.body}>
            This code is shown once. Keep it private and say it only after you see and confirm the provider at the
            location.
          </Text>
        </View>
      ) : null}

      {isRequester &&
      ['location_shared', 'provider_arrived', 'arrival_confirmed'].includes(session.state) &&
      !issuedCode ? (
        <View style={styles.panel}>
          <Text style={styles.sectionTitle}>Need another arrival code?</Text>
          <Text style={styles.body}>
            Replacing the code immediately retires the previous one and resets failed attempts.
          </Text>
          <ActionButton disabled={isSaving} label="Issue replacement code" onPress={replaceCode} />
        </View>
      ) : null}

      {session.canViewExactLocation && session.privateLocationLabel ? (
        <View style={styles.panel}>
          <Text style={styles.sectionTitle}>Exact service location</Text>
          <Text style={styles.body}>{session.privateLocationLabel}</Text>
          <Text style={styles.support}>
            {session.privateLatitude}, {session.privateLongitude}
          </Text>
        </View>
      ) : null}

      {!isRequester && session.state === 'location_shared' ? (
        <View style={styles.panel}>
          <Text style={styles.sectionTitle}>Confirm your arrival</Text>
          <Text style={styles.body}>Use this only when you are at the released service pin.</Text>
          <ActionButton
            disabled={isSaving}
            label="I have arrived"
            onPress={() =>
              runAction(() => markJobSafetyArrived(requestId!), 'The requester has been asked to confirm your arrival.')
            }
          />
        </View>
      ) : null}

      {isRequester && session.state === 'provider_arrived' ? (
        <View style={styles.warningPanel}>
          <Text style={styles.sectionTitle}>Is the provider present?</Text>
          <Text style={styles.body}>
            Confirm only after you can see the person you expected. Do not confirm from a phone call or message alone.
          </Text>
          <ActionButton
            disabled={isSaving}
            label="I confirm the provider is here"
            onPress={() =>
              runAction(
                () => confirmJobSafetyArrival(requestId!),
                'Arrival confirmed. The provider can now enter your code.',
              )
            }
          />
        </View>
      ) : null}

      {!isRequester && session.state === 'arrival_confirmed' ? (
        <View style={styles.panel}>
          <Text style={styles.sectionTitle}>Enter requester code</Text>
          <Text style={styles.body}>
            Ask the requester to say the six-digit code in person. Never request it by message or phone.
          </Text>
          <Field
            label="Six-digit code"
            value={code}
            onChangeText={(value) => setCode(value.replace(/\D/g, '').slice(0, 6))}
            keyboardType="number-pad"
            maxLength={6}
          />
          <ActionButton disabled={isSaving} label="Verify code and start job" onPress={submitCode} />
        </View>
      ) : null}

      {['active', 'completion_pending'].includes(session.state) ? (
        <View style={styles.panel}>
          <Text style={styles.sectionTitle}>Two-party completion</Text>
          <ConfirmationRow
            confirmed={Boolean(session.providerCompletedAt)}
            label="Provider confirmed work is finished"
          />
          <ConfirmationRow
            confirmed={Boolean(session.requesterCompletedAt)}
            label="Requester confirmed the job is complete"
          />
          {mayConfirmCompletion ? (
            <ActionButton
              disabled={isSaving}
              label={isRequester ? 'Confirm job is complete' : 'Confirm work is finished'}
              onPress={() =>
                runAction(async () => {
                  await acknowledgeJobSafetyCompletion(requestId!);
                }, 'Your completion confirmation was recorded.')
              }
            />
          ) : (
            <Text style={styles.support}>Your confirmation is recorded. Waiting for the other person.</Text>
          )}
        </View>
      ) : null}

      {session.state === 'completed' ? (
        <View style={styles.statusPanel}>
          <Text style={styles.sectionTitle}>Session complete</Text>
          <Text style={styles.body}>Both people confirmed completion. The job timeline has been updated.</Text>
        </View>
      ) : null}
    </Screen>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'number-pad' | 'numbers-and-punctuation';
  maxLength?: number;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{props.label}</Text>
      <TextInput
        accessibilityLabel={props.label}
        autoCapitalize="sentences"
        keyboardType={props.keyboardType}
        maxLength={props.maxLength}
        onChangeText={props.onChangeText}
        placeholder={props.placeholder}
        placeholderTextColor={tokens.color.textSecondary}
        style={styles.input}
        value={props.value}
      />
    </View>
  );
}

function ActionButton({ disabled, label, onPress }: { disabled: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[styles.button, disabled && styles.buttonDisabled]}
    >
      <Text style={styles.buttonText}>{disabled ? 'Saving...' : label}</Text>
    </Pressable>
  );
}

function ConfirmationRow({ confirmed, label }: { confirmed: boolean; label: string }) {
  return (
    <Text style={confirmed ? styles.confirmed : styles.support}>
      {confirmed ? 'Confirmed: ' : 'Waiting: '}
      {label}
    </Text>
  );
}

function errorMessage(caught: unknown, fallback: string) {
  return caught instanceof Error && caught.message ? caught.message : fallback;
}

const styles = StyleSheet.create({
  statusPanel: {
    backgroundColor: '#E8F5EF',
    borderColor: tokens.color.primary,
    borderWidth: 1,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
    gap: tokens.spacing.sm,
  },
  panel: {
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderWidth: 1,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
    gap: tokens.spacing.md,
  },
  warningPanel: {
    backgroundColor: '#FFF4D6',
    borderColor: tokens.color.warning,
    borderWidth: 1,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
    gap: tokens.spacing.md,
  },
  codePanel: {
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.primary,
    borderWidth: 2,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
    gap: tokens.spacing.md,
    alignItems: 'center',
  },
  eyebrow: { color: tokens.color.primary, fontSize: tokens.type.label, fontWeight: '700' },
  sectionTitle: { color: tokens.color.textPrimary, fontSize: tokens.type.card, fontWeight: '700' },
  body: { color: tokens.color.textPrimary, fontSize: tokens.type.body, lineHeight: 23 },
  support: { color: tokens.color.textSecondary, fontSize: tokens.type.support, lineHeight: 20 },
  confirmed: { color: tokens.color.success, fontSize: tokens.type.support, fontWeight: '700' },
  error: {
    backgroundColor: '#FDEDEA',
    borderRadius: tokens.radius.md,
    color: tokens.color.error,
    padding: tokens.spacing.md,
    fontSize: tokens.type.support,
  },
  success: {
    backgroundColor: '#E8F5EF',
    borderRadius: tokens.radius.md,
    color: tokens.color.primary,
    padding: tokens.spacing.md,
    fontSize: tokens.type.support,
    fontWeight: '700',
  },
  field: { gap: tokens.spacing.xs },
  label: { color: tokens.color.textPrimary, fontSize: tokens.type.label, fontWeight: '700' },
  input: {
    minHeight: tokens.touch.min,
    borderColor: tokens.color.border,
    borderWidth: 1,
    borderRadius: tokens.radius.md,
    backgroundColor: tokens.color.surface,
    color: tokens.color.textPrimary,
    fontSize: tokens.type.body,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
  },
  coordinateRow: { flexDirection: 'row', gap: tokens.spacing.sm, flexWrap: 'wrap' },
  coordinateField: { flexGrow: 1, flexBasis: 140 },
  consentRow: { minHeight: tokens.touch.min, flexDirection: 'row', alignItems: 'center', gap: tokens.spacing.md },
  checkbox: {
    width: 28,
    height: 28,
    borderColor: tokens.color.primary,
    borderWidth: 2,
    borderRadius: tokens.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: { backgroundColor: tokens.color.primary },
  checkboxText: { color: '#FFFFFF', fontSize: tokens.type.body, fontWeight: '700' },
  consentText: { flex: 1, color: tokens.color.textPrimary, fontSize: tokens.type.support, lineHeight: 20 },
  button: {
    minHeight: tokens.touch.min,
    justifyContent: 'center',
    backgroundColor: tokens.color.primary,
    borderRadius: tokens.radius.md,
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.md,
  },
  buttonDisabled: { backgroundColor: tokens.color.disabled },
  buttonText: { color: '#FFFFFF', textAlign: 'center', fontSize: tokens.type.body, fontWeight: '700' },
  code: { color: tokens.color.textPrimary, fontSize: 32, fontWeight: '800', letterSpacing: 0 },
});
