import { readFileSync } from 'node:fs';

jest.mock('@/lib/day2b-live-repository', () => ({
  getDay2BLiveRepository: jest.fn(),
}));

import { getDay2BLiveRepository } from '@/lib/day2b-live-repository';
import { clearDay2BProviderCache, loadDay2BProvidersByCategory } from '@/lib/day2b-read-repository';
import type { Provider } from '@/types/contracts';

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

  it('keeps provider selection and request composition user controlled', () => {
    const providerSource = readFileSync('app/hire/providers.tsx', 'utf8');
    const requestSource = readFileSync('app/hire/request/new.tsx', 'utf8');

    expect(providerSource).toContain("pathname: '/hire/request/new'");
    expect(providerSource).not.toContain("pathname: '/hire/request/review'");
    expect(providerSource).toContain('onRetry={() => void loadProviders()}');
    expect(requestSource).not.toContain('setTimeout(useSampleRequest');
    expect(requestSource).toContain('value={title}');
    expect(requestSource).toContain('value={description}');
  });

  it('allows supported tablets to rotate between portrait and landscape', () => {
    const appConfig = JSON.parse(readFileSync('app.json', 'utf8'));

    expect(appConfig.expo.ios.supportsTablet).toBe(true);
    expect(appConfig.expo.orientation).toBe('default');
  });

  it('adapts the welcome lockup for Android font scaling', () => {
    const source = readFileSync('app/index.tsx', 'utf8');

    expect(source).toContain('fontScale >= 1.6');
    expect(source).toContain('heroLogoStacked');
    expect(source).toContain('minHeight: tokens.touch.min');
  });

  it('opens sign-in without the web-incompatible Link asChild slot', () => {
    const source = readFileSync('app/index.tsx', 'utf8');

    expect(source).not.toContain('asChild');
    expect(source).not.toContain('import { Link');
    expect(source).toContain("onPress={() => router.push('/sign-in')}");
    expect(source).toContain('accessibilityLabel="Enter My Corner"');
  });

  it('exposes shared retry actions as labeled 48 dp buttons', () => {
    const source = readFileSync('src/components/StateBlocks.tsx', 'utf8');
    const retryButtonStyle = source.slice(source.indexOf('button: {'), source.indexOf('buttonText:'));

    expect(source).toContain('<Pressable accessibilityRole="button" onPress={onRetry} style={styles.button}>');
    expect(retryButtonStyle).toContain('minHeight: tokens.touch.min');
  });

  it('keeps the provider inbox synchronized and manually refreshable', () => {
    const source = readFileSync('app/provider/requests.tsx', 'utf8');

    expect(source).toContain("AppState.currentState === 'active'");
    expect(source).toContain('}, 10_000)');
    expect(source).toContain('onRetry={refreshRequests}');
    expect(source).toContain('Refresh requests');
    expect(source).toContain('getCurrentProviderProfile');
    expect(source).toContain('Signed in as provider');
    expect(source).toContain('providerBusinessName');
    expect(source).toContain('minHeight: tokens.touch.min');
  });

  it('routes provider status changes through the shared safety session', () => {
    const source = readFileSync('app/provider/request/status-update.tsx', 'utf8');

    expect(source).toContain('In-progress and completed states now come from the shared safety session.');
    expect(source).toContain('WebSafeLink');
    expect(source).toContain("pathname: '/hire/request/safety-session'");
    expect(source).toContain('params: { requestId }');
    expect(source).not.toContain('updateRequestStatus');
  });
});
