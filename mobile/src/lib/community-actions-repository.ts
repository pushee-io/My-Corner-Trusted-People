import {
  applyDay5ModerationDecision,
  createSocialGroupPostAction,
  defaultDay3NeighborhoodContext,
  getAgencyBroadcastScreenItems,
  getSocialGroupScreenSections,
  listAgencyBroadcastsForViewer,
  listDay5ModerationCases,
  listSocialGroupPosts,
  moderatorDay5Context,
  reportAgencyBroadcast,
  reportSocialGroupPost,
  requestSocialGroupMembership,
  resetDay3CommunityRepositoryForTests,
} from '@/lib/day3-community-repository';
import {
  toSupabaseCommunityReportInsert,
  toSupabaseModerationDecisionInsert,
  toSupabaseSocialGroupMembershipRequestInsert,
  toSupabaseSocialGroupPostInsert,
} from '@/lib/community-actions-supabase-adapter';
import type { SocialGroupScreenSection } from '@/lib/day3-community-repository';
import type {
  AgencyBroadcast,
  CommunityReportResult,
  Day3NeighborhoodContext,
  Day5ModerationActionResult,
  Day5ModerationCase,
  Day5ModerationDecision,
  SocialGroupJoinRequestResult,
  SocialGroupPost,
  SocialGroupPostActionResult,
} from '@/types/day3';

export type { SocialGroupScreenSection } from '@/lib/day3-community-repository';
export type CommunityActionsRepositoryMode = 'seeded' | 'supabase';

export type CommunityActionsRepository = {
  defaultViewer: Day3NeighborhoodContext;
  moderatorViewer: Day3NeighborhoodContext;
  mode: CommunityActionsRepositoryMode;
  getSocialGroupScreenSections: (viewer?: Day3NeighborhoodContext) => SocialGroupScreenSection[];
  getAgencyBroadcastScreenItems: (viewer?: Day3NeighborhoodContext) => AgencyBroadcast[];
  requestSocialGroupMembership: (groupId: string, viewer?: Day3NeighborhoodContext) => SocialGroupJoinRequestResult;
  createSocialGroupPost: (
    groupId: string,
    body: string,
    viewer?: Day3NeighborhoodContext,
  ) => SocialGroupPostActionResult;
  reportSocialGroupPost: (postId: string, viewer?: Day3NeighborhoodContext, reason?: string) => CommunityReportResult;
  reportAgencyBroadcast: (
    broadcastId: string,
    viewer?: Day3NeighborhoodContext,
    reason?: string,
  ) => CommunityReportResult;
  listSocialGroupPosts: (groupId: string, viewer?: Day3NeighborhoodContext) => SocialGroupPost[];
  listAgencyBroadcastsForViewer: (viewer?: Day3NeighborhoodContext) => AgencyBroadcast[];
  listModerationCases: (viewer?: Day3NeighborhoodContext) => Day5ModerationCase[];
  applyModerationDecision: (
    caseId: string,
    decision: Day5ModerationDecision,
    viewer?: Day3NeighborhoodContext,
  ) => Day5ModerationActionResult;
  resetForTests: () => void;
};

export const seededCommunityActionsRepository: CommunityActionsRepository = {
  defaultViewer: defaultDay3NeighborhoodContext,
  moderatorViewer: moderatorDay5Context,
  mode: 'seeded',

  getSocialGroupScreenSections(viewer = defaultDay3NeighborhoodContext) {
    return getSocialGroupScreenSections(viewer);
  },

  getAgencyBroadcastScreenItems(viewer = defaultDay3NeighborhoodContext) {
    return getAgencyBroadcastScreenItems(viewer);
  },

  requestSocialGroupMembership(groupId, viewer = defaultDay3NeighborhoodContext) {
    return requestSocialGroupMembership(groupId, viewer);
  },

  createSocialGroupPost(groupId, body, viewer = defaultDay3NeighborhoodContext) {
    return createSocialGroupPostAction({
      groupId,
      profileId: viewer.profileId,
      body,
    });
  },

  reportSocialGroupPost(postId, viewer = defaultDay3NeighborhoodContext, reason = 'Reported from Groups screen') {
    return reportSocialGroupPost(postId, viewer, reason);
  },

  reportAgencyBroadcast(
    broadcastId,
    viewer = defaultDay3NeighborhoodContext,
    reason = 'Reported from Agency broadcasts screen',
  ) {
    return reportAgencyBroadcast(broadcastId, viewer, reason);
  },

  listSocialGroupPosts(groupId, viewer = defaultDay3NeighborhoodContext) {
    return listSocialGroupPosts(groupId, viewer);
  },

  listAgencyBroadcastsForViewer(viewer = defaultDay3NeighborhoodContext) {
    return listAgencyBroadcastsForViewer(viewer);
  },

  listModerationCases(viewer = moderatorDay5Context) {
    return listDay5ModerationCases(viewer);
  },

  applyModerationDecision(caseId, decision, viewer = moderatorDay5Context) {
    return applyDay5ModerationDecision(caseId, viewer, decision);
  },

  resetForTests() {
    resetDay3CommunityRepositoryForTests();
  },
};

export const supabaseCommunityActionsRepository: CommunityActionsRepository = {
  ...seededCommunityActionsRepository,
  mode: 'supabase',

  requestSocialGroupMembership(groupId, viewer = defaultDay3NeighborhoodContext) {
    toSupabaseSocialGroupMembershipRequestInsert(groupId, viewer);
    return seededCommunityActionsRepository.requestSocialGroupMembership(groupId, viewer);
  },

  createSocialGroupPost(groupId, body, viewer = defaultDay3NeighborhoodContext) {
    toSupabaseSocialGroupPostInsert({
      groupId,
      profileId: viewer.profileId,
      body,
    });
    return seededCommunityActionsRepository.createSocialGroupPost(groupId, body, viewer);
  },

  reportSocialGroupPost(postId, viewer = defaultDay3NeighborhoodContext, reason = 'Reported from Groups screen') {
    toSupabaseCommunityReportInsert('social_group_post', postId, viewer, reason);
    return seededCommunityActionsRepository.reportSocialGroupPost(postId, viewer, reason);
  },

  reportAgencyBroadcast(
    broadcastId,
    viewer = defaultDay3NeighborhoodContext,
    reason = 'Reported from Agency broadcasts screen',
  ) {
    toSupabaseCommunityReportInsert('agency_broadcast', broadcastId, viewer, reason);
    return seededCommunityActionsRepository.reportAgencyBroadcast(broadcastId, viewer, reason);
  },

  applyModerationDecision(caseId, decision, viewer = moderatorDay5Context) {
    const moderationCase = seededCommunityActionsRepository
      .listModerationCases(viewer)
      .find((item) => item.id === caseId);

    if (moderationCase) {
      toSupabaseModerationDecisionInsert(moderationCase, decision, viewer);
    }

    return seededCommunityActionsRepository.applyModerationDecision(caseId, decision, viewer);
  },
};

export function createCommunityActionsRepository(
  mode: CommunityActionsRepositoryMode = getConfiguredRepositoryMode(),
): CommunityActionsRepository {
  if (mode === 'supabase') {
    return supabaseCommunityActionsRepository;
  }

  return seededCommunityActionsRepository;
}

function getConfiguredRepositoryMode(): CommunityActionsRepositoryMode {
  return process.env.EXPO_PUBLIC_COMMUNITY_ACTIONS_REPOSITORY === 'supabase' ? 'supabase' : 'seeded';
}

export const communityActionsRepository = createCommunityActionsRepository();
