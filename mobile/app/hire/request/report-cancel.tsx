import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Text, TextInput } from 'react-native';
import { Screen } from '@/components/Screen';
import { ReportButton, ReportLoadState, reportStyles as styles } from '@/components/JobReportParts';
import { useProtectedResource } from '@/hooks/useProtectedResource';
import { getRequesterJobReport, submitJobReport } from '@/lib/job-report-repository';
import { cancelRequest, getRequest } from '@/lib/repository';

export default function ReportCancelScreen() {
  const { requestId } = useLocalSearchParams<{ requestId?: string }>();
  const [details, setDetails] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();
  const pending = useRef(false);
  const load = useCallback(async () => {
    setDetails('');
    setError(undefined);
    if (!requestId) throw new Error('Request unavailable.');
    const [request] = await Promise.all([getRequest(requestId), getRequesterJobReport(requestId)]);
    if (!request) throw new Error('Request unavailable.');
    return request;
  }, [requestId]);
  const resource = useProtectedResource(load);
  const eligible =
    resource.data && ['Submitted', 'Viewed', 'Accepted', 'In progress', 'Reported'].includes(resource.data.status);

  async function submit(kind: 'cancel' | 'report') {
    if (!requestId || !eligible || pending.current) return;
    if (kind === 'report' && details.trim().length < 10) {
      setError('Describe the concern in 10 to 1000 characters.');
      return;
    }
    pending.current = true;
    setSaving(true);
    setError(undefined);
    try {
      if (kind === 'report') await submitJobReport(requestId, details);
      else await cancelRequest(requestId);
      router.replace({ pathname: '/hire/request/status', params: { requestId } });
    } catch {
      setError(
        'The action was not confirmed. Check your connection and try again. Repeating a report will not create a duplicate.',
      );
    } finally {
      pending.current = false;
      setSaving(false);
    }
  }

  return (
    <Screen title="Cancel or report">
      <ReportLoadState loading={resource.loading} error={resource.error} />
      {!resource.loading && !eligible ? (
        <Text style={styles.body}>This request is unavailable for a new report or cancellation.</Text>
      ) : null}
      {eligible ? (
        <>
          <Text style={styles.body}>
            Cancel if you no longer need help. Report a concern about safety, deception, abuse, or inappropriate
            behavior.
          </Text>
          <Text style={styles.note}>
            Reporting closes this job and sends your concern to moderators. My Corner does not guarantee safety or
            provide emergency services. If you are in immediate danger, contact local emergency services.
          </Text>
          <Text style={styles.title}>What happened?</Text>
          <TextInput
            accessibilityLabel="Report details"
            multiline
            maxLength={1000}
            value={details}
            onChangeText={setDetails}
            editable={!saving}
            style={styles.input}
            placeholder="Describe the concern"
          />
          <Text style={styles.note}>
            Use 10–1000 characters. Do not include a home address, arrival code, identity document, or other private
            evidence.
          </Text>
          {error ? (
            <Text accessibilityLiveRegion="assertive" style={styles.error}>
              {error}
            </Text>
          ) : null}
          <ReportButton
            label={saving ? 'Saving…' : 'Submit safety concern'}
            disabled={saving || details.trim().length < 10}
            onPress={() => void submit('report')}
          />
          <ReportButton
            label="Cancel request without reporting"
            disabled={saving || resource.data?.status === 'Reported'}
            onPress={() => void submit('cancel')}
          />
        </>
      ) : null}
      <ReportButton label="Refresh" disabled={saving || resource.loading} onPress={() => void resource.refresh()} />
    </Screen>
  );
}
