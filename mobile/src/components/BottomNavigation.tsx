import { router, type Href, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useProtectedResource } from '@/hooks/useProtectedResource';
import { getCurrentCapabilities } from '@/lib/capabilities';
import { Keyboard, Pressable, StyleSheet, View } from 'react-native';
import { tokens } from '@/theme/tokens';
import { isEventsClientEnabled } from '@/lib/events-feature';
import { NavigationArtwork } from './NavigationArtwork';
import { useState } from 'react';

type BottomNavigationItem = {
  label: string;
  href: Href;
  match: string[];
  icon: keyof typeof Ionicons.glyphMap | keyof typeof NavigationArtwork.glyphMap;
};

export const bottomNavigationItems: BottomNavigationItem[] = [
  { label: 'Home', icon: 'home-outline', href: '/home', match: ['/home', '/neighborhood', '/provider'] },
  { label: 'Hire', icon: 'hire', href: '/hire/categories', match: ['/hire'] },
  { label: 'Search', icon: 'search-outline', href: '/search', match: ['/search'] },
  {
    label: 'Community',
    icon: 'neighborhood',
    href: '/community',
    match: ['/community', '/groups', '/agency-broadcasts', ...(isEventsClientEnabled() ? ['/events'] : [])],
  },
  { label: 'Market', icon: 'storefront-outline', href: '/marketplace', match: ['/marketplace'] },
  { label: 'Settings', icon: 'settings-outline', href: '/settings', match: ['/settings'] },
];

function isSelected(pathname: string, item: BottomNavigationItem) {
  return item.match.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function BottomNavigation() {
  const pathname = usePathname();
  const [focusedTab, setFocusedTab] = useState<string>();
  const capabilities = useProtectedResource(getCurrentCapabilities);
  // Keep tab positions stable while account capabilities are loading.
  const items = bottomNavigationItems;

  return (
    <View accessibilityRole="tablist" style={styles.container}>
      {items.map((item) => {
        const selected = isSelected(pathname, item);
        const disabled = ['Community', 'Market'].includes(item.label) && !capabilities.data?.community;

        return (
          <Pressable
            accessibilityLabel={item.label}
            accessibilityRole="tab"
            accessibilityState={{ selected, disabled }}
            disabled={disabled}
            key={String(item.href)}
            onFocus={() => setFocusedTab(item.label)}
            onBlur={() => setFocusedTab(undefined)}
            onPress={() => {
              const destination =
                item.label === 'Home' && capabilities.data?.provider && !capabilities.data.community
                  ? '/provider/requests'
                  : item.href;
              Keyboard.dismiss();
              if (pathname !== destination) router.navigate(destination);
            }}
            style={({ pressed }) => [
              styles.item,
              selected ? styles.selectedItem : null,
              pressed && !disabled ? styles.pressed : null,
              focusedTab === item.label ? styles.focused : null,
            ]}
          >
            {item.icon === 'hire' || item.icon === 'neighborhood' ? (
              <NavigationArtwork
                name={item.icon}
                size={24}
                color={
                  disabled ? tokens.color.disabledText : selected ? tokens.color.primary : tokens.color.textSecondary
                }
                accessible={false}
                style={styles.artwork}
              />
            ) : (
              <Ionicons
                name={item.icon}
                size={24}
                color={
                  disabled ? tokens.color.disabledText : selected ? tokens.color.primary : tokens.color.textSecondary
                }
                accessible={false}
              />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: tokens.spacing.sm,
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
  },
  item: {
    alignItems: 'center',
    borderRadius: tokens.radius.control,
    borderWidth: 1,
    borderColor: 'transparent',
    flex: 1,
    justifyContent: 'center',
    minHeight: tokens.touch.min,
    minWidth: tokens.touch.min,
    paddingHorizontal: tokens.spacing.xs,
    paddingVertical: tokens.spacing.sm,
  },
  selectedItem: {
    backgroundColor: tokens.color.successSurface,
  },
  pressed: { backgroundColor: tokens.color.surfacePressed },
  focused: { borderColor: tokens.color.focusRing },
  artwork: {
    width: 24,
    height: 24,
    lineHeight: 24,
    includeFontPadding: false,
    textAlign: 'center',
  },
});
