import { IconButton } from '@/components/IconButton';
import { router, useFocusEffect, usePathname } from 'expo-router';
import { useCallback, type ReactNode } from 'react';
import { BackHandler, Keyboard, StyleSheet, Text, View } from 'react-native';
import { MessagesAccess } from '@/components/MessagesAccess';
import { MyCornerLogo } from '@/components/brand/MyCornerLogo';
import { tokens } from '@/theme/tokens';
import { typography } from '@/theme/typography';

export function navigateBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/home');
}

export function AppHeader({
  title,
  showTitle = true,
  showActions = true,
  onBack,
  homeHeader,
}: {
  title: string;
  showTitle?: boolean;
  showActions?: boolean;
  onBack?: () => void;
  homeHeader?: ReactNode;
}) {
  const pathname = usePathname();
  const root = pathname === '/home' || pathname === '/';
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        if ((root || pathname === '/ask' || onBack) && Keyboard.isVisible()) {
          Keyboard.dismiss();
          return true;
        }
        // Native Modals consume Back themselves. Home is the terminal app root.
        if (onBack) onBack();
        else if (root) BackHandler.exitApp();
        else navigateBack();
        return true;
      });
      return () => subscription.remove();
    }, [root, pathname, onBack]),
  );
  return (
    <View style={styles.header}>
      {root
        ? (homeHeader ?? (
            <View style={styles.homeRow}>
              <View style={styles.brand}>
                <MyCornerLogo />
              </View>
              {showActions ? <MessagesAccess /> : null}
            </View>
          ))
        : null}
      {!root ? (
        <View style={styles.titleRow}>
          <IconButton
            icon="arrow-back"
            label="Go back"
            hint={
              onBack ? 'Returns to the previous view' : 'Returns to the previous page, or Home if there is no history'
            }
            onPress={onBack ?? navigateBack}
          />
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
  homeRow: { flexDirection: 'row', alignItems: 'center', gap: tokens.spacing.sm },
  brand: { flex: 1, minWidth: 0 },
  title: { flex: 1, flexShrink: 1, ...typography.section, color: tokens.color.textPrimary },
});
