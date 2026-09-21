import { getCurrentProfile } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import type { UserRole } from '@/types/contracts';

export function capabilitiesFor(role: UserRole, providerLinked: boolean, verifiedResident: boolean) {
  return { provider: providerLinked, community: verifiedResident, moderator: role === 'moderator' || role === 'admin' };
}
export async function getCurrentCapabilities() {
  const profile = await getCurrentProfile();
  const [providers, memberships] = await Promise.all([
    supabase.from('provider_profiles').select('id').eq('profile_id', profile.id),
    supabase
      .from('neighborhood_memberships')
      .select('neighborhood_id, status, verified_at, ended_at, verification_expires_at')
      .eq('profile_id', profile.id),
  ]);
  if (providers.error) throw providers.error;
  if (memberships.error) throw memberships.error;
  const verified = (memberships.data ?? []).find(
    (m) =>
      m.status === 'verified' &&
      m.verified_at &&
      !m.ended_at &&
      (!m.verification_expires_at || Date.parse(m.verification_expires_at) > Date.now()),
  );
  const clusters = verified
    ? await supabase
        .from('neighborhood_cluster_members')
        .select('cluster_id')
        .eq('neighborhood_id', verified.neighborhood_id)
        .limit(1)
    : { data: [], error: null };
  if (clusters.error) throw clusters.error;
  return {
    clusterId: clusters.data?.[0]?.cluster_id as string | undefined,
    ...capabilitiesFor(profile.role, Boolean(providers.data?.length), Boolean(verified)),
    profileId: profile.id,
    neighborhoodId: verified?.neighborhood_id as string | undefined,
  };
}
