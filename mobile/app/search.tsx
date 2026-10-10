import { Ionicons } from '@expo/vector-icons';
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
  const [category, setCategory] = useState('All');
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
  const labels = ['All', ...new Set((resource.data ?? []).map((result) => result.sourceLabel))];
  const visible = (resource.data ?? []).filter((result) => category === 'All' || result.sourceLabel === category);
  useEffect(() => setCategory('All'), [debounced]);
  const searching = query.trim().length >= 2;
  const waiting = query.trim() !== debounced || resource.loading;
  return (
    <Screen title="Search">
      <View style={styles.intro}>
        <Text style={styles.eyebrow}>YOUR NEIGHBORHOOD, WITHIN REACH</Text>
        <Text accessibilityRole="header" style={styles.headline}>
          What are you looking for?
        </Text>
        <Text style={styles.subtitle}>Local help, useful finds and community answers.</Text>
      </View>
      <View style={styles.composer}>
        <TextInput
          ref={input}
          onSubmitEditing={submit}
          maxLength={600}
          value={query}
          onChangeText={setQuery}
          placeholderTextColor={tokens.color.textSecondary}
          placeholder="Search My Corner"
          accessibilityLabel="Search My Corner"
          style={styles.input}
          returnKeyType="search"
        />
        {query ? (
          <IconButton
            icon="close"
            label="Clear search"
            onPress={() => {
              setQuery('');
              setDebounced('');
              input.current?.focus();
            }}
          />
        ) : null}
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
        <View style={styles.section}>
          <Text style={styles.subtitle}>Search by name or keyword, or explore a corner below.</Text>
          <View style={styles.discovery}>
            {(
              [
                ['Local services', 'construct-outline', '/hire/categories'],
                ['Neighborhood feed', 'people-outline', '/community'],
                ['Marketplace', 'storefront-outline', '/marketplace'],
                ['Groups', 'chatbubbles-outline', '/groups'],
                ['Agency updates', 'megaphone-outline', '/agency-broadcasts'],
              ] as const
            ).map(([label, icon, href]) => (
              <WebSafeLink key={href} href={href} asChild>
                <Pressable
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.discoveryCard, pressed && styles.pressed]}
                >
                  <Ionicons name={icon} size={24} color={tokens.color.primary} accessible={false} />
                  <Text style={styles.discoveryLabel}>{label}</Text>
                  <Ionicons name="arrow-forward" size={18} color={tokens.color.textSecondary} accessible={false} />
                </Pressable>
              </WebSafeLink>
            ))}
          </View>
        </View>
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
          <Text accessibilityLiveRegion="polite" style={styles.subtitle}>
            {visible.length} results
          </Text>
          <View accessibilityRole="tablist" style={styles.filters}>
            {labels.map((label) => (
              <Pressable
                key={label}
                accessibilityRole="tab"
                accessibilityState={{ selected: label === category }}
                onPress={() => {
                  Keyboard.dismiss();
                  setCategory(label);
                }}
                style={[styles.filter, label === category && styles.activeFilter]}
              >
                <Text style={[styles.filterText, label === category && styles.activeFilterText]}>{label}</Text>
              </Pressable>
            ))}
          </View>
          {[...new Set(visible.map((r) => r.sourceLabel))].map((label) => (
            <View key={label} style={styles.section}>
              <Text accessibilityRole="header" style={styles.title}>
                {label}
              </Text>
              {visible
                .filter((r) => r.sourceLabel === label)
                .map((result) => (
                  <WebSafeLink key={result.id} href={result.href as Href} asChild>
                    <Pressable
                      accessibilityRole="button"
                      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
                    >
                      {result.thumbnailUrl ? (
                        <Image
                          source={{ uri: result.thumbnailUrl }}
                          style={{ width: '100%', height: 160 }}
                          accessibilityLabel="Listing photo"
                        />
                      ) : result.mediaParent && result.mediaParentId ? (
                        <MediaThumbnail parent={result.mediaParent} parentId={result.mediaParentId} />
                      ) : null}
                      <Text style={styles.eyebrow}>{result.sourceLabel}</Text>
                      <Text style={styles.title}>{result.title}</Text>
                      <Text style={styles.subtitle}>{result.subtitle}</Text>
                      <Text numberOfLines={3} style={styles.body}>
                        {result.body.slice(0, 240)}
                      </Text>
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
  intro: { gap: 6, paddingVertical: 8 },
  eyebrow: { color: tokens.color.primary, fontSize: 12, lineHeight: 18, letterSpacing: 0.8, fontWeight: '800' },
  headline: { color: tokens.color.ink, fontSize: 28, lineHeight: 34, fontWeight: '800' },
  subtitle: { color: tokens.color.textSecondary, fontSize: 14, lineHeight: 21 },
  discovery: { gap: 10 },
  discoveryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: tokens.color.successSurface,
    borderRadius: 16,
    padding: 16,
    minHeight: 64,
  },
  discoveryLabel: { flex: 1, color: tokens.color.textPrimary, fontSize: 16, lineHeight: 22, fontWeight: '700' },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filter: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: tokens.color.surfaceMuted,
  },
  activeFilter: { backgroundColor: tokens.color.primary },
  filterText: { color: tokens.color.textPrimary, fontSize: 14, fontWeight: '600' },
  activeFilterText: { color: tokens.color.onPrimary },
  pressed: { backgroundColor: tokens.color.surfacePressed },
  body: {
    color: tokens.color.textPrimary,
    fontSize: tokens.type.body,
    lineHeight: 22,
  },
  card: {
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderRadius: tokens.radius.card,
    borderWidth: 1,
    gap: tokens.spacing.sm,
    padding: tokens.spacing.lg,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.primary,
    borderRadius: tokens.radius.card,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    minWidth: 0,
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
