import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { EmptyState, LoadingState } from '@/components/StateBlocks';
import { searchRepository, type SearchResult } from '@/lib/search-repository';
import { tokens } from '@/theme/tokens';

export default function SearchScreen() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const searchPromise = searchRepository.search('');
    searchPromise.then(setResults).finally(() => setIsLoading(false));
  }, []);

  return (
    <Screen title="Search">
      <Text style={styles.body}>Search across trusted hire, local answers, marketplace, and groups.</Text>

      <TextInput
        editable={false}
        placeholder="Search My Corner"
        accessibilityLabel="Search My Corner"
        style={styles.input}
      />

      {isLoading ? (
        <LoadingState title="Loading search" />
      ) : results.length === 0 ? (
        <EmptyState title="Search is coming next" body="Try again when search read surfaces are connected." />
      ) : (
        <View style={styles.section}>
          {results.map((result) => (
            <View key={result.id} style={styles.card}>
              <Text style={styles.title}>{result.title}</Text>
              <Text style={styles.body}>{result.subtitle}</Text>
            </View>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    color: tokens.color.textPrimary,
    fontSize: tokens.type.body,
    lineHeight: 22,
  },
  card: {
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    gap: tokens.spacing.sm,
    padding: tokens.spacing.lg,
  },
  input: {
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    color: tokens.color.textPrimary,
    fontSize: tokens.type.body,
    minHeight: tokens.touch.min,
    padding: tokens.spacing.md,
  },
  section: {
    gap: tokens.spacing.md,
  },
  title: {
    color: tokens.color.textPrimary,
    fontSize: tokens.type.card,
    fontWeight: '700',
  },
});
