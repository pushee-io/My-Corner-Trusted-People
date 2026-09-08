import { getCurrentProfile } from '@/lib/auth';
import { assertSupabaseConfigured, supabase } from '@/lib/supabase';
import type { JobSafetySessionState, RequestStatus } from '@/types/contracts';

export type JobReportStatus = 'open' | 'reviewing' | 'resolved';
export type JobReportResolutionReason = 'no_violation' | 'insufficient_evidence';
export type RequesterJobReport = {
  status: JobReportStatus;
  submittedAt: string;
  resolvedAt?: string;
  outcome?: string;
};
export type JobModerationItem = {
  reportId: string;
  requestId: string;
  requestTitle: string;
  neighborhoodName: string;
  status: JobReportStatus;
  reportedAt: string;
  reason: string;
  sessionState?: JobSafetySessionState;
};
export type JobModerationReport = JobModerationItem & {
  details: string;
  requestStatus: RequestStatus;
  reporterName: string;
  reviewNotes?: string;
  auditHistory: { action: string; createdAt: string; actorName: string; reason?: string }[];
};
type QueueRow = {
  report_id: string;
  job_request_id: string;
  request_title: string;
  neighborhood_name: string | null;
  status: JobReportStatus;
  reported_at: string;
  reason: string;
  session_state: JobSafetySessionState | null;
};

function mapItem(row: QueueRow): JobModerationItem {
  return {
    reportId: row.report_id,
    requestId: row.job_request_id,
    requestTitle: row.request_title,
    neighborhoodName: row.neighborhood_name ?? 'Neighborhood unavailable',
    status: row.status,
    reportedAt: row.reported_at,
    reason: row.reason,
    sessionState: row.session_state ?? undefined,
  };
}

async function requireModerator() {
  assertSupabaseConfigured();
  const profile = await getCurrentProfile();
  if (profile.role !== 'moderator' && profile.role !== 'admin') {
    throw new Error('Moderator access is required to review job reports.');
  }
}

export async function submitJobReport(requestId: string, details: string) {
  assertSupabaseConfigured();
  const trimmed = details.trim();
  if (trimmed.length < 10 || trimmed.length > 1000) {
    throw new Error('Describe the concern in 10 to 1000 characters.');
  }
  const { data, error } = await supabase.rpc('submit_job_report', {
    target_job_request_id: requestId,
    report_details: trimmed,
  });
  if (error) throw error;
  return data as { report_id: string; status: JobReportStatus; already_reported: boolean };
}

export async function getRequesterJobReport(requestId: string): Promise<RequesterJobReport | undefined> {
  assertSupabaseConfigured();
  const { data, error } = await supabase.rpc('get_requester_job_report', { target_job_request_id: requestId });
  if (error) throw error;
  if (!data) return undefined;
  return {
    status: data.status,
    submittedAt: data.submitted_at,
    resolvedAt: data.resolved_at ?? undefined,
    outcome: data.outcome ?? undefined,
  };
}

export async function listJobModerationQueue(status: JobReportStatus | 'all' = 'open'): Promise<JobModerationItem[]> {
  await requireModerator();
  const { data, error } = await supabase.rpc('list_job_moderation_queue', { report_status_filter: status });
  if (error) throw error;
  return ((data ?? []) as QueueRow[]).map(mapItem);
}

export async function getJobModerationReport(reportId: string): Promise<JobModerationReport> {
  await requireModerator();
  const { data, error } = await supabase.rpc('get_job_moderation_report', { target_report_id: reportId });
  if (error) throw error;
  if (!data) throw new Error('Job report unavailable.');
  const row = data as QueueRow & {
    details: string;
    request_status: RequestStatus;
    reporter_name: string | null;
    review_notes: string | null;
    audit_history: { action: string; created_at: string; actor_name: string | null; reason: string | null }[];
  };
  return {
    ...mapItem(row),
    details: row.details,
    requestStatus: row.request_status,
    reporterName: row.reporter_name ?? 'Neighbor',
    reviewNotes: row.review_notes ?? undefined,
    auditHistory: (row.audit_history ?? []).map((entry) => ({
      action: entry.action,
      createdAt: entry.created_at,
      actorName: entry.actor_name ?? 'System',
      reason: entry.reason ?? undefined,
    })),
  };
}

export async function resolveJobReport(reportId: string, reason: JobReportResolutionReason, notes: string) {
  await requireModerator();
  const { data, error } = await supabase.rpc('resolve_job_report', {
    target_report_id: reportId,
    reason_code: reason,
    moderator_notes: notes.trim() || null,
  });
  if (error) throw error;
  return data as { status: 'resolved'; already_resolved: boolean };
}
