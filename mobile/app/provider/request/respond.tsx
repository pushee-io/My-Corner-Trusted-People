import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput } from 'react-native';
import { Screen } from '@/components/Screen';
import { trackEvent } from '@/lib/analytics';
import { updateRequestStatus } from '@/lib/repository';
import { tokens } from '@/theme/tokens';
import type { RequestStatus } from '@/types/contracts';

export default function ProviderRespondScreen() {
  const params = useLocalSearchParams<{ requestId?: string; decision?: string }>();
  const requestId = params.requestId ?? 'req-100';
  const decision = (params.decision === 'Declined' ? 'Declined' : 'Accepted') as RequestStatus;
  const [message, setMessage] = useState(
    decision === 'Accepted' ? 'Thanks. I can help with this request.' : 'Sorry, I am not available for this request.',
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>();

  async function save() {
    if (isSaving) return;

    setIsSaving(true);
    setError(undefined);

    try {
      await updateRequestStatus(requestId, decision, message.trim());
      trackEvent('provider_decision_saved', { requestId, decision });
      router.replace({ pathname: '/provider/request/[requestId]', params: { requestId } });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not save this response.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Screen title={decision === 'Accepted' ? 'Accept request' : 'Decline request'}>
      <Text style={styles.body}>Add a short response for the requester.</Text>

      <TextInput
        value={message}
        onChangeText={setMessage}
        multiline
        editable={!isSaving}
        style={styles.input}
        accessibilityLabel="Provider response"
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        onPress={save}
        disabled={isSaving}
        accessibilityRole="button"
        accessibilityState={{ disabled: isSaving }}
        style={[styles.button, isSaving && styles.disabled]}
      >
        <Text style={styles.buttonText}>{isSaving ? 'Saving response...' : 'Save response'}</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    color: tokens.color.textPrimary,
    fontSize: tokens.type.body,
  },
  input: {
    minHeight: 120,
    textAlignVertical: 'top',
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderWidth: 1,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.md,
    fontSize: tokens.type.body,
  },
  error: {
    color: tokens.color.error,
    fontSize: tokens.type.support,
  },
  button: {
    minHeight: tokens.touch.min,
    justifyContent: 'center',
    backgroundColor: tokens.color.primary,
    padding: tokens.spacing.lg,
    borderRadius: tokens.radius.md,
  },
  disabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '700',
  },
});
