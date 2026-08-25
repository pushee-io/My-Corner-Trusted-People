import { Link, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Screen } from '@/components/Screen';
import { tokens } from '@/theme/tokens';

export default function ProviderStatusUpdateScreen() {
  const params = useLocalSearchParams<{ requestId?: string }>();
  const requestId = params.requestId;

  return (
    <Screen title="Update status">
      <Text style={styles.body}>In-progress and completed states now come from the shared safety session.</Text>
      {requestId ? (
        <Link href={{ pathname: '/hire/request/safety-session', params: { requestId } }} asChild>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>Open job safety session</Text>
          </Pressable>
        </Link>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { color: tokens.color.textPrimary, fontSize: tokens.type.body },
  button: {
    minHeight: tokens.touch.min,
    justifyContent: 'center',
    backgroundColor: tokens.color.primary,
    padding: tokens.spacing.lg,
    borderRadius: tokens.radius.md,
  },
  buttonText: { color: '#FFFFFF', textAlign: 'center', fontWeight: '700' },
});
