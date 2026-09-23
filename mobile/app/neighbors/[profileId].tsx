import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Text } from 'react-native';
import { Screen } from '@/components/Screen';
import { MediaAvatar } from '@/components/media/MediaAvatar';
import { ReportButton, reportStyles as styles } from '@/components/JobReportParts';
import { useProtectedResource } from '@/hooks/useProtectedResource';
import { messagingApi, type Neighbor } from '@/lib/messaging';
export default function NeighborProfile() {
  const { profileId } = useLocalSearchParams<{ profileId?: string }>();
  const resource = useProtectedResource(
    useCallback(async () => {
      if (!profileId) throw new Error('Choose a neighbor.');
      return messagingApi<Neighbor>('profile', profileId);
    }, [profileId]),
    10000,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function start() {
    if (!profileId || busy) return;
    setBusy(true);
    setError('');
    try {
      const result = await messagingApi<{ conversationId: string }>('start', profileId);
      router.push({ pathname: '/messages', params: { conversationId: result.conversationId } });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Conversation unavailable.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <Screen title="Neighbor profile">
      {resource.loading ? <Text style={styles.body}>Loading neighbor…</Text> : null}
      {resource.error ? <Text style={styles.error}>{resource.error}</Text> : null}
      {resource.data ? (
        <>
          <MediaAvatar profileId={resource.data.id} name={resource.data.name} />
          <Text style={styles.title}>{resource.data.name}</Text>
          <Text style={styles.body}>{resource.data.neighborhood}</Text>
          <Text style={styles.note}>
            Verified neighborhood membership. Exact address and private identity are not shown.
          </Text>
          <ReportButton
            label={busy ? 'Opening…' : 'Message'}
            disabled={busy || !resource.data.canMessage}
            onPress={() => void start()}
          />
        </>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </Screen>
  );
}
