import type { NeighborhoodFeedPost } from '@/types/contracts';

// Share a navigation pointer only. The Feed route rechecks membership/RLS.
// No post text, name, media, neighborhood ID or private metadata leaves the app.
export function feedShareLink(post: NeighborhoodFeedPost) {
  if (post.moderationStatus !== 'clean' || post.visibility === 'moderator_only' || !post.id) return undefined;
  return {
    title: 'My Corner',
    message: `Open this post in My Corner. Sign-in and neighborhood access are required.\nmycorner://community?postId=${encodeURIComponent(post.id)}`,
  };
}
