import { messagingApi, sendChatMessage, loadNotifications, notificationApi } from '@/lib/messaging';
import { invalidateMediaSession } from '@/lib/media-session';
const mockRpc = jest.fn();
jest.mock('@/lib/supabase', () => ({ supabase: { rpc: (...args: unknown[]) => mockRpc(...args) } }));
beforeEach(() => mockRpc.mockReset());
it('retries the same nonce and text after an uncertain send without generating a second identity', async () => {
  mockRpc
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValueOnce({ data: { id: 'message', seq: 7 }, error: null });
  await expect(sendChatMessage('thread', '  Hello neighbor  ', 'stable-nonce')).rejects.toThrow('offline');
  await expect(sendChatMessage('thread', '  Hello neighbor  ', 'stable-nonce')).resolves.toEqual({
    id: 'message',
    seq: 7,
  });
  expect(mockRpc.mock.calls[0]).toEqual(mockRpc.mock.calls[1]);
  expect(mockRpc.mock.calls[1][1].payload).toEqual({ body: 'Hello neighbor', nonce: 'stable-nonce' });
});
it.each(['   ', 'x'.repeat(1001)])('rejects invalid message input before contacting the server', async (body) => {
  await expect(sendChatMessage('thread', body, 'nonce')).rejects.toThrow('1–1000');
  expect(mockRpc).not.toHaveBeenCalled();
});
it('does not expose a late response from the previous account', async () => {
  let finish!: (value: unknown) => void;
  mockRpc.mockReturnValue(
    new Promise((resolve) => {
      finish = resolve;
    }),
  );
  const pending = messagingApi('thread', 'private-thread');
  invalidateMediaSession();
  finish({ data: { body: 'old private data' }, error: null });
  await expect(pending).rejects.toThrow('account changed');
});
it('keeps server eligibility rejection authoritative', async () => {
  mockRpc.mockResolvedValue({ data: null, error: { code: '42501', message: 'Conversation unavailable.' } });
  await expect(sendChatMessage('blocked-thread', 'Hello', 'nonce')).rejects.toThrow('Conversation unavailable');
});

it('uses the shared notification projection and recipient-scoped read acknowledgement', async () => {
  mockRpc.mockResolvedValue({ data: [], error: null });
  await loadNotifications();
  expect(mockRpc).toHaveBeenLastCalledWith('notification_api', { action: 'list', target: null });
  await notificationApi('read', 'notice-id');
  expect(mockRpc).toHaveBeenLastCalledWith('notification_api', { action: 'read', target: 'notice-id' });
});
