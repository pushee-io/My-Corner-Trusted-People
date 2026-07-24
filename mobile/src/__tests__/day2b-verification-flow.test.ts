import {
  createDay2BLocalPost,
  getDay2BFeedUnlockStatus,
  listDay2BNeighborhoodPosts,
} from '@/lib/day2b-verification';

describe('Day 2B live Supabase verification flow', () => {
  it('keeps the neighborhood feed locked when Supabase is not configured', async () => {
    const unlock = await getDay2BFeedUnlockStatus();
    const posts = await listDay2BNeighborhoodPosts();
    const createdPost = await createDay2BLocalPost('Hello neighbors');

    expect(unlock).toMatchObject({
      configured: false,
      data: {
        status: 'locked',
        canRead: false,
        canPost: false,
      },
    });
    expect(posts).toMatchObject({ configured: false, data: [] });
    expect(createdPost).toMatchObject({ configured: false });
  });
});
