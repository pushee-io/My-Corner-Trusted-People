import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { EmptyState, LoadingState } from '@/components/StateBlocks';
import {
  createMarketplacePickupRequest,
  getMarketplaceListing,
} from '@/lib/marketplace-repository';
import { tokens } from '@/theme/tokens';
import type { MarketplaceListing, MarketplacePickupRequest } from '@/types/contracts';

function priceLabel(listing: MarketplaceListing) {
  return typeof listing.priceGhs === 'number' ? `GHS ${listing.priceGhs.toFixed(2)}` : 'Free or negotiable';
}

export default function MarketplaceListingScreen() {
  const { listingId } = useLocalSearchParams<{ listingId: string }>();
  const [listing, setListing] = useState<MarketplaceListing>();
  const [pickupRequest, setPickupRequest] = useState<MarketplacePickupRequest>();
  const [message, setMessage] = useState('Hi, I am interested. When would be a good pickup time?');
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!listingId) return;

    getMarketplaceListing(listingId)
      .then(setListing)
      .catch((caught) => setError(caught instanceof Error ? caught.message : 'Could not load listing.'))
      .finally(() => setIsLoading(false));
  }, [listingId]);

  async function sendPickupRequest() {
    if (!listing || message.trim().length < 2) return;

    setError(undefined);
    setIsSending(true);

    try {
      const request = await createMarketplacePickupRequest(listing.id, message);
      setPickupRequest(request);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not send pickup request.');
    } finally {
      setIsSending(false);
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
    <Screen title={listing.title}>
      {listing.imageUrl ? (
        <Image source={{ uri: listing.imageUrl }} style={styles.image} resizeMode="cover" />
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
        <Text style={styles.note}>Pickup: {listing.pickupArea}</Text>
        {listing.pickupNotes ? <Text style={styles.body}>{listing.pickupNotes}</Text> : null}
      </View>

      {error ? <EmptyState title="Pickup notice" body={error} /> : null}

      {pickupRequest ? (
        <View style={styles.panel}>
          <Text style={styles.title}>Pickup request sent</Text>
          <Text style={styles.body}>{pickupRequest.message}</Text>
          <Text style={styles.note}>Status: {pickupRequest.status}</Text>
        </View>
      ) : (
        <View style={styles.panel}>
          <Text style={styles.title}>Coordinate pickup</Text>
          <TextInput
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={300}
            style={styles.textArea}
            textAlignVertical="top"
          />
          <Text style={styles.note}>Use general pickup details first. Avoid exact home addresses in public spaces.</Text>
          <Pressable disabled={isSending || listing.availability !== 'available'} onPress={sendPickupRequest} style={styles.button}>
            <Text style={styles.buttonText}>
              {listing.availability !== 'available' ? 'Not available' : isSending ? 'Sending...' : 'Send pickup request'}
            </Text>
          </Pressable>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { color: tokens.color.textPrimary, fontSize: tokens.type.body, lineHeight: 22 },
  button: {
    backgroundColor: tokens.color.primary,
    borderRadius: tokens.radius.md,
    justifyContent: 'center',
    minHeight: tokens.touch.min,
    padding: tokens.spacing.lg,
  },
  buttonText: { color: '#FFFFFF', fontSize: tokens.type.body, fontWeight: '700', textAlign: 'center' },
  image: { backgroundColor: tokens.color.border, borderRadius: tokens.radius.md, height: 240, width: '100%' },
  imagePlaceholder: {
    alignItems: 'center',
    backgroundColor: '#EEF7F4',
    borderRadius: tokens.radius.md,
    height: 160,
    justifyContent: 'center',
    width: '100%',
  },
  imagePlaceholderText: { color: tokens.color.textSecondary, fontSize: tokens.type.support, fontWeight: '700' },
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
