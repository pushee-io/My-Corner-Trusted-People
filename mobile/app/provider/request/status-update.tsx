import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { updateRequestStatus } from '@/lib/repository';
import { tokens } from '@/theme/tokens';
import type { RequestStatus } from '@/types/contracts';

const statuses: RequestStatus[] = ['In progress', 'Completed'];

export default function ProviderStatusUpdateScreen() {
  const params = useLocalSearchParams<{ requestId?: string }>();
  const requestId = params.requestId ?? 'req-100';
  const [savingStatus, setSavingStatus] = useState<RequestStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isSaving = savingStatus !== null;

  async function save(status: RequestStatus) {
    if (isSaving) return;

    setSavingStatus(status);
    setError(null);

    try {
      const updatedRequest = await updateRequestStatus(
        requestId,
        status,
        `Provider marked this request as ${status.toLowerCase()}.`,
      );

      if (!updatedRequest) {
        setError('This request is no longer available.');
        return;
      }

      router.replace({ pathname: '/provider/request/[requestId]', params: { requestId } });
    } catch {
      setError('We could not update the request. Check your connection and try again.');
    } finally {
      setSavingStatus(null);
    }
  }

  return (
    <Screen title="Update status">
      <Text style={styles.body}>Use this after accepting a request. The requester will see the update.</Text>
      {error ? (
        <Text accessibilityLiveRegion="polite" accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}
      <View style={styles.list}>
        {statuses.map((status) => (
          <Pressable
            accessibilityState={{ busy: savingStatus === status, disabled: isSaving }}
            disabled={isSaving}
            key={status}
            onPress={() => void save(status)}
            style={[styles.button, isSaving ? styles.buttonDisabled : null]}
          >
            <Text style={styles.buttonText}>{savingStatus === status ? 'Saving...' : status}</Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { color: tokens.color.textPrimary, fontSize: tokens.type.body },
  error: { color: tokens.color.error, fontSize: tokens.type.body },
  list: { gap: tokens.spacing.md },
  button: {
    minHeight: tokens.touch.min,
    justifyContent: 'center',
    backgroundColor: tokens.color.primary,
    padding: tokens.spacing.lg,
    borderRadius: tokens.radius.md,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#FFFFFF', textAlign: 'center', fontWeight: '700' },
});
