import { getCurrentProfile } from '@/lib/auth';
import { createSocialGroup, defaultDay3NeighborhoodContext } from '@/lib/day3-community-repository';
import { assertSupabaseConfigured, supabase } from '@/lib/supabase';
import type { CreateSocialGroupInput, SocialGroup } from '@/types/day3';

export type GroupCreationRepository = {
  createGroup: (input: CreateSocialGroupInput) => Promise<SocialGroup>;
};

type CreateGroupRpcRow = {
  id: string;
  name: string;
  description: string;
  neighborhood_id: string;
  cluster_id: string | null;
  visibility: SocialGroup['visibility'];
  member_count: number;
  created_by_profile_id: string;
  created_at: string;
  moderation_status: SocialGroup['moderationStatus'];
};

const seededRepository: GroupCreationRepository = {
  async createGroup(input) {
    const result = createSocialGroup(input, defaultDay3NeighborhoodContext);
    if (!result.accepted || !result.group) {
      throw new Error(groupCreationError(result.reason));
    }
    return result.group;
  },
};

const supabaseRepository: GroupCreationRepository = {
  async createGroup(input) {
    assertSupabaseConfigured();
    const profile = await getCurrentProfile();
    const { data, error } = await supabase.rpc('create_social_group', {
      target_name: input.name.trim(),
      target_description: input.description.trim(),
      target_visibility: input.visibility,
    });

    if (error) throw new Error('Could not create the group. Check your verified neighborhood and try again.');
    const row = (Array.isArray(data) ? data[0] : data) as CreateGroupRpcRow | undefined;
    if (!row) throw new Error('Could not confirm the new group. Try again.');

    return {
      id: row.id,
      name: row.name,
      description: row.description,
      neighborhoodId: row.neighborhood_id,
      clusterId: row.cluster_id ?? '',
      visibility: row.visibility,
      memberCount: row.member_count,
      createdByProfileId: row.created_by_profile_id ?? profile.id,
      createdAt: row.created_at,
      moderationStatus: row.moderation_status,
    };
  },
};

function groupCreationError(reason: string | undefined) {
  if (reason === 'invalid_name') return 'Use a group name between 3 and 80 characters.';
  if (reason === 'invalid_description') return 'Add a description of 500 characters or fewer.';
  if (reason === 'not_verified') return 'Verify your neighborhood before creating a group.';
  return 'Could not create the group.';
}

export function getGroupCreationRepository(): GroupCreationRepository {
  return process.env.EXPO_PUBLIC_COMMUNITY_ACTIONS_REPOSITORY === 'supabase' ? supabaseRepository : seededRepository;
}
