import fs from 'node:fs';

const migrationPath = '../supabase/migrations/20260824120000_marketplace_media_pickup_messages.sql';

describe('Marketplace media, pickup, and messaging vertical slice', () => {
  const repository = fs.readFileSync('src/lib/marketplace-repository.ts', 'utf8');
  const listScreen = fs.readFileSync('app/marketplace.tsx', 'utf8');
  const detailScreen = fs.readFileSync('app/marketplace/listing/[listingId].tsx', 'utf8');
  const messagesScreen = fs.readFileSync('app/messages.tsx', 'utf8');
  const migration = fs.readFileSync(migrationPath, 'utf8');

  it('uses the shared eight-photo policy and private listing image bucket', () => {
    expect(listScreen).toContain("getMediaPipelinePolicy('marketplace_listing')");
    expect(listScreen).toContain('selectionLimit: remaining');
    expect(repository).toContain("new File(attachment.localUri).arrayBuffer()");
    expect(repository).toContain(".from('listing-images')");
    expect(repository).toContain(".from('marketplace_listing_images')");
    expect(migration).toContain("'listing-images',\n  'listing-images',\n  false");
  });

  it('keeps precise pickup details out of public listings and messages', () => {
    expect(repository).toContain('pickup_notes: null');
    expect(migration).toContain('marketplace_pickup_private_details');
    expect(repository).toContain("supabase.rpc('get_marketplace_pickup_private_details'");
    expect(migration).toContain('marketplace_pickup_private_access_audit');
    expect(migration).toContain("pr.status in ('confirmed', 'completed')");
    expect(migration).toContain('public.current_profile_id() in (pr.requester_id, ml.seller_id)');
    expect(migration).toContain('marketplace_message_privacy_guard');
    expect(migration).toContain('revoke update on public.marketplace_pickup_requests from authenticated');
  });

  it('implements explicit pickup transitions through a database RPC', () => {
    expect(repository).toContain("supabase.rpc('respond_to_marketplace_pickup_request'");
    expect(migration).toContain("action = 'accept'");
    expect(migration).toContain("action = 'confirm'");
    expect(migration).toContain("action = 'decline'");
    expect(migration).toContain("action = 'cancel'");
    expect(migration).toContain("action = 'complete'");
    expect(migration).toContain("availability = 'reserved'");
    expect(migration).toContain("availability = 'collected'");
    expect(detailScreen).toContain('Confirm private pickup details');
  });

  it('scopes each conversation to one pickup request and its participants', () => {
    expect(migration).toContain('pickup_request_id uuid not null unique');
    expect(migration).toContain('public.current_profile_id() in (buyer_profile_id, seller_profile_id)');
    expect(messagesScreen).toContain('useLocalSearchParams');
    expect(messagesScreen).toContain('listMarketplaceMessages(requestId)');
    expect(messagesScreen).toContain('sendMarketplaceMessage(requestId, trimmed)');
    expect(messagesScreen).toContain('not end-to-end encrypted');
  });
});
