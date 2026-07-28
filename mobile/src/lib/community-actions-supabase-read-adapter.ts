import {
  buildAgencyBroadcastsFromSupabaseRows,
  buildDay5ModerationCasesFromSupabaseRows,
  buildSocialGroupScreenSectionsFromSupabaseRows,
  type SupabaseModerationCaseRow,
  type SupabaseSocialGroupMembershipRow,
  type SupabaseSocialGroupPostRow,
} from '@/lib/community-actions-supabase-read-model';
import type { SupabaseAgencyBroadcastRow, SupabaseSocialGroupRow } from '@/lib/community-actions-supabase-adapter';
import type { SocialGroupScreenSection } from '@/lib/day3-community-repository';
import type { AgencyBroadcast, Day3NeighborhoodContext, Day5ModerationCase } from '@/types/day3';

export type SupabaseCommunityReadTableName =
  | 'social_groups'
  | 'social_group_memberships'
  | 'social_group_posts'
  | 'agency_broadcasts'
  | 'moderation_cases';

export type SupabaseCommunityReadFailureCode = 'none' | 'supabase_read_error';

export type SupabaseCommunityReadFailureDiagnostics = {
  tableName: SupabaseCommunityReadTableName | 'none';
  failureCode: SupabaseCommunityReadFailureCode;
  sanitizedMessage: string;
};

export type SupabaseCommunityReadError = {
  message: string;
};

export type SupabaseCommunityReadResult = {
  data: unknown[] | null;
  error: SupabaseCommunityReadError | null;
};

export type SupabaseCommunityReadQuery = {
  select: (columns?: string) => Promise<SupabaseCommunityReadResult>;
};

export type SupabaseCommunityReadClient = {
  from: (table: SupabaseCommunityReadTableName) => SupabaseCommunityReadQuery;
};

export type SupabaseCommunityActionsReadRepository = {
  listSocialGroupScreenSections: (viewer: Day3NeighborhoodContext) => Promise<SocialGroupScreenSection[]>;
  listAgencyBroadcasts: (viewer: Day3NeighborhoodContext) => Promise<AgencyBroadcast[]>;
  listModerationCases: (viewer: Day3NeighborhoodContext) => Promise<Day5ModerationCase[]>;
};

const socialGroupColumns =
  'id,name,description,neighborhood_id,cluster_id,visibility,member_count,created_by_profile_id,created_at,moderation_status';

const socialGroupMembershipColumns = 'id,group_id,profile_id,role,status,joined_at';

const socialGroupPostColumns = 'id,group_id,author_profile_id,body,created_at,moderation_status';

const agencyBroadcastColumns =
  'id,agency_name,title,body,scope,neighborhood_id,cluster_id,region_id,is_agency_approved,moderation_status,published_at';

const moderationCaseColumns =
  'id,source_table,source_id,reason,status,created_at,resolved_by,resolution_action,resolved_at';

let lastSupabaseCommunityReadFailure: SupabaseCommunityReadFailureDiagnostics = {
  tableName: 'none',
  failureCode: 'none',
  sanitizedMessage: 'none',
};

export function createSupabaseCommunityActionsReadRepository(
  client: SupabaseCommunityReadClient,
): SupabaseCommunityActionsReadRepository {
  return {
    async listSocialGroupScreenSections(viewer) {
      resetSupabaseCommunityReadFailureDiagnostics();

      const [groups, memberships, posts] = await Promise.all([
        selectRows<SupabaseSocialGroupRow>(client, 'social_groups', socialGroupColumns),
        selectRows<SupabaseSocialGroupMembershipRow>(client, 'social_group_memberships', socialGroupMembershipColumns),
        selectRows<SupabaseSocialGroupPostRow>(client, 'social_group_posts', socialGroupPostColumns),
      ]);

      return buildSocialGroupScreenSectionsFromSupabaseRows({ groups, memberships, posts }, viewer);
    },

    async listAgencyBroadcasts(viewer) {
      resetSupabaseCommunityReadFailureDiagnostics();

      const broadcasts = await selectRows<SupabaseAgencyBroadcastRow>(
        client,
        'agency_broadcasts',
        agencyBroadcastColumns,
      );

      return buildAgencyBroadcastsFromSupabaseRows(broadcasts, viewer);
    },

    async listModerationCases(viewer) {
      resetSupabaseCommunityReadFailureDiagnostics();

      const [moderationCases, groupPosts, agencyBroadcasts] = await Promise.all([
        selectRows<SupabaseModerationCaseRow>(client, 'moderation_cases', moderationCaseColumns),
        selectRows<SupabaseSocialGroupPostRow>(client, 'social_group_posts', socialGroupPostColumns),
        selectRows<SupabaseAgencyBroadcastRow>(client, 'agency_broadcasts', agencyBroadcastColumns),
      ]);

      return buildDay5ModerationCasesFromSupabaseRows({ moderationCases, groupPosts, agencyBroadcasts }, viewer);
    },
  };
}

export function getSupabaseCommunityReadFailureDiagnostics(): SupabaseCommunityReadFailureDiagnostics {
  return lastSupabaseCommunityReadFailure;
}

export function resetSupabaseCommunityReadFailureDiagnostics() {
  lastSupabaseCommunityReadFailure = {
    tableName: 'none',
    failureCode: 'none',
    sanitizedMessage: 'none',
  };
}

async function selectRows<Row>(
  client: SupabaseCommunityReadClient,
  table: SupabaseCommunityReadTableName,
  columns: string,
): Promise<Row[]> {
  const result = await client.from(table).select(columns);

  if (result.error) {
    const sanitizedMessage = sanitizeSupabaseReadErrorMessage(result.error.message);

    lastSupabaseCommunityReadFailure = {
      tableName: table,
      failureCode: 'supabase_read_error',
      sanitizedMessage,
    };

    throw new Error(`Could not read ${table}: ${sanitizedMessage}`);
  }

  return (result.data ?? []) as Row[];
}

function sanitizeSupabaseReadErrorMessage(message: string): string {
  return message
    .replace(/https?:\/\/\S+/gi, '[redacted-url]')
    .replace(/eyJ[\w.-]+/g, '[redacted-token]')
    .slice(0, 180);
}
