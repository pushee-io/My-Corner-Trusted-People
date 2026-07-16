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

export type FeatureFlags = {
  ai_service_request_structurer: boolean;
  ai_content_moderation: boolean;
};
