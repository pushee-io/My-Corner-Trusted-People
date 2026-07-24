import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';
import type { FeedUnlockResult, NeighborhoodFeedPost } from '@/types/contracts';

export const day2bFallbackNeighborhoodName = 'East Legon';
export const day2bTestPostcardCode = 'MC2026';

export type LiveResult<T> = {
  data?: T;
  error?: string;
  authRequired?: boolean;
  configured: boolean;
};

export type SafeIdentitySummary = {
  profileId: string;
  publicDisplayName: string;
  assuranceStatus: string;
  assuranceProvider: string;
  assuranceMethod: string;
};

export type SafeAddressSummary = {
  id: string;
  publicLabel: string;
  neighborhood: string;
  providerName: string;
  verificationStatus: string;
  exactAddressPublic: false;
  ghanaPostGpsPublic: false;
  exactCoordinatesPublic: false;
};

export type TestResidenceChallengeSummary = {
  id: string;
  status: 'delivered' | 'verified';
  challengeCode: string;
  exactAddressPublic: false;
  codeStoredAsHash: true;
};

type AuthContext = {
  profileId: string;
};

type SafeMembershipRow = {
  neighborhood_id: string;
  status: string;
  verification_method: string | null;
  verified_at: string | null;
  ended_at: string | null;
  verification_expires_at: string | null;
  neighborhoods?: {
    name?: string | null;
  } | null;
};

type CommunityPostRow = {
  id: string;
  author_id: string;
  neighborhood_id: string;
  title: string;
  body: string;
  created_at: string;
};

type PublicProfileRow = {
  profile_id: string;
  public_display_name: string | null;
};

type LiveAddressInput = {
  neighborhood: string;
  city: string;
  areaLabel: string;
  ghanaPostGps?: string;
  provider: string;
  latitude?: number;
  longitude?: number;
};

const lockedCopy: Record<FeedUnlockResult['reason'], { title: string; message: string }> = {
  verified_member: {
    title: 'Neighborhood feed unlocked',
    message: 'You can read and post with verified members in this neighborhood.',
  },
  no_membership: {
    title: 'Verify your neighborhood',
    message: 'Complete residence verification before opening this private neighborhood feed.',
  },
  wrong_neighborhood: {
    title: 'Different neighborhood',
    message: 'This feed is only available to verified members assigned to this neighborhood.',
  },
  not_verified: {
    title: 'Verification pending',
    message: 'Your neighborhood membership must be verified before feed access unlocks.',
  },
};

function clientOrError(client?: SupabaseClient): LiveResult<SupabaseClient> {
  if (client) return { data: client, configured: true };

  if (!isSupabaseConfigured()) {
    return {
      configured: false,
      error: 'Supabase is not configured for this build.',
    };
  }

  return { data: getSupabaseClient(), configured: true };
}

function messageFromError(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message?: unknown }).message ?? 'Supabase request failed.');
  }

  return 'Supabase request failed.';
}

function lockedResult(reason: FeedUnlockResult['reason'], message?: string): FeedUnlockResult {
  return {
    status: 'locked',
    neighborhoodId: 'unknown',
    canRead: false,
    canPost: false,
    reason,
    title: lockedCopy[reason].title,
    message: message ?? lockedCopy[reason].message,
  };
}

async function requireAuth(client: SupabaseClient): Promise<LiveResult<AuthContext>> {
  const userResponse = await client.auth.getUser();

  if (userResponse.error) {
    return { configured: true, authRequired: true, error: userResponse.error.message };
  }

  if (!userResponse.data.user) {
    return { configured: true, authRequired: true, error: 'Sign in before using verified neighborhood features.' };
  }

  const { data, error } = await client.rpc('current_profile_id');

  if (error) {
    return { configured: true, error: error.message };
  }

  if (!data) {
    return { configured: true, authRequired: true, error: 'No profile record exists for the signed-in user.' };
  }

  return { configured: true, data: { profileId: String(data) } };
}

async function getPrimaryMembership(client: SupabaseClient): Promise<LiveResult<SafeMembershipRow | undefined>> {
  const auth = await requireAuth(client);
  if (!auth.data) return auth;

  const { data, error } = await client
    .from('neighborhood_memberships')
    .select('neighborhood_id,status,verification_method,verified_at,ended_at,verification_expires_at,neighborhoods(name)')
    .eq('is_primary', true)
    .is('ended_at', null)
    .order('verified_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return { configured: true, error: error.message };
  }

  return { configured: true, data: (data as SafeMembershipRow | null) ?? undefined };
}

export async function getLiveFeedUnlockStatus(client?: SupabaseClient): Promise<LiveResult<FeedUnlockResult>> {
  const clientResult = clientOrError(client);
  if (!clientResult.data) {
    return {
      ...clientResult,
      data: lockedResult('no_membership', 'Connect Supabase to use the live verified neighborhood feed.'),
    };
  }

  const membership = await getPrimaryMembership(clientResult.data);
  if (!membership.data) {
    return {
      ...membership,
      data: lockedResult(membership.authRequired ? 'no_membership' : 'no_membership', membership.error),
    };
  }

  if (membership.data.status !== 'verified') {
    return {
      configured: true,
      data: {
        ...lockedResult('not_verified'),
        neighborhoodId: membership.data.neighborhood_id,
      },
    };
  }

  return {
    configured: true,
    data: {
      status: 'unlocked',
      neighborhoodId: membership.data.neighborhood_id,
      canRead: true,
      canPost: true,
      reason: 'verified_member',
      title: `${membership.data.neighborhoods?.name ?? day2bFallbackNeighborhoodName} feed unlocked`,
      message: 'You can read and post with verified members in this neighborhood.',
    },
  };
}

export async function listLiveNeighborhoodPosts(client?: SupabaseClient): Promise<LiveResult<NeighborhoodFeedPost[]>> {
  const clientResult = clientOrError(client);
  if (!clientResult.data) return { ...clientResult, data: [] };

  const unlock = await getLiveFeedUnlockStatus(clientResult.data);
  if (!unlock.data?.canRead) return { ...unlock, data: [] };

  const { data, error } = await clientResult.data
    .from('community_posts')
    .select('id,author_id,neighborhood_id,title,body,created_at')
    .eq('neighborhood_id', unlock.data.neighborhoodId)
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error) return { configured: true, error: error.message, data: [] };

  const rows = (data ?? []) as CommunityPostRow[];
  const authorIds = Array.from(new Set(rows.map((row) => row.author_id)));
  const namesByProfileId = new Map<string, string>();

  if (authorIds.length > 0) {
    const profileResponse = await clientResult.data
      .from('public_community_profiles')
      .select('profile_id,public_display_name')
      .in('profile_id', authorIds);

    if (!profileResponse.error) {
      ((profileResponse.data ?? []) as PublicProfileRow[]).forEach((profile) => {
        namesByProfileId.set(profile.profile_id, profile.public_display_name ?? 'Verified neighbor');
      });
    }
  }

  return {
    configured: true,
    data: rows.map((row) => ({
      id: row.id,
      neighborhoodId: row.neighborhood_id,
      authorUserId: row.author_id,
      authorDisplayName: namesByProfileId.get(row.author_id) ?? 'Verified neighbor',
      body: row.body,
      createdAt: row.created_at,
      visibility: 'verified_neighborhood_members',
    })),
  };
}

export async function createLiveLocalPost(body: string, client?: SupabaseClient): Promise<LiveResult<NeighborhoodFeedPost | undefined>> {
  const cleanBody = body.trim();
  if (cleanBody.length === 0) {
    return { configured: true, error: 'Post body is required.' };
  }

  const clientResult = clientOrError(client);
  if (!clientResult.data) return clientResult;

  const title = cleanBody.length > 80 ? `${cleanBody.slice(0, 77)}...` : cleanBody;
  const { data, error } = await clientResult.data.rpc('create_private_neighborhood_post', {
    post_title: title,
    post_body: cleanBody,
  });

  if (error) return { configured: true, error: error.message };

  const posts = await listLiveNeighborhoodPosts(clientResult.data);
  return {
    configured: true,
    data: posts.data?.find((post) => post.id === data) ?? posts.data?.[0],
    error: posts.error,
  };
}

export async function saveLiveLegalName(input: { givenNames: string; familyName: string }, client?: SupabaseClient): Promise<LiveResult<SafeIdentitySummary>> {
  const givenNames = input.givenNames.trim().replace(/\s+/g, ' ');
  const familyName = input.familyName.trim().replace(/\s+/g, ' ');

  if (givenNames.length < 2 || familyName.length < 2) {
    return { configured: true, error: 'Legal given and family names are required.' };
  }

  const clientResult = clientOrError(client);
  if (!clientResult.data) return clientResult;

  const { data: profileId, error } = await clientResult.data.rpc('complete_test_identity_assurance', {
    legal_given_name: givenNames,
    legal_family_name: familyName,
  });

  if (error) return { configured: true, error: error.message };

  const identityResponse = await clientResult.data
    .from('private_identity_profiles')
    .select('profile_id,public_display_name,assurance_status,assurance_provider,assurance_method')
    .eq('profile_id', profileId)
    .maybeSingle();

  if (identityResponse.error) return { configured: true, error: identityResponse.error.message };

  const row = identityResponse.data as {
    profile_id: string;
    public_display_name: string;
    assurance_status: string;
    assurance_provider: string;
    assurance_method: string;
  } | null;

  if (!row) return { configured: true, error: 'Identity summary was not returned.' };

  return {
    configured: true,
    data: {
      profileId: row.profile_id,
      publicDisplayName: row.public_display_name,
      assuranceStatus: row.assurance_status,
      assuranceProvider: row.assurance_provider,
      assuranceMethod: row.assurance_method,
    },
  };
}

export async function saveLiveGhanaAddress(input: LiveAddressInput, client?: SupabaseClient): Promise<LiveResult<SafeAddressSummary>> {
  const neighborhood = input.neighborhood.trim();
  const city = input.city.trim();
  const areaLabel = input.areaLabel.trim();
  const ghanaPostGps = input.ghanaPostGps?.trim().toUpperCase();
  const latitude = input.latitude ?? 5.6505;
  const longitude = input.longitude ?? -0.1655;

  if (!neighborhood || !city || !areaLabel) {
    return { configured: true, error: 'Neighborhood, city, and area label are required.' };
  }

  const clientResult = clientOrError(client);
  if (!clientResult.data) return clientResult;

  const auth = await requireAuth(clientResult.data);
  if (!auth.data) return auth;

  await clientResult.data
    .from('private_addresses')
    .update({ is_current: false })
    .eq('profile_id', auth.data.profileId)
    .eq('is_current', true);

  const point = `SRID=4326;POINT(${longitude} ${latitude})`;
  const { data, error } = await clientResult.data
    .from('private_addresses')
    .insert({
      profile_id: auth.data.profileId,
      original_entry: `${areaLabel}, ${neighborhood}, ${city}`,
      house_number_or_description: 'Private test residence',
      street_or_road: areaLabel,
      landmark: areaLabel,
      area: neighborhood,
      neighborhood_text: neighborhood,
      district_or_municipality: city,
      region: 'Greater Accra',
      country_code: 'GH',
      ghana_post_gps: ghanaPostGps || null,
      provider_name: input.provider,
      user_confirmed_latitude: latitude,
      user_confirmed_longitude: longitude,
      user_confirmed_point: point,
      verification_status: 'pending',
      is_current: true,
    })
    .select('id,neighborhood_text,provider_name,verification_status')
    .single();

  if (error) return { configured: true, error: error.message };

  const row = data as {
    id: string;
    neighborhood_text: string;
    provider_name: string;
    verification_status: string;
  };

  return {
    configured: true,
    data: {
      id: row.id,
      publicLabel: `${row.neighborhood_text}, ${city}`,
      neighborhood: row.neighborhood_text,
      providerName: row.provider_name,
      verificationStatus: row.verification_status,
      exactAddressPublic: false,
      ghanaPostGpsPublic: false,
      exactCoordinatesPublic: false,
    },
  };
}

export async function createLivePostcardChallenge(client?: SupabaseClient): Promise<LiveResult<TestResidenceChallengeSummary>> {
  const clientResult = clientOrError(client);
  if (!clientResult.data) return clientResult;

  const auth = await requireAuth(clientResult.data);
  if (!auth.data) return auth;

  const addressResponse = await clientResult.data
    .from('private_addresses')
    .select('id')
    .eq('profile_id', auth.data.profileId)
    .eq('is_current', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (addressResponse.error) return { configured: true, error: addressResponse.error.message };
  if (!addressResponse.data) return { configured: true, error: 'Save a current private address before creating a postcard challenge.' };

  const { data, error } = await clientResult.data.rpc('create_test_residence_challenge', {
    target_address_id: (addressResponse.data as { id: string }).id,
    test_code: day2bTestPostcardCode,
  });

  if (error) return { configured: true, error: error.message };

  return {
    configured: true,
    data: {
      id: String(data),
      status: 'delivered',
      challengeCode: day2bTestPostcardCode,
      exactAddressPublic: false,
      codeStoredAsHash: true,
    },
  };
}

export async function verifyLivePostcardCode(challengeId: string, code: string, client?: SupabaseClient): Promise<LiveResult<FeedUnlockResult>> {
  const clientResult = clientOrError(client);
  if (!clientResult.data) return clientResult;

  const { error } = await clientResult.data.rpc('verify_test_residence_challenge', {
    target_challenge_id: challengeId,
    submitted_code: code,
  });

  if (error) return { configured: true, error: error.message };

  return getLiveFeedUnlockStatus(clientResult.data);
}

export function friendlyLiveError(error: unknown): string {
  return messageFromError(error);
}
