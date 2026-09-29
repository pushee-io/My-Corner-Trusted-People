import { supabase } from '@/lib/supabase';
import { assertMediaSession, mediaSessionRevision } from '@/lib/media-session';

export async function loadVerifiedNeighborhood(): Promise<{ name: string; city: string } | null> {
  const revision = mediaSessionRevision();
  // Canonical membership context is independent of the AI feature flag and quota.
  const { data, error } = await supabase.rpc('neighborhood_search_context');
  assertMediaSession(revision);
  if (error) {
    if (error.code === '42501') return null;
    throw new Error('Neighborhood unavailable');
  }
  if (!data?.id || typeof data.name !== 'string' || typeof data.city !== 'string') return null;
  return { name: data.name, city: data.city };
}
