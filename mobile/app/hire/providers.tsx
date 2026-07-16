import { Link, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
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

  return (
    <Screen title={category ? category.name : 'Providers'}>
      <OfflineBanner />
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
            <Link
              key={provider.id}
              href={{ pathname: '/hire/provider/[providerId]', params: { providerId: provider.id, categoryId } }}
              asChild
            >
              <Pressable>
                <ProviderCard provider={provider} onPress={() => undefined} />
              </Pressable>
            </Link>
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
});
