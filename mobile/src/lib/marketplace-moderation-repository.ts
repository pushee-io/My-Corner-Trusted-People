import { getCurrentProfile } from '@/lib/auth';
import { assertSupabaseConfigured, supabase } from '@/lib/supabase';
import type {
  MarketplaceModerationActionInput,
  MarketplaceModerationAuditEntry,
  MarketplaceModerationDecision,
  MarketplaceModerationQueueItem,
  MarketplaceModerationReasonCode,
  MarketplaceModerationReport,
  MarketplaceModerationReportStatus,
  ModerationStatus,
} from '@/types/contracts';

export type MarketplaceModerationReason = {
  code: MarketplaceModerationReasonCode;
  label: string;
  decisions: MarketplaceModerationDecision[];
};

export const marketplaceModerationReasons: MarketplaceModerationReason[] = [
  { code: 'no_violation', label: 'No policy violation', decisions: ['approve'] },
  { code: 'insufficient_evidence', label: 'Not enough evidence', decisions: ['approve', 'flag'] },
  { code: 'misleading_or_scam', label: 'Misleading or suspected scam', decisions: ['flag', 'block'] },
  { code: 'prohibited_item', label: 'Prohibited or restricted item', decisions: ['block'] },
  { code: 'unsafe_pickup', label: 'Unsafe pickup arrangement', decisions: ['flag', 'block'] },
  { code: 'harassment', label: 'Harassment or abusive content', decisions: ['flag', 'block'] },
  { code: 'privacy_exposure', label: 'Private information exposed', decisions: ['flag', 'block'] },
  { code: 'duplicate_or_spam', label: 'Duplicate or spam listing', decisions: ['flag', 'block'] },
  { code: 'other', label: 'Other policy concern', decisions: ['flag', 'block'] },
];

type QueueRow = {
  report_id: string;
  report_reason: string;
  report_details: string | null;
  report_status: MarketplaceModerationReportStatus;
  reported_at: string;
  reporter_name: string;
  listing_id: string;
  listing_title: string;
  listing_description: string;
  listing_moderation_status: ModerationStatus;
  seller_id: string;
  seller_name: string;
  neighborhood_name: string;
  image_url: string | null;
};

type ReportPayload = QueueRow & {
  listing_pickup_area: string;
  image_paths: string[] | null;
  audit_history: Array<{
    id: string;
    actor_name: string;
    action: MarketplaceModerationDecision;
    reason_code: MarketplaceModerationReasonCode;
    reason_details: string | null;
    previous_status: ModerationStatus;
    resulting_status: ModerationStatus;
    created_at: string;
  }> | null;
};

function mapQueueItem(row: QueueRow): MarketplaceModerationQueueItem {
  return {
    reportId: row.report_id,
    reportReason: row.report_reason,
    reportDetails: row.report_details ?? undefined,
    reportStatus: row.report_status,
    reportedAt: row.reported_at,
    reporterName: row.reporter_name,
    listingId: row.listing_id,
    listingTitle: row.listing_title,
    listingDescription: row.listing_description,
    listingModerationStatus: row.listing_moderation_status,
    sellerId: row.seller_id,
    sellerName: row.seller_name,
    neighborhoodName: row.neighborhood_name,
    imageUrl: row.image_url ?? undefined,
  };
}

function mapAuditEntry(entry: NonNullable<ReportPayload['audit_history']>[number]): MarketplaceModerationAuditEntry {
  return {
    id: entry.id,
    actorName: entry.actor_name,
    action: entry.action,
    reasonCode: entry.reason_code,
    reasonDetails: entry.reason_details ?? undefined,
    previousStatus: entry.previous_status,
    resultingStatus: entry.resulting_status,
    createdAt: entry.created_at,
  };
}

async function requireMarketplaceModerator() {
  assertSupabaseConfigured();
  const profile = await getCurrentProfile();
  if (profile.role !== 'moderator' && profile.role !== 'admin') {
    throw new Error('Marketplace report review is limited to moderators and administrators.');
  }
  return profile;
}

export function validateMarketplaceModerationAction(input: MarketplaceModerationActionInput) {
  const reason = marketplaceModerationReasons.find((item) => item.code === input.reasonCode);
  if (!reason || !reason.decisions.includes(input.decision)) {
    throw new Error('Choose a reason that matches the moderation action.');
  }
  if (input.reasonCode === 'other' && (input.reasonDetails?.trim().length ?? 0) < 10) {
    throw new Error('Add at least 10 characters explaining the other policy concern.');
  }
  if ((input.reasonDetails?.trim().length ?? 0) > 500) {
    throw new Error('Moderator notes must be 500 characters or fewer.');
  }
}

export async function listMarketplaceModerationQueue(
  status: MarketplaceModerationReportStatus | 'all' = 'open',
): Promise<MarketplaceModerationQueueItem[]> {
  await requireMarketplaceModerator();
  const { data, error } = await supabase.rpc('list_marketplace_moderation_queue', {
    report_status_filter: status,
  });
  if (error) throw error;
  return ((data ?? []) as QueueRow[]).map(mapQueueItem);
}

export async function getMarketplaceModerationReport(reportId: string): Promise<MarketplaceModerationReport> {
  await requireMarketplaceModerator();
  const { data, error } = await supabase.rpc('get_marketplace_moderation_report', {
    target_report_id: reportId,
  });
  if (error) throw error;
  if (!data) throw new Error('Marketplace report not found.');
  const payload = data as ReportPayload;
  const imagePaths = payload.image_paths ?? [];
  const { data: signedImages, error: signedImagesError } =
    imagePaths.length > 0
      ? await supabase.storage.from('listing-images').createSignedUrls(imagePaths, 15 * 60)
      : { data: [], error: null };
  if (signedImagesError) throw signedImagesError;
  return {
    ...mapQueueItem(payload),
    listingPickupArea: payload.listing_pickup_area,
    imageUrls: (signedImages ?? []).flatMap((item) => (item.signedUrl ? [item.signedUrl] : [])),
    auditHistory: (payload.audit_history ?? []).map(mapAuditEntry),
  };
}

export async function reviewMarketplaceReport(input: MarketplaceModerationActionInput) {
  validateMarketplaceModerationAction(input);
  await requireMarketplaceModerator();
  const { data, error } = await supabase.rpc('review_marketplace_report', {
    target_report_id: input.reportId,
    decision: input.decision,
    reason_code: input.reasonCode,
    reason_details: input.reasonDetails?.trim() || null,
  });
  if (error) throw error;
  return data as {
    reportId: string;
    reportStatus: MarketplaceModerationReportStatus;
    listingModerationStatus: ModerationStatus;
  };
}
