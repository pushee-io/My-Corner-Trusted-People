import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { ReportButton, reportStyles as styles } from '@/components/JobReportParts';
import { useProtectedResource } from '@/hooks/useProtectedResource';
import { usePrivateSessionKey } from '@/hooks/useMessagingResource';
import { loadMessageReports, messagingApi, type MessageReport } from '@/lib/messaging';
function Report({ item, reload }: { item: MessageReport; reload: () => void }) {
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function decide(decision: string) {
    setBusy(true);
    setError('');
    try {
      await messagingApi('moderate', item.id, { decision, reason });
      reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save decision.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <View style={styles.panel}>
      <Text style={styles.title}>Reported conversation evidence</Text>
      <Text style={styles.body}>{item.reason}</Text>
      {item.evidence.map((message, index) => (
        <View key={index} style={styles.panel}>
          <Text style={styles.note}>
            {message.sender} · {new Date(message.createdAt).toLocaleString()}
          </Text>
          <Text style={styles.body}>{message.body}</Text>
        </View>
      ))}
      <TextInput
        accessibilityLabel="Message moderation decision notes"
        value={reason}
        onChangeText={setReason}
        multiline
        maxLength={500}
        style={styles.input}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <ReportButton
        label="Dismiss report"
        disabled={busy || reason.trim().length < 5}
        onPress={() => void decide('dismiss')}
      />
      <ReportButton
        label="Remove reported message"
        disabled={busy || reason.trim().length < 5}
        onPress={() => void decide('remove_message')}
      />
      <Text style={styles.note}>
        Suspend blocks the reported account from review and messaging features. Apply only for a documented policy
        violation.
      </Text>
      <ReportButton
        label="Suspend reported account"
        disabled={busy || reason.trim().length < 5}
        onPress={() => void decide('suspend')}
      />
    </View>
  );
}
export default function MessageModeration() {
  const resource = useProtectedResource(loadMessageReports, 10000);
  const key = usePrivateSessionKey();
  return (
    <Screen title="Message reports">
      <Text style={styles.note}>
        Only evidence submitted with a user report is available here. Moderators cannot browse private conversations.
      </Text>
      {resource.error ? <Text style={styles.error}>{resource.error}</Text> : null}
      {resource.loading ? <Text style={styles.body}>Loading reports…</Text> : null}
      {resource.data?.length === 0 ? <Text style={styles.body}>No open message reports.</Text> : null}
      {resource.data?.map((item) => (
        <Report key={`${key}-${item.id}`} item={item} reload={() => void resource.refresh()} />
      ))}
      <ReportButton label="Refresh" onPress={() => void resource.refresh()} />
    </Screen>
  );
}
