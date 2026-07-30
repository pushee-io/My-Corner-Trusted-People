import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { ProviderCard } from '@/components/ProviderCard';
import { EmptyState, OfflineBanner } from '@/components/StateBlocks';
import { Screen } from '@/components/Screen';
import { categories } from '@/lib/mock-data';
import { listDay2BProvidersByCategory } from '@/lib/day2b-read-repository';
import { tokens } from '@/theme/tokens';
import type { Provider } from '@/types/contracts';

export default function ProvidersScreen() {
  const params = useLocalSearchParams<{ categoryId?: string }>();
  const categoryId = params.categoryId ?? 'plumbing';
  const category = categories.find((item) => item.id === categoryId);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);
  const firstProvider = providers[0];

  function continueWithProvider(providerId = firstProvider?.id ?? '') {
    if (!providerId) return;

    router.push({
      pathname: '/hire/request/review',
      params: {
        requesterName: 'Akosua Mensah',
        providerId,
        categoryId,
        neighborhood: 'East Legon',
        areaLabel: 'East Legon, general area only',
        title: 'Kitchen sink leak',
        description: 'Water is leaking under the kitchen sink. I need someone to inspect it and repair the leak.',
        originalUserText: 'Water is leaking under the kitchen sink.',
        urgency: 'soon',
        preferredDate: '2026-07-18',
        preferredTime: 'Afternoon',
        contactPreference: 'app_update',
        photoCount: '0',
      },
    });
  }

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(undefined);

    listDay2BProvidersByCategory(categoryId)
      .then((items) => {
        if (isMounted) setProviders(items);
      })
      .catch((caught) => {
        if (isMounted) setError(caught instanceof Error ? caught.message : 'Could not load providers.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [categoryId]);

  return (
    <Screen title={category ? category.name : 'Providers'}>
      <OfflineBanner />
      <Text style={styles.note}>Choose a provider to review trust signals and start a request.</Text>

      <TextInput
        editable={false}
        placeholder="Search providers"
        style={styles.search}
        accessibilityLabel="Search providers"
      />

      <View style={styles.chips}>
        <View style={styles.chip}>
          <Text style={styles.chipText}>Top response rate</Text>
        </View>
        <View style={styles.chip}>
          <Text style={styles.chipText}>Accepting requests</Text>
        </View>
      </View>

      {error ? (
        <EmptyState title="Could not load providers" body={error} />
      ) : isLoading ? (
        <EmptyState title="Loading providers" body="Checking live Supabase listings for this category." />
      ) : providers.length === 0 ? (
        <EmptyState title="No providers available" body="Try a different category or neighborhood in this prototype." />
      ) : (
        <View style={styles.list}>
          {providers.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} onPress={() => continueWithProvider(provider.id)} />
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: {
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderWidth: 1,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
  },
  chips: { flexDirection: 'row', gap: tokens.spacing.sm, flexWrap: 'wrap' },
  chip: {
    backgroundColor: '#FFF4D6',
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.xs,
    borderRadius: tokens.radius.pill,
  },
  chipText: { color: tokens.color.textPrimary, fontSize: tokens.type.support },
  list: { gap: tokens.spacing.md },
  note: { color: tokens.color.textSecondary, fontSize: tokens.type.support },
});
