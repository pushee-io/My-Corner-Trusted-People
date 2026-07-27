import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { EmptyState, LoadingState } from '@/components/StateBlocks';
import {
  createMarketplaceListing,
  createMarketplacePickupRequest,
  getMarketplaceNeighborhood,
  listMarketplaceListings,
  type CurrentNeighborhood,
  type MarketplaceDraft,
} from '@/lib/marketplace-repository';
import { tokens } from '@/theme/tokens';
import type { MarketplaceListing } from '@/types/contracts';

function priceLabel(listing: MarketplaceListing) {
  return typeof listing.priceGhs === 'number' ? `GHS ${listing.priceGhs.toFixed(2)}` : 'Free or negotiable';
}

export default function MarketplaceScreen() {
  const [neighborhood, setNeighborhood] = useState<CurrentNeighborhood>();
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [pickupNotes, setPickupNotes] = useState('');
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string>();
  const [sent, setSent] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function load() {
      const currentNeighborhood = await getMarketplaceNeighborhood();
      const currentListings = await listMarketplaceListings(currentNeighborhood.id);
      setNeighborhood(currentNeighborhood);
      setListings(currentListings);
    }

    load()
      .catch((caught) => setError(caught instanceof Error ? caught.message : 'Could not load marketplace.'))
      .finally(() => setIsLoading(false));
  }, []);

  async function postListing() {
    if (!neighborhood || title.trim().length < 2 || description.trim().length < 2) return;

    setBusyId('new');
    setError(undefined);

    try {
      const parsedPrice = price.trim() ? Number(price.trim()) : undefined;
      const draft: MarketplaceDraft = {
        title,
        description,
        priceGhs: Number.isFinite(parsedPrice) ? parsedPrice : undefined,
        availability: 'available',
        pickupArea: 'East Legon, general pickup area',
        pickupNotes,
      };

      const listing = await createMarketplaceListing(neighborhood.id, draft);
      setListings((current) => [listing, ...current]);
      setTitle('');
      setDescription('');
      setPrice('');
      setPickupNotes('');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not create listing.');
    } finally {
      setBusyId(undefined);
    }
  }

  async function requestPickup(listing: MarketplaceListing) {
    setBusyId(listing.id);
    setError(undefined);

    try {
      await createMarketplacePickupRequest(listing.id, 'Hi, I am interested. When would be a good pickup time?');
      setSent((current) => ({ ...current, [listing.id]: true }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not send pickup request.');
    } finally {
      setBusyId(undefined);
    }
  }

  if (isLoading) {
    return (
      <Screen title="Marketplace">
        <LoadingState title="Loading marketplace" />
      </Screen>
    );
  }

  return (
    <Screen title={neighborhood ? `${neighborhood.name} marketplace` : 'Marketplace'}>
      <Text style={styles.body}>Listings use broad pickup areas only. Exact residential addresses are not shown.</Text>
      {error ? <EmptyState title="Marketplace notice" body={error} /> : null}

      <View style={styles.panel}>
        <Text style={styles.title}>New listing</Text>

        <TextInput value={title} onChangeText={setTitle} placeholder="Item name" style={styles.input} />
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Description"
          multiline
          style={[styles.input, styles.textArea]}
          textAlignVertical="top"
        />
        <TextInput
          value={price}
          onChangeText={setPrice}
          placeholder="Price in GHS"
          keyboardType="numeric"
          style={styles.input}
        />
        <TextInput
          value={pickupNotes}
          onChangeText={setPickupNotes}
          placeholder="Pickup notes, general area only"
          multiline
          style={[styles.input, styles.textArea]}
          textAlignVertical="top"
        />

        <Text style={styles.note}>Images come later. This version saves listings without photos.</Text>
        <Pressable disabled={busyId === 'new'} onPress={postListing} style={styles.button}>
          <Text style={styles.buttonText}>{busyId === 'new' ? 'Posting...' : 'Post listing'}</Text>
        </Pressable>
      </View>

      <View style={styles.list}>
        {listings.map((listing) => (
          <View key={listing.id} style={styles.card}>
            <Text style={styles.title}>{listing.title}</Text>
            <Text style={styles.body}>{listing.description}</Text>
            <Text style={styles.price}>{priceLabel(listing)}</Text>
            <Text style={styles.note}>
              {listing.availability} · {listing.sellerName}
            </Text>
            <Text style={styles.note}>Pickup: {listing.pickupArea}</Text>

            <Pressable
              disabled={sent[listing.id] || busyId === listing.id || listing.availability !== 'available'}
              onPress={() => requestPickup(listing)}
              style={styles.button}
            >
              <Text style={styles.buttonText}>
                {sent[listing.id]
                  ? 'Pickup request sent'
                  : busyId === listing.id
                    ? 'Sending...'
                    : 'Send pickup request'}
              </Text>
            </Pressable>
          </View>
        ))}
      </View>
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
  buttonText: { color: '#FFFFFF', fontWeight: '700', textAlign: 'center' },
  card: {
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    gap: tokens.spacing.sm,
    padding: tokens.spacing.lg,
  },
  input: {
    borderColor: tokens.color.border,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    color: tokens.color.textPrimary,
    fontSize: tokens.type.body,
    minHeight: tokens.touch.min,
    padding: tokens.spacing.md,
  },
  list: { gap: tokens.spacing.md },
  note: { color: tokens.color.textSecondary, fontSize: tokens.type.support, lineHeight: 20 },
  panel: {
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    gap: tokens.spacing.sm,
    padding: tokens.spacing.lg,
  },
  price: { color: tokens.color.primary, fontSize: tokens.type.body, fontWeight: '700' },
  textArea: { minHeight: 96 },
  title: { color: tokens.color.textPrimary, fontSize: tokens.type.card, fontWeight: '700' },
});
