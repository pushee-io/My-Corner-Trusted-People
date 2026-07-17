import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { ProviderCard } from '@/components/ProviderCard';
import { EmptyState, OfflineBanner } from '@/components/StateBlocks';
import { Screen } from '@/components/Screen';
import { categories } from '@/lib/mock-data';
import { listProvidersByCategory } from '@/lib/repository';
import { tokens } from '@/theme/tokens';

export default function ProvidersScreen() {
  const params = useLocalSearchParams<{ categoryId?: string }>();
  const categoryId = params.categoryId ?? 'plumbing';
  const category = categories.find((item) => item.id === categoryId);
  const providers = listProvidersByCategory(categoryId);
  const firstProvider = providers[0];

  function continueWithProvider(providerId = firstProvider?.id ?? 'prov-01') {
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
    if (!firstProvider) {
      return;
    }
    const timeout = setTimeout(() => continueWithProvider(firstProvider.id), 1800);
    return () => clearTimeout(timeout);
  }, [firstProvider?.id]);

  return (
    <Screen title={category ? category.name : 'Providers'}>
      <OfflineBanner />
      <Text style={styles.note}>Prototype note: provider results will continue to review automatically.</Text>
      <TextInput
        editable={false}
        placeholder="Search providers"
        style={styles.search}
        accessibilityLabel="Search providers"
      />
      <View style={styles.chips}>
        <View style={styles.chip}><Text style={styles.chipText}>Top response rate</Text></View>
        <View style={styles.chip}><Text style={styles.chipText}>Accepting requests</Text></View>
      </View>
      {providers.length === 0 ? (
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
  chip: { backgroundColor: '#FFF4D6', paddingHorizontal: tokens.spacing.md, paddingVertical: tokens.spacing.xs, borderRadius: tokens.radius.pill },
  chipText: { color: tokens.color.textPrimary, fontSize: tokens.type.support },
  list: { gap: tokens.spacing.md },
  note: { color: tokens.color.textSecondary, fontSize: tokens.type.support },
});
