import { useState, useSyncExternalStore } from 'react';
import { Text, TextInput, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { ReportButton, reportStyles as styles } from '@/components/JobReportParts';
import { useProtectedResource } from '@/hooks/useProtectedResource';
import { loadReviewCases, reviewApi, type ReviewCase } from '@/lib/reviews';
import { mediaSessionRevision, subscribeMediaSession } from '@/lib/media-session';
function Decision({ item, reload }: { item: ReviewCase; reload: () => void }) {
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function decide(decision: string, response = false) {
    setBusy(true);
    setError('');
    try {
      await reviewApi('moderate', item.reviewId, { decision, reason, response });
      reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save decision.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <View style={styles.panel}>
      <Text style={styles.title}>
        {item.title} · {item.rating}/5
      </Text>
      <Text style={styles.body}>{item.body}</Text>
      {item.response ? <Text style={styles.body}>Provider response: {item.response}</Text> : null}
      <Text style={styles.note}>Report: {item.reason}</Text>
      <TextInput
        accessibilityLabel="Review moderation decision notes"
        value={reason}
        onChangeText={setReason}
        maxLength={500}
        multiline
        style={styles.input}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <ReportButton
        label="Keep / publish review"
        disabled={busy || reason.trim().length < 5}
        onPress={() => void decide('clean')}
      />
      <ReportButton
        label="Hold review for review"
        disabled={busy || reason.trim().length < 5}
        onPress={() => void decide('flagged')}
      />
      <ReportButton
        label="Remove review"
        disabled={busy || reason.trim().length < 5}
        onPress={() => void decide('blocked')}
      />
      {item.response ? (
        <>
          <ReportButton
            label="Publish provider response"
            disabled={busy || reason.trim().length < 5}
            onPress={() => void decide('clean', true)}
          />
          <ReportButton
            label="Remove provider response"
            disabled={busy || reason.trim().length < 5}
            onPress={() => void decide('blocked', true)}
          />
        </>
      ) : null}
    </View>
  );
}
export default function ReviewModeration() {
  const resource = useProtectedResource(loadReviewCases, 10000);
  const revision = useSyncExternalStore(subscribeMediaSession, mediaSessionRevision, mediaSessionRevision);
  return (
    <Screen title="Review moderation" onRefresh={() => void resource.refresh()} refreshing={resource.loading}>
      <Text style={styles.note}>
        A negative rating or provider dispute alone is not grounds for removal. Assess content and policy, and record
        the reason.
      </Text>
      {resource.loading ? <Text style={styles.body}>Loading review reports…</Text> : null}
      {resource.error ? <Text style={styles.error}>{resource.error}</Text> : null}
      {resource.data?.length === 0 ? <Text style={styles.body}>No reviews awaiting moderation.</Text> : null}
      {resource.data?.map((item) => (
        <Decision key={`${revision}-${item.caseId}`} item={item} reload={() => void resource.refresh()} />
      ))}
      <ReportButton label="Refresh" onPress={() => void resource.refresh()} />
    </Screen>
  );
}
