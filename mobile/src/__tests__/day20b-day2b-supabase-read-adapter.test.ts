import {
  createDay2BSupabaseReadClient,
  day2bJobRequestColumns,
  day2bProviderProfileColumns,
  day2bProviderResponseColumns,
  day2bProviderServiceColumns,
  day2bProviderTrustSignalColumns,
  type Day2BSupabaseReadTableName,
} from '@/lib/day2b-supabase-read-adapter';

type Call = {
  table: string;
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

const sensitiveColumnPattern =
  /phone_number|email|ghana.*post|ghana_post|gps|exact.*address|address_line|street_address|coordinates?|latitude|longitude|legal.*name|legal_name|challenge.*hash|challenge_hash|hash/i;

function createQueryResult<Row>(rows: Row[], call: Call) {
  return {
    data: call.single ? (rows[0] ?? null) : rows,
    error: null,
  };
}

function applyFilters(rows: Record<string, unknown>[], call: Call) {
  return call.filters.reduce((currentRows, filter) => {
    if (filter.kind === 'eq') {
      return currentRows.filter((row) => row[filter.column] === filter.value);
    }

    return currentRows.filter((row) => Array.isArray(filter.value) && filter.value.includes(row[filter.column]));
  }, rows);
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
                call.single = true;
                return Promise.resolve(createQueryResult(applyFilters(rowsByTable[table] ?? [], call), call));
              },
              then(resolve: (value: unknown) => unknown, reject: (reason?: unknown) => unknown) {
                return Promise.resolve(createQueryResult(applyFilters(rowsByTable[table] ?? [], call), call)).then(
                  resolve,
                  reject,
                );
              },
            };

            return query;
          },
        };
      },
    },
  };
}

describe('Day 20B Day 2b Supabase read adapter', () => {
  it('uses narrow safe provider read columns and maps provider rows for the boundary', async () => {
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
          business_name: 'Adwoa Home Repairs',
          headline: 'Careful plumbing support',
          general_area: 'East Legon and nearby',
          rating: 4.8,
          review_count: 12,
          completed_jobs: 17,
          response_rate: 91,
          community_recommendations: 5,
          availability: 'Available today',
          accepting_requests: true,
          account_age: '8 months',
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
    });
    const readClient = createDay2BSupabaseReadClient(client as never);

    const result = await readClient.listProvidersByCategory?.('plumbing');

    expect(result?.error).toBeNull();
    expect(result?.data?.[0]).toMatchObject({
      id: 'prov-live-01',
      business_name: 'Adwoa Home Repairs',
      service_label: 'Plumbing repairs',
      category_ids: ['plumbing'],
      phone_verified: true,
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
    ]);
    expect(calls.map((call) => call.columns).join(',')).not.toMatch(sensitiveColumnPattern);
  });

  it('uses narrow safe request read columns and maps provider responses without addresses or coordinates', async () => {
    const { client, calls } = createFakeSupabaseClient({
      job_requests: [
        {
          id: 'req-live-01',
          requester_id: 'profile-requester',
          provider_id: 'prov-live-01',
          category_id: 'plumbing',
          title: 'Sink repair',
          description: 'Leak under cabinet',
          original_user_text: 'Sink leaking under cabinet',
          urgency: 'soon',
          preferred_date: '2026-07-28',
          preferred_time: 'Afternoon',
          contact_preference: 'app_update',
          general_area_label: 'East Legon, general area only',
          status: 'Accepted',
          moderation_status: 'not_run',
          created_at: '2026-07-28T12:00:00.000Z',
        },
      ],
      provider_responses: [
        {
          job_request_id: 'req-live-01',
          message: 'I can come this afternoon.',
          created_at: '2026-07-28T13:00:00.000Z',
        },
      ],
    });
    const readClient = createDay2BSupabaseReadClient(client as never);

    const result = await readClient.listProviderRequests?.('prov-live-01');

    expect(result?.error).toBeNull();
    expect(result?.data?.[0]).toMatchObject({
      id: 'req-live-01',
      provider_id: 'prov-live-01',
      general_area_label: 'East Legon, general area only',
      provider_message: 'I can come this afternoon.',
    });
    expect(calls).toEqual([
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
    expect(calls.map((call) => call.columns).join(',')).not.toMatch(sensitiveColumnPattern);
  });

  it('returns null for missing provider rows without surfacing Supabase not-found errors', async () => {
    const client = {
      from(table: Day2BSupabaseReadTableName) {
        return {
          select(columns: string) {
            void table;
            void columns;

            const query = {
              eq() {
                return query;
              },
              single() {
                return Promise.resolve({
                  data: null,
                  error: { message: 'not found', code: 'PGRST116' },
                });
              },
            };

            return query;
          },
        };
      },
    };
    const readClient = createDay2BSupabaseReadClient(client as never);

    await expect(readClient.getProvider?.('missing-provider')).resolves.toEqual({
      data: null,
      error: null,
    });
  });

  it('does not expose write methods from the live read adapter', () => {
    const { client } = createFakeSupabaseClient({});
    const readClient = createDay2BSupabaseReadClient(client as never);

    expect(Object.keys(readClient).sort()).toEqual(['getProvider', 'listProviderRequests', 'listProvidersByCategory']);
    expect('createJobRequest' in readClient).toBe(false);
    expect('updateRequestStatus' in readClient).toBe(false);
  });
});
