import { useState } from 'react';
import { Text, TextInput } from 'react-native';
import { Screen } from '@/components/Screen';
import { ReportButton, reportStyles as styles } from '@/components/JobReportParts';
import { usePrivateSessionKey } from '@/hooks/useMessagingResource';
import { useProtectedResource } from '@/hooks/useProtectedResource';
import { loadOwnPublicName, saveOwnPublicName } from '@/lib/messaging';

function PublicNameForm() {
  const resource = useProtectedResource(loadOwnPublicName);
  const [draft, setDraft] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const name = draft ?? resource.data?.name ?? '';
  async function save() {
    if (busy) return;
    setBusy(true);
    setNotice('');
    try {
      await saveOwnPublicName(name);
      setNotice('Public display name saved. Your conversations will show this name.');
      void resource.refresh();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not save your public name.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <Screen title="Public display name">
      <Text style={styles.body}>
        Choose the name neighbors see in Messages and your public profile. Saving approves this name for public display.
        Your private legal identity stays separate.
      </Text>
      {resource.error ? <Text style={styles.error}>{resource.error}</Text> : null}
      <TextInput
        accessibilityLabel="Public display name"
        placeholder="Your public name"
        value={name}
        onChangeText={setDraft}
        maxLength={80}
        editable={!busy && !resource.loading && !!resource.data}
        style={styles.input}
      />
      <ReportButton
        label={busy ? 'Saving…' : 'Save public display name'}
        disabled={busy || resource.loading || !resource.data || name.trim().length < 2}
        onPress={() => void save()}
      />
      {notice ? (
        <Text accessibilityLiveRegion="polite" style={styles.body}>
          {notice}
        </Text>
      ) : null}
    </Screen>
  );
}
export default function PublicNameScreen() {
  const sessionKey = usePrivateSessionKey();
  return <PublicNameForm key={sessionKey} />;
}
