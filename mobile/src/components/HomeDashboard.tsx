import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect, type Href } from 'expo-router';
import { useCallback, useRef, useState, type PropsWithChildren } from 'react';
import {
  Image,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type ImageStyle,
} from 'react-native';
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
import { useEventClock } from '@/hooks/useEventClock';
import { feedTimeLabel } from '@/lib/feed-time';
import { FeedShareAction } from '@/components/FeedPostActions';
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
        <AICharacterPresentation character={character} state={question.trim() ? 'listening' : 'idle'} />
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

function Thumbnail({ uri, label, style }: { uri?: string; label: string; style: StyleProp<ImageStyle> }) {
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
    <View style={[styles.card, styles.feedCard]}>
      <WebSafeLink href={{ pathname: '/community', params: { postId: post.id } }} asChild>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Open post by ${post.authorName}`}
          style={styles.feedContent}
        >
          <View style={styles.authorRow}>
            <MediaAvatar profileId={post.authorId} name={post.authorName} size={40} />
            <View style={styles.flex}>
              <Text numberOfLines={1} style={styles.author}>
                {post.authorName}
              </Text>
              <Text style={styles.caption}>{feedTimeLabel(post.createdAt)} · Neighborhood update</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={tokens.color.primary} accessible={false} />
          </View>
          <Text numberOfLines={3} ellipsizeMode="tail" style={styles.body}>
            {post.body}
          </Text>
          {image ? <Thumbnail uri={image} label="Post preview" style={styles.feedImage} /> : null}
          <View style={styles.engagement}>
            <View style={styles.actions}>
              <Ionicons
                name={post.likedByMe ? 'heart' : 'heart-outline'}
                size={17}
                color={tokens.color.primary}
                accessible={false}
              />
              <Text style={styles.caption}>
                {post.likeCount} {post.likeCount === 1 ? 'like' : 'likes'}
              </Text>
              <Ionicons name="chatbubble-outline" size={16} color={tokens.color.textSecondary} accessible={false} />
              <Text style={styles.caption}>
                {post.comments.length} {post.comments.length === 1 ? 'comment' : 'comments'}
              </Text>
            </View>
            <Text style={styles.link}>More →</Text>
          </View>
        </Pressable>
      </WebSafeLink>
      <View style={styles.feedFooter}>
        <Text style={styles.caption}>Join the conversation</Text>
        <FeedShareAction post={post} />
      </View>
    </View>
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

function PreviewArtwork({ uri, title, kind }: { uri?: string; title: string; kind: 'group' | 'event' }) {
  const [failed, setFailed] = useState<string>();
  if (uri && failed !== uri)
    return (
      <Image
        source={{ uri }}
        accessibilityLabel={`${title} ${kind === 'group' ? 'group image' : 'event image'}`}
        resizeMode="cover"
        style={styles.previewImage}
        onError={() => setFailed(uri)}
      />
    );
  return (
    <View
      style={[styles.previewImage, styles.artworkFallback, kind === 'event' && styles.eventFallback]}
      accessibilityLabel={`${title}, no photo yet`}
    >
      <View style={styles.artworkCircle} />
      <View style={styles.artworkCircleSmall} />
      <Ionicons
        name={kind === 'group' ? 'people-outline' : 'calendar-outline'}
        size={32}
        color={tokens.color.primary}
        accessible={false}
      />
      <Text style={styles.fallbackTitle}>
        {kind === 'group'
          ? title
              .split(/\s+/)
              .slice(0, 2)
              .map((word) => word[0])
              .join('')
              .toUpperCase()
          : 'Around the corner'}
      </Text>
    </View>
  );
}

export function HomeGroupsPreview({ groups }: { groups: HomeGroup[] }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.marketRow}>
      {groups.map((group) => (
        <WebSafeLink key={group.id} href={{ pathname: '/groups/[groupId]', params: { groupId: group.id } }} asChild>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Open group: ${group.name}`}
            style={({ pressed }) => [styles.previewCard, pressed && styles.previewPressed]}
          >
            <PreviewArtwork uri={group.image} title={group.name} kind="group" />
            <View style={styles.previewCardBody}>
              <View style={styles.authorRow}>
                {group.avatar && group.avatar !== group.image ? (
                  <Thumbnail uri={group.avatar} label={`${group.name} profile image`} style={styles.groupAvatar} />
                ) : null}
                <Text numberOfLines={2} style={[styles.previewTitle, styles.flex]}>
                  {group.name}
                </Text>
              </View>
              <Text numberOfLines={2} style={styles.metadata}>
                {group.description || 'Connect with neighbors who share your interests.'}
              </Text>
              <View style={styles.engagement}>
                <Text style={styles.caption}>
                  {group.memberCount} {group.memberCount === 1 ? 'member' : 'members'}
                </Text>
                {group.isMember ? <Text style={styles.membership}>You’re a member</Text> : null}
              </View>
              <View style={styles.previewCardAction}>
                <Text style={styles.link}>Explore group</Text>
                <Ionicons name="arrow-forward" size={18} color={tokens.color.primary} accessible={false} />
              </View>
            </View>
          </Pressable>
        </WebSafeLink>
      ))}
    </ScrollView>
  );
}

export function HomeEventsPreview({ events }: { events: HomeEvent[] }) {
  const now = useEventClock(events);
  const current = events.filter((event) => Date.parse(event.endsAt ?? event.startsAt) > now);
  if (!current.length)
    return (
      <View style={styles.card}>
        <Text style={styles.previewTitle}>Your next local plan starts here</Text>
        <Text style={styles.metadata}>
          No active or upcoming events. Explore Events for past gatherings or create a new plan.
        </Text>
      </View>
    );
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.marketRow}>
      {current.map((event) => (
        <WebSafeLink key={event.id} href={{ pathname: '/events/[eventId]', params: { eventId: event.id } }} asChild>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Open event: ${event.title}`}
            style={({ pressed }) => [styles.previewCard, pressed && styles.previewPressed]}
          >
            <PreviewArtwork uri={event.image} title={event.title} kind="event" />
            <View style={styles.previewCardBody}>
              <Text style={styles.eventDate}>{formatEventDate(event.startsAt, event.timezone)}</Text>
              <Text numberOfLines={2} style={styles.previewTitle}>
                {event.title}
              </Text>
              <View style={styles.authorRow}>
                <Ionicons name="location-outline" size={15} color={tokens.color.textSecondary} accessible={false} />
                <Text numberOfLines={2} style={[styles.metadata, styles.flex]}>
                  {event.areaLabel}
                </Text>
              </View>
              {Date.parse(event.startsAt) <= now ? (
                <Text style={styles.membership}>Happening now</Text>
              ) : event.isGoing ? (
                <Text style={styles.membership}>You’re going</Text>
              ) : null}
              <View style={styles.previewCardAction}>
                <Text style={styles.link}>View event</Text>
                <Ionicons name="arrow-forward" size={18} color={tokens.color.primary} accessible={false} />
              </View>
            </View>
          </Pressable>
        </WebSafeLink>
      ))}
    </ScrollView>
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
  feedCard: { padding: 0, overflow: 'hidden' },
  feedContent: { padding: 12, gap: 10 },
  feedImage: { width: '100%', height: 130, borderRadius: 10 },
  feedFooter: {
    borderTopWidth: 1,
    borderTopColor: tokens.color.borderSubtle,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },
  previewCard: {
    width: 252,
    backgroundColor: tokens.color.surface,
    borderWidth: 1,
    borderColor: tokens.color.borderSubtle,
    borderRadius: 16,
    overflow: 'hidden',
  },
  previewImage: { width: 250, height: 128 },
  previewCardBody: { padding: 12, gap: 8 },
  previewCardAction: {
    minHeight: 36,
    borderTopWidth: 1,
    borderTopColor: tokens.color.borderSubtle,
    paddingTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  groupAvatar: { width: 36, height: 36, borderRadius: 12 },
  membership: {
    color: tokens.color.primary,
    backgroundColor: '#EAF4EF',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 4,
    fontSize: 12,
    fontWeight: '600',
    alignSelf: 'flex-start',
    overflow: 'hidden',
  },
  eventDate: { color: tokens.color.primary, fontSize: 12, lineHeight: 18, fontWeight: '700' },
  artworkFallback: {
    backgroundColor: '#DCEAE2',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  eventFallback: { backgroundColor: '#F1E5CE' },
  artworkCircle: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#FFFFFF55',
    top: -60,
    right: -45,
  },
  artworkCircleSmall: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 12,
    borderColor: '#FFFFFF66',
    bottom: -45,
    left: -20,
  },
  fallbackTitle: { color: tokens.color.primary, fontSize: 16, fontWeight: '700' },
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
