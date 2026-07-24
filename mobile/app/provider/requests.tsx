import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { EmptyState, OfflineBanner } from '@/components/StateBlocks';
import { Screen } from '@/components/Screen';
import { StatusPill } from '@/components/StatusPill';
import { listAllRequests } from '@/lib/repository';
import { tokens } from '@/theme/tokens';

export default function ProviderRequestsScreen() {
  const requests = [...listAllRequests()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <Screen title="Incoming requests">
      <OfflineBanner />

      <Text style={styles.note}>
        Showing {requests.length} request{requests.length === 1 ? '' : 's'} for prototype verification.
      </Text>

      {requests.length === 0 ? (
        <EmptyState
          title="No incoming requests"
          body="Matching requester jobs will appear here for this test provider."
        />
      ) : (
        <View style={styles.list}>
          {requests.map((request) => (
            <Link
              key={request.id}
              href={{
                pathname: '/provider/request/[requestId]',
                params: { requestId: request.id },
              }}
              asChild
            >
              <Pressable style={styles.card}>
                <StatusPill status={request.status} />
                <Text style={styles.id}>Request ID: {request.id}</Text>
                <Text style={styles.title}>{request.title}</Text>
                <Text style={styles.body}>{request.areaLabel}</Text>
                <Text style={styles.note}>
                  {request.preferredDate} · {request.preferredTime}
                </Text>
              </Pressable>
            </Link>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: tokens.spacing.md,
  },
  card: {
    minHeight: tokens.touch.min,
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderWidth: 1,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
    gap: tokens.spacing.sm,
  },
  id: {
    color: tokens.color.primary,
    fontSize: tokens.type.support,
    fontWeight: '700',
  },
  title: {
    color: tokens.color.textPrimary,
    fontSize: tokens.type.card,
    fontWeight: '700',
  },
  body: {
    color: tokens.color.textPrimary,
    fontSize: tokens.type.body,
  },
  note: {
    color: tokens.color.textSecondary,
    fontSize: tokens.type.support,
  },
});
