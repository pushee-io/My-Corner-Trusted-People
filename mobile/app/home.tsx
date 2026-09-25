import { AskMyCornerAccess } from '@/components/AskMyCornerAccess';
import { type Href } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useProtectedResource } from '@/hooks/useProtectedResource';
import { getCurrentCapabilities } from '@/lib/capabilities';
import { partitionRequests, requestUpdatedAt } from '@/lib/active-requests';
import { categories } from '@/lib/mock-data';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { WebSafeLink } from '@/components/WebSafeLink';
import { Screen } from '@/components/Screen';
import { EmptyState } from '@/components/StateBlocks';
import { StatusPill } from '@/components/StatusPill';
import { getCurrentProfile } from '@/lib/auth';
import { getActiveLocationLabel } from '@/lib/location-context';
import { eventsRuntimeRepository, isEventsClientEnabled } from '@/lib/events-runtime-repository';
import { getProvider, listRequesterRequests } from '@/lib/repository';
import { tokens } from '@/theme/tokens';
import type { JobRequest } from '@/types/contracts';

export default function HomeScreen() {
  const resource = useProtectedResource(
    useCallback(async () => {
      const requests = await listRequesterRequests();
      const providers = await Promise.all(
        [...new Set(requests.map((r) => r.providerId))].map(
          async (id) => [id, (await getProvider(id))?.name ?? 'Selected provider'] as const,
        ),
      );
      return { requests, providers: Object.fromEntries(providers) };
    }, []),
    10_000,
  );
  const { error, loading: isLoading } = resource;
  const { active, past } = partitionRequests(resource.data?.requests ?? []);
  const capabilities = useProtectedResource(getCurrentCapabilities);
  const [eventsAvailable, setEventsAvailable] = useState(false);
  const [canModerateMarketplace, setCanModerateMarketplace] = useState(false);

  function requestCard(request: JobRequest) {
    return (
      <WebSafeLink
        key={request.id}
        href={{ pathname: '/hire/request/status', params: { requestId: request.id } }}
        asChild
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${request.title}, ${request.status}`}
          style={styles.panel}
        >
          <StatusPill status={request.status} />
          <Text style={styles.title}>{request.title}</Text>
          <Text style={styles.body}>{resource.data?.providers[request.providerId]}</Text>
          <Text style={styles.body}>
            {categories.find((c) => c.id === request.categoryId)?.name ?? 'Service'} · {request.areaLabel}
          </Text>
          <Text style={styles.body}>Updated {new Date(requestUpdatedAt(request)).toLocaleString('en-GH')}</Text>
        </Pressable>
      </WebSafeLink>
    );
  }

  useEffect(() => {
    getCurrentProfile()
      .then((profile) => setCanModerateMarketplace(profile.role === 'moderator' || profile.role === 'admin'))
      .catch(() => setCanModerateMarketplace(false));
  }, []);

  useEffect(() => {
    if (!isEventsClientEnabled()) return;
    eventsRuntimeRepository
      .isEnabled()
      .then(setEventsAvailable)
      .catch(() => setEventsAvailable(false));
  }, []);

  return (
    <Screen
      title="My Corner home"
      onRefresh={() => {
        void resource.refresh();
      }}
      refreshing={isLoading}
    >
      <Text style={styles.body}>{getActiveLocationLabel()}</Text>
      <AskMyCornerAccess home />

      {capabilities.data?.provider ? (
        <WebSafeLink href="/provider/requests" asChild>
          <Pressable accessibilityRole="button" style={styles.button}>
            <Text style={styles.buttonText}>Provider inbox</Text>
          </Pressable>
        </WebSafeLink>
      ) : null}
      <View style={styles.grid}>
        <WebSafeLink href="/hire/categories" asChild>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>Hire help</Text>
          </Pressable>
        </WebSafeLink>

        {capabilities.data?.community ? (
          <>
            <WebSafeLink href="/community" asChild>
              <Pressable style={styles.secondary}>
                <Text style={styles.secondaryText}>Neighborhood feed</Text>
              </Pressable>
            </WebSafeLink>

            <WebSafeLink href="/groups" asChild>
              <Pressable style={styles.secondary}>
                <Text style={styles.secondaryText}>Groups</Text>
              </Pressable>
            </WebSafeLink>

            {eventsAvailable ? (
              <WebSafeLink href={'/events' as Href} asChild>
                <Pressable accessibilityRole="button" style={styles.secondary}>
                  <Text style={styles.secondaryText}>Events</Text>
                </Pressable>
              </WebSafeLink>
            ) : null}

            <WebSafeLink href="/agency-broadcasts" asChild>
              <Pressable style={styles.secondary}>
                <Text style={styles.secondaryText}>Agency broadcasts</Text>
              </Pressable>
            </WebSafeLink>

            <WebSafeLink href="/marketplace" asChild>
              <Pressable style={styles.secondary}>
                <Text style={styles.secondaryText}>Marketplace</Text>
              </Pressable>
            </WebSafeLink>
          </>
        ) : null}
        {canModerateMarketplace ? (
          <WebSafeLink href="/marketplace/moderation" asChild>
            <Pressable accessibilityRole="button" style={styles.secondary}>
              <Text style={styles.secondaryText}>Marketplace reports</Text>
            </Pressable>
          </WebSafeLink>
        ) : null}

        {canModerateMarketplace ? (
          <WebSafeLink href="/community/moderation" asChild>
            <Pressable style={styles.secondary}>
              <Text style={styles.secondaryText}>Moderation queue</Text>
            </Pressable>
          </WebSafeLink>
        ) : null}

        <WebSafeLink href="/activity" asChild>
          <Pressable style={styles.secondary}>
            <Text style={styles.secondaryText}>My Activity</Text>
          </Pressable>
        </WebSafeLink>
        {canModerateMarketplace ? (
          <WebSafeLink href="/reviews/moderation" asChild>
            <Pressable style={styles.secondary}>
              <Text style={styles.secondaryText}>Review moderation</Text>
            </Pressable>
          </WebSafeLink>
        ) : null}
        {canModerateMarketplace ? (
          <WebSafeLink href="/message-moderation" asChild>
            <Pressable style={styles.secondary}>
              <Text style={styles.secondaryText}>Message reports</Text>
            </Pressable>
          </WebSafeLink>
        ) : null}
        <WebSafeLink href="/settings" asChild>
          <Pressable style={styles.secondary}>
            <Text style={styles.secondaryText}>Settings</Text>
          </Pressable>
        </WebSafeLink>
      </View>

      <Text accessibilityRole="header" style={styles.title}>
        Active Requests
      </Text>
      {error ? (
        <EmptyState title="Could not load requests" body={error} />
      ) : isLoading ? (
        <Text style={styles.body}>Loading your requests…</Text>
      ) : (
        <>
          {active.length ? (
            active.map(requestCard)
          ) : (
            <EmptyState title="No active requests" body="Choose Hire help to get started." />
          )}
          {past.length ? (
            <>
              <Text accessibilityRole="header" style={styles.title}>
                Past Requests
              </Text>
              {past.map(requestCard)}
            </>
          ) : null}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { color: tokens.color.textPrimary, fontSize: tokens.type.body },
  title: { color: tokens.color.textPrimary, fontSize: tokens.type.card, fontWeight: '700' },
  grid: { gap: tokens.spacing.md },
  panel: {
    minHeight: tokens.touch.min,
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderWidth: 1,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
    gap: tokens.spacing.sm,
  },
  button: {
    minHeight: tokens.touch.min,
    justifyContent: 'center',
    backgroundColor: tokens.color.primary,
    padding: tokens.spacing.lg,
    borderRadius: tokens.radius.md,
  },
  buttonText: { color: '#FFFFFF', textAlign: 'center', fontWeight: '700' },
  secondary: {
    minHeight: tokens.touch.min,
    justifyContent: 'center',
    borderColor: tokens.color.primary,
    borderWidth: 1,
    padding: tokens.spacing.lg,
    borderRadius: tokens.radius.md,
    backgroundColor: tokens.color.surface,
  },
  secondaryText: { color: tokens.color.primary, textAlign: 'center', fontWeight: '700' },
});
