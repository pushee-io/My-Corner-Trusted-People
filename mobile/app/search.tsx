import { AskMyCornerAccess } from '@/components/AskMyCornerAccess';
import { NeighborResults } from '@/components/NeighborResults';
import type { Href } from 'expo-router';
import { WebSafeLink } from '@/components/WebSafeLink';
import { MediaThumbnail } from '@/components/media/MediaThumbnail';
import { useProtectedResource } from '@/hooks/useProtectedResource';
import { useCallback, useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { EmptyState, ErrorState, LoadingState } from '@/components/StateBlocks';
import { searchRepository } from '@/lib/search-repository';
import { tokens } from '@/theme/tokens';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);
  const resource = useProtectedResource(useCallback(() => searchRepository.search(debounced), [debounced]));
  const searching = query.trim().length >= 2;
  const waiting = query.trim() !== debounced || resource.loading;
  return (
    <Screen title="Search">
      <Text style={styles.body}>Find local help, neighborhood posts, groups, events and marketplace listings.</Text>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search My Corner"
        accessibilityLabel="Search My Corner"
        style={styles.input}
        returnKeyType="search"
      />
      {query.trim().split(/\s+/).length >= 4 ? <AskMyCornerAccess question={query.trim()} /> : null}
      {!searching ? (
        <EmptyState title="What are you looking for?" body="Enter at least two characters to search." />
      ) : waiting ? (
        <LoadingState title="Searching" />
      ) : resource.error ? (
        <ErrorState
          title="Search unavailable"
          body={resource.error}
          onRetry={() => {
            void resource.refresh();
          }}
        />
      ) : !resource.data?.length ? (
        <EmptyState title="No results" body="Try a different name or keyword." />
      ) : (
        <View style={styles.section}>
          {resource.data.map((result) => (
            <WebSafeLink key={result.id} href={result.href as Href} asChild>
              <Pressable accessibilityRole="button" style={styles.card}>
                {result.thumbnailUrl ? (
                  <Image
                    source={{ uri: result.thumbnailUrl }}
                    style={{ width: '100%', height: 160 }}
                    accessibilityLabel="Listing photo"
                  />
                ) : result.mediaParent && result.mediaParentId ? (
                  <MediaThumbnail parent={result.mediaParent} parentId={result.mediaParentId} />
                ) : null}
                <Text style={styles.body}>{result.sourceLabel}</Text>
                <Text style={styles.title}>{result.title}</Text>
                <Text style={styles.body}>{result.subtitle}</Text>
              </Pressable>
            </WebSafeLink>
          ))}
        </View>
      )}
      {searching ? <NeighborResults query={debounced} /> : null}
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
