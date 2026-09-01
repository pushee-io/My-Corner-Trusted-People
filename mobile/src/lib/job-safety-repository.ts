import { assertSupabaseConfigured, supabase } from '@/lib/supabase';
import type {
  JobSafetyCompletionResult,
  JobSafetyLocationRelease,
  JobSafetySession,
  JobSafetyStartResult,
} from '@/types/contracts';

type SafetySessionRow = {
  job_request_id: string;
  state: JobSafetySession['state'];
  viewer_role: JobSafetySession['viewerRole'];
  can_view_exact_location: boolean;
  private_latitude: number | string | null;
  private_longitude: number | string | null;
  private_location_label: string | null;
  location_shared_at: string | null;
  provider_arrived_at: string | null;
  arrival_confirmed_at: string | null;
  active_at: string | null;
  code_expires_at: string | null;
  code_attempt_count: number;
  requester_completed_at: string | null;
  provider_completed_at: string | null;
  completed_at: string | null;
};

function optionalNumber(value: number | string | null): number | undefined {
  if (value === null) return undefined;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function optionalText(value: string | null): string | undefined {
  return value ?? undefined;
}

function firstRow<T>(value: T | T[] | null): T | undefined {
  if (Array.isArray(value)) return value[0];
  return value ?? undefined;
}

function mapSession(row: SafetySessionRow): JobSafetySession {
  return {
    jobRequestId: row.job_request_id,
    state: row.state,
    viewerRole: row.viewer_role,
    canViewExactLocation: row.can_view_exact_location,
    privateLatitude: optionalNumber(row.private_latitude),
    privateLongitude: optionalNumber(row.private_longitude),
    privateLocationLabel: optionalText(row.private_location_label),
    locationSharedAt: optionalText(row.location_shared_at),
    providerArrivedAt: optionalText(row.provider_arrived_at),
    arrivalConfirmedAt: optionalText(row.arrival_confirmed_at),
    activeAt: optionalText(row.active_at),
    codeExpiresAt: optionalText(row.code_expires_at),
    codeAttemptCount: row.code_attempt_count,
    requesterCompletedAt: optionalText(row.requester_completed_at),
    providerCompletedAt: optionalText(row.provider_completed_at),
    completedAt: optionalText(row.completed_at),
  };
}

export async function getJobSafetySession(jobRequestId: string): Promise<JobSafetySession | undefined> {
  assertSupabaseConfigured();
  const { data, error } = await supabase.rpc('get_job_safety_session', {
    target_job_request_id: jobRequestId,
  });
  if (error) throw error;

  const row = firstRow(data as SafetySessionRow | SafetySessionRow[] | null);
  return row ? mapSession(row) : undefined;
}

export async function releaseJobSafetyLocation(input: {
  jobRequestId: string;
  latitude: number;
  longitude: number;
  locationLabel: string;
  consentVersion: string;
}): Promise<JobSafetyLocationRelease> {
  assertSupabaseConfigured();
  const { data, error } = await supabase.rpc('set_job_safety_location', {
    target_job_request_id: input.jobRequestId,
    target_latitude: input.latitude,
    target_longitude: input.longitude,
    target_location_label: input.locationLabel,
    target_consent_version: input.consentVersion,
  });
  if (error) throw error;

  const result = data as {
    job_request_id: string;
    state: JobSafetyLocationRelease['state'];
    one_time_code: string;
    code_expires_at: string;
  };
  return {
    jobRequestId: result.job_request_id,
    state: result.state,
    oneTimeCode: result.one_time_code,
    codeExpiresAt: result.code_expires_at,
  };
}

export async function regenerateJobSafetyCode(jobRequestId: string): Promise<JobSafetyLocationRelease> {
  assertSupabaseConfigured();
  const { data, error } = await supabase.rpc('regenerate_job_safety_code', {
    target_job_request_id: jobRequestId,
  });
  if (error) throw error;

  const result = data as {
    job_request_id: string;
    state: JobSafetyLocationRelease['state'];
    one_time_code: string;
    code_expires_at: string;
  };
  return {
    jobRequestId: result.job_request_id,
    state: result.state,
    oneTimeCode: result.one_time_code,
    codeExpiresAt: result.code_expires_at,
  };
}

export async function markJobSafetyArrived(jobRequestId: string): Promise<void> {
  assertSupabaseConfigured();
  const { error } = await supabase.rpc('mark_job_safety_arrived', { target_job_request_id: jobRequestId });
  if (error) throw error;
}

export async function confirmJobSafetyArrival(jobRequestId: string): Promise<void> {
  assertSupabaseConfigured();
  const { error } = await supabase.rpc('confirm_job_safety_arrival', { target_job_request_id: jobRequestId });
  if (error) throw error;
}

export async function startJobSafetySession(jobRequestId: string, code: string): Promise<JobSafetyStartResult> {
  assertSupabaseConfigured();
  const { data, error } = await supabase.rpc('start_job_safety_session', {
    target_job_request_id: jobRequestId,
    supplied_code: code,
  });
  if (error) throw error;

  const result = data as {
    started: boolean;
    state?: 'active';
    reason?: JobSafetyStartResult['reason'];
    attempts_remaining?: number;
  };
  return {
    started: result.started,
    state: result.state,
    reason: result.reason,
    attemptsRemaining: result.attempts_remaining,
  };
}

export async function acknowledgeJobSafetyCompletion(jobRequestId: string): Promise<JobSafetyCompletionResult> {
  assertSupabaseConfigured();
  const { data, error } = await supabase.rpc('acknowledge_job_safety_completion', {
    target_job_request_id: jobRequestId,
  });
  if (error) throw error;

  const result = data as {
    state: JobSafetyCompletionResult['state'];
    requester_confirmed: boolean;
    provider_confirmed: boolean;
    completed: boolean;
  };
  return {
    state: result.state,
    requesterConfirmed: result.requester_confirmed,
    providerConfirmed: result.provider_confirmed,
    completed: result.completed,
  };
}
