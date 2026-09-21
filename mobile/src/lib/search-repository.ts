import type { CommunityActionsReadRepository } from '@/lib/community-actions-repository';
import type { Day2BReadRepository } from '@/lib/day2b-read-repository';
import { getActiveDay3NeighborhoodContext } from '@/lib/location-context';
import { categories } from '@/lib/mock-data';
import type { MarketplaceListing, ServiceCategory } from '@/types/contracts';
import type { AgencyBroadcast, Day3NeighborhoodContext } from '@/types/day3';

export type SearchResultKind =
  | 'post'
  | 'event'
  | 'provider'
  | 'request'
  | 'group'
  | 'agency_broadcast'
  | 'marketplace_listing';

export type SearchResult = {
  id: string;
  kind: SearchResultKind;
  title: string;
  subtitle: string;
  body: string;
  href: string;
  sourceLabel: string;
  mediaParent?: import('@/lib/media-contract').MediaParent;
  mediaParentId?: string;
  thumbnailUrl?: string;
};

export type SearchRepository = {
  search: (query: string) => Promise<SearchResult[]>;
};

type MarketplaceReadSource = {
  listListings: () => Promise<MarketplaceListing[]>;
};

export type SearchRepositoryOptions = {
  day2bReadRepository?: Day2BReadRepository;
  communityReadRepository?: CommunityActionsReadRepository;
  marketplaceReadSource?: MarketplaceReadSource;
  categories?: ServiceCategory[];
  providerRequestPreviewId?: string;
  communityViewer?: Day3NeighborhoodContext;
  limit?: number;
  extraReadSources?: (() => Promise<SearchResult[]>)[];
};

const defaultLimit = 20;
const minimumQueryLength = 2;
const previewProviderIdEnvKey = 'EXPO_PUBLIC_MY_CORNER_DAY2B_PROVIDER_PREVIEW_ID';
const fallbackPreviewProviderId = 'prov-01';

export function createSearchRepository(options: SearchRepositoryOptions = {}): SearchRepository {
  const sourceCategories = options.categories ?? categories;
  const providerRequestPreviewId = options.providerRequestPreviewId ?? getProviderRequestPreviewId();
  const communityViewer = options.communityViewer ?? getActiveDay3NeighborhoodContext();
  const limit = options.limit ?? defaultLimit;

  return {
    async search(query) {
      const normalizedQuery = normalize(query);
      if (normalizedQuery.length < minimumQueryLength) return [];

      const day2bRepository = options.day2bReadRepository ?? (await getDefaultDay2BReadRepository());
      const communityRepository = options.communityReadRepository ?? (await getDefaultCommunityReadRepository());

      const reads = await Promise.allSettled([
        providerResults(day2bRepository, sourceCategories),
        requestResults(day2bRepository, providerRequestPreviewId),
        communityResults(communityRepository, communityViewer),
        marketplaceResults(options.marketplaceReadSource ?? defaultMarketplaceReadSource),
        ...(options.extraReadSources ?? []).map((read) => read()),
      ]);

      if (reads.every((read) => read.status === 'rejected'))
        throw new Error('Search is unavailable. Please try again.');
      return reads
        .flatMap((read) => (read.status === 'fulfilled' ? read.value : []))
        .filter((result) => matchesQuery(result, normalizedQuery))
        .slice(0, limit);
    },
  };
}

// Live defaults resolve the viewer for every query; never search a seeded identity.
export const searchRepository: SearchRepository = {
  async search(query) {
    if (normalize(query).length < minimumQueryLength) return [];
    const { getCurrentCapabilities } = await import('@/lib/capabilities');
    const capabilities = await getCurrentCapabilities();
    const live = await import('@/lib/repository');
    const { createCommunityActionsReadRepository } = await import('@/lib/community-actions-repository');
    const community = createCommunityActionsReadRepository({ mode: 'supabase' });
    if (community.mode !== 'supabase') throw new Error('Live search is unavailable. Please try again.');
    const viewer = {
      ...getActiveDay3NeighborhoodContext(),
      profileId: capabilities.profileId,
      neighborhoodId: capabilities.neighborhoodId ?? '',
      clusterId: capabilities.clusterId ?? '',
      isVerifiedNeighborhoodMember: capabilities.community,
    };
    return createSearchRepository({
      day2bReadRepository: {
        mode: 'live-readonly',
        listProvidersByCategory: live.listProvidersByCategory,
        getProvider: live.getProvider,
        listProviderRequests: capabilities.provider ? live.listProviderRequests : async () => [],
      },
      communityReadRepository: capabilities.community
        ? community
        : {
            mode: 'supabase',
            listSocialGroupScreenSections: async () => [],
            listAgencyBroadcasts: async () => [],
            listModerationCases: async () => [],
          },
      communityViewer: viewer,
      marketplaceReadSource: capabilities.community ? defaultMarketplaceReadSource : { listListings: async () => [] },
      extraReadSources: capabilities.community
        ? [
            async () => {
              const { listNeighborhoodFeedPosts } = await import('@/lib/community-repository');
              const posts = await listNeighborhoodFeedPosts(capabilities.neighborhoodId!);
              return posts.map((post) => ({
                id: `post-${post.id}`,
                kind: 'post' as const,
                title: post.body.slice(0, 80),
                subtitle: 'Neighborhood post',
                body: post.body,
                href: '/community',
                sourceLabel: 'Neighborhood',
                mediaParent: 'neighborhood_post' as const,
                mediaParentId: post.id,
              }));
            },
            async () => {
              const { eventsRuntimeRepository, isEventsClientEnabled } = await import(
                '@/lib/events-runtime-repository'
              );
              if (!isEventsClientEnabled() || !(await eventsRuntimeRepository.isEnabled())) return [];
              return (await eventsRuntimeRepository.listEvents()).map((event) => ({
                id: `event-${event.id}`,
                kind: 'event' as const,
                title: event.title,
                subtitle: 'Event',
                body: event.description,
                href: `/events/${event.id}`,
                sourceLabel: 'Event',
                mediaParent: 'event' as const,
                mediaParentId: event.id,
              }));
            },
          ]
        : [],
    }).search(query);
  },
};

async function providerResults(
  repository: Day2BReadRepository,
  sourceCategories: ServiceCategory[],
): Promise<SearchResult[]> {
  const providerLists = await Promise.all(
    sourceCategories.map((category) => repository.listProvidersByCategory(category.id)),
  );
  const providers = dedupeById(providerLists.flat());

  return providers.map((provider) => ({
    id: `provider-${provider.id}`,
    kind: 'provider',
    title: provider.name,
    subtitle: provider.serviceLabel,
    body: [provider.headline, provider.areaLabel, provider.availability].filter(Boolean).join(' · '),
    href: `/hire/provider/${provider.id}`,
    sourceLabel: 'Provider',
    mediaParent: 'profile',
    mediaParentId: provider.profileId,
  }));
}

async function requestResults(repository: Day2BReadRepository, providerId: string): Promise<SearchResult[]> {
  const requests = await repository.listProviderRequests(providerId);

  return requests.map((request) => ({
    id: `request-${request.id}`,
    kind: 'request',
    title: request.title,
    subtitle: `Request · ${request.status}`,
    body: [request.description, request.areaLabel].filter(Boolean).join(' · '),
    href: `/provider/request/${request.id}`,
    sourceLabel: 'Request',
  }));
}

async function communityResults(
  repository: CommunityActionsReadRepository,
  viewer: Day3NeighborhoodContext,
): Promise<SearchResult[]> {
  const [groupSections, broadcasts] = await Promise.all([
    repository.listSocialGroupScreenSections(viewer),
    repository.listAgencyBroadcasts(viewer),
  ]);

  const groups: SearchResult[] = groupSections.map(({ group, membershipStatus }) => ({
    id: `group-${group.id}`,
    kind: 'group',
    title: group.name,
    subtitle: `Group · ${membershipStatus}`,
    body: group.description,
    href: `/groups/${group.id}`,
    mediaParent: 'group_cover',
    mediaParentId: group.id,
    sourceLabel: 'Group',
  }));

  return [...groups, ...broadcasts.map(broadcastResult)];
}

function broadcastResult(broadcast: AgencyBroadcast): SearchResult {
  return {
    id: `agency-broadcast-${broadcast.id}`,
    kind: 'agency_broadcast',
    title: broadcast.title,
    subtitle: broadcast.agencyName,
    body: broadcast.body,
    href: '/agency-broadcasts',
    sourceLabel: 'Agency broadcast',
  };
}

async function marketplaceResults(source: MarketplaceReadSource): Promise<SearchResult[]> {
  const listings = await source.listListings();

  return listings.map((listing) => ({
    id: `marketplace-${listing.id}`,
    kind: 'marketplace_listing',
    title: listing.title,
    subtitle:
      listing.priceGhs === undefined ? 'Marketplace · Free or negotiable' : `Marketplace · GHS ${listing.priceGhs}`,
    body: [listing.description, listing.pickupArea, listing.availability].filter(Boolean).join(' · '),
    href: `/marketplace/listing/${listing.id}`,
    mediaParent: 'marketplace_listing',
    mediaParentId: listing.id,
    sourceLabel: 'Marketplace',
    thumbnailUrl: listing.imageUrl,
  }));
}

const defaultMarketplaceReadSource: MarketplaceReadSource = {
  async listListings() {
    const { getMarketplaceNeighborhood, listMarketplaceListings } = await import('@/lib/marketplace-repository');
    const neighborhood = await getMarketplaceNeighborhood();
    return listMarketplaceListings(neighborhood.id);
  },
};

async function getDefaultDay2BReadRepository(): Promise<Day2BReadRepository> {
  const { getDay2BReadRepository } = await import('@/lib/day2b-read-repository');
  return getDay2BReadRepository();
}

async function getDefaultCommunityReadRepository(): Promise<CommunityActionsReadRepository> {
  const { createCommunityActionsReadRepository } = await import('@/lib/community-actions-repository');
  return createCommunityActionsReadRepository();
}

function getProviderRequestPreviewId(): string {
  return envValue(previewProviderIdEnvKey) ?? fallbackPreviewProviderId;
}

function envValue(key: string): string | undefined {
  const maybeProcess = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;
  const value = maybeProcess?.env?.[key];

  return value && value.trim().length > 0 ? value : undefined;
}

function matchesQuery(result: SearchResult, normalizedQuery: string) {
  return searchableText(result).includes(normalizedQuery);
}

function searchableText(result: SearchResult) {
  return normalize([result.title, result.subtitle, result.body, result.sourceLabel].join(' '));
}

function normalize(value: string) {
  return value.trim().toLocaleLowerCase();
}

function dedupeById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}
