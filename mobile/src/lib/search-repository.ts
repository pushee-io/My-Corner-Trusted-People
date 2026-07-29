import { createCommunityActionsReadRepository, type CommunityActionsReadRepository } from '@/lib/community-actions-repository';
import { getDay2BReadRepository, type Day2BReadRepository } from '@/lib/day2b-read-repository';
import { getMarketplaceNeighborhood, listMarketplaceListings } from '@/lib/marketplace-repository';
import { categories } from '@/lib/mock-data';
import type { JobRequest, MarketplaceListing, Provider, ServiceCategory } from '@/types/contracts';
import type { AgencyBroadcast } from '@/types/day3';

export type SearchResultKind = 'provider' | 'request' | 'group' | 'agency_broadcast' | 'marketplace_listing';

export type SearchResult = {
  id: string;
  kind: SearchResultKind;
  title: string;
  subtitle: string;
  body: string;
  href: string;
  sourceLabel: string;
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
  limit?: number;
};

const defaultLimit = 20;
const minimumQueryLength = 2;

export function createSearchRepository(options: SearchRepositoryOptions = {}): SearchRepository {
  const sourceCategories = options.categories ?? categories;
  const limit = options.limit ?? defaultLimit;

  return {
    async search(query) {
      const normalizedQuery = normalize(query);
      if (normalizedQuery.length < minimumQueryLength) return [];

      const [providers, requests, community, marketplace] = await Promise.all([
        safeRead(() => providerResults(options.day2bReadRepository ?? getDay2BReadRepository(), sourceCategories)),
        safeRead(() => requestResults(options.day2bReadRepository ?? getDay2BReadRepository())),
        safeRead(() => communityResults(options.communityReadRepository ?? createCommunityActionsReadRepository())),
        safeRead(() => marketplaceResults(options.marketplaceReadSource ?? defaultMarketplaceReadSource)),
      ]);

      return [...providers, ...requests, ...community, ...marketplace]
        .filter((result) => matchesQuery(result, normalizedQuery))
        .slice(0, limit);
    },
  };
}

export const searchRepository = createSearchRepository();

async function providerResults(repository: Day2BReadRepository, sourceCategories: ServiceCategory[]): Promise<SearchResult[]> {
  const providerLists = await Promise.all(
    sourceCategories.map((category) => safeRead(() => repository.listProvidersByCategory(category.id))),
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
  }));
}

async function requestResults(repository: Day2BReadRepository): Promise<SearchResult[]> {
  const requests = await repository.listProviderRequests();

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

async function communityResults(repository: CommunityActionsReadRepository): Promise<SearchResult[]> {
  const [groupSections, broadcasts] = await Promise.all([
    repository.listSocialGroupScreenSections(),
    repository.listAgencyBroadcasts(),
  ]);

  const groups: SearchResult[] = groupSections.map(({ group, membershipStatus }) => ({
    id: `group-${group.id}`,
    kind: 'group',
    title: group.name,
    subtitle: `Group · ${membershipStatus}`,
    body: group.description,
    href: '/groups',
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
    subtitle: listing.priceGhs === undefined ? 'Marketplace · Free or negotiable' : `Marketplace · GHS ${listing.priceGhs}`,
    body: [listing.description, listing.pickupArea, listing.availability].filter(Boolean).join(' · '),
    href: '/marketplace',
    sourceLabel: 'Marketplace',
  }));
}

const defaultMarketplaceReadSource: MarketplaceReadSource = {
  async listListings() {
    const neighborhood = await getMarketplaceNeighborhood();
    return listMarketplaceListings(neighborhood.id);
  },
};

function matchesQuery(result: SearchResult, normalizedQuery: string) {
  return searchableText(result).includes(normalizedQuery);
}

function searchableText(result: SearchResult) {
  return normalize([result.title, result.subtitle, result.body, result.sourceLabel].join(' '));
}

function normalize(value: string) {
  return value.trim().toLocaleLowerCase();
}

async function safeRead<T>(read: () => Promise<T[]>): Promise<T[]> {
  try {
    return await read();
  } catch {
    return [];
  }
}

function dedupeById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}
