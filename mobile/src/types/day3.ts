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