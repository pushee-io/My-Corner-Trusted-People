import { useEffect, useState } from 'react';
import { AppState, Pressable, StyleSheet, Text, View } from 'react-native';
import { WebSafeLink } from '@/components/WebSafeLink';
import { EmptyState, ErrorState, OfflineBanner } from '@/components/StateBlocks';
import { Screen } from '@/components/Screen';
import { StatusPill } from '@/components/StatusPill';
import { getCurrentProviderProfile } from '@/lib/auth';
import { listProviderRequests } from '@/lib/repository';
import { tokens } from '@/theme/tokens';
import type { JobRequest } from '@/types/contracts';

export default function ProviderRequestsScreen() {
  const [requests, setRequests] = useState<JobRequest[]>([]);
  const [providerBusinessName, setProviderBusinessName] = useState<string>();
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    let inFlight = false;

    async function loadRequests(showLoading = false) {
      if (inFlight) return;

      inFlight = true;
      if (showLoading) setIsLoading(true);

      try {
        const [providerProfile, nextRequests] = await Promise.all([
          getCurrentProviderProfile(),
          listProviderRequests(),
        ]);
        if (!active) return;

        setProviderBusinessName(providerProfile.businessName);
        setRequests(nextRequests);
        setError(undefined);
      } catch (caught) {
        if (!active) return;

        setError(caught instanceof Error ? caught.message : 'Could not load incoming requests.');
      } finally {
        inFlight = false;
        if (active) setIsLoading(false);
      }
    }

    void loadRequests(true);
    const refreshInterval = setInterval(() => {
      if (AppState.currentState === 'active') void loadRequests();
    }, 10_000);

    return () => {
      active = false;
      clearInterval(refreshInterval);
    };
  }, [reloadKey]);

  function refreshRequests() {
    setReloadKey((current) => current + 1);
  }

  return (
    <Screen title="Incoming requests">
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
