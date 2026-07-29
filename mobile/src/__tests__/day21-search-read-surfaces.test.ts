import { readFileSync } from 'fs';
import { createSearchRepository } from '@/lib/search-repository';
import type { CommunityActionsReadRepository } from '@/lib/community-actions-repository';
import type { Day2BReadRepository } from '@/lib/day2b-read-repository';
import type { JobRequest, MarketplaceListing, Provider } from '@/types/contracts';

const privateFieldPattern =
  /phone_number|email|ghana.*post|ghana_post|gps|exact.*address|exact_address|address_line|street_address|coordinates?|latitude|longitude|legal.*name|legal_name|challenge.*hash|challenge_hash|hash/i;

const provider = {
  id: 'prov-live-01',
  name: 'Kwame PipeCare',
  headline: 'Fast plumbing help for leaks',
  serviceLabel: 'Plumbing',
  neighborhood: 'East Legon',
  areaLabel: 'East Legon and nearby',
  categoryIds: ['plumbing'],
  imageKind: 'initials',
  rating: 4.8,
  reviewCount: 37,
  communityRecommendations: 18,
  phoneVerified: true,
  availability: 'Available today',
  completedJobs: 46,
  responseRate: '92%',
  accountAge: '2 years',
  isAcceptingRequests: true,
  phone_number: '+233000000000',
  email: 'private@example.com',
  exact_address: 'Private house address',
} as unknown as Provider;

const request = {
  id: 'req-live-01',
  requesterName: 'Safe requester',
  providerId: 'prov-live-01',
  categoryId: 'plumbing',
  neighborhood: 'East Legon',
  areaLabel: 'East Legon general area',
  title: 'Bathroom pipe leak',
  description: 'Water is leaking under the sink.',
  originalUserText: 'Water is leaking under the sink.',
  urgency: 'soon',
  preferredDate: '2026-07-30',
  preferredTime: 'Afternoon',
  contactPreference: 'app_update',
  photoCount: 0,
  status: 'Submitted',
  moderationStatus: 'clean',
  createdAt: '2026-07-29T12:00:00.000Z',
  statusTimeline: [],
  exact_address: 'Private request address',
  coordinates: '5.1,-0.2',
} as unknown as JobRequest;

const day2bReadRepository: Day2BReadRepository = {
  mode: 'seeded',
  listProvidersByCategory: async (categoryId) => (categoryId === 'plumbing' ? [provider] : []),
  getProvider: async () => provider,
  listProviderRequests: async () => [request],
};

const communityReadRepository: CommunityActionsReadRepository = {
  mode: 'seeded',
  listSocialGroupScreenSections: async () => [
    {
      group: {
        id: 'group-east-legon-repairs',
        name: 'East Legon repair tips',
        description: 'Private neighborhood group for repair tips and provider recommendations.',
        neighborhoodId: 'east-legon',
        clusterId: 'accra-east',
        visibility: 'verified_neighborhood_members',
        memberCount: 24,
        createdByProfileId: 'profile-akosua',
        createdAt: '2026-07-29T12:00:00.000Z',
        moderationStatus: 'clean',
      },
      posts: [],
      membershipStatus: 'accepted',
    },
  ],
  listAgencyBroadcasts: async () => [
    {
      id: 'broadcast-water',
      agencyName: 'Ghana Water Help Desk',
      title: 'Accra East water pressure update',
      body: 'Temporary low pressure is expected in parts of Accra East.',
      scope: 'immediate_cluster',
      clusterId: 'accra-east',
      regionId: 'greater-accra',
      isAgencyApproved: true,
      moderationStatus: 'clean',
      publishedAt: '2026-07-29T12:00:00.000Z',
    },
  ],
  listModerationCases: async () => [],
};

const marketplaceListing = {
  id: 'listing-chair',
  neighborhoodId: 'east-legon',
  sellerId: 'profile-seller',
  sellerName: 'Neighbor',
  title: 'Study chair pickup',
  description: 'Clean chair available for pickup.',
  availability: 'available',
  pickupArea: 'East Legon general pickup area',
  moderationStatus: 'clean',
  createdAt: '2026-07-29T12:00:00.000Z',
  phone_number: '+233000000000',
} as unknown as MarketplaceListing;

function buildRepository(overrides: Partial<Parameters<typeof createSearchRepository>[0]> = {}) {
  return createSearchRepository({
    day2bReadRepository,
    communityReadRepository,
    marketplaceReadSource: { listListings: async () => [marketplaceListing] },
    categories: [{ id: 'plumbing', name: 'Plumbing', icon: 'Pl' }],
    ...overrides,
  });
}

describe('Day 21 search read surfaces', () => {
  it('searches providers, requests, groups, agency broadcasts, and marketplace listings', async () => {
    const repository = buildRepository();

    await expect(repository.search('plumbing')).resolves.toEqual(
      expect.arrayContaining([expect.objectContaining({ kind: 'provider', title: 'Kwame PipeCare' })]),
    );
    await expect(repository.search('bathroom')).resolves.toEqual(
      expect.arrayContaining([expect.objectContaining({ kind: 'request', title: 'Bathroom pipe leak' })]),
    );
    await expect(repository.search('repair tips')).resolves.toEqual(
      expect.arrayContaining([expect.objectContaining({ kind: 'group', title: 'East Legon repair tips' })]),
    );
    await expect(repository.search('water pressure')).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: 'agency_broadcast', title: 'Accra East water pressure update' }),
      ]),
    );
    await expect(repository.search('chair')).resolves.toEqual(
      expect.arrayContaining([expect.objectContaining({ kind: 'marketplace_listing', title: 'Study chair pickup' })]),
    );
  });

  it('fails closed per source while returning results from healthy read surfaces', async () => {
    const repository = buildRepository({
      day2bReadRepository: {
        ...day2bReadRepository,
        listProvidersByCategory: async () => {
          throw new Error('provider read failed');
        },
      },
    });

    const results = await repository.search('water');

    expect(results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: 'agency_broadcast', title: 'Accra East water pressure update' }),
      ]),
    );
    expect(results).not.toEqual(expect.arrayContaining([expect.objectContaining({ kind: 'provider' })]));
  });

  it('does not expose private source payload fields in search results', async () => {
    const results = await buildRepository().search('east legon');
    const serialized = JSON.stringify(results);

    expect(serialized).not.toMatch(privateFieldPattern);
    expect(serialized).not.toContain('+233000000000');
    expect(serialized).not.toContain('private@example.com');
    expect(serialized).not.toContain('Private house address');
    expect(serialized).not.toContain('Private request address');
    expect(serialized).not.toContain('5.1,-0.2');
  });

  it('keeps the screen and repository read-only', () => {
    const searchRepositorySource = readFileSync('src/lib/search-repository.ts', 'utf8');
    const searchScreenSource = readFileSync('app/search.tsx', 'utf8');

    expect(searchRepositorySource).not.toContain('.insert(');
    expect(searchRepositorySource).not.toContain('.update(');
    expect(searchRepositorySource).not.toContain('.delete(');
    expect(searchRepositorySource).not.toContain('createJobRequest');
    expect(searchRepositorySource).not.toContain('createNeighborhoodFeedPost');
    expect(searchRepositorySource).not.toContain('createMarketplaceListing');
    expect(searchScreenSource).toContain('searchRepository.search');
    expect(searchScreenSource).not.toContain('createJobRequest');
    expect(searchScreenSource).not.toContain('createNeighborhoodFeedPost');
    expect(searchScreenSource).not.toContain('createMarketplaceListing');
  });
});
