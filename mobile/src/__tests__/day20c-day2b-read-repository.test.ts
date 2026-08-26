import { getDay2BLiveRepository } from '@/lib/day2b-live-repository';
import {
  getDay2BPreviewProviderId,
  getDay2BReadRepository,
  listDay2BProviderRequests,
  listDay2BProvidersByCategory,
} from '@/lib/day2b-read-repository';

jest.mock('@/lib/day2b-live-repository', () => ({
  getDay2BLiveRepository: jest.fn(),
}));

const mockGetDay2BLiveRepository = getDay2BLiveRepository as jest.Mock;

const readRepository = {
  mode: 'seeded',
  listProvidersByCategory: jest.fn(async (categoryId: string) => [
    {
      id: 'prov-read-01',
      name: 'Read Only Provider',
      headline: 'Seeded read path',
      serviceLabel: 'Plumbing',
      neighborhood: 'East Legon',
      areaLabel: 'East Legon and nearby',
      categoryIds: [categoryId],
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
    },
  ]),
  getProvider: jest.fn(),
  listProviderRequests: jest.fn(async (providerId: string) => [
    {
      id: 'req-read-01',
      requesterName: 'Requester',
      providerId,
      categoryId: 'plumbing',
      neighborhood: 'East Legon',
      areaLabel: 'East Legon, general area only',
      title: 'Read-only request',
      description: 'Read-only screen payload',
      originalUserText: 'Read-only screen payload',
      urgency: 'soon',
      preferredDate: '2026-07-28',
      preferredTime: 'Afternoon',
      contactPreference: 'app_update',
      photoCount: 0,
      status: 'Submitted',
      moderationStatus: 'not_run',
      createdAt: '2026-07-28T12:00:00.000Z',
      statusTimeline: [],
    },
  ]),
  createJobRequest: jest.fn(),
  updateRequestStatus: jest.fn(),
};

describe('Day 20C Day 2b read-only screen repository', () => {
  beforeEach(() => {
    mockGetDay2BLiveRepository.mockReset();
    readRepository.listProvidersByCategory.mockClear();
    readRepository.listProviderRequests.mockClear();
    readRepository.createJobRequest.mockClear();
    readRepository.updateRequestStatus.mockClear();
    mockGetDay2BLiveRepository.mockReturnValue(readRepository);
    delete process.env.EXPO_PUBLIC_MY_CORNER_DAY2B_PROVIDER_PREVIEW_ID;
  });

  it('exposes only read methods to screens', () => {
    expect(Object.keys(getDay2BReadRepository()).sort()).toEqual([
      'getProvider',
      'listProviderRequests',
      'listProvidersByCategory',
      'mode',
    ]);
  });

  it('keeps the provider list screen path behind the Day 2b boundary default', async () => {
    const providers = await listDay2BProvidersByCategory('plumbing');

    expect(mockGetDay2BLiveRepository).toHaveBeenCalledWith();
    expect(readRepository.listProvidersByCategory).toHaveBeenCalledWith('plumbing');
    expect(providers[0]?.id).toBe('prov-read-01');
    expect(readRepository.createJobRequest).not.toHaveBeenCalled();
    expect(readRepository.updateRequestStatus).not.toHaveBeenCalled();
  });

  it('uses the preview provider id for the provider request screen read path', async () => {
    process.env.EXPO_PUBLIC_MY_CORNER_DAY2B_PROVIDER_PREVIEW_ID = 'prov-live-preview';

    const requests = await listDay2BProviderRequests();

    expect(readRepository.listProviderRequests).toHaveBeenCalledWith('prov-live-preview');
    expect(requests[0]?.providerId).toBe('prov-live-preview');
  });

  it('falls back to a seeded preview provider id when live preview config is absent', async () => {
    await listDay2BProviderRequests();

    expect(getDay2BPreviewProviderId()).toBe('prov-01');
    expect(readRepository.listProviderRequests).toHaveBeenCalledWith('prov-01');
  });
});
