export type UserRole = 'requester' | 'provider' | 'moderator' | 'admin';

export type RequestUrgency = 'flexible' | 'soon' | 'urgent';

export type ContactPreference = 'app_update' | 'phone_call' | 'sms';

export type RequestStatus =
  | 'Draft'
  | 'Submitted'
  | 'Viewed'
  | 'Accepted'
  | 'Declined'
  | 'Cancelled'
  | 'In progress'
  | 'Completed'
  | 'Reported';

export type ModerationStatus = 'not_run' | 'clean' | 'flagged' | 'blocked';

export type Neighborhood = {
  id: string;
  name: string;
  city: string;
  country: string;
};

export type ServiceCategory = {
  id: string;
  name: string;
  icon: string;
  description?: string;
};

export type TrustSignal = {
  id: string;
  label: string;
  value: string;
};

export type Provider = {
  id: string;
  name: string;
  headline: string;
  serviceLabel: string;
  neighborhood: string;
  areaLabel: string;
  categoryIds: string[];
  imageKind: 'initials' | 'illustration';
  rating: number;
  reviewCount: number;
  communityRecommendations: number;
  phoneVerified: boolean;
  availability: string;
  trustSignals: TrustSignal[];
  completedJobs: number;
  responseRate: string;
  accountAge: string;
  isAcceptingRequests: boolean;
};

export type JobRequestDraftInput = {
  requesterName: string;
  providerId: string;
  categoryId: string;
  neighborhood: string;
  areaLabel: string;
  title: string;
  description: string;
  originalUserText: string;
  urgency: RequestUrgency;
  preferredDate: string;
  preferredTime: string;
  contactPreference: ContactPreference;
  photoCount: number;
};

export type StatusEvent = {
  id: string;
  status: RequestStatus;
  actor: 'requester' | 'provider' | 'system';
  note?: string;
  createdAt: string;
};

export type JobRequest = JobRequestDraftInput & {
  id: string;
  status: RequestStatus;
  moderationStatus: ModerationStatus;
  providerMessage?: string;
  createdAt: string;
  statusTimeline: StatusEvent[];
};

export type JobSafetySessionState =
  | 'awaiting_location'
  | 'location_shared'
  | 'provider_arrived'
  | 'arrival_confirmed'
  | 'active'
  | 'completion_pending'
  | 'completed'
  | 'cancelled';

export type JobSafetyViewerRole = 'requester' | 'provider';

export type JobSafetySession = {
  jobRequestId: string;
  state: JobSafetySessionState;
  viewerRole: JobSafetyViewerRole;
  canViewExactLocation: boolean;
  privateLatitude?: number;
  privateLongitude?: number;
  privateLocationLabel?: string;
  locationSharedAt?: string;
  providerArrivedAt?: string;
  arrivalConfirmedAt?: string;
  activeAt?: string;
  codeExpiresAt?: string;
  codeAttemptCount: number;
  requesterCompletedAt?: string;
  providerCompletedAt?: string;
  completedAt?: string;
};

export type JobSafetyLocationRelease = {
  jobRequestId: string;
  state: JobSafetySessionState;
  oneTimeCode: string;
  codeExpiresAt: string;
};

export type JobSafetyStartResult = {
  started: boolean;
  state?: 'active';
  reason?: 'invalid_code' | 'attempt_limit_reached' | 'code_expired';
  attemptsRemaining?: number;
};

export type JobSafetyCompletionResult = {
  state: 'completion_pending' | 'completed';
  requesterConfirmed: boolean;
  providerConfirmed: boolean;
  completed: boolean;
};

export type FeatureFlags = {
  ai_service_request_structurer: boolean;
  ai_content_moderation: boolean;
  events: boolean;
};

export type MarketplaceAvailability = 'available' | 'reserved' | 'collected' | 'removed';

export type MarketplaceListing = {
  id: string;
  neighborhoodId: string;
  sellerId: string;
  sellerName: string;
  title: string;
  description: string;
  priceGhs?: number;
  imageUrl?: string;
  imageUrls?: string[];
  availability: MarketplaceAvailability;
  pickupArea: string;
  pickupNotes?: string;
  moderationStatus: ModerationStatus;
  createdAt: string;
};

export type MarketplacePickupStatus = 'proposed' | 'accepted' | 'confirmed' | 'declined' | 'cancelled' | 'completed';

export type MarketplacePickupRequest = {
  id: string;
  listingId: string;
  requesterId: string;
  requesterName: string;
  message: string;
  generalArea: string;
  proposedStart: string;
  proposedEnd: string;
  status: MarketplacePickupStatus;
  privateDetails?: string;
  createdAt: string;
};

export type MarketplaceMessage = {
  id: string;
  conversationId: string;
  senderProfileId: string;
  senderName: string;
  body: string;
  createdAt: string;
  isOwn: boolean;
};

export type UserImageBucket =
  | 'profile-images'
  | 'listing-images'
  | 'request-images'
  | 'report-images'
  | 'group-images'
  | 'group-post-images'
  | 'feed-post-images'
  | 'event-images';

export type UserUploadedImage = {
  id: string;
  bucket: UserImageBucket;
  path: string;
  publicUrl?: string;
  ownerId: string;
  altText?: string;
  moderationStatus: ModerationStatus;
  createdAt: string;
};

export type NeighborhoodFeedVisibility = 'verified_neighborhood_members' | 'public' | 'moderator_only';

export type NeighborhoodFeedPost = {
  id: string;
  neighborhoodId: string;
  authorId?: string;
  authorUserId?: string;
  authorName: string;
  authorDisplayName?: string;
  body: string;
  imageUrls?: string[];
  moderationStatus: ModerationStatus;
  createdAt: string;
  comments: NeighborhoodFeedComment[];
  likeCount: number;
  likedByMe: boolean;
  isReported: boolean;
  visibility?: NeighborhoodFeedVisibility;
};

export type NeighborhoodFeedComment = {
  id: string;
  postId: string;
  authorId?: string;
  authorUserId?: string;
  authorName: string;
  authorDisplayName?: string;
  body: string;
  moderationStatus: ModerationStatus;
  createdAt: string;
  isReported: boolean;
};

export type CommunityVisibilityItem = {
  id: string;
  type: 'ordinary_post' | 'agency_broadcast' | 'regional_post';
  neighborhoodId?: string;
  body: string;
  authorId: string;
  authorName?: string;
  isAgencyApproved?: boolean;
  isRegionalOptIn?: boolean;
  createdAt: string;
};

export type GroupType = 'neighborhood_club' | 'hoa' | 'school_community' | 'faith_group' | 'sports';

export type GroupVisibility = 'public' | 'neighborhood_only' | 'private';

export type GroupJoinPolicy = 'open' | 'request_to_join' | 'invite_only';

export type GroupMembershipRole = 'owner' | 'moderator' | 'member';

export type GroupMembershipStatus = 'active' | 'pending' | 'removed';

export type CommunityGroup = {
  id: string;
  neighborhoodId: string;
  name: string;
  description: string;
  type: GroupType;
  visibility: GroupVisibility;
  joinPolicy: GroupJoinPolicy;
  coverImageUrl?: string;
  memberCount: number;
  myMembershipStatus?: GroupMembershipStatus;
  createdAt: string;
};

export type CommunityGroupPost = {
  id: string;
  groupId: string;
  authorId: string;
  authorName: string;
  body: string;
  imageUrls?: string[];
  moderationStatus: ModerationStatus;
  createdAt: string;
};

export type ModerationQueueItem = {
  id: string;
  sourceTable: string;
  sourceId: string;
  reason: string;
  status: string;
  createdAt: string;
  resolutionAction?: 'keep_content' | 'hide_content' | 'resolve_case';
  resolvedAt?: string;
};

export type ModerationCaseStatus = 'open' | 'reviewing' | 'resolved';

export type ModerationCase = {
  id: string;
  contentType: 'marketplace_item' | 'job_request' | 'community_post';
  contentId: string;
  title: string;
  summary: string;
  reason: string;
  status: ModerationCaseStatus;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
};

export type AuditEvent = {
  id: string;
  actorId?: string;
  actor?: string;
  action: string;
  targetType?: string;
  targetId?: string;
  subjectId?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type NeighborhoodMembershipStatus = 'unverified' | 'verified' | 'pending_reverification' | 'rejected';

export type NeighborhoodMembership = {
  id?: string;
  userId: string;
  profileId?: string;
  neighborhoodId?: string;
  status: NeighborhoodMembershipStatus;
  assignedBy?: 'server' | 'manual' | 'system';
  verifiedAt?: string;
  verificationStatus?: NeighborhoodMembershipStatus;
  isPrimary?: boolean;
  evidenceSummary?: string[];
  requiresReverificationAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type FeedUnlockReason = 'verified_member' | 'no_membership' | 'wrong_neighborhood' | 'not_verified';

export type FeedUnlockStatus = 'unlocked' | 'locked';

export type FeedUnlockResult = {
  status: FeedUnlockStatus;
  neighborhoodId: string;
  canRead: boolean;
  canWrite: boolean;
  canPost: boolean;
  reason: FeedUnlockReason;
  title: string;
  message: string;
};

export type ResidenceVerificationSignalType =
  | 'phone'
  | 'standardized_address'
  | 'map_confirmation'
  | 'location_consistency'
  | 'postcard_challenge'
  | 'ghana_post_gps'
  | 'manual_review'
  | 'identity_provider';

export type ResidenceVerificationSignal = {
  type: ResidenceVerificationSignalType;
  neighborhoodId?: string;
  passed: boolean;
  checkedAt: string;
};
