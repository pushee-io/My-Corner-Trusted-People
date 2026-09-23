import { useCallback } from 'react';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { useProtectedResource } from '@/hooks/useProtectedResource';
import { findNeighbors } from '@/lib/messaging';
import { MediaAvatar } from './media/MediaAvatar';
import { ReportButton, reportStyles as styles } from './JobReportParts';
export function NeighborResults({ query }: { query: string }) {
  const resource = useProtectedResource(useCallback(() => findNeighbors(query), [query]));
  return (
    <View style={styles.panel}>
      <Text style={styles.title}>Neighbors</Text>
      <Text style={styles.note}>
        Discoverable neighbors in your verified neighborhood. Private messages are never searched.
      </Text>
      {resource.loading ? <Text style={styles.body}>Finding neighbors…</Text> : null}
      {resource.error ? <Text style={styles.note}>{resource.error}</Text> : null}
      {resource.data?.length === 0 ? <Text style={styles.body}>No eligible neighbors found.</Text> : null}
      {resource.data?.map((neighbor) => (
        <View key={neighbor.id} style={styles.panel}>
          <MediaAvatar profileId={neighbor.id} name={neighbor.name} />
          <Text style={styles.title}>{neighbor.name}</Text>
          <Text style={styles.note}>{neighbor.neighborhood}</Text>
          <ReportButton
            label={`View ${neighbor.name}'s profile`}
            onPress={() => router.push({ pathname: '/neighbors/[profileId]', params: { profileId: neighbor.id } })}
          />
        </View>
      ))}
    </View>
  );
}
