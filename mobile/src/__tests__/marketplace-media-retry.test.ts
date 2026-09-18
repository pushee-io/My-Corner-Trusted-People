import { createMarketplaceListing } from '@/lib/marketplace-repository';
import { supabase } from '@/lib/supabase';
import { insertOwnedOnce } from '@/lib/insert-owned-once';
jest.mock('expo-file-system', () => ({
  File: class {
    async arrayBuffer() {
      return new ArrayBuffer(12);
    }
  },
}));
jest.mock('@/lib/auth', () => ({ getCurrentProfile: async () => ({ id: 'seller', displayName: 'QA seller' }) }));
jest.mock('@/lib/insert-owned-once', () => ({ insertOwnedOnce: jest.fn() }));
const mockUpload = jest.fn();
const mockRemove = jest.fn();
const mockSigned = jest.fn(async () => ({ data: [{ signedUrl: 'https://example.invalid/photo' }], error: null }));
jest.mock('@/lib/supabase', () => ({
  assertSupabaseConfigured: jest.fn(),
  supabase: {
    from: jest.fn(),
    storage: { from: () => ({ upload: mockUpload, remove: mockRemove, createSignedUrls: mockSigned }) },
  },
}));
const path = 'marketplace_listing/seller/stable-id/0.jpg';
const draft = {
  title: 'QA item',
  description: 'Fictional listing',
  pickupArea: 'General area',
  availability: 'available' as const,
  photos: [
    { uri: 'file:///photo.jpg', fileName: 'photo.jpg', mimeType: 'image/jpeg', byteSize: 12, width: 1, height: 1 },
  ],
};
const row = {
  id: 'stable-id',
  seller_id: 'seller',
  neighborhood_id: 'area',
  title: 'QA item',
  availability: 'available',
  price_ghs: null,
  image_url: null,
};
function query(data: unknown, error: unknown = null) {
  const chain = {
    select: jest.fn(),
    eq: jest.fn(),
    neq: jest.fn(),
    in: jest.fn(),
    order: jest.fn(),
    insert: jest.fn(),
    then: (resolve: (value: unknown) => unknown) => Promise.resolve({ data, error }).then(resolve),
  };
  for (const name of ['select', 'eq', 'neq', 'in', 'order', 'insert'] as const) chain[name].mockReturnValue(chain);
  jest.mocked(supabase.from).mockReturnValueOnce(chain as never);
  return chain;
}
beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(insertOwnedOnce).mockResolvedValue({ row, reused: true });
  mockUpload.mockResolvedValue({ error: null });
});
it('recovers a lost photo-row response without re-uploading or deleting a referenced photo', async () => {
  query([]);
  query(null, { message: 'response lost after insert' });
  await expect(createMarketplaceListing('area', draft, 'stable-id')).rejects.toThrow('Retry this submission');
  expect(mockUpload).toHaveBeenCalledWith(path, expect.any(ArrayBuffer), expect.objectContaining({ upsert: false }));
  expect(mockRemove).not.toHaveBeenCalled();
  query([{ object_path: path }]);
  query([{ id: 'seller', display_name: 'QA seller' }]);
  query([{ listing_id: 'stable-id', object_path: path, position: 0 }]);
  await expect(createMarketplaceListing('area', draft, 'stable-id')).resolves.toMatchObject({ id: 'stable-id' });
  expect(mockUpload).toHaveBeenCalledTimes(1);
  expect(mockRemove).not.toHaveBeenCalled();
  expect(insertOwnedOnce).toHaveBeenLastCalledWith(
    'marketplace_listings',
    expect.any(Object),
    expect.any(String),
    'seller_id',
    'seller',
    'stable-id',
  );
});
it('resumes a previously uploaded photo without overwriting when its acknowledgement was lost', async () => {
  query([]);
  query(null);
  query([]);
  query([{ listing_id: 'stable-id', object_path: path, position: 0 }]);
  mockUpload.mockResolvedValue({ error: { statusCode: '409', message: 'The resource already exists' } });
  await expect(createMarketplaceListing('area', draft, 'stable-id')).resolves.toMatchObject({ id: 'stable-id' });
  expect(mockRemove).not.toHaveBeenCalled();
});
