import { getCurrentProfile, getCurrentProviderProfileId } from '@/lib/auth';
import { assertSupabaseConfigured, supabase } from '@/lib/supabase';
import type { JobRequest, JobRequestDraftInput, Provider, RequestStatus, StatusEvent } from '@/types/contracts';

type ProviderRow = {
  id: string;
  business_name: string;
  headline: string;
  general_area: string;
  rating: number | string;
  review_count: number;
  completed_jobs: number;
  response_rate: number;
  community_recommendations: number;
  availability: string;
  accepting_requests: boolean;
};

type ProviderServiceRow = {
  provider_id: string;
  category_id: string;
  service_label: string;
};

type TrustSignalRow = {
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
  urgency: JobRequest['urgency'];
  preferred_date: string;
  preferred_time: string;
  contact_preference: JobRequest['contactPreference'];
  general_area_label: string;
  status: RequestStatus;
  moderation_status: JobRequest['moderationStatus'];
  created_at: string;
};

type StatusEventRow = {
  id: string;
  status: RequestStatus;
  note: string | null;
  created_at: string;
};

type ProviderResponseRow = {
  message: string | null;
  created_at: string;
};

function sortByCreatedAtDesc<T extends { created_at: string }>(rows: T[]) {
  return [...rows].sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime());
}

function actorForStatus(status: RequestStatus): StatusEvent['actor'] {
  return status === 'Cancelled' || status === 'Reported' ? 'requester' : 'provider';
}

async function providerServices(providerIds: string[]) {
  if (providerIds.length === 0) return [];

  const { data, error } = await supabase
    .from('provider_services')
    .select('provider_id, category_id, service_label')
    .in('provider_id', providerIds);

  if (error) throw error;
  return (data ?? []) as ProviderServiceRow[];
}

async function providerTrustSignals(providerIds: string[]) {
  if (providerIds.length === 0) return [];

  const { data, error } = await supabase
    .from('provider_trust_signals')
    .select('id, provider_id, label, value')
    .in('provider_id', providerIds);

  if (error) throw error;
  return (data ?? []) as TrustSignalRow[];
}

function mapProvider(row: ProviderRow, services: ProviderServiceRow[], signals: TrustSignalRow[]): Provider {
  const providerServicesForRow = services.filter((service) => service.provider_id === row.id);
  const trustSignals = signals.filter((signal) => signal.provider_id === row.id);
  const categoryIds = providerServicesForRow.map((service) => service.category_id);
  const firstService = providerServicesForRow[0];
  const rating = typeof row.rating === 'string' ? Number(row.rating) : row.rating;

  return {
    id: row.id,
    name: row.business_name,
    headline: row.headline,
    serviceLabel: firstService?.service_label ?? 'Local service',
    neighborhood: row.general_area.split(' and ')[0] ?? row.general_area,
    areaLabel: row.general_area,
    categoryIds,
    imageKind: 'initials',
    rating,
    reviewCount: row.review_count,
    communityRecommendations: row.community_recommendations,
    phoneVerified: trustSignals.some((signal) => signal.label === 'Phone verified' && signal.value === 'Yes'),
    availability: row.availability,
    trustSignals: trustSignals.map((signal) => ({ id: signal.id, label: signal.label, value: signal.value })),
    completedJobs: row.completed_jobs,
    responseRate: `${row.response_rate}%`,
    accountAge: 'Seeded pilot profile',
    isAcceptingRequests: row.accepting_requests,
  };
}

async function mapProviders(rows: ProviderRow[]) {
  const providerIds = rows.map((row) => row.id);
  const [services, signals] = await Promise.all([providerServices(providerIds), providerTrustSignals(providerIds)]);
  return rows.map((row) => mapProvider(row, services, signals));
}

async function loadRequestDetails(rows: JobRequestRow[]): Promise<JobRequest[]> {
  if (rows.length === 0) return [];

  const requestIds = rows.map((row) => row.id);
  const [{ data: events, error: eventsError }, { data: responses, error: responsesError }] = await Promise.all([
    supabase
      .from('job_request_status_events')
      .select('id, job_request_id, status, note, created_at')
      .in('job_request_id', requestIds)
      .order('created_at', { ascending: false }),
    supabase
      .from('provider_responses')
      .select('job_request_id, message, created_at')
      .in('job_request_id', requestIds)
      .order('created_at', { ascending: false }),
  ]);

  if (eventsError) throw eventsError;
  if (responsesError) throw responsesError;

  return rows.map((row) => {
    const statusTimeline = ((events ?? []) as (StatusEventRow & { job_request_id: string })[])
      .filter((event) => event.job_request_id === row.id)
      .map((event) => ({
        id: event.id,
        status: event.status,
        actor: actorForStatus(event.status),
        note: event.note ?? undefined,
        createdAt: event.created_at,
      }));
    const providerMessage = ((responses ?? []) as (ProviderResponseRow & { job_request_id: string })[]).find(
      (response) => response.job_request_id === row.id,
    )?.message;

    return {
      requesterName: 'Signed-in requester',
      providerId: row.provider_id,
      categoryId: row.category_id,
      neighborhood: 'Selected neighborhood',
      areaLabel: row.general_area_label,
      title: row.title,
      description: row.description,
      originalUserText: row.original_user_text,
      urgency: row.urgency,
      preferredDate: row.preferred_date,
      preferredTime: row.preferred_time,
      contactPreference: row.contact_preference,
      photoCount: 0,
      id: row.id,
      status: row.status,
      moderationStatus: row.moderation_status,
      providerMessage: providerMessage ?? undefined,
      createdAt: row.created_at,
      statusTimeline,
    };
  });
}

export async function listProvidersByCategory(categoryId: string): Promise<Provider[]> {
  assertSupabaseConfigured();
  const { data: services, error: servicesError } = await supabase
    .from('provider_services')
    .select('provider_id')
    .eq('category_id', categoryId);

  if (servicesError) throw servicesError;

  const providerIds = [...new Set((services ?? []).map((service) => service.provider_id))];
  if (providerIds.length === 0) return [];

  const { data, error } = await supabase
    .from('provider_profiles')
    .select(
      'id, business_name, headline, general_area, rating, review_count, completed_jobs, response_rate, community_recommendations, availability, accepting_requests',
    )
    .in('id', providerIds)
    .eq('accepting_requests', true)
    .order('rating', { ascending: false });

  if (error) throw error;
  return mapProviders((data ?? []) as ProviderRow[]);
}

export async function getProvider(providerId: string): Promise<Provider | undefined> {
  assertSupabaseConfigured();
  const { data, error } = await supabase
    .from('provider_profiles')
    .select(
      'id, business_name, headline, general_area, rating, review_count, completed_jobs, response_rate, community_recommendations, availability, accepting_requests',
    )
    .eq('id', providerId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return undefined;
    throw error;
  }

  const providers = await mapProviders([data as ProviderRow]);
  return providers[0];
}

export async function createJobRequest(input: JobRequestDraftInput): Promise<JobRequest> {
  const profile = await getCurrentProfile();
  const { data: neighborhoods, error: neighborhoodError } = await supabase
    .from('neighborhoods')
    .select('id')
    .eq('name', input.neighborhood)
    .limit(1);

  if (neighborhoodError) throw neighborhoodError;

  const { data, error } = await supabase
    .from('job_requests')
    .insert({
      requester_id: profile.id,
      provider_id: input.providerId,
      category_id: input.categoryId,
      title: input.title,
      description: input.description,
      original_user_text: input.originalUserText,
      urgency: input.urgency,
      preferred_date: input.preferredDate,
      preferred_time: input.preferredTime,
      contact_preference: input.contactPreference,
      neighborhood_id: neighborhoods?.[0]?.id ?? null,
      general_area_label: input.areaLabel,
      status: 'Submitted',
      moderation_status: 'not_run',
    })
    .select(
      'id, requester_id, provider_id, category_id, title, description, original_user_text, urgency, preferred_date, preferred_time, contact_preference, general_area_label, status, moderation_status, created_at',
    )
    .single();

  if (error) throw error;

  await insertStatusEvent(data.id, 'Submitted', profile.id);
  const [request] = await loadRequestDetails([data as JobRequestRow]);
  return request;
}

export async function listRequesterRequests(): Promise<JobRequest[]> {
  const profile = await getCurrentProfile();
  const { data, error } = await supabase
    .from('job_requests')
    .select(
      'id, requester_id, provider_id, category_id, title, description, original_user_text, urgency, preferred_date, preferred_time, contact_preference, general_area_label, status, moderation_status, created_at',
    )
    .eq('requester_id', profile.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return loadRequestDetails(sortByCreatedAtDesc((data ?? []) as JobRequestRow[]));
}

export async function listProviderRequests(): Promise<JobRequest[]> {
  const providerProfileId = await getCurrentProviderProfileId();
  const { data, error } = await supabase
    .from('job_requests')
    .select(
      'id, requester_id, provider_id, category_id, title, description, original_user_text, urgency, preferred_date, preferred_time, contact_preference, general_area_label, status, moderation_status, created_at',
    )
    .eq('provider_id', providerProfileId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return loadRequestDetails(sortByCreatedAtDesc((data ?? []) as JobRequestRow[]));
}

async function insertStatusEvent(requestId: string, status: RequestStatus, actorId: string, note?: string) {
  const { error } = await supabase.from('job_request_status_events').insert({
    job_request_id: requestId,
    status,
    actor_id: actorId,
    note,
  });

  if (error) throw error;
}

export async function updateRequestStatus(
  requestId: string,
  status: RequestStatus,
  providerMessage?: string,
): Promise<JobRequest | undefined> {
  const profile = await getCurrentProfile();

  const { data, error } = await supabase
    .from('job_requests')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', requestId)
    .select(
      'id, requester_id, provider_id, category_id, title, description, original_user_text, urgency, preferred_date, preferred_time, contact_preference, general_area_label, status, moderation_status, created_at',
    )
    .single();

  if (error) {
    if (error.code === 'PGRST116') return undefined;
    throw error;
  }

  await insertStatusEvent(requestId, status, profile.id, providerMessage);

  if ((status === 'Accepted' || status === 'Declined') && providerMessage) {
    const { error: responseError } = await supabase.from('provider_responses').insert({
      job_request_id: requestId,
      provider_id: data.provider_id,
      response_status: status,
      message: providerMessage,
    });

    if (responseError) throw responseError;
  }

  const [request] = await loadRequestDetails([data as JobRequestRow]);
  return request;
}

export async function markRequestViewed(requestId: string): Promise<JobRequest | undefined> {
  const request = await getRequest(requestId);
  if (!request || request.status !== 'Submitted') return request;
  return updateRequestStatus(requestId, 'Viewed', 'Provider opened the request.');
}

export async function cancelRequest(requestId: string): Promise<JobRequest | undefined> {
  return updateRequestStatus(requestId, 'Cancelled');
}

export async function reportRequest(requestId: string): Promise<JobRequest | undefined> {
  return updateRequestStatus(requestId, 'Reported');
}

export async function getRequest(requestId: string): Promise<JobRequest | undefined> {
  const { data, error } = await supabase
    .from('job_requests')
    .select(
      'id, requester_id, provider_id, category_id, title, description, original_user_text, urgency, preferred_date, preferred_time, contact_preference, general_area_label, status, moderation_status, created_at',
    )
    .eq('id', requestId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return undefined;
    throw error;
  }

  const [request] = await loadRequestDetails([data as JobRequestRow]);
  return request;
}
