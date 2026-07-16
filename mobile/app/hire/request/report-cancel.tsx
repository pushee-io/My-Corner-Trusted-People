import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Screen } from '@/components/Screen';
import { cancelRequest, reportRequest } from '@/lib/repository';
import { trackEvent } from '@/lib/analytics';
import { tokens } from '@/theme/tokens';

export default function ReportCancelScreen() {
  const params = useLocalSearchParams<{ requestId?: string }>();
  const requestId = params.requestId ?? 'req-100';

  function cancel() {
    cancelRequest(requestId);
    trackEvent('request_cancelled', { requestId });
    router.replace({ pathname: '/hire/request/status', params: { requestId } });
  }

  function report() {
    reportRequest(requestId);
    trackEvent('request_reported', { requestId });
    router.replace({ pathname: '/hire/request/status', params: { requestId } });
  }

  return (
    <Screen title="Cancel or report">
      <Text style={styles.body}>Cancel if you no longer need help. Report only for safety, deception, abuse, or inappropriate behavior.</Text>
      <Pressable onPress={cancel} style={styles.button}>
        <Text style={styles.buttonText}>Cancel request</Text>
      </Pressable>
      <Pressable onPress={report} style={styles.report}>
        <Text style={styles.reportText}>Report a concern</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { color: tokens.color.textPrimary, fontSize: tokens.type.body },
  button: { minHeight: tokens.touch.min, justifyContent: 'center', backgroundColor: tokens.color.primary, padding: tokens.spacing.lg, borderRadius: tokens.radius.md },
  buttonText: { color: '#FFFFFF', textAlign: 'center', fontWeight: '700' },
  report: { minHeight: tokens.touch.min, justifyContent: 'center', borderColor: tokens.color.error, borderWidth: 1, padding: tokens.spacing.lg, borderRadius: tokens.radius.md },
  reportText: { color: tokens.color.error, textAlign: 'center', fontWeight: '700' },
});
