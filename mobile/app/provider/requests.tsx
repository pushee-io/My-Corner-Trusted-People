import { useCallback } from 'react';
import { useProtectedResource } from '@/hooks/useProtectedResource';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { WebSafeLink } from '@/components/WebSafeLink';
import { EmptyState, ErrorState, OfflineBanner } from '@/components/StateBlocks';
import { Screen } from '@/components/Screen';
import { StatusPill } from '@/components/StatusPill';
import { getCurrentProviderProfile } from '@/lib/auth';
import { listProviderRequests } from '@/lib/repository';
import { tokens } from '@/theme/tokens';

export default function ProviderRequestsScreen() {
  const resource = useProtectedResource(
    useCallback(async () => {
      const [provider, requests] = await Promise.all([getCurrentProviderProfile(), listProviderRequests()]);
      return { provider, requests };
    }, []),
    10_000,
  );
  const requests = resource.data?.requests ?? [];
  const providerBusinessName = resource.data?.provider.businessName;
  const { error, loading: isLoading } = resource;
  const refreshRequests = () => {
    void resource.refresh();
  };

  return (
    <Screen title="Incoming requests" onRefresh={refreshRequests} refreshing={isLoading}>
      <OfflineBanner onRetry={refreshRequests} />

      {providerBusinessName ? (
        <View accessibilityLabel={`Signed in as provider: ${providerBusinessName}`} style={styles.identity}>
          <Text style={styles.identityLabel}>Signed in as provider</Text>
          <Text style={styles.identityName}>{providerBusinessName}</Text>
        </View>
      ) : null}

      {error ? (
        <ErrorState title="Could not load requests" body={error} onRetry={refreshRequests} />
      ) : isLoading ? (
        <EmptyState title="Loading requests" body="Checking live Supabase request assignments." />
      ) : requests.length === 0 ? (
        <>
          <EmptyState
            title="No incoming requests"
            body="Matching requester jobs will appear here for this test provider."
          />
          <Pressable accessibilityRole="button" onPress={refreshRequests} style={styles.refreshButton}>
            <Text style={styles.refreshButtonText}>Refresh requests</Text>
          </Pressable>
        </>
      ) : (
        <View style={styles.list}>
          {requests.map((request) => (
            <WebSafeLink
              key={request.id}
              href={{ pathname: '/provider/request/[requestId]', params: { requestId: request.id } }}
              asChild
            >
              <Pressable style={styles.card}>
                <StatusPill status={request.status} />
                <Text style={styles.title}>{request.title}</Text>
                <Text style={styles.body}>{request.areaLabel}</Text>
                <Text style={styles.note}>
                  {request.preferredDate} · {request.preferredTime}
                </Text>
              </Pressable>
            </WebSafeLink>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  identity: {
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    gap: tokens.spacing.xs,
    padding: tokens.spacing.md,
  },
  identityLabel: { color: tokens.color.textSecondary, fontSize: tokens.type.support },
  identityName: { color: tokens.color.textPrimary, fontSize: tokens.type.card, fontWeight: '700' },
  list: { gap: tokens.spacing.md },
  refreshButton: {
    alignItems: 'center',
    borderColor: tokens.color.primary,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: tokens.touch.min,
    padding: tokens.spacing.md,
  },
  refreshButtonText: { color: tokens.color.primary, fontWeight: '700' },
  card: {
    minHeight: tokens.touch.min,
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderWidth: 1,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
    gap: tokens.spacing.sm,
  },
  title: { color: tokens.color.textPrimary, fontSize: tokens.type.card, fontWeight: '700' },
  body: { color: tokens.color.textPrimary, fontSize: tokens.type.body },
  note: { color: tokens.color.textSecondary, fontSize: tokens.type.support },
});
