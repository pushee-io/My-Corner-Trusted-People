import { Ionicons } from '@expo/vector-icons';
import { IconButton } from '@/components/IconButton';
import { useProtectedResource } from '@/hooks/useProtectedResource';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Keyboard, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ProviderCard } from '@/components/ProviderCard';
import { EmptyState, ErrorState, LoadingState } from '@/components/StateBlocks';
import { Screen } from '@/components/Screen';
import { categories } from '@/lib/mock-data';
import { loadDay2BProvidersByCategory } from '@/lib/day2b-read-repository';
import { tokens } from '@/theme/tokens';

export default function ProvidersScreen() {
  const params = useLocalSearchParams<{ categoryId?: string }>();
  const categoryId = params.categoryId ?? 'plumbing';
  const category = categories.find((item) => item.id === categoryId);
  const resource = useProtectedResource(useCallback(() => loadDay2BProvidersByCategory(categoryId), [categoryId]));
  const providers = resource.data?.items ?? [];
  const error = resource.error;
  const isLoading = resource.loading;
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'accepting' | 'verified'>('all');
  const visible = providers.filter((provider) => {
    const matches = [provider.name, provider.headline, provider.areaLabel]
      .join(' ')
      .toLocaleLowerCase()
      .includes(query.trim().toLocaleLowerCase());
    return (
      matches && (filter === 'all' || (filter === 'accepting' ? provider.isAcceptingRequests : provider.phoneVerified))
    );
  });
  const loadProviders = resource.refresh;

  function openProvider(providerId: string) {
    router.push({
      pathname: '/hire/provider/[providerId]',
      params: { providerId, categoryId },
    });
  }

  return (
    <Screen title={category ? category.name : 'Providers'}>
      <Text style={styles.note}>
        Providers across service areas. Check each provider’s listed coverage before starting a request.
      </Text>

      <View style={styles.search}>
        <Ionicons name="search-outline" size={22} color={tokens.color.primary} accessible={false} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={Keyboard.dismiss}
          returnKeyType="search"
          placeholder="Search name or service area"
          style={styles.input}
          accessibilityLabel="Search providers"
        />
        {query ? <IconButton icon="close" label="Clear provider search" onPress={() => setQuery('')} /> : null}
      </View>
      <View style={styles.chips}>
        {(
          [
            ['all', 'All providers'],
            ['accepting', 'Accepting requests'],
            ['verified', 'Phone verified'],
          ] as const
        ).map(([value, label]) => (
          <Pressable
            key={value}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{ selected: filter === value }}
            onPress={() => {
              Keyboard.dismiss();
              setFilter(value);
            }}
            style={[styles.chip, filter === value && styles.activeChip]}
          >
            <Text style={[styles.chipText, filter === value && styles.activeChipText]}>{label}</Text>
          </Pressable>
        ))}
      </View>

      {error ? (
        <ErrorState title="Could not load providers" body={error} onRetry={() => void loadProviders()} />
      ) : isLoading ? (
        <LoadingState title="Finding local help" />
      ) : visible.length === 0 ? (
        <EmptyState title="No matching providers" body="Try another name, filter or service category." />
      ) : (
        <View style={styles.list}>
          {visible.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} onPress={() => openProvider(provider.id)} />
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: { flex: 1, minWidth: 0, minHeight: 48, color: tokens.color.textPrimary, fontSize: 16 },
  activeChip: { backgroundColor: tokens.color.primary },
  activeChipText: { color: tokens.color.onPrimary },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderWidth: 1,
    borderRadius: tokens.radius.card,
    paddingHorizontal: tokens.spacing.md,
  },
  chips: { flexDirection: 'row', gap: tokens.spacing.sm, flexWrap: 'wrap' },
  chip: {
    backgroundColor: tokens.color.successSurface,
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    borderRadius: tokens.radius.pill,
  },
  chipText: { color: tokens.color.textPrimary, fontSize: tokens.type.support },
  list: { gap: tokens.spacing.md },
  note: { color: tokens.color.textSecondary, fontSize: tokens.type.support },
});
