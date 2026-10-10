import { AskMyCornerAccess } from '@/components/AskMyCornerAccess';
import { IconButton } from '@/components/IconButton';
import { useLocalSearchParams } from 'expo-router';
import type { Href } from 'expo-router';
import { WebSafeLink } from '@/components/WebSafeLink';
import { MediaThumbnail } from '@/components/media/MediaThumbnail';
import { useProtectedResource } from '@/hooks/useProtectedResource';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Image, Keyboard, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { EmptyState, ErrorState, LoadingState } from '@/components/StateBlocks';
import { searchRepository } from '@/lib/search-repository';
import { tokens } from '@/theme/tokens';

export default function SearchScreen() {
  const params = useLocalSearchParams<{ query?: string }>();
  const input = useRef<TextInput>(null);
  const [query, setQuery] = useState(typeof params.query === 'string' ? params.query.slice(0, 600) : '');
  const [debounced, setDebounced] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);
  const resource = useProtectedResource(useCallback(() => searchRepository.search(debounced), [debounced]));
  function submit() {
    input.current?.blur();
    Keyboard.dismiss();
    setDebounced(query.trim());
  }
  const searching = query.trim().length >= 2;
  const waiting = query.trim() !== debounced || resource.loading;
  return (
    <Screen title="Search">
      <Text style={styles.body}>Find local help, neighborhood posts, groups, events and marketplace listings.</Text>
      <View style={styles.composer}>
      <TextInput
        ref={input}
        onSubmitEditing={submit}
        maxLength={600}
        value={query}
        onChangeText={setQuery}
        placeholder="Search My Corner"
        accessibilityLabel="Search My Corner"
        style={styles.input}
        returnKeyType="search"
      />
        <IconButton icon="search-outline" label="Search" onPress={submit} />
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <AskMyCornerAccess
          question={query.trim()}
          beforeOpen={() => {
            input.current?.blur();
            Keyboard.dismiss();
          }}
        />
      </View>
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
        <EmptyState
          title="No results"
          body={
            resource.data?.unavailableSources?.length
              ? `No matches from available categories. Temporarily unavailable: ${resource.data.unavailableSources.join(', ')}. Try again.`
              : 'Try a different name or keyword.'
          }
        />
      ) : (
        <View style={styles.section}>
          {resource.data.unavailableSources?.length ? (
            <Text style={styles.body}>
              Some categories are temporarily unavailable: {resource.data.unavailableSources.join(', ')}.
            </Text>
          ) : null}
          {[...new Set(resource.data.map((r) => r.sourceLabel))].map((label) => (
            <View key={label} style={styles.section}>
              <Text accessibilityRole="header" style={styles.title}>
                {label}
              </Text>
              {resource
                .data!.filter((r) => r.sourceLabel === label)
                .map((result) => (
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
                      <Text style={styles.body}>{result.body.slice(0, 240)}</Text>
                    </Pressable>
                  </WebSafeLink>
                ))}
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
  composer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border, borderRadius: tokens.radius.control, borderWidth: 1,
  },
  input: {
    flex: 1, minWidth: 0,
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
