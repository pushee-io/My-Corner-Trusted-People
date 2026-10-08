import { contentPublicNames, contentPublicNameAfterWrite } from '@/lib/content-public-names';
import { supabase } from '@/lib/supabase';
import { invalidateMediaSession } from '@/lib/media-session';
import { listMarketplaceListings, listMarketplacePickupRequestsForListing } from '@/lib/marketplace-repository';
jest.mock('expo-file-system', () => ({ File: jest.fn() }));
jest.mock('@/lib/auth', () => ({ getCurrentProfile: jest.fn() }));
jest.mock('@/lib/supabase', () => ({
  assertSupabaseConfigured: jest.fn(),
  supabase: { rpc: jest.fn(), from: jest.fn() },
}));
const rpc = supabase.rpc as jest.Mock;
function query(data: unknown) {
  const q: Record<string, unknown> = {
    then: (resolve: (v: unknown) => unknown) => Promise.resolve({ data, error: null }).then(resolve),
  };
  for (const name of ['select', 'eq', 'neq', 'in', 'order', 'limit']) q[name] = jest.fn(() => q);
  return q;
}
beforeEach(() => {
  jest.clearAllMocks();
  rpc.mockResolvedValue({ data: [], error: null } as never);
});
it('batches content references and uses only canonical approved names', async () => {
  rpc.mockResolvedValue({ data: [{ id: 'peer', name: 'Approved name', legal_name: 'SECRET' }], error: null } as never);
  const result = await contentPublicNames(
    'marketplace_listing',
    Array.from({ length: 205 }, (_, i) => `listing-${i}`),
  );
  expect(rpc).toHaveBeenCalledTimes(3);
  expect(rpc.mock.calls.map((c) => (c[1] as { content_ids: string[] }).content_ids.length)).toEqual([100, 100, 5]);
  expect([...result]).toEqual([['peer', 'Approved name']]);
});
it('resolves a seller for a different viewer without reading profiles or legal identity', async () => {
  jest
    .mocked(supabase.from)
    .mockImplementation(
      (table) =>
        query(table === 'marketplace_listings' ? [{ id: 'listing', seller_id: 'seller', title: 'Item' }] : []) as never,
    );
  rpc.mockResolvedValue({ data: [{ id: 'seller', name: 'Canonical seller' }], error: null } as never);
  expect(await listMarketplaceListings('hood')).toEqual([expect.objectContaining({ sellerName: 'Canonical seller' })]);
  expect(rpc).toHaveBeenCalledWith('content_public_names', { kind: 'marketplace_listing', content_ids: ['listing'] });
  expect(supabase.from).not.toHaveBeenCalledWith('profiles');
});
it('hydrates buyer identities on authorized pickup requests with a legitimate Neighbor fallback', async () => {
  jest.mocked(supabase.from).mockReturnValue(
    query([
      { id: 'pickup', requester_id: 'buyer' },
      { id: 'other', requester_id: 'unnamed' },
    ]) as never,
  );
  rpc.mockImplementation(
    async (name) =>
      ({
        data: name === 'content_public_names' ? [{ id: 'buyer', name: 'Canonical buyer' }] : [],
        error: null,
      }) as never,
  );
  expect((await listMarketplacePickupRequestsForListing('listing')).map((r) => r.requesterName)).toEqual([
    'Canonical buyer',
    'Neighbor',
  ]);
});
it('rejects name responses after an account switch', async () => {
  rpc.mockImplementation(async () => {
    invalidateMediaSession();
    return { data: [{ id: 'old', name: 'Previous account peer' }], error: null } as never;
  });
  await expect(contentPublicNames('group_post', ['post'])).rejects.toThrow('account changed');
});
it('propagates read errors and does not turn successful content writes into duplicate retries', async () => {
  rpc.mockResolvedValue({ data: null, error: { message: 'unavailable' } } as never);
  await expect(contentPublicNames('event', ['event'])).rejects.toEqual({ message: 'unavailable' });
  await expect(contentPublicNameAfterWrite('group_comment', 'comment', 'author')).resolves.toBe('Neighbor');
});
