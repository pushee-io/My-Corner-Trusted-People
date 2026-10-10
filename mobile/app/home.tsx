import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { WebSafeLink } from '@/components/WebSafeLink';
import { StatusPill } from '@/components/StatusPill';
import { EmptyState } from '@/components/StateBlocks';
import {
  HomeAICard,
  HomeBroadcastPreview,
  HomeFeedPreview,
  HomeHeader,
  HomeHireAction,
  HomeMarketplaceShowcase,
  HomeSection,
  HomeSectionState,
} from '@/components/HomeDashboard';
import { useProtectedResource } from '@/hooks/useProtectedResource';
import { usePrivateSessionKey } from '@/hooks/useMessagingResource';
import { getCurrentCapabilities } from '@/lib/capabilities';
import { partitionRequests, requestUpdatedAt } from '@/lib/active-requests';
import { categories } from '@/lib/mock-data';
import { loadVerifiedNeighborhood } from '@/lib/verified-neighborhood';
import { getProvider, listRequesterRequests } from '@/lib/repository';
import { loadAskContext } from '@/lib/neighborhood-assistant';
import { loadHomeBroadcast, loadHomeFeed, loadHomeMarketplace, previewImage } from '@/lib/home-dashboard';
import { tokens } from '@/theme/tokens';
import type { JobRequest } from '@/types/contracts';

function HomeContentPreviews() {
  const feed = useProtectedResource(loadHomeFeed);
  const market = useProtectedResource(loadHomeMarketplace);
  const broadcast = useProtectedResource(loadHomeBroadcast);
  return (
    <>
      <HomeSection title="LATEST FEED UPDATES" href="/community">
        {feed.data?.post ? (
          <HomeFeedPreview post={feed.data.post} image={previewImage(feed.data.media)} />
        ) : (
          <HomeSectionState
            loading={feed.loading}
            error={feed.error}
            empty="Your neighborhood's next conversation starts with you."
            onRetry={() => void feed.refresh()}
          />
        )}
      </HomeSection>
      <HomeSection title="MARKETPLACE SHOWCASE" href="/marketplace">
        {market.data?.length ? (
          <HomeMarketplaceShowcase listings={market.data} />
        ) : (
          <HomeSectionState
            loading={market.loading}
            error={market.error}
            empty="No listings yet. Discover something local or offer something you no longer need."
            onRetry={() => void market.refresh()}
          />
        )}
      </HomeSection>
      <HomeSection title="AGENCY BROADCAST" href="/agency-broadcasts">
        {broadcast.data ? (
          <HomeBroadcastPreview broadcast={broadcast.data} />
        ) : (
          <HomeSectionState
            loading={broadcast.loading}
            error={broadcast.error}
            empty="No current agency announcements."
            onRetry={() => void broadcast.refresh()}
          />
        )}
      </HomeSection>
    </>
  );
}

export default function HomeScreen() {
  const session = usePrivateSessionKey();
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
  const { active, past } = partitionRequests(resource.data?.requests ?? []);
  const capabilities = useProtectedResource(getCurrentCapabilities);
  const neighborhood = useProtectedResource(loadVerifiedNeighborhood);
  const context = useProtectedResource(loadAskContext);
  const [activeExpanded, setActiveExpanded] = useState(false);
  const [pastExpanded, setPastExpanded] = useState(false);
  const [moderationExpanded, setModerationExpanded] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const location = neighborhood.data
    ? `${neighborhood.data.name} · ${neighborhood.data.city}`
    : neighborhood.loading
      ? 'Loading neighborhood…'
      : neighborhood.error
        ? 'Neighborhood unavailable'
        : 'Verify your neighborhood';

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

  return (
    <Screen
      title="My Corner home"
      homeHeader={<HomeHeader location={location} />}
      onRefresh={() => {
        void resource.refresh();
        void capabilities.refresh();
        void neighborhood.refresh();
        void context.refresh();
        setRefreshKey((value) => value + 1);
      }}
      refreshing={resource.loading}
    >
      <HomeAICard
        key={`${session}:${context.data?.id ?? ''}`}
        neighborhood={context.data?.name}
        available={Boolean(context.data)}
        loading={context.loading}
      />
      <HomeHireAction />
      {capabilities.data?.community ? (
        <HomeContentPreviews key={`${session}:${capabilities.data.neighborhoodId}:${refreshKey}`} />
      ) : (
        <Text style={styles.body}>
          {capabilities.loading ? 'Checking neighborhood access…' : 'Verify your neighborhood to see local updates.'}
        </Text>
      )}

      <View style={styles.requests}>
        <View style={styles.requestHeading}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            My Requests
          </Text>
          <WebSafeLink href="/activity" asChild>
            <Pressable accessibilityRole="button" style={styles.textAction}>
              <Text style={styles.link}>My Activity</Text>
            </Pressable>
          </WebSafeLink>
        </View>
        {resource.error ? (
          <HomeSectionState error={resource.error} empty="" onRetry={() => void resource.refresh()} />
        ) : resource.loading ? (
          <Text style={styles.body}>Loading your requests…</Text>
        ) : (
          <>
            <View style={styles.statusRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Active Requests (${active.length})`}
                accessibilityState={{ expanded: activeExpanded }}
                onPress={() => setActiveExpanded((value) => !value)}
                style={styles.statusButton}
              >
                <Text style={styles.link}>Active {active.length}</Text>
                <Ionicons
                  name={activeExpanded ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={tokens.color.primary}
                  accessible={false}
                />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Past Requests (${past.length})`}
                accessibilityState={{ expanded: pastExpanded }}
                onPress={() => setPastExpanded((value) => !value)}
                style={styles.statusButton}
              >
                <Text style={styles.link}>Past {past.length}</Text>
                <Ionicons
                  name={pastExpanded ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={tokens.color.primary}
                  accessible={false}
                />
              </Pressable>
            </View>
            {activeExpanded ? (
              active.length ? (
                active.map(requestCard)
              ) : (
                <EmptyState title="No active requests" body="Choose Hire Trusted Local Help to get started." />
              )
            ) : null}
            {pastExpanded ? (
              past.length ? (
                past.map(requestCard)
              ) : (
                <Text style={styles.body}>No past requests yet.</Text>
              )
            ) : null}
          </>
        )}
        {capabilities.data?.provider ? (
          <WebSafeLink href="/provider/requests" asChild>
            <Pressable accessibilityRole="button" style={styles.textAction}>
              <Text style={styles.link}>Provider inbox</Text>
            </Pressable>
          </WebSafeLink>
        ) : null}
      </View>
      {capabilities.data?.moderator ? (
        <View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Moderation tools"
            accessibilityState={{ expanded: moderationExpanded }}
            onPress={() => setModerationExpanded((value) => !value)}
            style={styles.textAction}
          >
            <Text style={styles.link}>Moderation tools</Text>
          </Pressable>
          {moderationExpanded ? (
            <View style={styles.utilityLinks}>
              <WebSafeLink href="/marketplace/moderation" asChild>
                <Pressable accessibilityRole="button" style={styles.textAction}>
                  <Text style={styles.link}>Marketplace reports</Text>
                </Pressable>
              </WebSafeLink>
              <WebSafeLink href="/community/moderation" asChild>
                <Pressable accessibilityRole="button" style={styles.textAction}>
                  <Text style={styles.link}>Moderation queue</Text>
                </Pressable>
              </WebSafeLink>
              <WebSafeLink href="/reviews/moderation" asChild>
                <Pressable accessibilityRole="button" style={styles.textAction}>
                  <Text style={styles.link}>Review moderation</Text>
                </Pressable>
              </WebSafeLink>
              <WebSafeLink href="/message-moderation" asChild>
                <Pressable accessibilityRole="button" style={styles.textAction}>
                  <Text style={styles.link}>Message reports</Text>
                </Pressable>
              </WebSafeLink>
            </View>
          ) : null}
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { color: tokens.color.textSecondary, ...tokens.typography.metadata },
  title: { color: tokens.color.textPrimary, ...tokens.typography.card },
  sectionTitle: { color: tokens.color.textPrimary, fontSize: 16, lineHeight: 22, fontWeight: '600' },
  requests: { gap: 8, borderTopWidth: 1, borderTopColor: tokens.color.borderSubtle, paddingTop: 8 },
  requestHeading: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusButton: {
    minHeight: 48,
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingHorizontal: 12,
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.borderSubtle,
    borderWidth: 1,
    borderRadius: 12,
  },
  link: { color: tokens.color.primary, fontSize: 14, lineHeight: 20, fontWeight: '600' },
  textAction: { minHeight: 48, justifyContent: 'center', paddingHorizontal: 8 },
  utilityLinks: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
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
