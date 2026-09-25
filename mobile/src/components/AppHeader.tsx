import { AskMyCornerAccess } from '@/components/AskMyCornerAccess';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect, usePathname } from 'expo-router';
import { useCallback } from 'react';
import { BackHandler, Pressable, StyleSheet, Text, View } from 'react-native';
import { MessagesAccess } from '@/components/MessagesAccess';
import { MyCornerLogo } from '@/components/brand/MyCornerLogo';
import { tokens } from '@/theme/tokens';

export function navigateBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/home');
}

export function AppHeader({
  title,
  showTitle = true,
  showActions = true,
}: {
  title: string;
  showTitle?: boolean;
  showActions?: boolean;
}) {
  const pathname = usePathname();
  const root = pathname === '/home' || pathname === '/';
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        // Native Modals consume Back themselves. Home is the terminal app root.
        if (root) BackHandler.exitApp();
        else navigateBack();
        return true;
      });
      return () => subscription.remove();
    }, [root]),
  );
  return (
    <View style={styles.header}>
      <MyCornerLogo />
      {showActions ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          <MessagesAccess />
          {pathname !== '/home' && pathname !== '/' ? <AskMyCornerAccess /> : null}
        </View>
      ) : null}
      {!root || showTitle ? (
        <View style={styles.titleRow}>
          {!root ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              accessibilityHint="Returns to the previous page, or Home if there is no history"
              onPress={navigateBack}
              style={styles.back}
            >
              <Ionicons name="arrow-back" size={24} color={tokens.color.textPrimary} accessible={false} />
            </Pressable>
          ) : null}
          {showTitle ? (
            <Text accessibilityRole="header" style={styles.title}>
              {title}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
const styles = StyleSheet.create({
  header: {
    gap: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.lg,
    paddingTop: tokens.spacing.sm,
    paddingBottom: tokens.spacing.sm,
    width: '100%',
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: tokens.spacing.sm },
  back: { width: 48, height: 48, justifyContent: 'center', alignItems: 'center' },
  title: { flex: 1, flexShrink: 1, fontSize: 28, fontWeight: '700', color: tokens.color.textPrimary },
});
