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

  function save(status: RequestStatus) {
    updateRequestStatus(requestId, status, `Provider marked this request as ${status.toLowerCase()}.`);
    router.replace({ pathname: '/provider/request/[requestId]', params: { requestId } });
  }

  return (
    <Screen title="Update status">
      <Text style={styles.body}>Use this after accepting a request. The requester will see the update.</Text>
      <View style={styles.list}>
        {statuses.map((status) => (
          <Pressable key={status} onPress={() => save(status)} style={styles.button}>
            <Text style={styles.buttonText}>{status}</Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { color: tokens.color.textPrimary, fontSize: tokens.type.body },
  list: { gap: tokens.spacing.md },
  button: {
    minHeight: tokens.touch.min,
    justifyContent: 'center',
    backgroundColor: tokens.color.primary,
    padding: tokens.spacing.lg,
    borderRadius: tokens.radius.md,
  },
  buttonText: { color: '#FFFFFF', textAlign: 'center', fontWeight: '700' },
});
