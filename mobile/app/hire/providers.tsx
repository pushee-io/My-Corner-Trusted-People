import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
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

  function continueWithProvider(providerId: string) {
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

  return (
    <Screen title={category ? category.name : 'Providers'}>
      <OfflineBanner />

      <Text style={styles.count}>
        Showing {providers.length} provider{providers.length === 1 ? '' : 's'}
      </Text>

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

      {providers.length === 0 ? (
        <EmptyState title="No providers available" body="Try a different category or neighborhood in this prototype." />
      ) : (
        <View style={styles.list}>
          {providers.map((provider) => (
            <Pressable
              key={provider.id}
              onPress={() => continueWithProvider(provider.id)}
              style={styles.providerCard}
              accessibilityRole="button"
            >
              <Text style={styles.providerName}>{provider.name}</Text>
              <Text style={styles.providerHeadline}>{provider.headline}</Text>
              <Text style={styles.providerMeta}>
                {provider.serviceLabel} · {provider.areaLabel}
              </Text>
              <Text style={styles.providerMeta}>
                {provider.rating} rating · {provider.reviewCount} reviews · {provider.completedJobs} jobs
              </Text>
              <Text style={styles.trustText}>Phone verified: {provider.phoneVerified ? 'Yes' : 'No'}</Text>
              <Text style={styles.trustText}>Response rate: {provider.responseRate}</Text>
              <Text style={styles.disclaimer}>Trust signals are evidence, not a guarantee.</Text>
            </Pressable>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  count: {
    color: tokens.color.textSecondary,
    fontSize: tokens.type.support,
  },
  search: {
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderWidth: 1,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
  },
  chips: {
    flexDirection: 'row',
    gap: tokens.spacing.sm,
    flexWrap: 'wrap',
  },
  chip: {
    backgroundColor: '#FFF4D6',
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.xs,
    borderRadius: tokens.radius.pill,
  },
  chipText: {
    color: tokens.color.textPrimary,
    fontSize: tokens.type.support,
  },
  list: {
    gap: tokens.spacing.md,
  },
  providerCard: {
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderWidth: 1,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
    gap: tokens.spacing.xs,
  },
  providerName: {
    color: tokens.color.textPrimary,
    fontSize: tokens.type.card,
    fontWeight: '700',
  },
  providerHeadline: {
    color: tokens.color.textPrimary,
    fontSize: tokens.type.body,
  },
  providerMeta: {
    color: tokens.color.textSecondary,
    fontSize: tokens.type.support,
  },
  trustText: {
    color: tokens.color.textPrimary,
    fontSize: tokens.type.support,
  },
  disclaimer: {
    color: tokens.color.textSecondary,
    fontSize: tokens.type.support,
    marginTop: tokens.spacing.xs,
  },
});
