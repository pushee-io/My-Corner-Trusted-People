import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { ProviderCard } from '@/components/ProviderCard';
import { EmptyState, ErrorState, OfflineBanner } from '@/components/StateBlocks';
import { Screen } from '@/components/Screen';
import { categories } from '@/lib/mock-data';
import { loadDay2BProvidersByCategory } from '@/lib/day2b-read-repository';
import { tokens } from '@/theme/tokens';
import type { Provider } from '@/types/contracts';

export default function ProvidersScreen() {
  const params = useLocalSearchParams<{ categoryId?: string }>();
  const categoryId = params.categoryId ?? 'plumbing';
  const category = categories.find((item) => item.id === categoryId);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);
  const [isShowingSaved, setIsShowingSaved] = useState(false);

  function continueWithProvider(providerId: string) {
    router.push({
      pathname: '/hire/request/new',
      params: { providerId, categoryId },
    });
  }

  const loadProviders = useCallback(async () => {
    setIsLoading(true);
    setError(undefined);

    try {
      const result = await loadDay2BProvidersByCategory(categoryId);
      setProviders(result.items);
      setIsShowingSaved(result.fromCache);
    } catch (caught) {
      setProviders([]);
      setIsShowingSaved(false);
      setError(caught instanceof Error ? caught.message : 'Could not load providers.');
    } finally {
      setIsLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    void loadProviders();
  }, [loadProviders]);

  return (
    <Screen title={category ? category.name : 'Providers'}>
      {isShowingSaved ? (
        <OfflineBanner
          message="Showing saved providers. Reconnect and try again for updates."
          onRetry={() => void loadProviders()}
        />
      ) : null}
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
        <ErrorState title="Could not load providers" body={error} onRetry={() => void loadProviders()} />
      ) : isLoading ? (
        <EmptyState title="Loading providers" body="Checking live Supabase listings for this category." />
      ) : providers.length === 0 ? (
        <EmptyState
          title="No providers available"
          body="Try a different category or neighborhood in this prototype."
        />
      ) : (
        <View style={styles.list}>
          {providers.map((provider) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              onPress={() => continueWithProvider(provider.id)}
            />
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
