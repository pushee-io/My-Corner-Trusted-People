import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect, type Href } from 'expo-router';
import { useCallback, useRef, useState, type PropsWithChildren } from 'react';
import { Image, Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { AICharacterPresentation } from '@/components/AICharacterPresentation';
import { MyCornerLogo } from '@/components/brand/MyCornerLogo';
import { CommunicationActions } from '@/components/CommunicationActions';
import { useAICharacter } from '@/hooks/useAICharacter';
import { IconButton } from '@/components/IconButton';
import { WebSafeLink } from '@/components/WebSafeLink';
import { MediaAvatar } from '@/components/media/MediaAvatar';
import { tokens } from '@/theme/tokens';
import type { MarketplaceListing, NeighborhoodFeedPost } from '@/types/contracts';
import type { AgencyBroadcast } from '@/types/day3';
import type { HomeGroup, HomeEvent } from '@/lib/home-dashboard';
import { formatEventDate } from '@/lib/events-format';

export function HomeHeader({
  location,
  unread,
  notifications,
}: {
  location: string;
  unread?: number;
  notifications?: number;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.brand}>
        <View style={styles.location}>
          <Ionicons name="location-sharp" size={14} color={tokens.color.primary} accessible={false} />
          <Text style={styles.metadata}>{location}</Text>
        </View>
        <MyCornerLogo home />
      </View>
      <CommunicationActions unread={unread} notifications={notifications} />
    </View>
  );
}

export function HomeAICard({
  neighborhood,
  available,
  loading,
}: {
  neighborhood?: string;
  available: boolean;
  loading: boolean;
}) {
  const { character } = useAICharacter();
  const navigating = useRef(false);
  useFocusEffect(
    useCallback(() => {
      navigating.current = false;
    }, []),
  );
  const [question, setQuestion] = useState('');
  const enabled = available && question.trim().length >= 3;
  function send() {
    if (!enabled || navigating.current) return;
    navigating.current = true;
    Keyboard.dismiss();
    router.push({
      pathname: '/ask',
      params: { question: question.trim().slice(0, 600), fromHome: '1', submission: String(Date.now()) },
    });
    setQuestion('');
  }
  return (
    <View style={styles.aiCard}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open Ask My Corner AI"
        onPress={() => {
          Keyboard.dismiss();
          router.push('/ask');
        }}
        style={styles.aiHeading}
      >
        <AICharacterPresentation character={character} />
        <View style={styles.flex}>
          <Text accessibilityRole="header" style={styles.aiTitle}>
            Ask My Corner AI
          </Text>
          <Text style={styles.aiGreeting}>
            {loading
              ? 'Checking your neighborhood…'
              : available
                ? `How can I help you today${neighborhood ? ` in ${neighborhood}` : ''}?`
                : 'Neighborhood AI is currently unavailable.'}
          </Text>
        </View>
      </Pressable>
      <View style={styles.aiInputRow}>
        <TextInput
          accessibilityLabel="Ask My Corner AI question"
          placeholder="Ask anything about your neighborhood…"
          placeholderTextColor={tokens.color.textSecondary}
          value={question}
          onChangeText={setQuestion}
          maxLength={600}
          editable={available}
          returnKeyType="send"
          onSubmitEditing={send}
          style={styles.aiInput}
        />
        <IconButton icon="arrow-forward" label="Send neighborhood question" disabled={!enabled} onPress={send} />
      </View>
    </View>
  );
}

export function HomeHireAction() {
  return (
    <WebSafeLink href="/hire/categories" asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Hire Trusted Local Help"
        style={({ pressed }) => [styles.hire, pressed && styles.hirePressed]}
      >
        <Ionicons name="construct-outline" size={22} color={tokens.color.onPrimary} accessible={false} />
        <Text style={styles.hireText}>Hire Trusted Local Help</Text>
      </Pressable>
    </WebSafeLink>
  );
}

export function HomeSection({ title, href, children }: PropsWithChildren<{ title: string; href: Href }>) {
  return (
    <View style={styles.section}>
      <WebSafeLink href={href} asChild>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Open ${title.toLowerCase()}`}
          style={styles.sectionHeading}
        >
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            {title}
          </Text>
          <Ionicons name="chevron-forward" size={18} color={tokens.color.textSecondary} accessible={false} />
        </Pressable>
      </WebSafeLink>
      {children}
    </View>
  );
}

export function HomeSectionState({
  loading,
  error,
  empty,
  onRetry,
}: {
  loading?: boolean;
  error?: string;
  empty: string;
  onRetry: () => void;
}) {
  return (
    <View style={styles.card}>
      <Text accessibilityLiveRegion="polite" style={styles.metadata}>
        {loading ? 'Loading neighborhood updates…' : error ? 'Updates unavailable. Please try again.' : empty}
      </Text>
      {error ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Retry updates" onPress={onRetry} style={styles.retry}>
          <Text style={styles.link}>Retry</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function Thumbnail({ uri, label, style }: { uri?: string; label: string; style: typeof styles.thumbnail }) {
  const [failed, setFailed] = useState<string>();
  return uri && uri !== failed ? (
    <Image
      source={{ uri }}
      accessibilityLabel={label}
      style={style}
      resizeMode="cover"
      onError={() => setFailed(uri)}
    />
  ) : (
    <View style={[style, styles.imageFallback]} accessibilityLabel="No photo available">
      <Ionicons name="image-outline" size={24} color={tokens.color.textSecondary} accessible={false} />
    </View>
  );
}

export function HomeFeedPreview({ post, image }: { post: NeighborhoodFeedPost; image?: string }) {
  return (
    <WebSafeLink href={{ pathname: '/community', params: { postId: post.id } }} asChild>
      <Pressable accessibilityRole="button" accessibilityLabel={`Open post by ${post.authorName}`} style={styles.card}>
        <View style={styles.authorRow}>
          <MediaAvatar profileId={post.authorId} name={post.authorName} size={34} />
          <View style={styles.flex}>
            <Text numberOfLines={1} style={styles.author}>
              {post.authorName}
            </Text>
            <Text style={styles.caption}>{new Date(post.createdAt).toLocaleString('en-GH')}</Text>
          </View>
        </View>
        <View style={styles.feedBody}>
          <Text numberOfLines={3} ellipsizeMode="tail" style={[styles.body, styles.flex]}>
            {post.body}
          </Text>
          {image ? <Thumbnail uri={image} label="Post preview" style={styles.thumbnail} /> : null}
        </View>
        <View style={styles.engagement}>
          <View style={styles.actions}>
            <Ionicons
              name={post.likedByMe ? 'heart' : 'heart-outline'}
              size={17}
              color={tokens.color.primary}
              accessible={false}
            />
            <Text style={styles.caption}>{post.likeCount} likes</Text>
            <Ionicons name="chatbubble-outline" size={16} color={tokens.color.textSecondary} accessible={false} />
            <Text style={styles.caption}>{post.comments.length} comments</Text>
          </View>
          <Text style={styles.link}>More</Text>
        </View>
      </Pressable>
    </WebSafeLink>
  );
}

export function HomeMarketplaceShowcase({ listings }: { listings: MarketplaceListing[] }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.marketRow}>
      {listings.map((listing) => (
        <WebSafeLink
          key={listing.id}
          href={{ pathname: '/marketplace/listing/[listingId]', params: { listingId: listing.id } }}
          asChild
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Open listing: ${listing.title}`}
            style={styles.listing}
          >
            <Thumbnail uri={listing.imageUrl} label={listing.title} style={styles.listingImage} />
            <View style={styles.listingText}>
              <Text numberOfLines={2} style={styles.author}>
                {listing.title}
              </Text>
              <Text style={styles.price}>
                {typeof listing.priceGhs === 'number' ? `GHS ${listing.priceGhs.toFixed(2)}` : 'Free or negotiable'}
              </Text>
            </View>
          </Pressable>
        </WebSafeLink>
      ))}
    </ScrollView>
  );
}

export function HomeGroupsPreview({ groups }: { groups: HomeGroup[] }) {
  return (
    <View style={styles.previewList}>
      {groups.map((group) => (
        <WebSafeLink key={group.id} href={{ pathname: '/groups/[groupId]', params: { groupId: group.id } }} asChild>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Open group: ${group.name}`}
            style={({ pressed }) => [styles.card, styles.previewRow, pressed && styles.previewPressed]}
          >
            {group.image ? (
              <Thumbnail uri={group.image} label={group.name} style={styles.thumbnail} />
            ) : (
              <View style={styles.previewIcon}>
                <Ionicons name="people-outline" size={26} color={tokens.color.primary} accessible={false} />
              </View>
            )}
            <View style={[styles.flex, styles.previewCopy]}>
              <Text numberOfLines={2} style={styles.previewTitle}>
                {group.name}
              </Text>
              <Text numberOfLines={2} style={styles.metadata}>
                {group.description}
              </Text>
              <Text style={styles.link}>
                {group.memberCount} members{group.isMember ? ' · You’re a member' : ''}
              </Text>
            </View>
          </Pressable>
        </WebSafeLink>
      ))}
    </View>
  );
}

export function HomeEventsPreview({ events }: { events: HomeEvent[] }) {
  return (
    <View style={styles.previewList}>
      {events.map((event) => (
        <WebSafeLink key={event.id} href={{ pathname: '/events/[eventId]', params: { eventId: event.id } }} asChild>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Open event: ${event.title}`}
            style={({ pressed }) => [styles.card, styles.previewRow, pressed && styles.previewPressed]}
          >
            <View style={[styles.previewIcon, styles.eventIcon]}>
              <Ionicons name="calendar-outline" size={26} color={tokens.color.primary} accessible={false} />
            </View>
            <View style={[styles.flex, styles.previewCopy]}>
              <Text style={styles.link}>{formatEventDate(event.startsAt, event.timezone)}</Text>
              <Text numberOfLines={2} style={styles.previewTitle}>
                {event.title}
              </Text>
              <Text numberOfLines={2} style={styles.metadata}>
                {event.areaLabel}
              </Text>
              {event.isGoing ? <Text style={styles.link}>You’re going</Text> : null}
            </View>
          </Pressable>
        </WebSafeLink>
      ))}
    </View>
  );
}

export function HomeBroadcastPreview({ broadcast }: { broadcast: AgencyBroadcast }) {
  return (
    <WebSafeLink href={{ pathname: '/agency-broadcasts', params: { broadcastId: broadcast.id } }} asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open broadcast: ${broadcast.title}`}
        style={[styles.card, styles.broadcast]}
      >
        <View style={styles.authorRow}>
          <View style={styles.megaphone}>
            <Ionicons name="megaphone-outline" size={24} color={tokens.color.primary} accessible={false} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.caption}>{broadcast.agencyName}</Text>
            <Text numberOfLines={2} style={styles.author}>
              {broadcast.title}
            </Text>
          </View>
        </View>
        <Text numberOfLines={2} style={styles.body}>
          {broadcast.body}
        </Text>
      </Pressable>
    </WebSafeLink>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 4 },
  brand: { flexGrow: 1, flexShrink: 1, minWidth: 150 },
  location: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  metadata: { color: tokens.color.textSecondary, fontSize: 13, lineHeight: 19 },
  caption: { color: tokens.color.textSecondary, fontSize: 12, lineHeight: 18 },
  actions: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  flex: { flex: 1, minWidth: 0 },
  aiCard: { backgroundColor: '#144C43', borderRadius: 16, padding: 12, gap: 10 },
  aiHeading: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  aiTitle: { color: '#FFFFFF', fontSize: 18, lineHeight: 24, fontWeight: '700' },
  aiGreeting: { color: '#FFFFFF', fontSize: 14, lineHeight: 20 },
  aiInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingLeft: 12,
  },
  aiInput: { flex: 1, minWidth: 0, minHeight: 48, color: tokens.color.textPrimary, fontSize: 14, paddingVertical: 10 },
  hire: {
    minHeight: 50,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 12,
    backgroundColor: tokens.color.primary,
  },
  hirePressed: { backgroundColor: tokens.color.primaryPressed },
  hireText: { flexShrink: 1, color: tokens.color.onPrimary, fontSize: 16, lineHeight: 22, fontWeight: '700' },
  section: { gap: 4 },
  sectionHeading: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  sectionTitle: {
    flex: 1,
    color: tokens.color.ink,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.7,
    fontWeight: '800',
  },
  card: {
    backgroundColor: tokens.color.surface,
    borderWidth: 1,
    borderColor: tokens.color.borderSubtle,
    borderRadius: 14,
    padding: 12,
    gap: 8,
  },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  author: { color: tokens.color.textPrimary, fontSize: 14, lineHeight: 20, fontWeight: '600' },
  body: { color: tokens.color.textPrimary, fontSize: 14, lineHeight: 20 },
  feedBody: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  thumbnail: { width: 64, height: 64, borderRadius: 8 },
  imageFallback: { backgroundColor: tokens.color.surfaceMuted, alignItems: 'center', justifyContent: 'center' },
  engagement: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 },
  link: { color: tokens.color.primary, fontSize: 14, lineHeight: 20, fontWeight: '600' },
  marketRow: { gap: 10, paddingBottom: 2 },
  listing: {
    width: 138,
    borderWidth: 1,
    borderColor: tokens.color.borderSubtle,
    borderRadius: 12,
    backgroundColor: tokens.color.surface,
    overflow: 'hidden',
  },
  listingImage: { width: 136, height: 88, borderRadius: 0 },
  listingText: { padding: 8, gap: 4 },
  price: { color: tokens.color.primary, fontSize: 13, lineHeight: 19, fontWeight: '700' },
  broadcast: { backgroundColor: '#F6F8F5' },
  previewList: { gap: 8 },
  previewRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  previewCopy: { gap: 4 },
  previewTitle: { color: tokens.color.textPrimary, fontSize: 15, lineHeight: 21, fontWeight: '700' },
  previewIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#EAF4EF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventIcon: { backgroundColor: '#F5F0E5' },
  previewPressed: { backgroundColor: tokens.color.surfacePressed },
  megaphone: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#EBF0E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  retry: { minHeight: 48, justifyContent: 'center', alignSelf: 'flex-start', paddingHorizontal: 8 },
});
