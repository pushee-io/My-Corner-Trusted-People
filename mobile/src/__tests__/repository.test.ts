import { createJobRequest, getRequest, listProvidersByCategory, updateRequestStatus } from '@/lib/repository';
import { getCurrentProfile } from '@/lib/auth';
import { assertSupabaseConfigured, supabase } from '@/lib/supabase';

jest.mock('@/lib/auth', () => ({
  getCurrentProfile: jest.fn(),
}));

jest.mock('@/lib/supabase', () => ({
  assertSupabaseConfigured: jest.fn(),
  supabase: {
    from: jest.fn(),
  },
}));

type QueryResult = {
  data: unknown;
  error: unknown;
};

type QueryMock = PromiseLike<QueryResult> & {
  eq: jest.Mock;
  in: jest.Mock;
  insert: jest.Mock;
  limit: jest.Mock;
  order: jest.Mock;
  select: jest.Mock;
  single: jest.Mock;
  update: jest.Mock;
};

type SupabaseMock = {
  from: jest.Mock;
};

const mockedGetCurrentProfile = getCurrentProfile as jest.MockedFunction<typeof getCurrentProfile>;
const mockedAssertSupabaseConfigured = assertSupabaseConfigured as jest.MockedFunction<typeof assertSupabaseConfigured>;
const mockedSupabase = supabase as unknown as SupabaseMock;

const createdAt = '2026-07-24T12:00:00.000Z';

function createQuery(result: QueryResult = { data: [], error: null }): QueryMock {
  const query = {} as QueryMock;

  query.eq = jest.fn(() => query);
  query.in = jest.fn(() => query);
  query.insert = jest.fn(() => query);
  query.limit = jest.fn(() => query);
  query.order = jest.fn(() => query);
  query.select = jest.fn(() => query);
  query.single = jest.fn(() => query);
  query.update = jest.fn(() => query);
  query.then = (onfulfilled, onrejected) => Promise.resolve(result).then(onfulfilled, onrejected);

  return query;
}

function useTableQueries(queriesByTable: Record<string, QueryMock[]>) {
  mockedSupabase.from.mockImplementation((table: string) => {
    const query = queriesByTable[table]?.shift();

    if (!query) {
      throw new Error(`Unexpected table query: ${table}`);
    }

    return query;
  });
}

function jobRequestRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'request-1',
    requester_id: 'profile-requester',
    provider_id: 'prov-01',
    category_id: 'plumbing',
    title: 'Test sink repair',
    description: 'The sink is leaking under the cabinet.',
    original_user_text: 'Sink leaking under cabinet',
    urgency: 'soon',
    preferred_date: '2026-07-18',
    preferred_time: 'Afternoon',
    contact_preference: 'app_update',
    general_area_label: 'East Legon, general area only',
    status: 'Submitted',
    moderation_status: 'not_run',
    created_at: createdAt,
    ...overrides,
  };
}

function statusEvent(status: 'Submitted' | 'Accepted', note: string | null = null) {
  return {
    id: `event-${status.toLowerCase()}`,
    job_request_id: 'request-1',
    status,
    note,
    created_at: createdAt,
  };
}

function providerResponse(message: string) {
  return {
    job_request_id: 'request-1',
    message,
    created_at: createdAt,
  };
}

describe('Module 1 repository', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedGetCurrentProfile.mockResolvedValue({
      id: 'profile-requester',
      authUserId: 'auth-requester',
      displayName: 'Akosua Mensah',
      role: 'requester',
      phoneVerified: true,
    });
  });

  it('lists fictional providers for requested categories', async () => {
    useTableQueries({
      provider_services: [
        createQuery({
          data: [{ provider_id: 'prov-01' }, { provider_id: 'prov-02' }, { provider_id: 'prov-03' }],
          error: null,
        }),
        createQuery({
          data: [
            { provider_id: 'prov-01', category_id: 'plumbing', service_label: 'Plumbing repairs' },
            { provider_id: 'prov-02', category_id: 'plumbing', service_label: 'Leak checks' },
            { provider_id: 'prov-03', category_id: 'plumbing', service_label: 'Pipe repairs' },
          ],
          error: null,
        }),
      ],
      provider_profiles: [
        createQuery({
          data: [
            {
              id: 'prov-01',
              business_name: 'Ama Plumbing',
              headline: 'Fast local plumbing help',
              general_area: 'East Legon and nearby areas',
              rating: 4.8,
              review_count: 24,
              completed_jobs: 40,
              response_rate: 95,
              community_recommendations: 12,
              availability: 'Today',
              accepting_requests: true,
            },
            {
              id: 'prov-02',
              business_name: 'Kojo Fixes',
              headline: 'Leak and pipe specialist',
              general_area: 'East Legon and nearby areas',
              rating: 4.7,
              review_count: 18,
              completed_jobs: 33,
              response_rate: 90,
              community_recommendations: 9,
              availability: 'Tomorrow',
              accepting_requests: true,
            },
            {
              id: 'prov-03',
              business_name: 'Efua Home Repairs',
              headline: 'Reliable plumbing visits',
              general_area: 'East Legon and nearby areas',
              rating: 4.6,
              review_count: 15,
              completed_jobs: 28,
              response_rate: 88,
              community_recommendations: 7,
              availability: 'This week',
              accepting_requests: true,
            },
          ],
          error: null,
        }),
      ],
      provider_trust_signals: [
        createQuery({
          data: [
            { id: 'signal-1', provider_id: 'prov-01', label: 'Phone verified', value: 'Yes' },
            { id: 'signal-2', provider_id: 'prov-02', label: 'Phone verified', value: 'Yes' },
            { id: 'signal-3', provider_id: 'prov-03', label: 'Phone verified', value: 'Yes' },
          ],
          error: null,
        }),
      ],
    });

    const providers = await listProvidersByCategory('plumbing');

    expect(mockedAssertSupabaseConfigured).toHaveBeenCalled();
    expect(providers.length).toBeGreaterThanOrEqual(3);
    expect(providers[0]).toMatchObject({
      id: 'prov-01',
      name: 'Ama Plumbing',
      phoneVerified: true,
    });
  });

  it('creates a request and lets provider accept it', async () => {
    useTableQueries({
      neighborhoods: [
        createQuery({
          data: [{ id: 'east-legon' }],
          error: null,
        }),
      ],
      job_requests: [
        createQuery({
          data: jobRequestRow(),
          error: null,
        }),
        createQuery({
          data: jobRequestRow(),
          error: null,
        }),
        createQuery({
          data: jobRequestRow({ status: 'Accepted' }),
          error: null,
        }),
        createQuery({
          data: jobRequestRow({ status: 'Accepted' }),
          error: null,
        }),
      ],
      job_request_status_events: [
        createQuery({ data: null, error: null }),
        createQuery({
          data: [statusEvent('Submitted')],
          error: null,
        }),
        createQuery({
          data: [statusEvent('Submitted')],
          error: null,
        }),
        createQuery({ data: null, error: null }),
        createQuery({
          data: [statusEvent('Accepted', 'I can come this afternoon.')],
          error: null,
        }),
        createQuery({
          data: [statusEvent('Accepted', 'I can come this afternoon.')],
          error: null,
        }),
      ],
      provider_responses: [
        createQuery({ data: [], error: null }),
        createQuery({ data: [], error: null }),
        createQuery({ data: null, error: null }),
        createQuery({
          data: [providerResponse('I can come this afternoon.')],
          error: null,
        }),
        createQuery({
          data: [providerResponse('I can come this afternoon.')],
          error: null,
        }),
      ],
    });

    const request = await createJobRequest({
      requesterName: 'Akosua Mensah',
      providerId: 'prov-01',
      categoryId: 'plumbing',
      neighborhood: 'East Legon',
      areaLabel: 'East Legon, general area only',
      title: 'Test sink repair',
      description: 'The sink is leaking under the cabinet.',
      originalUserText: 'Sink leaking under cabinet',
      urgency: 'soon',
      preferredDate: '2026-07-18',
      preferredTime: 'Afternoon',
      contactPreference: 'app_update',
      photoCount: 0,
    });

    expect((await getRequest(request.id))?.status).toBe('Submitted');

    await updateRequestStatus(request.id, 'Accepted', 'I can come this afternoon.');

    const updated = await getRequest(request.id);

    expect(updated?.status).toBe('Accepted');
    expect(updated?.providerMessage).toBe('I can come this afternoon.');
  });
});
