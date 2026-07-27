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

export type CommunityActionsRepository = {
  defaultViewer: Day3NeighborhoodContext;
  moderatorViewer: Day3NeighborhoodContext;
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

export const communityActionsRepository = seededCommunityActionsRepository;
