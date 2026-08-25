import { readFileSync } from 'node:fs';
import { getDay2BLiveRepository } from '@/lib/day2b-live-repository';
import { clearDay2BProviderCache, loadDay2BProvidersByCategory } from '@/lib/day2b-read-repository';
import type { Provider } from '@/types/contracts';

jest.mock('@/lib/day2b-live-repository', () => ({
  getDay2BLiveRepository: jest.fn(),
}));

const provider: Provider = {
  id: 'prov-cache-01',
  name: 'Cached Provider',
  headline: 'Saved provider result',
  serviceLabel: 'Plumbing',
  neighborhood: 'East Legon',
  areaLabel: 'East Legon and nearby',
  categoryIds: ['plumbing'],
  imageKind: 'initials',
  rating: 4.8,
  reviewCount: 12,
  communityRecommendations: 5,
  phoneVerified: true,
  availability: 'Available today',
  trustSignals: [],
  completedJobs: 24,
  responseRate: '90%',
  accountAge: '1 year',
  isAcceptingRequests: true,
};

const mockedGetRepository = getDay2BLiveRepository as jest.Mock;

describe('preview device repairs', () => {
  beforeEach(() => {
    clearDay2BProviderCache();
    mockedGetRepository.mockReset();
  });

  it('returns the last successful provider read when the next read fails', async () => {
    const listProvidersByCategory = jest
      .fn()
      .mockResolvedValueOnce([provider])
      .mockRejectedValueOnce(new Error('Network unavailable'));
    mockedGetRepository.mockReturnValue({
      mode: 'supabase',
      listProvidersByCategory,
      getProvider: jest.fn(),
      listProviderRequests: jest.fn(),
    });

    await expect(loadDay2BProvidersByCategory('plumbing')).resolves.toEqual({
      items: [provider],
      fromCache: false,
    });
    await expect(loadDay2BProvidersByCategory('plumbing')).resolves.toEqual({
      items: [provider],
      fromCache: true,
    });
  });

  it('routes provider selection through trust review and editable composition', () => {
    const providersSource = readFileSync('app/hire/providers.tsx', 'utf8');
    const profileSource = readFileSync('app/hire/provider/[providerId].tsx', 'utf8');
    const requestSource = readFileSync('app/hire/request/new.tsx', 'utf8');
    const providerInboxSource = readFileSync('app/provider/requests.tsx', 'utf8');

    expect(providersSource).toContain("pathname: '/hire/provider/[providerId]'");
    expect(profileSource).toContain("pathname: '/hire/request/new'");
    expect(profileSource).not.toContain("pathname: '/hire/request/review'");
    expect(profileSource).not.toContain('Kitchen sink leak');
    expect(providersSource).toContain('onRetry={() => void loadProviders()}');
    expect(requestSource).not.toContain('<OfflineBanner');
    expect(providerInboxSource).not.toContain('<OfflineBanner');
    expect(requestSource).not.toContain('setTimeout(useSampleRequest');
    expect(requestSource).toContain('value={title}');
    expect(requestSource).toContain('value={description}');
  });

  it('adapts the welcome lockup for Android font scaling', () => {
    const source = readFileSync('app/index.tsx', 'utf8');

    expect(source).toContain('fontScale >= 1.6');
    expect(source).toContain('heroLogoStacked');
    expect(source).toContain('minHeight: tokens.touch.min');
  });
});
