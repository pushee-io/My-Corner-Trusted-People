import { getCurrentProfile } from '@/lib/auth';
import {
  applySocialGroupMembershipDecision,
  defaultDay3NeighborhoodContext,
  listPendingSocialGroupMemberships,
  moderatorDay5Context,
  requestSocialGroupMembership,
} from '@/lib/day3-community-repository';
import { assertSupabaseConfigured, supabase } from '@/lib/supabase';
import type {
  SocialGroupJoinRequestResult,
  SocialGroupMembershipDecision,
  SocialGroupMembershipDecisionResult,
  SocialGroupMembershipRequest,
  SocialGroupMembershipStatus,
} from '@/types/day3';

export type GroupMembershipRepositoryMode = 'seeded' | 'supabase';

export type GroupMembershipRepository = {
  mode: GroupMembershipRepositoryMode;
  requestMembership: (groupId: string) => Promise<SocialGroupJoinRequestResult>;
  listPendingMemberships: () => Promise<SocialGroupMembershipRequest[]>;
  decideMembership: (
    membershipId: string,
    decision: SocialGroupMembershipDecision,
  ) => Promise<SocialGroupMembershipDecisionResult>;
};

type RequestMembershipRpcRow = {
  group_id: string;
  profile_id: string;
  status: SocialGroupMembershipStatus;
  created: boolean;
};

type PendingMembershipRpcRow = {
  membership_id: string;
  group_id: string;
  group_name: string;
  profile_id: string;
  applicant_name: string;
  status: Exclude<SocialGroupMembershipStatus, 'none'>;
  requested_at: string;
};

type DecideMembershipRpcRow = {
  membership_id: string;
  status: SocialGroupMembershipDecision;
  accepted: boolean;
};

const seededRepository: GroupMembershipRepository = {
  mode: 'seeded',

  async requestMembership(groupId) {
    return requestSocialGroupMembership(groupId, defaultDay3NeighborhoodContext);
  },

  async listPendingMemberships() {
    return listPendingSocialGroupMemberships(moderatorDay5Context);
  },

  async decideMembership(membershipId, decision) {
    return applySocialGroupMembershipDecision(membershipId, moderatorDay5Context, decision);
  },
};

const supabaseRepository: GroupMembershipRepository = {
  mode: 'supabase',

  async requestMembership(groupId) {
    assertSupabaseConfigured();
    const profile = await getCurrentProfile();
    const { data, error } = await supabase.rpc('request_social_group_membership', {
      target_group_id: groupId,
    });

    if (error) throw new Error('Could not send your join request. Check your connection and try again.');

    const row = singleRpcRow<RequestMembershipRpcRow>(data);
    if (!row) throw new Error('Could not confirm your join request. Try again.');

    return {
      groupId: row.group_id,
      profileId: row.profile_id ?? profile.id,
      status: row.status,
      created: row.created,
    };
  },

  async listPendingMemberships() {
    assertSupabaseConfigured();
    const { data, error } = await supabase.rpc('list_pending_social_group_memberships');

    if (error) throw new Error('Could not load membership requests. Try again later.');

    return rpcRows<PendingMembershipRpcRow>(data).map((row) => ({
      membershipId: row.membership_id,
      groupId: row.group_id,
      groupName: row.group_name,
      profileId: row.profile_id,
      applicantName: row.applicant_name,
      status: row.status,
      requestedAt: row.requested_at,
    }));
  },

  async decideMembership(membershipId, decision) {
    assertSupabaseConfigured();
    const { data, error } = await supabase.rpc('decide_social_group_membership', {
      target_membership_id: membershipId,
      target_status: decision,
    });

    if (error) throw new Error('Could not save this membership decision. Try again.');

    const row = singleRpcRow<DecideMembershipRpcRow>(data);
    if (!row) throw new Error('This membership request is no longer pending.');

    return {
      membershipId: row.membership_id,
      status: row.status,
      accepted: row.accepted,
    };
  },
};

function rpcRows<Row>(data: unknown): Row[] {
  if (Array.isArray(data)) return data as Row[];
  return data ? [data as Row] : [];
}

function singleRpcRow<Row>(data: unknown): Row | undefined {
  return rpcRows<Row>(data)[0];
}

export function createGroupMembershipRepository(
  mode: GroupMembershipRepositoryMode = configuredMode(),
): GroupMembershipRepository {
  return mode === 'supabase' ? supabaseRepository : seededRepository;
}

function configuredMode(): GroupMembershipRepositoryMode {
  return process.env.EXPO_PUBLIC_COMMUNITY_ACTIONS_REPOSITORY === 'supabase' ? 'supabase' : 'seeded';
}

let cachedRepository: GroupMembershipRepository | undefined;

export function getGroupMembershipRepository(): GroupMembershipRepository {
  if (!cachedRepository) cachedRepository = createGroupMembershipRepository();
  return cachedRepository;
}

export function resetGroupMembershipRepositoryForTests() {
  cachedRepository = undefined;
}
