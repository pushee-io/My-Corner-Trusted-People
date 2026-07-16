import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { EmptyState, OfflineBanner } from '@/components/StateBlocks';
import { Screen } from '@/components/Screen';
import { StatusPill } from '@/components/StatusPill';
import { listProviderRequests } from '@/lib/repository';
import { testProvider } from '@/lib/session';
import { tokens } from '@/theme/tokens';

export default function ProviderRequestsScreen() {
  const requests = listProviderRequests(testProvider.providerId ?? 'prov-01');

  return (
    <Screen title="Incoming requests">
      <OfflineBanner />
      {requests.length === 0 ? (
        <EmptyState title="No incoming requests" body="Matching requester jobs will appear here for this test provider." />
      ) : (
        <View style={styles.list}>
          {requests.map((request) => (
            <Link key={request.id} href={{ pathname: '/provider/request/[requestId]', params: { requestId: request.id } }} asChild>
              <Pressable style={styles.card}>
                <StatusPill status={request.status} />
                <Text style={styles.title}>{request.title}</Text>
                <Text style={styles.body}>{request.areaLabel}</Text>
                <Text style={styles.note}>{request.preferredDate} · {request.preferredTime}</Text>
              </Pressable>
            </Link>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: tokens.spacing.md },
  card: { minHeight: tokens.touch.min, backgroundColor: tokens.color.surface, borderColor: tokens.color.border, borderWidth: 1, borderRadius: tokens.radius.md, padding: tokens.spacing.lg, gap: tokens.spacing.sm },
  title: { color: tokens.color.textPrimary, fontSize: tokens.type.card, fontWeight: '700' },
  body: { color: tokens.color.textPrimary, fontSize: tokens.type.body },
  note: { color: tokens.color.textSecondary, fontSize: tokens.type.support },
});
