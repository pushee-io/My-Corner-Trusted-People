import {
  Day2BLiveRepositoryError,
  getDay2BLiveRepository,
  sanitizeLiveJobRequestRow,
  sanitizeLiveProviderRow,
} from '@/lib/day2b-live-repository';

jest.mock('@/lib/repository', () => ({
  listProvidersByCategory: jest.fn((categoryId: string) => [
    {
      id: 'prov-01',
      name: 'Seeded Provider 1',
      headline: 'Seeded plumbing help',
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
      trustSignals: [{ id: 't1', label: 'Phone verified', value: 'Yes' }],
      completedJobs: 24,
      responseRate: '90%',
      accountAge: '1 year',
      isAcceptingRequests: true,
    },
    {
      id: 'prov-02',
      name: 'Seeded Provider 2',
      headline: 'Seeded plumbing help',
      serviceLabel: 'Plumbing',
      neighborhood: 'Osu',
      areaLabel: 'Osu and nearby',
      categoryIds: [categoryId],
      imageKind: 'initials',
      rating: 4.7,
      reviewCount: 10,
      communityRecommendations: 4,
      phoneVerified: true,
      availability: 'Available tomorrow',
      trustSignals: [{ id: 't2', label: 'Phone verified', value: 'Yes' }],
      completedJobs: 20,
      responseRate: '88%',
      accountAge: '10 months',
      isAcceptingRequests: true,
    },
    {
      id: 'prov-03',
      name: 'Seeded Provider 3',
      headline: 'Seeded plumbing help',
      serviceLabel: 'Plumbing',
      neighborhood: 'Labone',
      areaLabel: 'Labone and nearby',
      categoryIds: [categoryId],
      imageKind: 'initials',
      rating: 4.6,
      reviewCount: 8,
      communityRecommendations: 3,
      phoneVerified: true,
      availability: 'Flexible',
      trustSignals: [{ id: 't3', label: 'Phone verified', value: 'Yes' }],
      completedJobs: 18,
      responseRate: '86%',
      accountAge: '9 months',
      isAcceptingRequests: true,
    },
  ]),
  getProvider: jest.fn(),
  listProviderRequests: jest.fn(() => []),
  createJobRequest: jest.fn(),
  updateRequestStatus: jest.fn(),
}));

const explicitLiveConfig = {
  liveSupabaseEnabled: true,
  supabaseUrl: 'https://example.supabase.co',
  supabaseAnonKey: 'anon-key',
};

describe('Day 2b live recovery boundary', () => {
  it('keeps seeded/local behavior as the default mode', async () => {
    const repository = getDay2BLiveRepository({});
    const providers = await repository.listProvidersByCategory('plumbing');

    expect(repository.mode).toBe('seeded');
    expect(providers.length).toBeGreaterThanOrEqual(3);
    expect(providers[0]?.id).toMatch(/^prov-/);
  });

  it('fails closed when live mode is requested without Supabase config', async () => {
    const repository = getDay2BLiveRepository({
      liveSupabaseEnabled: true,
      supabaseUrl: '',
      supabaseAnonKey: '',
    });

    expect(repository.mode).toBe('live-disabled');
    await expect(repository.listProvidersByCategory('plumbing')).rejects.toThrow(Day2BLiveRepositoryError);
  });

  it('uses safe live provider payloads without private Day 2b fields', async () => {
    const repository = getDay2BLiveRepository(explicitLiveConfig, {
      listProvidersByCategory: async () => ({
        error: null,
        data: [
          {
            id: 'prov-live-01',
            business_name: 'Adwoa Home Repairs',
            headline: 'Careful plumbing support',
            neighborhood: 'East Legon',
            general_area: 'East Legon and nearby',
            category_ids: ['plumbing'],
            trust_signals: [{ id: 'phone-verified', label: 'Phone verified', value: 'Yes' }],
            completed_jobs: 17,
            response_rate: 91,
            account_age: '8 months',
            accepting_requests: true,
          },
        ],
      }),
    });

    const [provider] = await repository.listProvidersByCategory('plumbing');
    const serialized = JSON.stringify(provider).toLowerCase();

    expect(repository.mode).toBe('live-readonly');
    expect(provider).toMatchObject({
      id: 'prov-live-01',
      name: 'Adwoa Home Repairs',
      areaLabel: 'East Legon and nearby',
    });
    expect(serialized).not.toMatch(
      /phone_number|email|ghana_post|ghana.*gps|exact_address|coordinates|legal_name|challenge_hash/,
    );
  });

  it('uses safe live request payloads without private Day 2b fields', async () => {
    const repository = getDay2BLiveRepository(explicitLiveConfig, {
      listProviderRequests: async () => ({
        error: null,
        data: [
          {
            id: 'req-live-01',
            requester_name: 'Requester',
            provider_id: 'prov-live-01',
            category_id: 'plumbing',
            neighborhood: 'East Legon',
            general_area_label: 'East Legon, general area only',
            title: 'Sink repair',
            description: 'Leak under cabinet',
            original_user_text: 'Sink leaking under cabinet',
            urgency: 'soon',
            preferred_time: 'Afternoon',
            photo_count: 0,
            status: 'Submitted',
            moderation_status: 'not_run',
            created_at: '2026-07-28T12:00:00.000Z',
          },
        ],
      }),
    });

    const [request] = await repository.listProviderRequests('prov-live-01');
    const serialized = JSON.stringify(request).toLowerCase();

    expect(request).toMatchObject({
      id: 'req-live-01',
      areaLabel: 'East Legon, general area only',
      status: 'Submitted',
    });
    expect(serialized).not.toMatch(
      /phone|email|ghana_post|ghana.*gps|exact_address|coordinates|legal_name|challenge_hash/,
    );
  });

  it.each([
    ['phone', { phone_number: '+233201234567' }],
    ['email', { email: 'private@example.com' }],
    ['GhanaPost GPS', { ghana_post_gps: 'GA-123-4567' }],
    ['exact address', { exact_address: '12 Private Street' }],
    ['coordinates', { coordinates: [5.6037, -0.187] }],
    ['legal name', { legal_name: 'Private Legal Name' }],
    ['challenge hashes', { challenge_hash: 'private-hash' }],
  ])('rejects live provider payloads that include %s', (_label, privateFields) => {
    expect(() =>
      sanitizeLiveProviderRow({
        id: 'prov-live-private',
        business_name: 'Private Provider',
        ...privateFields,
      }),
    ).toThrow(Day2BLiveRepositoryError);
  });

  it.each([
    ['phone', { phone_number: '+233201234567' }],
    ['email', { email_address: 'requester@example.com' }],
    ['GhanaPost GPS', { ghana_post_gps: 'GA-123-4567' }],
    ['exact address', { exact_address: '12 Private Street' }],
    ['coordinates', { latitude: 5.6037, longitude: -0.187 }],
    ['legal name', { legal_name: 'Private Requester' }],
    ['challenge hashes', { postcard_challenge_hash: 'private-hash' }],
  ])('rejects live request payloads that include %s', (_label, privateFields) => {
    expect(() =>
      sanitizeLiveJobRequestRow({
        id: 'req-live-private',
        provider_id: 'prov-live-01',
        category_id: 'plumbing',
        title: 'Sink repair',
        description: 'Leak under cabinet',
        ...privateFields,
      }),
    ).toThrow(Day2BLiveRepositoryError);
  });

  it('keeps live writes disabled from Expo Go even with mocked live reads', async () => {
    const repository = getDay2BLiveRepository(explicitLiveConfig, {});

    await expect(
      repository.createJobRequest({
        requesterName: 'Akosua Mensah',
        providerId: 'prov-live-01',
        categoryId: 'plumbing',
        neighborhood: 'East Legon',
        areaLabel: 'East Legon, general area only',
        title: 'Test sink repair',
        description: 'The sink is leaking under the cabinet.',
        originalUserText: 'Sink leaking under cabinet',
        urgency: 'soon',
        preferredDate: '2026-07-28',
        preferredTime: 'Afternoon',
        contactPreference: 'app_update',
        photoCount: 0,
      }),
    ).rejects.toThrow('writes are not enabled');
  });
});
