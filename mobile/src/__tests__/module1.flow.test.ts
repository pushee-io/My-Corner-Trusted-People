import { createJobRequest, getRequest, updateRequestStatus } from '@/lib/repository';
import { getCurrentProfile } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

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

function jobRequestRow(status: 'Submitted' | 'Declined' = 'Submitted') {
  return {
    id: 'request-1',
    requester_id: 'profile-requester',
    provider_id: 'prov-01',
    category_id: 'plumbing',
    title: 'Pipe noise',
    description: 'The bathroom pipe makes a loud sound when water runs.',
    original_user_text: 'Pipe noise when water runs',
    urgency: 'flexible',
    preferred_date: '2026-07-19',
    preferred_time: 'Morning',
    contact_preference: 'app_update',
    general_area_label: 'East Legon, general area only',
    status,
    moderation_status: 'not_run',
    created_at: createdAt,
  };
}

function statusEvent(status: 'Submitted' | 'Declined', note: string | null = null) {
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

describe('Module 1 happy path', () => {
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

  it('requester submits and provider declines with a visible status update', async () => {
    useTableQueries({
      neighborhoods: [
        createQuery({
          data: [{ id: 'east-legon' }],
          error: null,
        }),
      ],
      job_requests: [
        createQuery({
          data: jobRequestRow('Submitted'),
          error: null,
        }),
        createQuery({
          data: jobRequestRow('Declined'),
          error: null,
        }),
        createQuery({
          data: jobRequestRow('Declined'),
          error: null,
        }),
      ],
      job_request_status_events: [
        createQuery({ data: null, error: null }),
        createQuery({
          data: [statusEvent('Submitted')],
          error: null,
        }),
        createQuery({ data: null, error: null }),
        createQuery({
          data: [statusEvent('Declined', 'Sorry, I am fully booked.')],
          error: null,
        }),
        createQuery({
          data: [statusEvent('Declined', 'Sorry, I am fully booked.')],
          error: null,
        }),
      ],
      provider_responses: [
        createQuery({
          data: [],
          error: null,
        }),
        createQuery({ data: null, error: null }),
        createQuery({
          data: [providerResponse('Sorry, I am fully booked.')],
          error: null,
        }),
        createQuery({
          data: [providerResponse('Sorry, I am fully booked.')],
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
      title: 'Pipe noise',
      description: 'The bathroom pipe makes a loud sound when water runs.',
      originalUserText: 'Pipe noise when water runs',
      urgency: 'flexible',
      preferredDate: '2026-07-19',
      preferredTime: 'Morning',
      contactPreference: 'app_update',
      photoCount: 0,
    });

    await updateRequestStatus(request.id, 'Declined', 'Sorry, I am fully booked.');

    const updated = await getRequest(request.id);

    expect(updated?.status).toBe('Declined');
    expect(updated?.providerMessage).toContain('fully booked');
    expect(updated?.areaLabel).not.toContain('GPS');
  });
});
