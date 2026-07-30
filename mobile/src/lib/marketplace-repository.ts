import { getCurrentProfile } from '@/lib/auth';
import { getActiveLocationContext } from '@/lib/location-context';
import { assertSupabaseConfigured, supabase } from '@/lib/supabase';
import type { MarketplaceAvailability, MarketplaceListing, MarketplacePickupRequest } from '@/types/contracts';

export type CurrentNeighborhood = {
  id: string;
  name: string;
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
  pickup_notes: string | null;
  moderation_status: MarketplaceListing['moderationStatus'];
  created_at: string;
};

type PickupRequestRow = {
  id: string;
  listing_id: string;
  requester_id: string;
  message: string;
  status: MarketplacePickupRequest['status'];
  created_at: string;
};

export type MarketplaceDraft = {
  title: string;
  description: string;
  priceGhs?: number;
  imageUrl?: string;
  availability: MarketplaceAvailability;
  pickupArea: string;
  pickupNotes?: string;
};

function mapListing(row: ListingRow, sellerName = 'Neighbor'): MarketplaceListing {
  return {
    id: row.id,
    neighborhoodId: row.neighborhood_id,
    sellerId: row.seller_id,
    sellerName,
    title: row.title,
    description: row.description,
    priceGhs: row.price_ghs ?? undefined,
    imageUrl: row.image_url ?? undefined,
    availability: row.availability,
    pickupArea: row.pickup_area,
    pickupNotes: row.pickup_notes ?? undefined,
    moderationStatus: row.moderation_status,
    createdAt: row.created_at,
  };
}

function mapPickupRequest(row: PickupRequestRow, requesterName = 'Neighbor'): MarketplacePickupRequest {
  return {
    id: row.id,
    listingId: row.listing_id,
    requesterId: row.requester_id,
    requesterName,
    message: row.message,
    status: row.status,
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

export async function getMarketplaceNeighborhood(): Promise<CurrentNeighborhood> {
  const context = getActiveLocationContext();
  return {
    id: context.neighborhoodId,
    name: context.neighborhoodName,
  };
}

export async function listMarketplaceListings(neighborhoodId: string): Promise<MarketplaceListing[]> {
  assertSupabaseConfigured();

  const { data, error } = await supabase
    .from('marketplace_listings')
    .select(
      'id, neighborhood_id, seller_id, title, description, price_ghs, image_url, availability, pickup_area, pickup_notes, moderation_status, created_at',
    )
    .eq('neighborhood_id', neighborhoodId)
    .neq('moderation_status', 'blocked')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;

  const rows = (data ?? []) as ListingRow[];
  const names = await profileNames(rows.map((row) => row.seller_id));
  return rows.map((row) => mapListing(row, names.get(row.seller_id)));
}

export async function getMarketplaceListing(listingId: string): Promise<MarketplaceListing> {
  assertSupabaseConfigured();

  const { data, error } = await supabase
    .from('marketplace_listings')
    .select(
      'id, neighborhood_id, seller_id, title, description, price_ghs, image_url, availability, pickup_area, pickup_notes, moderation_status, created_at',
    )
    .eq('id', listingId)
    .neq('moderation_status', 'blocked')
    .single();

  if (error) throw error;

  const row = data as ListingRow;
  const names = await profileNames([row.seller_id]);
  return mapListing(row, names.get(row.seller_id));
}

export async function createMarketplaceListing(
  neighborhoodId: string,
  draft: MarketplaceDraft,
): Promise<MarketplaceListing> {
  assertSupabaseConfigured();
  const profile = await getCurrentProfile();

  const { data, error } = await supabase
    .from('marketplace_listings')
    .insert({
      neighborhood_id: neighborhoodId,
      seller_id: profile.id,
      title: draft.title.trim(),
      description: draft.description.trim(),
      price_ghs: draft.priceGhs ?? null,
      image_url: draft.imageUrl?.trim() || null,
      availability: draft.availability,
      pickup_area: draft.pickupArea.trim(),
      pickup_notes: draft.pickupNotes?.trim() || null,
      moderation_status: 'not_run',
    })
    .select(
      'id, neighborhood_id, seller_id, title, description, price_ghs, image_url, availability, pickup_area, pickup_notes, moderation_status, created_at',
    )
    .single();

  if (error) throw error;
  return mapListing(data as ListingRow, profile.displayName);
}

export async function createMarketplacePickupRequest(
  listingId: string,
  message: string,
): Promise<MarketplacePickupRequest> {
  assertSupabaseConfigured();
  const profile = await getCurrentProfile();

  const { data, error } = await supabase
    .from('marketplace_pickup_requests')
    .insert({
      listing_id: listingId,
      requester_id: profile.id,
      message: message.trim(),
      status: 'open',
    })
    .select('id, listing_id, requester_id, message, status, created_at')
    .single();

  if (error) throw error;
  return mapPickupRequest(data as PickupRequestRow, profile.displayName);
}

export async function listMyMarketplacePickupRequests(): Promise<MarketplacePickupRequest[]> {
  assertSupabaseConfigured();
  const profile = await getCurrentProfile();

  const { data, error } = await supabase
    .from('marketplace_pickup_requests')
    .select('id, listing_id, requester_id, message, status, created_at')
    .eq('requester_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw error;

  const rows = (data ?? []) as PickupRequestRow[];
  return rows.map((row) => mapPickupRequest(row, profile.displayName));
}
