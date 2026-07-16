import { Link, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Screen } from '@/components/Screen';
import { SuccessState } from '@/components/StateBlocks';
import { tokens } from '@/theme/tokens';

export default function ConfirmationScreen() {
  const params = useLocalSearchParams<{ requestId?: string }>();

  return (
    <Screen title="Request sent">
      <SuccessState title="Submitted" body="The provider can now accept or decline. You can track the status from this prototype." />
      <Link href={{ pathname: '/hire/request/status', params: { requestId: params.requestId ?? 'req-100' } }} asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>View status</Text>
        </Pressable>
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  button: { minHeight: tokens.touch.min, justifyContent: 'center', backgroundColor: tokens.color.primary, padding: tokens.spacing.lg, borderRadius: tokens.radius.md },
  buttonText: { color: '#FFFFFF', textAlign: 'center', fontWeight: '700' },
});
