import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { getDay2BFeedUnlockStatus, listDay2BNeighborhoodPosts } from '@/lib/day2b-verification';
import { tokens } from '@/theme/tokens';
import type { FeedUnlockResult, NeighborhoodFeedPost } from '@/types/contracts';

export default function CommunityScreen() {
  const [unlock, setUnlock] = useState<FeedUnlockResult>();
  const [posts, setPosts] = useState<NeighborhoodFeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadFeed() {
    setLoading(true);
    const unlockResult = await getDay2BFeedUnlockStatus();
    const postResult = await listDay2BNeighborhoodPosts();

    setUnlock(unlockResult.data);
    setPosts(postResult.data ?? []);
    setError(unlockResult.error ?? postResult.error ?? '');
    setLoading(false);
  }

  useEffect(() => {
    void loadFeed();
  }, []);

  const canRead = unlock?.canRead === true;

  return (
    <Screen title="My Neighborhood">
      {loading ? <Text style={styles.body}>Checking verified neighborhood access...</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {canRead ? (
        <>
          <View style={styles.unlockedNotice}>
            <Text style={styles.sectionTitle}>{unlock?.title}</Text>
            <Text style={styles.body}>{unlock?.message}</Text>
          </View>

          <Link href="/community/new-post" asChild>
            <Pressable style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Create local post</Text>
            </Pressable>
          </Link>

          <Text style={styles.sectionTitle}>Private local posts</Text>

          {posts.length === 0 ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>No visible posts yet</Text>
              <Text style={styles.body}>RLS returned no posts for your verified neighborhood.</Text>
            </View>
          ) : (
            posts.map((post) => (
              <View key={post.id} style={styles.card}>
                <Text style={styles.cardTitle}>{post.authorDisplayName}</Text>
                <Text style={styles.body}>{post.body}</Text>
                <Text style={styles.meta}>Verified neighborhood only</Text>
              </View>
            ))
          )}
        </>
      ) : (
        <>
          <View style={styles.lockedNotice}>
            <Text style={styles.sectionTitle}>{unlock?.title ?? 'Feed locked'}</Text>
            <Text style={styles.body}>{unlock?.message ?? 'Sign in and complete residence verification.'}</Text>
            <Text style={styles.meta}>Server-side RLS decides whether private posts are readable.</Text>
          </View>

          <Link href="/profile/phone-verification" asChild>
            <Pressable style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Start resident verification</Text>
            </Pressable>
          </Link>
        </>
      )}

      <Text style={styles.sectionTitle}>Explore</Text>

      <Link href="/marketplace" asChild>
        <Pressable style={styles.linkButton}>
          <Text style={styles.linkText}>Marketplace</Text>
        </Pressable>
      </Link>

      <Link href="/recommendations" asChild>
        <Pressable style={styles.linkButton}>
          <Text style={styles.linkText}>Recommendations</Text>
        </Pressable>
      </Link>

      <Link href="/groups" asChild>
        <Pressable style={styles.linkButton}>
          <Text style={styles.linkText}>Groups</Text>
        </Pressable>
      </Link>

      <Link href="/agency-broadcasts" asChild>
        <Pressable style={styles.linkButton}>
          <Text style={styles.linkText}>Agency broadcasts</Text>
        </Pressable>
      </Link>

      <Link href="/report/evidence" asChild>
        <Pressable style={styles.linkButton}>
          <Text style={styles.linkText}>Report evidence</Text>
        </Pressable>
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  lockedNotice: {
    backgroundColor: '#FFF4D6',
    borderRadius: tokens.radius.md,
    gap: tokens.spacing.sm,
    padding: tokens.spacing.lg,
  },
  unlockedNotice: {
    backgroundColor: '#EEF7F4',
    borderColor: tokens.color.success,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    gap: tokens.spacing.sm,
    padding: tokens.spacing.lg,
  },
  primaryButton: {
    minHeight: tokens.touch.min,
    justifyContent: 'center',
    backgroundColor: tokens.color.primary,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '700',
  },
  sectionTitle: {
    color: tokens.color.textPrimary,
    fontSize: tokens.type.card,
    fontWeight: '800',
  },
  linkButton: {
    minHeight: tokens.touch.min,
    justifyContent: 'center',
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.primary,
    borderWidth: 1,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
  },
  linkText: {
    color: tokens.color.primary,
    textAlign: 'center',
    fontWeight: '700',
  },
  card: {
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderWidth: 1,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
    gap: tokens.spacing.xs,
  },
  cardTitle: {
    color: tokens.color.textPrimary,
    fontSize: tokens.type.card,
    fontWeight: '700',
  },
  body: {
    color: tokens.color.textPrimary,
    fontSize: tokens.type.body,
  },
  meta: {
    color: tokens.color.textSecondary,
    fontSize: tokens.type.support,
  },
  error: {
    color: tokens.color.error,
    fontSize: tokens.type.support,
    fontWeight: '700',
  },
});
