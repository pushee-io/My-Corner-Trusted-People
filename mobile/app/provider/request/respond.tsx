import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput } from 'react-native';
import { Screen } from '@/components/Screen';
import { updateRequestStatus } from '@/lib/repository';
import { trackEvent } from '@/lib/analytics';
import { tokens } from '@/theme/tokens';
import type { RequestStatus } from '@/types/contracts';

export default function ProviderRespondScreen() {
  const params = useLocalSearchParams<{ requestId?: string; decision?: string }>();
  const requestId = params.requestId;
  const decision = (params.decision === 'Declined' ? 'Declined' : 'Accepted') as RequestStatus;
  const [message, setMessage] = useState(decision === 'Accepted' ? 'Thanks. I can help with this request.' : 'Sorry, I am not available for this request.');
  const [error, setError] = useState<string>();
  const [isSaving, setIsSaving] = useState(false);

  async function save() {
    if (!requestId) {
      setError('No request ID was provided.');
      return;
    }

    setError(undefined);
    setIsSaving(true);

    try {
      await updateRequestStatus(requestId, decision, message);
      trackEvent('provider_decision_saved', { requestId, decision });
      router.replace({ pathname: '/provider/request/[requestId]', params: { requestId } });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not save provider response.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Screen title={decision === 'Accepted' ? 'Accept request' : 'Decline request'}>
      <Text style={styles.body}>Add a short response for the requester.</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TextInput value={message} onChangeText={setMessage} multiline style={styles.input} accessibilityLabel="Provider response" />
      <Pressable disabled={isSaving} onPress={save} style={styles.button}>
        <Text style={styles.buttonText}>{isSaving ? 'Saving...' : 'Save response'}</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { color: tokens.color.textPrimary, fontSize: tokens.type.body },
  error: { color: tokens.color.error, fontSize: tokens.type.support },
  input: { minHeight: 120, textAlignVertical: 'top', backgroundColor: tokens.color.surface, borderColor: tokens.color.border, borderWidth: 1, borderRadius: tokens.radius.md, padding: tokens.spacing.md, fontSize: tokens.type.body },
  button: { minHeight: tokens.touch.min, justifyContent: 'center', backgroundColor: tokens.color.primary, padding: tokens.spacing.lg, borderRadius: tokens.radius.md },
  buttonText: { color: '#FFFFFF', textAlign: 'center', fontWeight: '700' },
});
