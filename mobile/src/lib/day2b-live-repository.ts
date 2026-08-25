import {
  createJobRequest as createSeededJobRequest,
  getProvider as getSeededProvider,
  listProviderRequests as listSeededProviderRequests,
  listProvidersByCategory as listSeededProvidersByCategory,
  updateRequestStatus as updateSeededRequestStatus,
} from '@/lib/repository';
import type { JobRequest, JobRequestDraftInput, Provider, RequestStatus, TrustSignal } from '@/types/contracts';

export type Day2BLiveRepositoryMode = 'seeded' | 'live-disabled' | 'live-readonly';

export type Day2BLiveRepositoryConfig = {
  liveSupabaseEnabled?: boolean;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
};

export type Day2BQueryResult<T> = {
  data: T[] | null;
  error: Error | null;
};

export type Day2BSupabaseReadClient = {
  listProvidersByCategory?: (categoryId: string) => Promise<Day2BQueryResult<Day2BLiveProviderRow>>;
  getProvider?: (providerId: string) => Promise<{ data: Day2BLiveProviderRow | null; error: Error | null }>;
  listProviderRequests?: (providerId: string) => Promise<Day2BQueryResult<Day2BLiveJobRequestRow>>;
};

export type Day2BRepository = {
  mode: Day2BLiveRepositoryMode;
  listProvidersByCategory: (categoryId: string) => Promise<Provider[]>;
  getProvider: (providerId: string) => Promise<Provider | undefined>;
  listProviderRequests: (providerId: string) => Promise<JobRequest[]>;
  createJobRequest: (input: JobRequestDraftInput) => Promise<JobRequest>;
  updateRequestStatus: (
    requestId: string,
    status: RequestStatus,
    providerMessage?: string,
  ) => Promise<JobRequest | undefined>;
};

export type Day2BLiveProviderRow = Record<string, unknown> & {
  id?: string;
  business_name?: string;
  display_name?: string;
  headline?: string;
  service_label?: string;
  neighborhood?: string;
  general_area?: string;
  area_label?: string;
  category_ids?: string[];
  trust_signals?: TrustSignal[];
  completed_jobs?: number;
  response_rate?: number | string;
  account_age?: string;
  accepting_requests?: boolean;
  rating?: number | string;
  review_count?: number;
  community_recommendations?: number;
  phone_verified?: boolean;
  availability?: string;
};

export type Day2BLiveJobRequestRow = Record<string, unknown> & {
  id?: string;
  requester_name?: string;
  provider_id?: string;
  category_id?: string;
  neighborhood?: string;
  general_area_label?: string;
  title?: string;
  description?: string;
  original_user_text?: string;
  urgency?: JobRequest['urgency'];
  preferred_date?: string;
  preferred_time?: string;
  contact_preference?: JobRequest['contactPreference'];
  photo_count?: number;
  status?: RequestStatus;
  moderation_status?: JobRequest['moderationStatus'];
  provider_message?: string | null;
  created_at?: string;
};

const liveOptInValue = 'enabled';

const sensitiveFieldPattern =
  /(phone_number|email|ghana.*post|ghana_post|gps|exact.*address|address_line|street_address|coordinates?|latitude|longitude|legal.*name|legal_name|challenge.*hash|challenge_hash|hash)/i;

function envValue(key: string): string | undefined {
  const maybeProcess = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;
  return maybeProcess?.env?.[key];
}

function readEnvironmentConfig(): Day2BLiveRepositoryConfig {
  return {
    liveSupabaseEnabled: envValue('EXPO_PUBLIC_MY_CORNER_DAY2B_LIVE_SUPABASE') === liveOptInValue,
    supabaseUrl: envValue('EXPO_PUBLIC_SUPABASE_URL'),
    supabaseAnonKey: envValue('EXPO_PUBLIC_SUPABASE_ANON_KEY'),
  };
}

function hasSupabaseConfig(config: Day2BLiveRepositoryConfig): boolean {
  return Boolean(config.supabaseUrl && config.supabaseAnonKey);
}

function assertNoSensitiveFields(row: Record<string, unknown>): void {
  const sensitiveKey = Object.keys(row).find((key) => sensitiveFieldPattern.test(key));
  if (sensitiveKey) {
    throw new Day2BLiveRepositoryError(`Live Day 2b payload included blocked private field: ${sensitiveKey}`);
  }
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim().length > 0 ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function asTrustSignals(value: unknown): TrustSignal[] {
  if (!Array.isArray(value)) return [];
  return value.filter((signal): signal is TrustSignal => {
    if (!signal || typeof signal !== 'object') return false;
    const candidate = signal as Partial<TrustSignal>;
    return (
      typeof candidate.id === 'string' && typeof candidate.label === 'string' && typeof candidate.value === 'string'
    );
  });
}

function statusTimelineFor(row: Day2BLiveJobRequestRow): JobRequest['statusTimeline'] {
  return [
    {
      id: `${asString(row.id, 'live-request')}-status`,
      status: row.status ?? 'Submitted',
      actor: 'system',
      createdAt: asString(row.created_at, new Date(0).toISOString()),
    },
  ];
}

export class Day2BLiveRepositoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'Day2BLiveRepositoryError';
  }
}

export function resolveDay2BLiveRepositoryMode(config: Day2BLiveRepositoryConfig = readEnvironmentConfig()) {
  if (!config.liveSupabaseEnabled) return 'seeded' satisfies Day2BLiveRepositoryMode;
  if (!hasSupabaseConfig(config)) return 'live-disabled' satisfies Day2BLiveRepositoryMode;
  return 'live-readonly' satisfies Day2BLiveRepositoryMode;
}

export function sanitizeLiveProviderRow(row: Day2BLiveProviderRow): Provider {
  assertNoSensitiveFields(row);

  const responseRate = row.response_rate === undefined ? '0%' : `${asNumber(row.response_rate)}%`;
  const areaLabel = asString(row.general_area, asString(row.area_label, 'General service area'));
  const trustSignals = asTrustSignals(row.trust_signals);

  return {
    id: asString(row.id, 'live-provider'),
    name: asString(row.business_name, asString(row.display_name, 'Local provider')),
    headline: asString(row.headline, 'Local service provider'),
    serviceLabel: asString(row.service_label, 'Local service'),
    neighborhood: asString(row.neighborhood, areaLabel.split(' and ')[0] ?? areaLabel),
    areaLabel,
    categoryIds: Array.isArray(row.category_ids) ? row.category_ids.filter((item) => typeof item === 'string') : [],
    imageKind: 'initials',
    rating: asNumber(row.rating),
    reviewCount: asNumber(row.review_count),
    communityRecommendations: asNumber(row.community_recommendations),
    phoneVerified: row.phone_verified === true || trustSignals.some((signal) => signal.label === 'Phone verified'),
    availability: asString(row.availability, 'Availability not set'),
    trustSignals,
    completedJobs: asNumber(row.completed_jobs),
    responseRate,
    accountAge: asString(row.account_age, 'Pilot profile'),
    isAcceptingRequests: row.accepting_requests !== false,
  };
}

export function sanitizeLiveJobRequestRow(row: Day2BLiveJobRequestRow): JobRequest {
  assertNoSensitiveFields(row);

  return {
    requesterName: asString(row.requester_name, 'Requester'),
    providerId: asString(row.provider_id),
    categoryId: asString(row.category_id),
    neighborhood: asString(row.neighborhood, 'Selected neighborhood'),
    areaLabel: asString(row.general_area_label, 'General service area'),
    title: asString(row.title, 'Service request'),
    description: asString(row.description),
    originalUserText: asString(row.original_user_text, asString(row.description)),
    urgency: row.urgency ?? 'flexible',
    preferredDate: asString(row.preferred_date, ''),
    preferredTime: asString(row.preferred_time, 'Flexible'),
    contactPreference: row.contact_preference ?? 'app_update',
    photoCount: asNumber(row.photo_count),
    id: asString(row.id, 'live-request'),
    status: row.status ?? 'Submitted',
    moderationStatus: row.moderation_status ?? 'not_run',
    providerMessage: row.provider_message ?? undefined,
    createdAt: asString(row.created_at, new Date(0).toISOString()),
    statusTimeline: statusTimelineFor(row),
  };
}

function seededRepository(): Day2BRepository {
  return {
    mode: 'seeded',
    listProvidersByCategory: async (categoryId) => listSeededProvidersByCategory(categoryId),
    getProvider: async (providerId) => getSeededProvider(providerId),
    listProviderRequests: async () => listSeededProviderRequests(),
    createJobRequest: async (input) => createSeededJobRequest(input),
    updateRequestStatus: async (requestId, status, providerMessage) =>
      updateSeededRequestStatus(requestId, status, providerMessage),
  };
}

function closedRepository(mode: Day2BLiveRepositoryMode): Day2BRepository {
  const failClosed = async () => {
    throw new Day2BLiveRepositoryError(
      'Live Day 2b Supabase access is disabled until explicit configuration and screen wiring are approved.',
    );
  };

  return {
    mode,
    listProvidersByCategory: failClosed,
    getProvider: failClosed,
    listProviderRequests: failClosed,
    createJobRequest: failClosed,
    updateRequestStatus: failClosed,
  };
}

function liveReadOnlyRepository(client: Day2BSupabaseReadClient): Day2BRepository {
  const writesDisabled = async () => {
    throw new Day2BLiveRepositoryError('Live Day 2b writes are not enabled from Expo Go.');
  };

  return {
    mode: 'live-readonly',
    listProvidersByCategory: async (categoryId) => {
      if (!client.listProvidersByCategory) return [];
      const { data, error } = await client.listProvidersByCategory(categoryId);
      if (error) throw error;
      return (data ?? []).map(sanitizeLiveProviderRow);
    },
    getProvider: async (providerId) => {
      if (!client.getProvider) return undefined;
      const { data, error } = await client.getProvider(providerId);
      if (error) throw error;
      return data ? sanitizeLiveProviderRow(data) : undefined;
    },
    listProviderRequests: async (providerId) => {
      if (!client.listProviderRequests) return [];
      const { data, error } = await client.listProviderRequests(providerId);
      if (error) throw error;
      return (data ?? []).map(sanitizeLiveJobRequestRow);
    },
    createJobRequest: writesDisabled,
    updateRequestStatus: writesDisabled,
  };
}

export function getDay2BLiveRepository(
  config: Day2BLiveRepositoryConfig = readEnvironmentConfig(),
  client?: Day2BSupabaseReadClient,
): Day2BRepository {
  const mode = resolveDay2BLiveRepositoryMode(config);

  if (mode === 'seeded') return seededRepository();
  if (mode === 'live-disabled') return closedRepository(mode);

  const liveClient = client ?? loadConfiguredDay2BSupabaseReadClient();

  if (!liveClient) return closedRepository('live-disabled');
  return liveReadOnlyRepository(liveClient);
}

function loadConfiguredDay2BSupabaseReadClient(): Day2BSupabaseReadClient | undefined {
  try {
    // Keep the Supabase adapter lazy so seeded tests do not load native modules.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const adapter = require('@/lib/day2b-supabase-read-adapter') as {
      getSupabaseDay2BReadClient?: () => Day2BSupabaseReadClient;
    };

    return adapter.getSupabaseDay2BReadClient?.();
  } catch {
    return undefined;
  }
}
