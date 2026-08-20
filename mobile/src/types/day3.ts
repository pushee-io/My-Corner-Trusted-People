export type ProviderEnvironment = 'test' | 'development' | 'staging' | 'production';

export type ProviderConfig = {
  environment: ProviderEnvironment;
  credentials?: Record<string, string | undefined>;
};

export type SmsVerificationStart = {
  sessionId: string;
  phoneE164: string;
  provider: string;
  expiresAt: string;
};

export type SmsVerificationResult = {
  verified: boolean;
  provider: string;
  reason?: string;
};

export type AddressSearchResult = {
  id: string;
  label: string;
  neighborhood?: string;
  city?: string;
  countryCode: string;
};

export type NormalizedAddress = {
  label: string;
  neighborhood?: string;
  city?: string;
  countryCode: string;
  ghanaPostGps?: string;
  exactAddressPublic: false;
};

export type GeocodingResult = {
  latitude: number;
  longitude: number;
  accuracy: 'neighborhood' | 'street' | 'parcel';
  exactCoordinatesPublic: false;
};

export type IdentityVerificationResult = {
  status: 'verified' | 'rejected' | 'needs_human_review';
  provider: string;
  collectsGhanaCardImages: false;
  finalDecisionByAi: false;
};

export type ResidenceVerificationResult = {
  status: 'verified' | 'rejected' | 'needs_human_review';
  provider: string;
  exactAddressPublic: false;
  autoApproved: boolean;
};

export type PushNotification = {
  recipientProfileId: string;
  title: string;
  body: string;
  data?: Record<string, string>;
};

export type PushSendResult = {
  queued: boolean;
  provider: string;
  messageId?: string;
};

export type SmsVerificationProvider = {
  name: string;
  environment: ProviderEnvironment;
  startVerification(phoneE164: string): Promise<SmsVerificationStart>;
  confirmVerification(sessionId: string, code: string): Promise<SmsVerificationResult>;
};

export type AddressSearchProvider = {
  name: string;
  environment: ProviderEnvironment;
  search(query: string): Promise<AddressSearchResult[]>;
};

export type AddressNormalizationProvider = {
  name: string;
  environment: ProviderEnvironment;
  normalize(address: string): Promise<NormalizedAddress>;
};

export type GeocodingProvider = {
  name: string;
  environment: ProviderEnvironment;
  geocode(address: string): Promise<GeocodingResult>;
};

export type IdentityVerificationProvider = {
  name: string;
  environment: ProviderEnvironment;
  verifyIdentity(profileId: string): Promise<IdentityVerificationResult>;
};

export type ResidenceVerificationProvider = {
  name: string;
  environment: ProviderEnvironment;
  verifyResidence(profileId: string, code?: string): Promise<ResidenceVerificationResult>;
};

export type PushProvider = {
  name: string;
  environment: ProviderEnvironment;
  send(notification: PushNotification): Promise<PushSendResult>;
};

export type Day3ModerationStatus = 'not_run' | 'clean' | 'flagged' | 'blocked';

export type Day3NeighborhoodContext = {
  profileId: string;
  neighborhoodId: string;
  clusterId: string;
  regionId: 'greater-accra';
  isVerifiedNeighborhoodMember: boolean;
};

export type SocialGroupVisibility = 'verified_neighborhood_members' | 'immediate_cluster_members';

export type SocialGroup = {
  id: string;
  name: string;
  description: string;
  neighborhoodId: string;
  clusterId: string;
  visibility: SocialGroupVisibility;
  memberCount: number;
  createdByProfileId: string;
  createdAt: string;
  moderationStatus: Day3ModerationStatus;
};

export type SocialGroupMembershipRole = 'member' | 'moderator' | 'owner';

export type SocialGroupMembershipStatus = 'none' | 'pending' | 'accepted' | 'rejected' | 'removed';

export type SocialGroupMembership = {
  id: string;
  groupId: string;
  profileId: string;
  role: SocialGroupMembershipRole;
  status: Exclude<SocialGroupMembershipStatus, 'none'>;
  joinedAt?: string;
};

export type SocialGroupMembershipDecision = 'accepted' | 'rejected';

export type SocialGroupMembershipRequest = {
  membershipId: string;
  groupId: string;
  groupName: string;
  profileId: string;
  applicantName: string;
  status: Exclude<SocialGroupMembershipStatus, 'none'>;
  requestedAt: string;
};

export type SocialGroupMembershipDecisionResult = {
  membershipId: string;
  status?: SocialGroupMembershipDecision;
  accepted: boolean;
  reason?: 'membership_not_found' | 'not_pending' | 'not_moderator';
};

export type SocialGroupPost = {
  id: string;
  groupId: string;
  authorProfileId: string;
  body: string;
  createdAt: string;
  moderationStatus: Day3ModerationStatus;
};

export type CreateSocialGroupPostInput = {
  groupId: string;
  profileId: string;
  body: string;
};

export type SocialGroupJoinRequestResult = {
  groupId: string;
  profileId: string;
  status: SocialGroupMembershipStatus;
  created: boolean;
};

export type SocialGroupPostActionResult = {
  post?: SocialGroupPost;
  accepted: boolean;
  reason?: 'not_visible' | 'not_accepted_member' | 'empty_body';
};

export type AgencyBroadcastScope = 'neighborhood' | 'immediate_cluster' | 'greater_accra';

export type AgencyBroadcast = {
  id: string;
  agencyName: string;
  title: string;
  body: string;
  scope: AgencyBroadcastScope;
  neighborhoodId?: string;
  clusterId?: string;
  regionId: 'greater-accra';
  isAgencyApproved: boolean;
  moderationStatus: Day3ModerationStatus;
  publishedAt: string;
  expiresAt?: string;
};

export type CommunityReportTargetType = 'agency_broadcast' | 'social_group_post';

export type CommunityReport = {
  id: string;
  targetType: CommunityReportTargetType;
  targetId: string;
  reporterProfileId: string;
  reason: string;
  createdAt: string;
};

export type CommunityReportResult = {
  report?: CommunityReport;
  accepted: boolean;
  reason?: 'not_visible' | 'already_reported';
};

export type Day5ModerationTargetType = CommunityReportTargetType;

export type Day5ModerationCaseStatus = 'open' | 'resolved';

export type Day5ModerationDecision = 'keep_content' | 'hide_content';

export type Day5ModerationCase = {
  id: string;
  reportId: string;
  targetType: Day5ModerationTargetType;
  targetId: string;
  targetTitle: string;
  targetBody: string;
  reporterProfileId: string;
  reportReason: string;
  status: Day5ModerationCaseStatus;
  createdAt: string;
  resolvedAt?: string;
  resolvedByProfileId?: string;
  decision?: Day5ModerationDecision;
};

export type Day5ModerationActionResult = {
  accepted: boolean;
  caseId: string;
  status?: Day5ModerationCaseStatus;
  decision?: Day5ModerationDecision;
  reason?: 'case_not_found' | 'already_resolved' | 'not_moderator';
};
