import { useState } from 'react';
import { Text } from 'react-native';
import { Screen } from '@/components/Screen';
import { ReportButton, reportStyles as styles } from '@/components/JobReportParts';
import { useProtectedResource } from '@/hooks/useProtectedResource';
import { loadCommunicationPreferences, messagingApi, type CommunicationPreferences } from '@/lib/messaging';
export default function MessageSettings() {
  const resource = useProtectedResource(loadCommunicationPreferences);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function toggle(key: keyof CommunicationPreferences) {
    if (!resource.data || busy) return;
    setBusy(true);
    setError('');
    try {
      await messagingApi('settings', undefined, { [key]: !resource.data[key] });
      void resource.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save preference.');
    } finally {
      setBusy(false);
    }
  }
  const options: [keyof CommunicationPreferences, string][] = [
    ['discoverable', 'Neighbors can discover my profile'],
    ['allowNeighborMessages', 'Allow neighbor messages'],
    ['notifyMessages', 'Message notifications'],
    ['notifyReviews', 'Review notifications'],
  ];
  return (
    <Screen title="Message privacy">
      <Text style={styles.note}>
        These settings apply to your account. Notifications are in-app; push delivery is not enabled by this feature.
      </Text>
      {resource.error || error ? <Text style={styles.error}>{error || resource.error}</Text> : null}
      {resource.loading ? <Text style={styles.body}>Loading preferences…</Text> : null}
      {resource.data
        ? options.map(([key, label]) => (
            <ReportButton
              key={key}
              label={`${label}: ${resource.data![key] ? 'On' : 'Off'}`}
              disabled={busy}
              onPress={() => void toggle(key)}
            />
          ))
        : null}
    </Screen>
  );
}
