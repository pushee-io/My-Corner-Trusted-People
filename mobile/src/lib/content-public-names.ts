import { supabase } from '@/lib/supabase';
import { assertMediaSession, mediaSessionRevision } from '@/lib/media-session';

type ContentKind =
  | 'service_request'
  | 'marketplace_listing'
  | 'marketplace_pickup'
  | 'marketplace_message'
  | 'group_post'
  | 'group_comment'
  | 'event'
  | 'event_comment'
  | 'event_rsvp';

// Transport only. Consent/fallback and authorization stay in the existing
// canonical database resolver; callers supply content IDs, never profile IDs.
export async function contentPublicNames(kind: ContentKind, ids: string[]) {
  const revision = mediaSessionRevision();
  const names = new Map<string, string>();
  const unique = [...new Set(ids)];
  for (let offset = 0; offset < unique.length; offset += 100) {
    const { data, error } = await supabase.rpc('content_public_names', {
      kind,
      content_ids: unique.slice(offset, offset + 100),
    });
    assertMediaSession(revision);
    if (error) throw error;
    for (const row of (data ?? []) as { id: string; name: string }[]) {
      if (typeof row.id === 'string' && typeof row.name === 'string') names.set(row.id, row.name.trim() || 'Neighbor');
    }
  }
  return names;
}

// The content write already committed. An identity read failure must not invite
// duplicate submissions, nor use the self-profile name as a fallback.
export async function contentPublicNameAfterWrite(kind: ContentKind, id: string, profileId: string) {
  const revision = mediaSessionRevision();
  let name = 'Neighbor';
  try {
    name = (await contentPublicNames(kind, [id])).get(profileId) ?? name;
  } catch {
    /* Reload retries the name read. */
  }
  assertMediaSession(revision);
  return name;
}
