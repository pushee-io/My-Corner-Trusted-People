import { Link, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { EmptyState, LoadingState } from '@/components/StateBlocks';
import {
  createMarketplacePickupRequest,
  getMarketplaceListing,
  getMarketplaceViewer,
  listMarketplacePickupRequestsForListing,
  respondToMarketplacePickupRequest,
} from '@/lib/marketplace-repository';
import { tokens } from '@/theme/tokens';
import type { MarketplaceListing, MarketplacePickupRequest } from '@/types/contracts';

function priceLabel(listing: MarketplaceListing) {
  return typeof listing.priceGhs === 'number' ? `GHS ${listing.priceGhs.toFixed(2)}` : 'Free or negotiable';
}

function initialPickupDate() {
  return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function pickupWindow(date: string, time: string) {
  const start = new Date(`${date}T${time}:00Z`);
  if (Number.isNaN(start.getTime())) throw new Error('Enter a valid pickup date and time.');
  return {
    start: start.toISOString(),
    end: new Date(start.getTime() + 60 * 60 * 1000).toISOString(),
  };
}

function pickupTimeLabel(request: MarketplacePickupRequest) {
  return `${new Date(request.proposedStart).toLocaleString('en-GH', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Africa/Accra',
  })}–${new Date(request.proposedEnd).toLocaleTimeString('en-GH', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Africa/Accra',
  })}`;
}

export default function MarketplaceListingScreen() {
  const { listingId } = useLocalSearchParams<{ listingId: string }>();
  const [listing, setListing] = useState<MarketplaceListing>();
  const [viewerId, setViewerId] = useState<string>();
  const [requests, setRequests] = useState<MarketplacePickupRequest[]>([]);
  const [message, setMessage] = useState('Hi, I am interested in this item.');
  const [pickupDate, setPickupDate] = useState(initialPickupDate);
  const [pickupTime, setPickupTime] = useState('10:00');
  const [privateDetailsByRequest, setPrivateDetailsByRequest] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string>();
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);
  const [busyAction, setBusyAction] = useState<string>();

  const load = useCallback(async () => {
    if (!listingId) return;
    setError(undefined);
    try {
      const [item, viewer, pickupRequests] = await Promise.all([
        getMarketplaceListing(listingId),
        getMarketplaceViewer(),
        listMarketplacePickupRequestsForListing(listingId),
      ]);
      setListing(item);
      setViewerId(viewer.id);
      setRequests(pickupRequests);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not load listing.');
    } finally {
      setIsLoading(false);
    }
  }, [listingId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const isSeller = Boolean(listing && viewerId === listing.sellerId);
  const myRequest = useMemo(() => requests.find((request) => request.requesterId === viewerId), [requests, viewerId]);

  async function sendPickupRequest() {
    if (!listing || message.trim().length < 2) return;
    setBusyAction('create');
    setError(undefined);
    setNotice(undefined);
    try {
      const window = pickupWindow(pickupDate, pickupTime);
      await createMarketplacePickupRequest(listing.id, {
        message,
        generalArea: listing.pickupArea,
        proposedStart: window.start,
        proposedEnd: window.end,
      });
      setNotice('Pickup proposed. The seller can accept, decline, or confirm private details.');
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not send pickup request.');
    } finally {
      setBusyAction(undefined);
    }
  }

  async function respond(requestId: string, action: 'accept' | 'confirm' | 'decline' | 'cancel' | 'complete') {
    setBusyAction(`${requestId}:${action}`);
    setError(undefined);
    setNotice(undefined);
    try {
      await respondToMarketplacePickupRequest(
        requestId,
        action,
        action === 'confirm' ? privateDetailsByRequest[requestId] : undefined,
      );
      setPrivateDetailsByRequest((current) => ({ ...current, [requestId]: '' }));
      setNotice(
        action === 'confirm'
          ? 'Pickup confirmed. Precise details are now visible only to buyer and seller.'
          : `Pickup ${{ accept: 'accepted', decline: 'declined', cancel: 'cancelled', complete: 'completed' }[action]}.`,
      );
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not update pickup.');
    } finally {
      setBusyAction(undefined);
    }
  }

  if (isLoading) {
    return (
      <Screen title="Marketplace listing">
        <LoadingState title="Loading listing" />
      </Screen>
    );
  }

  if (!listing) {
    return (
      <Screen title="Marketplace listing">
        <EmptyState title="Listing unavailable" body={error ?? 'This listing may have been removed or hidden.'} />
      </Screen>
    );
  }

  return (
    <Screen title={listing.title} showBottomNavigation={false}>
      {listing.imageUrls?.length ? (
        <View style={styles.imageGrid}>
          {listing.imageUrls.map((uri, index) => (
            <Image
              key={uri}
              accessibilityLabel={`${listing.title} photo ${index + 1}`}
              source={{ uri }}
              style={styles.image}
              resizeMode="cover"
            />
          ))}
        </View>
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imagePlaceholderText}>No image added</Text>
        </View>
      )}

      <View style={styles.panel}>
        <Text style={styles.price}>{priceLabel(listing)}</Text>
        <Text style={styles.body}>{listing.description}</Text>
        <Text style={styles.note}>Seller: {listing.sellerName}</Text>
        <Text style={styles.note}>Availability: {listing.availability}</Text>
        <Text style={styles.note}>General pickup area: {listing.pickupArea}</Text>
        <Text style={styles.privacyNote}>Exact pickup instructions are not part of this public listing.</Text>
        {listing.moderationStatus !== 'clean' ? (
          <Text accessibilityLiveRegion="polite" style={styles.reviewNotice}>
            This listing is under moderation review. Neighbors cannot view it or propose a pickup.
          </Text>
        ) : null}
      </View>

      {error ? <EmptyState title="Marketplace notice" body={error} /> : null}
      {notice ? (
        <Text accessibilityRole="alert" style={styles.success}>
          {notice}
        </Text>
      ) : null}

      {isSeller ? (
        <View style={styles.section}>
          <Text accessibilityRole="header" style={styles.title}>
            Pickup requests
          </Text>
          {requests.length === 0 ? <Text style={styles.note}>No pickup proposals yet.</Text> : null}
          {requests.map((request) => (
            <View key={request.id} style={styles.panel}>
              <Text style={styles.title}>{request.requesterName}</Text>
              <Text style={styles.body}>{request.message}</Text>
              <Text style={styles.note}>{pickupTimeLabel(request)}</Text>
              <Text style={styles.note}>General area: {request.generalArea}</Text>
              <Text style={styles.status}>Status: {request.status}</Text>
              {request.privateDetails ? (
                <Text style={styles.privateDetails}>Private pickup details: {request.privateDetails}</Text>
              ) : null}
              {request.status === 'proposed' ? (
                <View style={styles.actions}>
                  <ActionButton
                    label="Accept proposed time"
                    busy={Boolean(busyAction)}
                    onPress={() => void respond(request.id, 'accept')}
                  />
                  <ActionButton
                    label="Decline"
                    busy={Boolean(busyAction)}
                    onPress={() => void respond(request.id, 'decline')}
                    secondary
                  />
                </View>
              ) : null}
              {request.status === 'accepted' ? (
                <>
                  <TextInput
                    accessibilityLabel="Private pickup instructions"
                    value={privateDetailsByRequest[request.id] ?? ''}
                    onChangeText={(value) =>
                      setPrivateDetailsByRequest((current) => ({ ...current, [request.id]: value }))
                    }
                    placeholder="Exact meeting point or address"
                    multiline
                    maxLength={500}
                    style={styles.textArea}
                  />
                  <Text style={styles.note}>Visible only to this buyer after confirmation.</Text>
                  <ActionButton
                    label="Confirm private pickup details"
                    busy={Boolean(busyAction)}
                    onPress={() => void respond(request.id, 'confirm')}
                  />
                </>
              ) : null}
              {request.status === 'confirmed' ? (
                <ActionButton
                  label="Mark pickup completed"
                  busy={Boolean(busyAction)}
                  onPress={() => void respond(request.id, 'complete')}
                />
              ) : null}
              {['proposed', 'accepted', 'confirmed'].includes(request.status) ? (
                <ActionButton
                  label="Cancel pickup"
                  busy={Boolean(busyAction)}
                  onPress={() => void respond(request.id, 'cancel')}
                  secondary
                />
              ) : null}
              <Link
                href={{ pathname: '/messages', params: { requestId: request.id, listingTitle: listing.title } }}
                asChild
              >
                <Pressable accessibilityRole="button" style={styles.secondaryButton}>
                  <Text style={styles.secondaryButtonText}>Open messages</Text>
                </Pressable>
              </Link>
            </View>
          ))}
        </View>
      ) : myRequest ? (
        <View style={styles.panel}>
          <Text style={styles.title}>Your pickup</Text>
          <Text style={styles.body}>{pickupTimeLabel(myRequest)}</Text>
          <Text style={styles.note}>General area: {myRequest.generalArea}</Text>
          <Text style={styles.status}>Status: {myRequest.status}</Text>
          {myRequest.privateDetails ? (
            <Text style={styles.privateDetails}>Private pickup details: {myRequest.privateDetails}</Text>
          ) : (
            <Text style={styles.note}>Precise details remain hidden until the seller confirms pickup.</Text>
          )}
          <Link
            href={{ pathname: '/messages', params: { requestId: myRequest.id, listingTitle: listing.title } }}
            asChild
          >
            <Pressable accessibilityRole="button" style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Message seller</Text>
            </Pressable>
          </Link>
          {['proposed', 'accepted', 'confirmed'].includes(myRequest.status) ? (
            <ActionButton
              label="Cancel pickup"
              busy={Boolean(busyAction)}
              onPress={() => void respond(myRequest.id, 'cancel')}
              secondary
            />
          ) : null}
          {myRequest.status === 'confirmed' ? (
            <ActionButton
              label="Mark pickup completed"
              busy={Boolean(busyAction)}
              onPress={() => void respond(myRequest.id, 'complete')}
            />
          ) : null}
        </View>
      ) : (
        <View style={styles.panel}>
          <Text style={styles.title}>Propose pickup</Text>
          <TextInput
            accessibilityLabel="Message to seller"
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={300}
            style={styles.textArea}
          />
          <TextInput
            accessibilityLabel="Pickup date"
            value={pickupDate}
            onChangeText={setPickupDate}
            placeholder="YYYY-MM-DD"
            style={styles.input}
          />
          <TextInput
            accessibilityLabel="Pickup time"
            value={pickupTime}
            onChangeText={setPickupTime}
            placeholder="HH:MM"
            style={styles.input}
          />
          <Text style={styles.note}>Times use Ghana time. The initial proposal includes only the general area.</Text>
          <ActionButton
            label={
              listing.availability !== 'available'
                ? 'Not available'
                : busyAction
                  ? 'Sending...'
                  : 'Send pickup proposal'
            }
            busy={Boolean(busyAction) || listing.availability !== 'available'}
            onPress={() => void sendPickupRequest()}
          />
        </View>
      )}
    </Screen>
  );
}

function ActionButton({
  label,
  busy,
  onPress,
  secondary = false,
}: {
  label: string;
  busy: boolean;
  onPress: () => void;
  secondary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={busy}
      onPress={onPress}
      style={secondary ? styles.secondaryButton : styles.button}
    >
      <Text style={secondary ? styles.secondaryButtonText : styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  actions: { gap: tokens.spacing.sm },
  body: { color: tokens.color.textPrimary, fontSize: tokens.type.body, lineHeight: 22 },
  button: {
    backgroundColor: tokens.color.primary,
    borderRadius: tokens.radius.md,
    justifyContent: 'center',
    minHeight: tokens.touch.min,
    padding: tokens.spacing.lg,
  },
  buttonText: { color: '#FFFFFF', fontSize: tokens.type.body, fontWeight: '700', textAlign: 'center' },
  image: {
    backgroundColor: tokens.color.border,
    borderRadius: tokens.radius.md,
    flexBasis: '48%',
    height: 180,
    minWidth: 145,
  },
  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.spacing.sm },
  imagePlaceholder: {
    alignItems: 'center',
    backgroundColor: '#EEF7F4',
    borderRadius: tokens.radius.md,
    height: 160,
    justifyContent: 'center',
    width: '100%',
  },
  imagePlaceholderText: { color: tokens.color.textSecondary, fontSize: tokens.type.support, fontWeight: '700' },
  input: {
    borderColor: tokens.color.border,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    color: tokens.color.textPrimary,
    fontSize: tokens.type.body,
    minHeight: tokens.touch.min,
    padding: tokens.spacing.md,
  },
  note: { color: tokens.color.textSecondary, fontSize: tokens.type.support, lineHeight: 20 },
  panel: {
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    gap: tokens.spacing.sm,
    padding: tokens.spacing.lg,
  },
  price: { color: tokens.color.primary, fontSize: tokens.type.card, fontWeight: '700' },
  privacyNote: {
    backgroundColor: '#FFF4D6',
    borderRadius: tokens.radius.md,
    color: tokens.color.textPrimary,
    fontSize: tokens.type.support,
    lineHeight: 20,
    padding: tokens.spacing.md,
  },
  reviewNotice: {
    backgroundColor: '#FFF4D6',
    borderRadius: tokens.radius.md,
    color: tokens.color.textPrimary,
    fontSize: tokens.type.support,
    lineHeight: 20,
    padding: tokens.spacing.md,
  },
  privateDetails: {
    backgroundColor: '#E7F6EE',
    borderRadius: tokens.radius.md,
    color: tokens.color.textPrimary,
    fontSize: tokens.type.body,
    lineHeight: 22,
    padding: tokens.spacing.md,
  },
  secondaryButton: {
    borderColor: tokens.color.primary,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: tokens.touch.min,
    padding: tokens.spacing.md,
  },
  secondaryButtonText: { color: tokens.color.primary, fontWeight: '700', textAlign: 'center' },
  section: { gap: tokens.spacing.md },
  status: { color: tokens.color.primary, fontSize: tokens.type.support, fontWeight: '700' },
  success: {
    backgroundColor: '#E7F6EE',
    borderRadius: tokens.radius.md,
    color: tokens.color.textPrimary,
    fontSize: tokens.type.support,
    padding: tokens.spacing.md,
  },
  textArea: {
    borderColor: tokens.color.border,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    color: tokens.color.textPrimary,
    fontSize: tokens.type.body,
    minHeight: 104,
    padding: tokens.spacing.md,
  },
  title: { color: tokens.color.textPrimary, fontSize: tokens.type.card, fontWeight: '700' },
});
