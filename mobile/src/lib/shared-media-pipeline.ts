import type { ModerationStatus, UserImageBucket, UserUploadedImage } from '@/types/contracts';

export type MediaSurface =
  | 'service_request'
  | 'report'
  | 'neighborhood_post'
  | 'group_post'
  | 'marketplace_listing'
  | 'event';

export type MediaUploadStatus = 'pending' | 'uploaded' | 'failed';

export type MediaAttachmentDraft = {
  uri: string;
  fileName?: string;
  mimeType: string;
  byteSize: number;
  width?: number;
  height?: number;
  altText?: string;
};

export type MediaAttachment = {
  id: string;
  surface: MediaSurface;
  bucket: UserImageBucket;
  localUri: string;
  objectPath: string;
  mimeType: MediaAttachmentDraft['mimeType'];
  byteSize: number;
  width?: number;
  height?: number;
  altText?: string;
  moderationStatus: ModerationStatus;
  uploadStatus: MediaUploadStatus;
  createdAt: string;
};

export type MediaPipelinePolicy = {
  surface: MediaSurface;
  bucket: UserImageBucket;
  maxFiles: number;
  maxBytesPerFile: number;
  allowedMimeTypes: readonly string[];
  purpose: 'job_photo' | 'safety_evidence' | 'community_photo' | 'listing_photo' | 'event_photo';
};

export type MediaPipelineErrorCode =
  | 'too_many_files'
  | 'missing_uri'
  | 'unsupported_mime_type'
  | 'file_too_large'
  | 'invalid_file_size';

export type MediaPipelineError = {
  code: MediaPipelineErrorCode;
  index: number;
  message: string;
};

export type PrepareMediaInput = {
  surface: MediaSurface;
  ownerProfileId: string;
  attachments: MediaAttachmentDraft[];
  createdAt?: string;
};

export type PrepareMediaResult = {
  accepted: boolean;
  policy: MediaPipelinePolicy;
  attachments: MediaAttachment[];
  errors: MediaPipelineError[];
};

const mb = 1024 * 1024;
const allowedPhotoMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'] as const;

const mediaPipelinePolicies: Record<MediaSurface, MediaPipelinePolicy> = {
  service_request: {
    surface: 'service_request',
    bucket: 'request-images',
    maxFiles: 4,
    maxBytesPerFile: 6 * mb,
    allowedMimeTypes: allowedPhotoMimeTypes,
    purpose: 'job_photo',
  },
  report: {
    surface: 'report',
    bucket: 'report-images',
    maxFiles: 6,
    maxBytesPerFile: 8 * mb,
    allowedMimeTypes: allowedPhotoMimeTypes,
    purpose: 'safety_evidence',
  },
  neighborhood_post: {
    surface: 'neighborhood_post',
    bucket: 'feed-post-images',
    maxFiles: 4,
    maxBytesPerFile: 6 * mb,
    allowedMimeTypes: allowedPhotoMimeTypes,
    purpose: 'community_photo',
  },
  group_post: {
    surface: 'group_post',
    bucket: 'group-post-images',
    maxFiles: 4,
    maxBytesPerFile: 6 * mb,
    allowedMimeTypes: allowedPhotoMimeTypes,
    purpose: 'community_photo',
  },
  marketplace_listing: {
    surface: 'marketplace_listing',
    bucket: 'listing-images',
    maxFiles: 8,
    maxBytesPerFile: 6 * mb,
    allowedMimeTypes: allowedPhotoMimeTypes,
    purpose: 'listing_photo',
  },
  event: {
    surface: 'event',
    bucket: 'event-images',
    maxFiles: 6,
    maxBytesPerFile: 6 * mb,
    allowedMimeTypes: allowedPhotoMimeTypes,
    purpose: 'event_photo',
  },
};

const sensitiveAltTextPattern =
  /\+?233|\b0\d{8,9}\b|@|ghana\s*post|ghana_post|gps|exact address|street address|coordinates?|latitude|longitude|legal name|challenge hash|hash/i;

export function getMediaPipelinePolicy(surface: MediaSurface): MediaPipelinePolicy {
  return mediaPipelinePolicies[surface];
}

export function prepareMediaAttachments(input: PrepareMediaInput): PrepareMediaResult {
  const policy = getMediaPipelinePolicy(input.surface);
  const createdAt = input.createdAt ?? new Date().toISOString();
  const errors: MediaPipelineError[] = [];

  if (input.attachments.length > policy.maxFiles) {
    errors.push({
      code: 'too_many_files',
      index: policy.maxFiles,
      message: `${policy.surface} supports up to ${policy.maxFiles} photos.`,
    });
  }

  const acceptedDrafts = input.attachments.slice(0, policy.maxFiles);
  const attachments = acceptedDrafts.flatMap((draft, index) => {
    const draftErrors = validateDraft(draft, policy, index);
    errors.push(...draftErrors);

    if (draftErrors.length > 0) return [];

    return [toPreparedAttachment(draft, input.surface, input.ownerProfileId, createdAt, index)];
  });

  return {
    accepted: errors.length === 0,
    policy,
    attachments,
    errors,
  };
}

export function toUserUploadedImage(attachment: MediaAttachment, ownerId: string): UserUploadedImage {
  return {
    id: attachment.id,
    bucket: attachment.bucket,
    path: attachment.objectPath,
    ownerId,
    altText: attachment.altText,
    moderationStatus: attachment.moderationStatus,
    createdAt: attachment.createdAt,
  };
}

function validateDraft(draft: MediaAttachmentDraft, policy: MediaPipelinePolicy, index: number): MediaPipelineError[] {
  const errors: MediaPipelineError[] = [];

  if (!draft.uri.trim()) {
    errors.push({ code: 'missing_uri', index, message: 'Photo is missing a local file URI.' });
  }

  if (!policy.allowedMimeTypes.includes(draft.mimeType)) {
    errors.push({ code: 'unsupported_mime_type', index, message: 'Use a JPEG, PNG, WebP, HEIC, or HEIF photo.' });
  }

  if (!Number.isFinite(draft.byteSize) || draft.byteSize <= 0) {
    errors.push({ code: 'invalid_file_size', index, message: 'Photo file size is invalid.' });
  } else if (draft.byteSize > policy.maxBytesPerFile) {
    errors.push({ code: 'file_too_large', index, message: 'Photo is too large for this upload type.' });
  }

  return errors;
}

function toPreparedAttachment(
  draft: MediaAttachmentDraft,
  surface: MediaSurface,
  ownerProfileId: string,
  createdAt: string,
  index: number,
): MediaAttachment {
  const id = `${surface}-${timestampSegment(createdAt)}-${index + 1}`;

  return {
    id,
    surface,
    bucket: getMediaPipelinePolicy(surface).bucket,
    localUri: draft.uri,
    objectPath: buildObjectPath(surface, ownerProfileId, createdAt, index, draft.mimeType),
    mimeType: draft.mimeType,
    byteSize: draft.byteSize,
    width: draft.width,
    height: draft.height,
    altText: safeAltText(draft.altText),
    moderationStatus: 'not_run',
    uploadStatus: 'pending',
    createdAt,
  };
}

function buildObjectPath(
  surface: MediaSurface,
  ownerProfileId: string,
  createdAt: string,
  index: number,
  mimeType: string,
) {
  return `${surface}/${safePathSegment(ownerProfileId)}/${timestampSegment(createdAt)}/media-${index + 1}.${extensionForMimeType(
    mimeType,
  )}`;
}

function safeAltText(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed || sensitiveAltTextPattern.test(trimmed)) return undefined;
  return trimmed.slice(0, 140);
}

function safePathSegment(value: string): string {
  const sanitized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return sanitized || 'unknown-owner';
}

function timestampSegment(value: string): string {
  return value.replace(/[^0-9]/g, '').slice(0, 14) || 'pending-time';
}

function extensionForMimeType(mimeType: string): string {
  if (mimeType === 'image/png') return 'png';
  if (mimeType === 'image/webp') return 'webp';
  if (mimeType === 'image/heic') return 'heic';
  if (mimeType === 'image/heif') return 'heif';
  return 'jpg';
}
