import { CommentsProvider } from '@/components/CollapsibleComments';
import { AppHeader } from '@/components/AppHeader';
import { PropsWithChildren } from 'react';
import { RefreshControl, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNavigation } from '@/components/BottomNavigation';
import { tokens } from '@/theme/tokens';

export function Screen({
  title,
  children,
  showTitle = true,
  showBottomNavigation = true,
  onRefresh,
  refreshing = false,
}: PropsWithChildren<{
  title: string;
  showTitle?: boolean;
  showBottomNavigation?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
}>) {
  const { width } = useWindowDimensions();
  const contentWidth = width >= 840 ? 760 : width >= 600 ? 560 : undefined;

  return (
    <CommentsProvider>
      <SafeAreaView style={styles.safe}>
        <View style={[styles.header, contentWidth ? { maxWidth: contentWidth } : null]}>
          <AppHeader title={title} showTitle={showTitle} showActions={showBottomNavigation} />
        </View>
        <ScrollView
          refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> : undefined}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          style={styles.scroll}
          contentContainerStyle={[
            styles.content,
            contentWidth ? { maxWidth: contentWidth, alignSelf: 'center', width: '100%' } : null,
          ]}
        >
          <View style={styles.body}>{children}</View>
        </ScrollView>
        {showBottomNavigation ? <BottomNavigation /> : null}
      </SafeAreaView>
    </CommentsProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: tokens.color.background },
  scroll: { flex: 1 },
  content: {
    flexGrow: 1,
    gap: tokens.spacing.lg,
    padding: tokens.spacing.lg,
    paddingBottom: tokens.spacing.xxl,
  },
  header: { width: '100%', alignSelf: 'center' },
  body: { flexShrink: 1, gap: tokens.spacing.md },
});
