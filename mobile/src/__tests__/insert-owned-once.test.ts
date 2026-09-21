import { insertOwnedOnce } from '@/lib/insert-owned-once';
import { supabase } from '@/lib/supabase';
jest.mock('@/lib/supabase', () => ({ supabase: { from: jest.fn() } }));
const from = jest.mocked(supabase.from);
function query(data: unknown, error: unknown = null) {
  const chain = { select: jest.fn(), eq: jest.fn(), insert: jest.fn(), maybeSingle: jest.fn(), single: jest.fn() };
  chain.select.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  chain.insert.mockReturnValue(chain);
  chain.single.mockResolvedValue({ data, error });
  chain.maybeSingle.mockResolvedValue({ data, error });
  from.mockReturnValueOnce(chain as unknown as ReturnType<typeof supabase.from>);
  return chain;
}
const save = () => insertOwnedOnce('posts', { body: 'Original' }, 'id,body', 'author_id', 'owner', 'stable-id');
beforeEach(() => from.mockReset());
it('returns the existing owned row after a lost INSERT acknowledgement', async () => {
  const q = query({ id: 'stable-id', body: 'Original' });
  await expect(save()).resolves.toMatchObject({ reused: true, row: { id: 'stable-id' } });
  expect(q.eq.mock.calls).toEqual([
    ['id', 'stable-id'],
    ['author_id', 'owner'],
  ]);
  expect(q.insert).not.toHaveBeenCalled();
});
it('reconciles a concurrent insert collision without updating the row', async () => {
  query(null);
  const write = query(null, { code: '23505' });
  query({ id: 'stable-id' });
  await expect(save()).resolves.toMatchObject({ reused: true });
  expect(write.insert).toHaveBeenCalledWith({ id: 'stable-id', body: 'Original' });
});
it('does not treat a collision with a different owner as success', async () => {
  query(null);
  query(null, { code: '23505' });
  query(null);
  await expect(save()).rejects.toMatchObject({ code: '23505' });
});
it('propagates read permission failures without attempting an insert', async () => {
  query(null, { code: '42501' });
  await expect(save()).rejects.toMatchObject({ code: '42501' });
  expect(from).toHaveBeenCalledTimes(1);
});
