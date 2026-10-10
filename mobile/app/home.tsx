import { Ionicons } from '@expo/vector-icons';
import { HomeDestination } from '@/components/HomeDestination';
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
import { loadVerifiedNeighborhood } from '@/lib/verified-neighborhood';
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
  const neighborhood = useProtectedResource(loadVerifiedNeighborhood);
  const [activeExpanded, setActiveExpanded] = useState(true);
  const [pastExpanded, setPastExpanded] = useState(false);
  const [eventsAvailable, setEventsAvailable] = useState(false);
  const canModerateMarketplace = capabilities.data?.moderator === true;

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
          style={({ pressed }) => [styles.panel, pressed && styles.pressed]}
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
        void neighborhood.refresh();
      }}
      refreshing={isLoading}
    >
      <Text style={styles.body}>
        {neighborhood.data
          ? `${neighborhood.data.name} · ${neighborhood.data.city}`
          : neighborhood.loading
            ? 'Loading neighborhood…'
            : neighborhood.error
              ? 'Neighborhood unavailable'
              : 'Verify your neighborhood'}
      </Text>
      <AskMyCornerAccess home />

      <View style={styles.grid}>
        <HomeDestination href="/hire/categories" label="Hire help" icon="construct-outline" primary />
        {capabilities.data?.provider ? (
          <HomeDestination href="/provider/requests" label="Provider inbox" icon="briefcase-outline" />
        ) : null}
        {capabilities.data?.community ? (
          <HomeDestination href="/community" label="Neighborhood feed" icon="people-outline" />
        ) : null}
      </View>

      {error ? (
        <EmptyState title="Could not load requests" body={error} />
      ) : isLoading ? (
        <Text style={styles.body}>Loading your requests…</Text>
      ) : (
        <>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Active Requests (${active.length})`}
            accessibilityState={{ expanded: activeExpanded }}
            onPress={() => setActiveExpanded((expanded) => !expanded)}
            style={styles.sectionToggle}
          >
            <Text style={styles.sectionTitle}>Active Requests ({active.length})</Text>
            <Ionicons
              name={activeExpanded ? 'chevron-up' : 'chevron-down'}
              size={22}
              color={tokens.color.textPrimary}
              accessible={false}
            />
          </Pressable>
          {activeExpanded ? (
            active.length ? (
              active.map(requestCard)
            ) : (
              <EmptyState title="No active requests" body="Choose Hire help to get started." />
            )
          ) : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Past Requests (${past.length})`}
            accessibilityState={{ expanded: pastExpanded }}
            onPress={() => setPastExpanded((expanded) => !expanded)}
            style={styles.sectionToggle}
          >
            <Text style={styles.sectionTitle}>Past Requests ({past.length})</Text>
            <Ionicons
              name={pastExpanded ? 'chevron-up' : 'chevron-down'}
              size={22}
              color={tokens.color.textPrimary}
              accessible={false}
            />
          </Pressable>
          {pastExpanded ? (
            past.length ? (
              past.map(requestCard)
            ) : (
              <Text style={styles.body}>No past requests yet.</Text>
            )
          ) : null}
        </>
      )}

      {capabilities.data?.community ? (
        <View style={styles.section}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            Explore your neighborhood
          </Text>
          <View style={styles.grid}>
            <HomeDestination href="/marketplace" label="Marketplace" icon="storefront-outline" />
            <HomeDestination href="/groups" label="Groups" icon="people-outline" />
            {eventsAvailable ? (
              <HomeDestination href={'/events' as Href} label="Events" icon="calendar-outline" />
            ) : null}
            <HomeDestination href="/agency-broadcasts" label="Agency broadcasts" icon="megaphone-outline" />
          </View>
        </View>
      ) : null}

      <View style={styles.section}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>
          Your corner
        </Text>
        <View style={styles.grid}>
          <HomeDestination href="/activity" label="My Activity" icon="time-outline" />
          <HomeDestination href="/settings" label="Settings" icon="settings-outline" />
        </View>
      </View>
      {canModerateMarketplace ? (
        <View style={styles.section}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            Moderation
          </Text>
          <View style={styles.grid}>
            <HomeDestination href="/marketplace/moderation" label="Marketplace reports" icon="flag-outline" />
            <HomeDestination href="/community/moderation" label="Moderation queue" icon="shield-outline" />
            <HomeDestination href="/reviews/moderation" label="Review moderation" icon="star-outline" />
            <HomeDestination href="/message-moderation" label="Message reports" icon="chatbubble-outline" />
          </View>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { color: tokens.color.textSecondary, ...tokens.typography.metadata },
  title: { color: tokens.color.textPrimary, ...tokens.typography.card },
  sectionToggle: {
    minHeight: tokens.touch.min,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacing.md,
    paddingVertical: tokens.spacing.md,
  },
  sectionTitle: { color: tokens.color.textPrimary, ...tokens.typography.section, flexShrink: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.spacing.sm },
  section: { gap: tokens.spacing.md, marginTop: tokens.spacing.sm },
  pressed: { backgroundColor: tokens.color.surfacePressed },
  panel: {
    minHeight: tokens.touch.min,
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderWidth: 1,
    borderRadius: tokens.radius.card,
    padding: tokens.spacing.lg,
    gap: tokens.spacing.sm,
  },
});
