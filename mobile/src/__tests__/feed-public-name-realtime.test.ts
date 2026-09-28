import { subscribeToNeighborhoodFeedPosts } from '@/lib/community-repository';
import { invalidateMediaSession } from '@/lib/media-session';
import { supabase } from '@/lib/supabase';
jest.mock('@/lib/auth', () => ({ getCurrentProfile: jest.fn() }));
jest.mock('@/lib/supabase', () => ({
  assertSupabaseConfigured: jest.fn(),
  supabase: { channel: jest.fn(), removeChannel: jest.fn(), rpc: jest.fn(), from: jest.fn() },
}));
const client = supabase as unknown as { channel: jest.Mock; removeChannel: jest.Mock; rpc: jest.Mock; from: jest.Mock };
const row = {
  id: 'post-one',
  author_id: 'author-one',
  neighborhood_id: 'east-legon',
  body: 'Post',
  moderation_status: 'clean',
  created_at: '2026-09-27T12:00:00Z',
};
function setup() {
  const handlers: Record<string, (payload: { new: Record<string, unknown> }) => void> = {};
  const channel = { on: jest.fn(), subscribe: jest.fn() };
  channel.on.mockImplementation((_event, config, callback) => {
    handlers[`${config.table}:${config.event}`] = callback;
    return channel;
  });
  channel.subscribe.mockReturnValue(channel);
  client.channel.mockReturnValue(channel);
  const post = jest.fn();
  const comment = jest.fn();
  const error = jest.fn();
  const stop = subscribeToNeighborhoodFeedPosts('east-legon', post, comment, jest.fn(), jest.fn(), error, jest.fn());
  return { handlers, post, comment, error, stop };
}
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));
describe('Feed public author realtime authorization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it.each(['unsubscribe', 'account change', 'blocked update'])(
    'does not publish an in-flight name after %s',
    async (reason) => {
      let resolve!: (value: unknown) => void;
      client.rpc.mockReturnValue(
        new Promise((done) => {
          resolve = done;
        }),
      );
      const h = setup();
      h.handlers['neighborhood_feed_posts:INSERT']({ new: row });
      expect(client.rpc).toHaveBeenCalledWith('feed_author_names', { post_ids: ['post-one'], comment_ids: [] });
      if (reason === 'unsubscribe') h.stop();
      if (reason === 'account change') invalidateMediaSession();
      if (reason === 'blocked update')
        h.handlers['neighborhood_feed_posts:UPDATE']({ new: { ...row, moderation_status: 'blocked' } });
      resolve({ data: [{ id: 'author-one', name: 'Approved Public Name' }], error: null });
      await flush();
      expect(h.post).not.toHaveBeenCalled();
      expect(h.error).not.toHaveBeenCalled();
    },
  );
  it('does not publish realtime content when the author reference is unauthorized', async () => {
    client.rpc.mockResolvedValue({ data: [], error: null });
    const h = setup();
    h.handlers['neighborhood_feed_posts:INSERT']({ new: row });
    await flush();
    expect(h.post).not.toHaveBeenCalled();
    expect(client.from).not.toHaveBeenCalled();
    h.stop();
  });
  it('suppresses an in-flight comment when its parent becomes hidden', async () => {
    let resolve!: (value: unknown) => void;
    client.rpc.mockReturnValue(
      new Promise((done) => {
        resolve = done;
      }),
    );
    const h = setup();
    h.handlers['neighborhood_feed_comments:INSERT']({ new: { ...row, id: 'comment-one', post_id: 'post-one' } });
    h.handlers['neighborhood_feed_posts:UPDATE']({ new: { ...row, moderation_status: 'blocked' } });
    resolve({ data: [{ id: 'author-one', name: 'Approved Public Name' }], error: null });
    await flush();
    expect(h.comment).not.toHaveBeenCalled();
    h.stop();
  });
});
