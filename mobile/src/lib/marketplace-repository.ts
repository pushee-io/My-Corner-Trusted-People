import { File } from 'expo-file-system';

import { getCurrentProfile } from '@/lib/auth';
import { prepareMediaAttachments, type MediaAttachmentDraft } from '@/lib/shared-media-pipeline';
import { assertSupabaseConfigured, supabase } from '@/lib/supabase';
import type {
  MarketplaceAvailability,
  MarketplaceListing,
  MarketplaceMessage,
  MarketplacePickupRequest,
  MarketplacePickupStatus,
} from '@/types/contracts';

export type CurrentNeighborhood = {
  id: string;
  name: string;
};

export type MarketplaceDraft = {
  title: string;
  description: string;
  priceGhs?: number;
  photos: MediaAttachmentDraft[];
  availability: MarketplaceAvailability;
  pickupArea: string;
};

export type MarketplacePickupDraft = {
  message: string;
  generalArea: string;
  proposedStart: string;
  proposedEnd: string;
};

type ListingRow = {
  id: string;
  neighborhood_id: string;
  seller_id: string;
  title: string;
  description: string;
  price_ghs: number | null;
  image_url: string | null;
  availability: MarketplaceAvailability;
  pickup_area: string;
  moderation_status: MarketplaceListing['moderationStatus'];
  created_at: string;
};

type ListingImageRow = {
  listing_id: string;
  object_path: string;
  position: number;
};

type PickupRequestRow = {
  id: string;
  listing_id: string;
  requester_id: string;
  message: string;
  general_area: string;
  proposed_start: string;
  proposed_end: string;
  status: MarketplacePickupStatus;
  created_at: string;
};

type PrivatePickupRow = {
  request_id: string;
  exact_details: string;
};

type ConversationRow = {
  id: string;
  pickup_request_id: string;
};

type MessageRow = {
  id: string;
  conversation_id: string;
  sender_profile_id: string;
  body: string;
  created_at: string;
};

const listingColumns =
  'id, neighborhood_id, seller_id, title, description, price_ghs, image_url, availability, pickup_area, moderation_status, created_at';
const pickupColumns =
  'id, listing_id, requester_id, message, general_area, proposed_start, proposed_end, status, created_at';

function mapListing(
  row: ListingRow,
  sellerName = 'Neighbor',
  imageUrls: string[] = row.image_url ? [row.image_url] : [],
): MarketplaceListing {
  return {
    id: row.id,
    neighborhoodId: row.neighborhood_id,
    sellerId: row.seller_id,
    sellerName,
    title: row.title,
    description: row.description,
    priceGhs: row.price_ghs ?? undefined,
    imageUrl: imageUrls[0],
    imageUrls,
    availability: row.availability,
    pickupArea: row.pickup_area,
    moderationStatus: row.moderation_status,
    createdAt: row.created_at,
  };
}

function mapPickupRequest(
  row: PickupRequestRow,
  requesterName = 'Neighbor',
  privateDetails?: string,
): MarketplacePickupRequest {
  return {
    id: row.id,
    listingId: row.listing_id,
    requesterId: row.requester_id,
    requesterName,
    message: row.message,
    generalArea: row.general_area,
    proposedStart: row.proposed_start,
    proposedEnd: row.proposed_end,
    status: row.status,
    privateDetails,
    createdAt: row.created_at,
  };
}

async function profileNames(profileIds: string[]) {
  const uniqueIds = [...new Set(profileIds)];
  if (uniqueIds.length === 0) return new Map<string, string>();

  const { data, error } = await supabase.from('profiles').select('id, display_name').in('id', uniqueIds);
  if (error) throw error;

  return new Map((data ?? []).map((row) => [row.id, row.display_name]));
}

async function signedListingImages(listingIds: string[]) {
  if (listingIds.length === 0) return new Map<string, string[]>();

  const { data, error } = await supabase
    .from('marketplace_listing_images')
    .select('listing_id, object_path, position')
    .in('listing_id', listingIds)
    .neq('moderation_status', 'blocked')
    .order('position', { ascending: true });
  if (error) throw error;

  const rows = (data ?? []) as ListingImageRow[];
  if (rows.length === 0) return new Map<string, string[]>();

  const { data: signed, error: signedError } = await supabase.storage.from('listing-images').createSignedUrls(
    rows.map((row) => row.object_path),
    60 * 60,
  );
  if (signedError) throw signedError;

  const urls = new Map<string, string[]>();
  rows.forEach((row, index) => {
    const signedUrl = signed?.[index]?.signedUrl;
    if (!signedUrl) return;
    urls.set(row.listing_id, [...(urls.get(row.listing_id) ?? []), signedUrl]);
  });
  return urls;
}

async function hydrateListings(rows: ListingRow[]) {
  const [names, imageUrls] = await Promise.all([
    profileNames(rows.map((row) => row.seller_id)),
    signedListingImages(rows.map((row) => row.id)),
  ]);
  return rows.map((row) => mapListing(row, names.get(row.seller_id), imageUrls.get(row.id)));
}

async function privatePickupDetails(requestIds: string[]) {
  if (requestIds.length === 0) return new Map<string, string>();
  const { data, error } = await supabase.rpc('get_marketplace_pickup_private_details', {
    target_request_ids: requestIds,
  });
  if (error) throw error;
  return new Map(((data ?? []) as PrivatePickupRow[]).map((row) => [row.request_id, row.exact_details]));
}

async function hydratePickupRequests(rows: PickupRequestRow[]) {
  const [names, privateDetails] = await Promise.all([
    profileNames(rows.map((row) => row.requester_id)),
    privatePickupDetails(rows.map((row) => row.id)),
  ]);
  return rows.map((row) => mapPickupRequest(row, names.get(row.requester_id), privateDetails.get(row.id)));
}

export async function getMarketplaceNeighborhood(): Promise<CurrentNeighborhood> {
  assertSupabaseConfigured();
  const profile = await getCurrentProfile();
  const { data: membership, error: membershipError } = await supabase
    .from('neighborhood_memberships')
    .select('neighborhood_id')
    .eq('profile_id', profile.id)
    .eq('status', 'verified')
    .eq('is_primary', true)
    .not('verified_at', 'is', null)
    .is('ended_at', null)
    .maybeSingle();

  if (membershipError) throw membershipError;
  if (!membership) throw new Error('A verified primary neighborhood is required to use Marketplace.');

  const { data: neighborhood, error: neighborhoodError } = await supabase
    .from('neighborhoods')
    .select('id, name')
    .eq('id', membership.neighborhood_id)
    .single();

  if (neighborhoodError) throw neighborhoodError;
  return { id: neighborhood.id, name: neighborhood.name };
}

export async function getMarketplaceViewer() {
  const profile = await getCurrentProfile();
  return { id: profile.id, displayName: profile.displayName };
}

export async function listMarketplaceListings(neighborhoodId: string): Promise<MarketplaceListing[]> {
  assertSupabaseConfigured();
  const { data, error } = await supabase
    .from('marketplace_listings')
    .select(listingColumns)
    .eq('neighborhood_id', neighborhoodId)
    .neq('moderation_status', 'blocked')
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return hydrateListings((data ?? []) as ListingRow[]);
}

export async function getMarketplaceListing(listingId: string): Promise<MarketplaceListing> {
  assertSupabaseConfigured();
  const { data, error } = await supabase
    .from('marketplace_listings')
    .select(listingColumns)
    .eq('id', listingId)
    .neq('moderation_status', 'blocked')
    .single();
  if (error) throw error;
  return (await hydrateListings([data as ListingRow]))[0];
}

async function uploadListingPhotos(profileId: string, photos: MediaAttachmentDraft[]) {
  if (photos.length === 0) return [];
  const prepared = prepareMediaAttachments({
    surface: 'marketplace_listing',
    ownerProfileId: profileId,
    attachments: photos,
  });
  if (!prepared.accepted) {
    throw new Error(prepared.errors[0]?.message ?? 'Could not prepare listing photos.');
  }

  const uploaded: typeof prepared.attachments = [];
  try {
    for (const attachment of prepared.attachments) {
      const bytes = await new File(attachment.localUri).arrayBuffer();
      const { error } = await supabase.storage.from(attachment.bucket).upload(attachment.objectPath, bytes, {
        contentType: attachment.mimeType,
        cacheControl: '3600',
        upsert: false,
      });
      if (error) throw error;
      uploaded.push(attachment);
    }
    return uploaded;
  } catch (caught) {
    if (uploaded.length > 0) {
      await supabase.storage.from('listing-images').remove(uploaded.map((item) => item.objectPath));
    }
    throw caught;
  }
}

export async function createMarketplaceListing(
  neighborhoodId: string,
  draft: MarketplaceDraft,
): Promise<MarketplaceListing> {
  assertSupabaseConfigured();
  const profile = await getCurrentProfile();
  const uploaded = await uploadListingPhotos(profile.id, draft.photos);

  const { data, error } = await supabase
    .from('marketplace_listings')
    .insert({
      neighborhood_id: neighborhoodId,
      seller_id: profile.id,
      title: draft.title.trim(),
      description: draft.description.trim(),
      price_ghs: draft.priceGhs ?? null,
      availability: draft.availability,
      pickup_area: draft.pickupArea.trim(),
      pickup_notes: null,
      moderation_status: 'not_run',
    })
    .select(listingColumns)
    .single();

  if (error) {
    if (uploaded.length > 0) {
      await supabase.storage.from('listing-images').remove(uploaded.map((item) => item.objectPath));
    }
    throw error;
  }

  const listingRow = data as ListingRow;
  if (uploaded.length > 0) {
    const { error: imageError } = await supabase.from('marketplace_listing_images').insert(
      uploaded.map((attachment, position) => ({
        listing_id: listingRow.id,
        owner_profile_id: profile.id,
        object_path: attachment.objectPath,
        mime_type: attachment.mimeType,
        position,
        alt_text: attachment.altText ?? null,
        moderation_status: attachment.moderationStatus,
      })),
    );
    if (imageError) {
      await supabase.storage.from('listing-images').remove(uploaded.map((item) => item.objectPath));
      throw new Error('Listing saved, but its photos could not be attached. Retry from the listing.');
    }
  }

  return (await hydrateListings([listingRow]))[0];
}

export async function createMarketplacePickupRequest(
  listingId: string,
  draft: MarketplacePickupDraft,
): Promise<MarketplacePickupRequest> {
  assertSupabaseConfigured();
  const profile = await getCurrentProfile();
  const { data, error } = await supabase
    .from('marketplace_pickup_requests')
    .insert({
      listing_id: listingId,
      requester_id: profile.id,
      message: draft.message.trim(),
      general_area: draft.generalArea.trim(),
      proposed_start: draft.proposedStart,
      proposed_end: draft.proposedEnd,
      status: 'proposed',
    })
    .select(pickupColumns)
    .single();
  if (error) throw error;
  return mapPickupRequest(data as PickupRequestRow, profile.displayName);
}

export async function listMarketplacePickupRequestsForListing(listingId: string) {
  assertSupabaseConfigured();
  const { data, error } = await supabase
    .from('marketplace_pickup_requests')
    .select(pickupColumns)
    .eq('listing_id', listingId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return hydratePickupRequests((data ?? []) as PickupRequestRow[]);
}

export async function respondToMarketplacePickupRequest(
  requestId: string,
  action: 'accept' | 'confirm' | 'decline' | 'cancel' | 'complete',
  privateDetails?: string,
) {
  assertSupabaseConfigured();
  const { data, error } = await supabase.rpc('respond_to_marketplace_pickup_request', {
    target_request_id: requestId,
    action,
    private_details: privateDetails?.trim() || null,
  });
  if (error) throw error;
  const row = data as PickupRequestRow;
  const [request] = await hydratePickupRequests([row]);
  return request;
}

async function conversationForRequest(requestId: string) {
  const { data, error } = await supabase
    .from('marketplace_conversations')
    .select('id, pickup_request_id')
    .eq('pickup_request_id', requestId)
    .single();
  if (error) throw error;
  return data as ConversationRow;
}

export async function listMarketplaceMessages(requestId: string): Promise<MarketplaceMessage[]> {
  assertSupabaseConfigured();
  const [profile, conversation] = await Promise.all([getCurrentProfile(), conversationForRequest(requestId)]);
  const { data, error } = await supabase
    .from('marketplace_messages')
    .select('id, conversation_id, sender_profile_id, body, created_at')
    .eq('conversation_id', conversation.id)
    .order('created_at', { ascending: true })
    .limit(200);
  if (error) throw error;
  const rows = (data ?? []) as MessageRow[];
  const names = await profileNames(rows.map((row) => row.sender_profile_id));
  return rows.map((row) => ({
    id: row.id,
    conversationId: row.conversation_id,
    senderProfileId: row.sender_profile_id,
    senderName: names.get(row.sender_profile_id) ?? 'Neighbor',
    body: row.body,
    createdAt: row.created_at,
    isOwn: row.sender_profile_id === profile.id,
  }));
}

export async function sendMarketplaceMessage(requestId: string, body: string) {
  assertSupabaseConfigured();
  const [profile, conversation] = await Promise.all([getCurrentProfile(), conversationForRequest(requestId)]);
  const { data, error } = await supabase
    .from('marketplace_messages')
    .insert({
      conversation_id: conversation.id,
      sender_profile_id: profile.id,
      body: body.trim(),
    })
    .select('id, conversation_id, sender_profile_id, body, created_at')
    .single();
  if (error) throw error;
  const row = data as MessageRow;
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderProfileId: row.sender_profile_id,
    senderName: profile.displayName,
    body: row.body,
    createdAt: row.created_at,
    isOwn: true,
  } satisfies MarketplaceMessage;
}
