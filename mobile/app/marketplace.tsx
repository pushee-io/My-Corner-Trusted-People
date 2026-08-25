import { File } from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { Link, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { EmptyState, LoadingState } from '@/components/StateBlocks';
import {
  createMarketplaceListing,
  getMarketplaceNeighborhood,
  listMarketplaceListings,
  type CurrentNeighborhood,
  type MarketplaceDraft,
} from '@/lib/marketplace-repository';
import { getMediaPipelinePolicy } from '@/lib/shared-media-pipeline';
import { tokens } from '@/theme/tokens';
import type { MarketplaceListing } from '@/types/contracts';

const photoPolicy = getMediaPipelinePolicy('marketplace_listing');
const marketplacePhotoMaxEdge = 1600;

type SelectedPhoto = {
  assetId?: string | null;
  fileName?: string | null;
  fileSize: number;
  height: number;
  mimeType: string;
  uri: string;
  width: number;
};

async function prepareMarketplacePhoto(photo: ImagePicker.ImagePickerAsset): Promise<SelectedPhoto> {
  const context = ImageManipulator.ImageManipulator.manipulate(photo.uri);
  if (Math.max(photo.width, photo.height) > marketplacePhotoMaxEdge) {
    if (photo.width >= photo.height) context.resize({ width: marketplacePhotoMaxEdge, height: null });
    else context.resize({ width: null, height: marketplacePhotoMaxEdge });
  }

  const rendered = await context.renderAsync();
  let saved = await rendered.saveAsync({ compress: 0.72, format: ImageManipulator.SaveFormat.JPEG });
  let file = new File(saved.uri);

  if (file.size > photoPolicy.maxBytesPerFile) {
    const fallback = ImageManipulator.ImageManipulator.manipulate(saved.uri);
    fallback.resize({
      width: saved.width >= saved.height ? 1280 : null,
      height: saved.height > saved.width ? 1280 : null,
    });
    saved = await (
      await fallback.renderAsync()
    ).saveAsync({
      compress: 0.5,
      format: ImageManipulator.SaveFormat.JPEG,
    });
    file = new File(saved.uri);
  }

  return {
    assetId: photo.assetId,
    fileName: `${(photo.fileName ?? 'marketplace-photo').replace(/\.[^.]+$/, '')}.jpg`,
    fileSize: file.size,
    height: saved.height,
    mimeType: 'image/jpeg',
    uri: saved.uri,
    width: saved.width,
  };
}

function priceLabel(listing: MarketplaceListing) {
  return typeof listing.priceGhs === 'number' ? `GHS ${listing.priceGhs.toFixed(2)}` : 'Free or negotiable';
}

export default function MarketplaceScreen() {
  const [neighborhood, setNeighborhood] = useState<CurrentNeighborhood>();
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [photos, setPhotos] = useState<SelectedPhoto[]>([]);
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string>();
  const [preparingPhotos, setPreparingPhotos] = useState(false);

  const load = useCallback(async () => {
    setError(undefined);
    try {
      const currentNeighborhood = await getMarketplaceNeighborhood();
      setNeighborhood(currentNeighborhood);
      const currentListings = await listMarketplaceListings(currentNeighborhood.id);
      setListings(currentListings);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not load marketplace.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  async function pickPhotos() {
    const remaining = photoPolicy.maxFiles - photos.length;
    if (remaining <= 0) {
      setError(`Add up to ${photoPolicy.maxFiles} photos.`);
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Photo access is required to add listing images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.75,
    });
    if (result.canceled) return;
    setPreparingPhotos(true);
    setError(undefined);
    try {
      const prepared = await Promise.all(result.assets.map(prepareMarketplacePhoto));
      setPhotos((current) => [...current, ...prepared].slice(0, photoPolicy.maxFiles));
    } catch {
      setError('Could not prepare that photo. Choose another image and try again.');
    } finally {
      setPreparingPhotos(false);
    }
  }

  async function postListing() {
    if (title.trim().length < 2 || description.trim().length < 2) {
      setError('Add an item name and a short description.');
      return;
    }
    if (!neighborhood) {
      setError('Your verified neighborhood could not be loaded. Refresh Marketplace and try again.');
      return;
    }

    setBusyId('new');
    setError(undefined);
    setMessage(undefined);

    try {
      const parsedPrice = price.trim() ? Number(price.trim()) : undefined;
      const draft: MarketplaceDraft = {
        title,
        description,
        priceGhs: Number.isFinite(parsedPrice) ? parsedPrice : undefined,
        photos: photos.map((photo) => {
          const file = new File(photo.uri);
          return {
            uri: photo.uri,
            fileName: photo.fileName ?? file.name,
            mimeType: photo.mimeType || file.type || 'image/jpeg',
            byteSize: photo.fileSize ?? file.size,
            width: photo.width,
            height: photo.height,
            altText: `${title.trim()} photo`,
          };
        }),
        availability: 'available',
        pickupArea: `${neighborhood.name}, general pickup area`,
      };

      const listing = await createMarketplaceListing(neighborhood.id, draft);
      setListings((current) => [listing, ...current.filter((item) => item.id !== listing.id)]);
      setTitle('');
      setDescription('');
      setPrice('');
      setPhotos([]);
      setMessage('Listing posted. Exact pickup details stay private until a pickup is confirmed.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not create listing.');
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
      <Text style={styles.body}>Browse nearby items. Exact pickup details are shared only after confirmation.</Text>

      {error ? <EmptyState title="Marketplace notice" body={error} /> : null}
      {message ? (
        <Text accessibilityRole="alert" style={styles.success}>
          {message}
        </Text>
      ) : null}

      <View style={styles.panel}>
        <Text style={styles.title}>New listing</Text>
        <TextInput
          accessibilityLabel="Item name"
          value={title}
          onChangeText={(value) => {
            setTitle(value);
            setError(undefined);
          }}
          placeholder="Item name"
          style={styles.input}
        />
        <TextInput
          accessibilityLabel="Item description"
          value={description}
          onChangeText={(value) => {
            setDescription(value);
            setError(undefined);
          }}
          placeholder="Condition, size, and useful details"
          multiline
          maxLength={700}
          style={[styles.input, styles.textArea]}
          textAlignVertical="top"
        />
        <TextInput
          accessibilityLabel="Price in Ghana cedis"
          value={price}
          onChangeText={setPrice}
          placeholder="Price in GHS"
          keyboardType="decimal-pad"
          style={styles.input}
        />

        <View style={styles.photoHeader}>
          <Text style={styles.fieldLabel}>Photos</Text>
          <Text style={styles.note}>
            {photos.length} of {photoPolicy.maxFiles}
          </Text>
        </View>
        <View style={styles.photoGrid}>
          {photos.map((photo, index) => (
            <View key={`${photo.assetId ?? photo.uri}-${index}`} style={styles.photoItem}>
              <Image source={{ uri: photo.uri }} style={styles.photo} resizeMode="cover" />
              <Pressable
                accessibilityLabel={`Remove photo ${index + 1}`}
                accessibilityRole="button"
                onPress={() => setPhotos((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                style={styles.removeButton}
              >
                <Text style={styles.removeText}>Remove</Text>
              </Pressable>
            </View>
          ))}
        </View>
        <Pressable
          accessibilityRole="button"
          disabled={preparingPhotos}
          onPress={() => void pickPhotos()}
          style={[styles.secondaryButton, preparingPhotos ? styles.disabled : null]}
        >
          <Text style={styles.secondaryButtonText}>{preparingPhotos ? 'Preparing photos...' : 'Add photos'}</Text>
        </Pressable>
        <Text style={styles.note}>JPEG, PNG, WebP, HEIC, or HEIF. Maximum 6 MB each.</Text>
        <Text style={styles.privacyNote}>
          Pickup area: {neighborhood?.name}. Precise instructions are never stored on the public listing.
        </Text>

        <Pressable
          accessibilityRole="button"
          disabled={busyId === 'new'}
          onPress={() => void postListing()}
          style={[styles.button, busyId === 'new' ? styles.disabled : null]}
        >
          <Text style={styles.buttonText}>{busyId === 'new' ? 'Posting...' : 'Post listing'}</Text>
        </Pressable>
      </View>

      <View style={styles.list}>
        {listings.map((listing) => (
          <View key={listing.id} style={styles.card}>
            {listing.imageUrl ? (
              <Image source={{ uri: listing.imageUrl }} style={styles.listingImage} resizeMode="cover" />
            ) : null}
            <Text style={styles.title}>{listing.title}</Text>
            <Text style={styles.body}>{listing.description}</Text>
            <Text style={styles.price}>{priceLabel(listing)}</Text>
            <Text style={styles.note}>
              {listing.availability} · {listing.sellerName}
            </Text>
            <Text style={styles.note}>Pickup area: {listing.pickupArea}</Text>
            <Link href={{ pathname: '/marketplace/listing/[listingId]', params: { listingId: listing.id } }} asChild>
              <Pressable accessibilityRole="button" style={styles.button}>
                <Text style={styles.buttonText}>View listing</Text>
              </Pressable>
            </Link>
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
  disabled: { opacity: 0.55 },
  fieldLabel: { color: tokens.color.textPrimary, fontSize: tokens.type.body, fontWeight: '700' },
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
  listingImage: { backgroundColor: tokens.color.border, borderRadius: tokens.radius.md, height: 180, width: '100%' },
  note: { color: tokens.color.textSecondary, fontSize: tokens.type.support, lineHeight: 20 },
  panel: {
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    gap: tokens.spacing.sm,
    padding: tokens.spacing.lg,
  },
  photo: { height: 112, width: '100%' },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.spacing.sm },
  photoHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  photoItem: {
    borderColor: tokens.color.border,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    flexBasis: '47%',
    minWidth: 132,
    overflow: 'hidden',
  },
  price: { color: tokens.color.primary, fontSize: tokens.type.body, fontWeight: '700' },
  privacyNote: {
    backgroundColor: '#FFF4D6',
    borderRadius: tokens.radius.md,
    color: tokens.color.textPrimary,
    fontSize: tokens.type.support,
    lineHeight: 20,
    padding: tokens.spacing.md,
  },
  removeButton: { justifyContent: 'center', minHeight: tokens.touch.min, paddingHorizontal: tokens.spacing.sm },
  removeText: { color: tokens.color.error, fontWeight: '700', textAlign: 'center' },
  secondaryButton: {
    borderColor: tokens.color.primary,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: tokens.touch.min,
    padding: tokens.spacing.md,
  },
  secondaryButtonText: { color: tokens.color.primary, fontWeight: '700', textAlign: 'center' },
  success: {
    backgroundColor: '#E7F6EE',
    borderRadius: tokens.radius.md,
    color: tokens.color.textPrimary,
    fontSize: tokens.type.support,
    padding: tokens.spacing.md,
  },
  textArea: { minHeight: 96 },
  title: { color: tokens.color.textPrimary, fontSize: tokens.type.card, fontWeight: '700' },
});
