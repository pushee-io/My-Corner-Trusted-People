import type {
  Day2BLiveJobRequestRow,
  Day2BLiveProviderRow,
  Day2BQueryResult,
  Day2BSupabaseReadClient,
} from '@/lib/day2b-live-repository';

export type Day2BSupabaseReadTableName =
  | 'provider_profiles'
  | 'provider_services'
  | 'provider_trust_signals'
  | 'job_requests'
  | 'provider_responses';

export type Day2BSupabaseReadError = {
  message: string;
  code?: string;
};

type SupabaseLikeResult<Row> = {
  data: Row[] | Row | null;
  error: Day2BSupabaseReadError | null;
};

type SupabaseLikeQuery<Row> = PromiseLike<SupabaseLikeResult<Row>> & {
  eq: (column: string, value: unknown) => SupabaseLikeQuery<Row>;
  in: (column: string, values: unknown[]) => SupabaseLikeQuery<Row>;
  order: (column: string, options?: { ascending?: boolean }) => SupabaseLikeQuery<Row>;
  single: () => PromiseLike<SupabaseLikeResult<Row>>;
};

type SupabaseLikeTable<Row> = {
  select: (columns: string) => SupabaseLikeQuery<Row>;
};

type SupabaseLikeClient = {
  from: <Row = Record<string, unknown>>(table: Day2BSupabaseReadTableName) => SupabaseLikeTable<Row>;
};

type SupabaseModuleShape = {
  supabase?: SupabaseLikeClient;
};

type ProviderProfileRow = {
  id: string;
  business_name: string;
  headline: string;
  general_area: string;
  rating: number | string;
  review_count: number;
  completed_jobs: number;
  response_rate: number | string;
  community_recommendations: number;
  availability: string;
  accepting_requests: boolean;
  account_age?: string;
};

type ProviderServiceRow = {
  provider_id: string;
  category_id: string;
  service_label: string;
};

type ProviderTrustSignalRow = {
  id: string;
  provider_id: string;
  label: string;
  value: string;
};

type JobRequestRow = {
  id: string;
  requester_id: string;
  provider_id: string;
  category_id: string;
  title: string;
  description: string;
  original_user_text: string;
  urgency: Day2BLiveJobRequestRow['urgency'];
  preferred_date: string;
  preferred_time: string;
  contact_preference: Day2BLiveJobRequestRow['contact_preference'];
  general_area_label: string;
  status: Day2BLiveJobRequestRow['status'];
  moderation_status: Day2BLiveJobRequestRow['moderation_status'];
  created_at: string;
};

type ProviderResponseRow = {
  job_request_id: string;
  message: string | null;
  created_at: string;
};

export const day2bProviderProfileColumns =
  'id,business_name,headline,general_area,rating,review_count,completed_jobs,response_rate,community_recommendations,availability,accepting_requests';

export const day2bProviderServiceColumns = 'provider_id,category_id,service_label';

export const day2bProviderTrustSignalColumns = 'id,provider_id,label,value';

export const day2bJobRequestColumns =
  'id,requester_id,provider_id,category_id,title,description,original_user_text,urgency,preferred_date,preferred_time,contact_preference,general_area_label,status,moderation_status,created_at';

export const day2bProviderResponseColumns = 'job_request_id,message,created_at';

let cachedSupabaseDay2BReadClient: Day2BSupabaseReadClient | undefined;

export function createDay2BSupabaseReadClient(client: SupabaseLikeClient): Day2BSupabaseReadClient {
  return {
    async listProvidersByCategory(categoryId) {
      const servicesResult = await client
        .from<ProviderServiceRow>('provider_services')
        .select('provider_id')
        .eq('category_id', categoryId);

      if (servicesResult.error) return { data: null, error: toError(servicesResult.error) };

      const providerIds = uniqueRows(asRows(servicesResult.data).map((service) => service.provider_id));
      if (providerIds.length === 0) return { data: [], error: null };

      const providersResult = await client
        .from<ProviderProfileRow>('provider_profiles')
        .select(day2bProviderProfileColumns)
        .in('id', providerIds)
        .eq('accepting_requests', true)
        .order('rating', { ascending: false });

      if (providersResult.error) return { data: null, error: toError(providersResult.error) };

      return buildProviderRows(client, asRows(providersResult.data));
    },

    async getProvider(providerId) {
      const providerResult = await client
        .from<ProviderProfileRow>('provider_profiles')
        .select(day2bProviderProfileColumns)
        .eq('id', providerId)
        .single();

      if (providerResult.error) {
        if (providerResult.error.code === 'PGRST116') return { data: null, error: null };
        return { data: null, error: toError(providerResult.error) };
      }

      const provider = asSingleRow(providerResult.data);
      if (!provider) return { data: null, error: null };

      const providerRows = await buildProviderRows(client, [provider]);
      if (providerRows.error) return { data: null, error: providerRows.error };

      return { data: providerRows.data?.[0] ?? null, error: null };
    },

    async listProviderRequests(providerId) {
      const requestsResult = await client
        .from<JobRequestRow>('job_requests')
        .select(day2bJobRequestColumns)
        .eq('provider_id', providerId)
        .order('created_at', { ascending: false });

      if (requestsResult.error) return { data: null, error: toError(requestsResult.error) };

      const requests = asRows(requestsResult.data);
      if (requests.length === 0) return { data: [], error: null };

      const requestIds = requests.map((request) => request.id);
      const responsesResult = await client
        .from<ProviderResponseRow>('provider_responses')
        .select(day2bProviderResponseColumns)
        .in('job_request_id', requestIds)
        .order('created_at', { ascending: false });

      if (responsesResult.error) return { data: null, error: toError(responsesResult.error) };

      return {
        data: requests.map((request) => mapJobRequestRow(request, asRows(responsesResult.data))),
        error: null,
      };
    },
  };
}

export function getSupabaseDay2BReadClient(): Day2BSupabaseReadClient {
  if (!cachedSupabaseDay2BReadClient) {
    const supabaseModule = loadSupabaseModule();

    if (!supabaseModule.supabase) {
      throw new Error('Supabase Day 2b read client is unavailable.');
    }

    cachedSupabaseDay2BReadClient = createDay2BSupabaseReadClient(supabaseModule.supabase);
  }

  return cachedSupabaseDay2BReadClient;
}

export function resetSupabaseDay2BReadClientForTests() {
  cachedSupabaseDay2BReadClient = undefined;
}

async function buildProviderRows(
  client: SupabaseLikeClient,
  providerRows: ProviderProfileRow[],
): Promise<Day2BQueryResult<Day2BLiveProviderRow>> {
  if (providerRows.length === 0) return { data: [], error: null };

  const providerIds = providerRows.map((provider) => provider.id);
  const [servicesResult, signalsResult] = await Promise.all([
    client
      .from<ProviderServiceRow>('provider_services')
      .select(day2bProviderServiceColumns)
      .in('provider_id', providerIds),
    client
      .from<ProviderTrustSignalRow>('provider_trust_signals')
      .select(day2bProviderTrustSignalColumns)
      .in('provider_id', providerIds),
  ]);

  if (servicesResult.error) return { data: null, error: toError(servicesResult.error) };
  if (signalsResult.error) return { data: null, error: toError(signalsResult.error) };

  const services = asRows(servicesResult.data);
  const signals = asRows(signalsResult.data);

  return {
    data: providerRows.map((provider) => mapProviderRow(provider, services, signals)),
    error: null,
  };
}

function mapProviderRow(
  provider: ProviderProfileRow,
  services: ProviderServiceRow[],
  signals: ProviderTrustSignalRow[],
): Day2BLiveProviderRow {
  const providerServices = services.filter((service) => service.provider_id === provider.id);
  const providerSignals = signals.filter((signal) => signal.provider_id === provider.id);
  const firstService = providerServices[0];

  return {
    id: provider.id,
    business_name: provider.business_name,
    headline: provider.headline,
    service_label: firstService?.service_label,
    general_area: provider.general_area,
    category_ids: providerServices.map((service) => service.category_id),
    trust_signals: providerSignals.map((signal) => ({ id: signal.id, label: signal.label, value: signal.value })),
    completed_jobs: provider.completed_jobs,
    response_rate: provider.response_rate,
    account_age: provider.account_age ?? 'Live pilot profile',
    accepting_requests: provider.accepting_requests,
    rating: provider.rating,
    review_count: provider.review_count,
    community_recommendations: provider.community_recommendations,
    phone_verified: providerSignals.some((signal) => signal.label === 'Phone verified' && signal.value === 'Yes'),
    availability: provider.availability,
  };
}

function mapJobRequestRow(request: JobRequestRow, responses: ProviderResponseRow[]): Day2BLiveJobRequestRow {
  const providerMessage = responses.find((response) => response.job_request_id === request.id)?.message;

  return {
    id: request.id,
    requester_name: 'Requester',
    provider_id: request.provider_id,
    category_id: request.category_id,
    neighborhood: 'Selected neighborhood',
    general_area_label: request.general_area_label,
    title: request.title,
    description: request.description,
    original_user_text: request.original_user_text,
    urgency: request.urgency,
    preferred_date: request.preferred_date,
    preferred_time: request.preferred_time,
    contact_preference: request.contact_preference,
    photo_count: 0,
    status: request.status,
    moderation_status: request.moderation_status,
    provider_message: providerMessage ?? undefined,
    created_at: request.created_at,
  };
}

function asRows<Row>(data: Row[] | Row | null): Row[] {
  if (!data) return [];
  return Array.isArray(data) ? data : [data];
}

function asSingleRow<Row>(data: Row[] | Row | null): Row | undefined {
  return asRows(data)[0];
}

function uniqueRows(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function toError(error: Day2BSupabaseReadError): Error {
  return new Error(error.message.slice(0, 180));
}

function loadSupabaseModule(): SupabaseModuleShape {
  return require('@/lib/supabase') as SupabaseModuleShape;
}
