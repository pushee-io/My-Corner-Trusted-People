import { CommunicationProvider, CommunicationOverlay } from '@/components/CommunicationProvider';
import { CommentsProvider } from '@/components/CollapsibleComments';
import { AppHeader } from '@/components/AppHeader';
import { PropsWithChildren, type ReactNode } from 'react';
import { RefreshControl, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNavigation } from '@/components/BottomNavigation';
import { tokens } from '@/theme/tokens';
import { usePathname } from 'expo-router';
import { isFocusedForm } from '@/lib/navigation-layout';

export function Screen({
  title,
  children,
  showTitle = true,
  showBottomNavigation = true,
  onRefresh,
  refreshing = false,
  onBack,
  homeHeader,
  footer,
}: PropsWithChildren<{
  title: string;
  showTitle?: boolean;
  showBottomNavigation?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
  onBack?: () => void;
  homeHeader?: ReactNode;
  footer?: ReactNode;
}>) {
  const { width } = useWindowDimensions();
  const pathname = usePathname();
  const showTabs = showBottomNavigation && !isFocusedForm(pathname);
  const contentWidth = width >= 840 ? 760 : width >= 600 ? 560 : undefined;

  const contents = (
    <CommentsProvider>
      <SafeAreaView style={styles.safe}>
        <View style={[styles.header, contentWidth ? { maxWidth: contentWidth } : null]}>
          <AppHeader
            title={title}
            showTitle={showTitle}
            showActions={
              !['/', '/sign-in', '/create-account', '/forgot-password', '/reset-password'].includes(pathname)
            }
            onBack={onBack}
            homeHeader={homeHeader}
          />
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
        {footer ? (
          <View style={[styles.footer, contentWidth ? { maxWidth: contentWidth } : null]}>{footer}</View>
        ) : null}
        {showTabs ? <BottomNavigation /> : null}
        <CommunicationOverlay />
      </SafeAreaView>
    </CommentsProvider>
  );
  return ['/', '/sign-in', '/create-account', '/forgot-password', '/reset-password'].includes(pathname) ? (
    contents
  ) : (
    <CommunicationProvider>{contents}</CommunicationProvider>
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
  footer: {
    width: '100%',
    alignSelf: 'center',
    padding: 12,
    backgroundColor: tokens.color.surface,
    borderTopWidth: 1,
    borderColor: tokens.color.borderSubtle,
  },
  body: { flexShrink: 1, gap: tokens.spacing.md },
});
