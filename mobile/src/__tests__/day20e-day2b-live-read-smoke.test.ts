import { getDay2BLiveRepository } from '@/lib/day2b-live-repository';
import {
  createDay2BSupabaseReadClient,
  day2bJobRequestColumns,
  day2bProviderProfileColumns,
  day2bProviderResponseColumns,
  day2bProviderServiceColumns,
  day2bProviderTrustSignalColumns,
  type Day2BSupabaseReadTableName,
} from '@/lib/day2b-supabase-read-adapter';

jest.mock('@/lib/repository', () => ({
  listProvidersByCategory: jest.fn(),
  getProvider: jest.fn(),
  listProviderRequests: jest.fn(),
  createJobRequest: jest.fn(),
  updateRequestStatus: jest.fn(),
}));

type Call = {
  table: Day2BSupabaseReadTableName;
  columns: string;
  filters: {
    kind: 'eq' | 'in';
    column: string;
    value: unknown;
  }[];
  order?: { column: string; ascending?: boolean };
  single?: boolean;
};

type RowsByTable = Partial<Record<Day2BSupabaseReadTableName, Record<string, unknown>[]>>;

const explicitLiveConfig = {
  liveSupabaseEnabled: true,
  supabaseUrl: 'https://example.supabase.co',
  supabaseAnonKey: 'anon-key',
};

const privatePayloadPattern =
  /phone_number|email|ghana.*post|ghana_post|gps|exact.*address|exact_address|address_line|street_address|coordinates?|latitude|longitude|legal.*name|legal_name|challenge.*hash|challenge_hash|hash/i;

function applyFilters(rows: Record<string, unknown>[], call: Call) {
  return call.filters.reduce((currentRows, filter) => {
    if (filter.kind === 'eq') {
      return currentRows.filter((row) => row[filter.column] === filter.value);
    }

    return currentRows.filter((row) => Array.isArray(filter.value) && filter.value.includes(row[filter.column]));
  }, rows);
}

function createQueryResult<Row>(rows: Row[], call: Call) {
  return {
    data: call.single ? (rows[0] ?? null) : rows,
    error: null,
  };
}

function createFakeSupabaseClient(rowsByTable: RowsByTable) {
  const calls: Call[] = [];

  return {
    calls,
    client: {
      from(table: Day2BSupabaseReadTableName) {
        return {
          select(columns: string) {
            const call: Call = {
              table,
              columns,
              filters: [],
            };
            calls.push(call);

            const query = {
              eq(column: string, value: unknown) {
                call.filters.push({ kind: 'eq', column, value });
                return query;
              },
              in(column: string, value: unknown[]) {
                call.filters.push({ kind: 'in', column, value });
                return query;
              },
              order(column: string, options?: { ascending?: boolean }) {
                call.order = { column, ascending: options?.ascending };
                return query;
              },
              single() {
                const rows = applyFilters(rowsByTable[table] ?? [], call);
                return Promise.resolve(createQueryResult(rows, call));
              },
              then(resolve: (value: unknown) => unknown, reject: (reason?: unknown) => unknown) {
                const rows = applyFilters(rowsByTable[table] ?? [], call);
                return Promise.resolve(createQueryResult(rows, call)).then(resolve, reject);
              },
            };

            return query;
          },
        };
      },
    },
  };
}

describe('Day 20E Day 2b live read smoke path', () => {
  it('reads providers and requests through the explicit live flag without writes or private fields', async () => {
    const { client, calls } = createFakeSupabaseClient({
      provider_services: [
        {
          provider_id: 'prov-live-01',
          category_id: 'plumbing',
          service_label: 'Plumbing repairs',
        },
      ],
      provider_profiles: [
        {
          id: 'prov-live-01',
          business_name: 'Kwame PipeCare',
          headline: 'Careful plumbing support',
          general_area: 'East Legon and nearby',
          rating: 4.8,
          review_count: 12,
          completed_jobs: 17,
          response_rate: 91,
          community_recommendations: 5,
          availability: 'Available today',
          accepting_requests: true,
        },
      ],
      provider_trust_signals: [
        {
          id: 'signal-phone',
          provider_id: 'prov-live-01',
          label: 'Phone verified',
          value: 'Yes',
        },
      ],
      job_requests: [
        {
          id: 'req-live-01',
          requester_id: 'profile-requester',
          provider_id: 'prov-live-01',
          category_id: 'plumbing',
          title: 'Bathroom pipe leak',
          description: 'A bathroom pipe is leaking. Please inspect and advise on repair.',
          original_user_text: 'Bathroom pipe leaking near the sink.',
          urgency: 'soon',
          preferred_date: '2026-07-25',
          preferred_time: 'Morning',
          contact_preference: 'app_update',
          general_area_label: 'East Legon, near Lagos Avenue',
          status: 'Viewed',
          moderation_status: 'not_run',
          created_at: '2026-07-28T12:00:00.000Z',
        },
      ],
      provider_responses: [
        {
          job_request_id: 'req-live-01',
          message: 'I can come tomorrow morning and will confirm before I leave.',
          created_at: '2026-07-28T13:00:00.000Z',
        },
      ],
    });
    const readClient = createDay2BSupabaseReadClient(client as never);
    const repository = getDay2BLiveRepository(explicitLiveConfig, readClient);

    const providers = await repository.listProvidersByCategory('plumbing');
    const requests = await repository.listProviderRequests('prov-live-01');
    const serializedPayload = JSON.stringify({ providers, requests });
    const selectedColumns = calls.map((call) => call.columns).join(',');

    expect(repository.mode).toBe('live-readonly');
    expect(providers[0]).toMatchObject({
      id: 'prov-live-01',
      name: 'Kwame PipeCare',
      serviceLabel: 'Plumbing repairs',
      areaLabel: 'East Legon and nearby',
    });
    expect(requests[0]).toMatchObject({
      id: 'req-live-01',
      providerId: 'prov-live-01',
      areaLabel: 'East Legon, near Lagos Avenue',
      providerMessage: 'I can come tomorrow morning and will confirm before I leave.',
    });
    expect(calls).toEqual([
      {
        table: 'provider_services',
        columns: 'provider_id',
        filters: [{ kind: 'eq', column: 'category_id', value: 'plumbing' }],
      },
      {
        table: 'provider_profiles',
        columns: day2bProviderProfileColumns,
        filters: [
          { kind: 'in', column: 'id', value: ['prov-live-01'] },
          { kind: 'eq', column: 'accepting_requests', value: true },
        ],
        order: { column: 'rating', ascending: false },
      },
      {
        table: 'provider_services',
        columns: day2bProviderServiceColumns,
        filters: [{ kind: 'in', column: 'provider_id', value: ['prov-live-01'] }],
      },
      {
        table: 'provider_trust_signals',
        columns: day2bProviderTrustSignalColumns,
        filters: [{ kind: 'in', column: 'provider_id', value: ['prov-live-01'] }],
      },
      {
        table: 'job_requests',
        columns: day2bJobRequestColumns,
        filters: [{ kind: 'eq', column: 'provider_id', value: 'prov-live-01' }],
        order: { column: 'created_at', ascending: false },
      },
      {
        table: 'provider_responses',
        columns: day2bProviderResponseColumns,
        filters: [{ kind: 'in', column: 'job_request_id', value: ['req-live-01'] }],
        order: { column: 'created_at', ascending: false },
      },
    ]);
    expect(selectedColumns).not.toMatch(privatePayloadPattern);
    expect(serializedPayload).not.toMatch(privatePayloadPattern);
    await expect(
      repository.createJobRequest({
        requesterName: 'Akosua Mensah',
        providerId: 'prov-live-01',
        categoryId: 'plumbing',
        neighborhood: 'East Legon',
        areaLabel: 'East Legon, near Lagos Avenue',
        title: 'Bathroom pipe leak',
        description: 'A bathroom pipe is leaking. Please inspect and advise on repair.',
        originalUserText: 'Bathroom pipe leaking near the sink.',
        urgency: 'soon',
        preferredDate: '2026-07-25',
        preferredTime: 'Morning',
        contactPreference: 'app_update',
        photoCount: 0,
      }),
    ).rejects.toThrow('writes are not enabled');
    await expect(repository.updateRequestStatus('req-live-01', 'Accepted')).rejects.toThrow('writes are not enabled');
  });
});
