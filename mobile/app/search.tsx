import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { EmptyState, ErrorState, LoadingState } from '@/components/StateBlocks';
import { searchRepository, type SearchResult } from '@/lib/search-repository';
import { tokens } from '@/theme/tokens';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();

  async function runSearch() {
    setHasSearched(true);
    setError(undefined);
    setIsLoading(true);

    try {
      setResults(await searchRepository.search(query));
    } catch {
      setError('Could not search right now. Try again later.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Screen title="Search">
      <View style={styles.searchPanel}>
        <TextInput
          accessibilityLabel="Search My Corner"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={runSearch}
          placeholder="Search providers, groups, notices, requests"
          placeholderTextColor={tokens.color.textSecondary}
          returnKeyType="search"
          style={styles.input}
        />
        <Pressable accessibilityRole="button" onPress={runSearch} style={styles.button}>
          <Text style={styles.buttonText}>Search</Text>
        </Pressable>
      </View>

      {error ? (
        <ErrorState title="Search unavailable" body={error} onRetry={runSearch} />
      ) : isLoading ? (
        <LoadingState title="Searching" />
      ) : !hasSearched ? (
        <EmptyState title="Search My Corner" body="Find providers, groups, agency notices, requests, and marketplace posts." />
      ) : results.length === 0 ? (
        <EmptyState title="No results found" body="Try a provider, service, neighborhood, group, or marketplace keyword." />
      ) : (
        <View style={styles.results}>
          {results.map((result) => (
            <Link key={result.id} href={result.href as '/home'} asChild>
              <Pressable accessibilityRole="button" style={styles.resultCard}>
                <Text style={styles.source}>{result.sourceLabel}</Text>
                <Text style={styles.title}>{result.title}</Text>
                <Text style={styles.subtitle}>{result.subtitle}</Text>
                <Text style={styles.body}>{result.body}</Text>
              </Pressable>
            </Link>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchPanel: {
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    gap: tokens.spacing.md,
    padding: tokens.spacing.lg,
  },
  input: {
    backgroundColor: tokens.color.background,
    borderColor: tokens.color.border,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    color: tokens.color.textPrimary,
    fontSize: tokens.type.body,
    minHeight: tokens.touch.min,
    paddingHorizontal: tokens.spacing.md,
  },
  button: {
    alignItems: 'center',
    backgroundColor: tokens.color.primary,
    borderRadius: tokens.radius.md,
    justifyContent: 'center',
    minHeight: tokens.touch.min,
    padding: tokens.spacing.md,
  },
  buttonText: { color: '#FFFFFF', fontWeight: '700' },
  results: { gap: tokens.spacing.md },
  resultCard: {
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    gap: tokens.spacing.xs,
    minHeight: tokens.touch.min,
    padding: tokens.spacing.lg,
  },
  source: { color: tokens.color.primary, fontSize: tokens.type.label, fontWeight: '800' },
  title: { color: tokens.color.textPrimary, fontSize: tokens.type.card, fontWeight: '700' },
  subtitle: { color: tokens.color.textSecondary, fontSize: tokens.type.support, fontWeight: '700' },
  body: { color: tokens.color.textPrimary, fontSize: tokens.type.support },
});
