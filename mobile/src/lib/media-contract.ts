/** Shared defaults mirror server media_surface_policies; the server remains authoritative. */
export const mediaLimits = {
  profile: { images: 1, videos: 0 },
  neighborhood_post: { images: 4, videos: 1 },
  service_request: { images: 4, videos: 1 },
  group_post: { images: 4, videos: 1 },
  group_avatar: { images: 1, videos: 0 },
  group_cover: { images: 1, videos: 0 },
  event: { images: 6, videos: 1 },
  marketplace_listing: { images: 0, videos: 1 },
} as const;
export const mediaFileLimits = { imageBytes: 6 * 1024 * 1024, videoBytes: 20 * 1024 * 1024, seconds: 30, edge: 1920 };
export type MediaParent = keyof typeof mediaLimits;
export type MediaKind = 'image' | 'video';
export type MediaDraft = {
  id: string;
  kind: MediaKind;
  uri: string;
  posterUri?: string;
  width: number;
  height: number;
  bytes: number;
  seconds?: number;
  status: 'selected' | 'uploading' | 'processing' | 'ready' | 'failed';
  progress: number;
  error?: string;
};
export type MediaAsset = {
  id: string;
  owner_profile_id: string;
  parent_type: MediaParent;
  parent_id: string | null;
  media_type: MediaKind;
  storage_path: string;
  poster_path: string | null;
  mime_type: string;
  byte_size: number;
  width: number;
  height: number;
  duration_seconds: number | null;
  sort_order: number;
  alt_text: string;
  processing_status: 'uploading' | 'ready' | 'failed' | 'removed';
  moderation_status: 'not_run' | 'clean' | 'flagged' | 'blocked';
  created_at: string;
  updated_at: string;
};
export type DisplayMedia = MediaAsset & { url: string; posterUrl?: string; expiresAt: number };

export function validateMediaDrafts(parent: MediaParent, drafts: MediaDraft[]): string | undefined {
  const policy = mediaLimits[parent];
  if (
    drafts.filter((item) => item.kind === 'image').length > policy.images ||
    drafts.filter((item) => item.kind === 'video').length > policy.videos
  ) {
    return `Choose up to ${policy.images} photos${policy.videos ? ' and one video' : ''}.`;
  }
  for (const item of drafts) {
    if (!item.uri || !Number.isFinite(item.bytes) || item.bytes <= 0)
      return 'This file could not be read. Choose it again.';
    if (
      !Number.isInteger(item.width) ||
      !Number.isInteger(item.height) ||
      item.width < 1 ||
      item.height < 1 ||
      Math.max(item.width, item.height) > mediaFileLimits.edge
    ) {
      return 'Use media no larger than 1920 pixels on either side.';
    }
    if (item.bytes > (item.kind === 'image' ? mediaFileLimits.imageBytes : mediaFileLimits.videoBytes))
      return item.kind === 'image' ? 'Choose a photo under 6 MB.' : 'Choose a video under 20 MB.';
    if (
      item.kind === 'video' &&
      (!item.posterUri || !Number.isFinite(item.seconds) || !item.seconds || item.seconds > mediaFileLimits.seconds)
    )
      return 'Choose a video up to 30 seconds long.';
  }
}
