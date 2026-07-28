import {
  buildAgencyBroadcastsFromSupabaseRows,
  buildDay5ModerationCasesFromSupabaseRows,
  buildSocialGroupScreenSectionsFromSupabaseRows,
  type SupabaseCommunityReportRow,
  type SupabaseModerationDecisionRow,
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
  | 'community_reports'
  | 'moderation_decisions';

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

const communityReportColumns = 'id,target_type,target_id,reporter_profile_id,reason,created_at';

const moderationDecisionColumns =
  'moderation_case_id,report_id,target_type,target_id,decision,resolved_by_profile_id,resolved_at';

export function createSupabaseCommunityActionsReadRepository(
  client: SupabaseCommunityReadClient,
): SupabaseCommunityActionsReadRepository {
  return {
    async listSocialGroupScreenSections(viewer) {
      const [groups, memberships, posts] = await Promise.all([
        selectRows<SupabaseSocialGroupRow>(client, 'social_groups', socialGroupColumns),
        selectRows<SupabaseSocialGroupMembershipRow>(client, 'social_group_memberships', socialGroupMembershipColumns),
        selectRows<SupabaseSocialGroupPostRow>(client, 'social_group_posts', socialGroupPostColumns),
      ]);

      return buildSocialGroupScreenSectionsFromSupabaseRows({ groups, memberships, posts }, viewer);
    },

    async listAgencyBroadcasts(viewer) {
      const broadcasts = await selectRows<SupabaseAgencyBroadcastRow>(
        client,
        'agency_broadcasts',
        agencyBroadcastColumns,
      );

      return buildAgencyBroadcastsFromSupabaseRows(broadcasts, viewer);
    },

    async listModerationCases(viewer) {
      const [reports, decisions, groupPosts, agencyBroadcasts] = await Promise.all([
        selectRows<SupabaseCommunityReportRow>(client, 'community_reports', communityReportColumns),
        selectRows<SupabaseModerationDecisionRow>(client, 'moderation_decisions', moderationDecisionColumns),
        selectRows<SupabaseSocialGroupPostRow>(client, 'social_group_posts', socialGroupPostColumns),
        selectRows<SupabaseAgencyBroadcastRow>(client, 'agency_broadcasts', agencyBroadcastColumns),
      ]);

      return buildDay5ModerationCasesFromSupabaseRows({ reports, decisions, groupPosts, agencyBroadcasts }, viewer);
    },
  };
}

async function selectRows<Row>(
  client: SupabaseCommunityReadClient,
  table: SupabaseCommunityReadTableName,
  columns: string,
): Promise<Row[]> {
  const result = await client.from(table).select(columns);

  if (result.error) {
    throw new Error(`Could not read ${table}: ${result.error.message}`);
  }

  return (result.data ?? []) as Row[];
}
