import { router, type Href, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useProtectedResource } from '@/hooks/useProtectedResource';
import { getCurrentCapabilities } from '@/lib/capabilities';
import { Pressable, StyleSheet, View } from 'react-native';
import { tokens } from '@/theme/tokens';
import { isEventsClientEnabled } from '@/lib/events-feature';

type BottomNavigationItem = {
  label: string;
  href: Href;
  match: string[];
  icon: keyof typeof Ionicons.glyphMap;
};

export const bottomNavigationItems: BottomNavigationItem[] = [
  { label: 'Home', icon: 'home-outline', href: '/home', match: ['/home', '/neighborhood', '/provider'] },
  { label: 'Hire', icon: 'construct-outline', href: '/hire/categories', match: ['/hire'] },
  { label: 'Search', icon: 'search-outline', href: '/search', match: ['/search'] },
  {
    label: 'Community',
    icon: 'people-outline',
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
  const capabilities = useProtectedResource(getCurrentCapabilities);
  const items = bottomNavigationItems.filter(
    (item) => !['Community', 'Market'].includes(item.label) || capabilities.data?.community,
  );

  return (
    <View accessibilityRole="tablist" style={styles.container}>
      {items.map((item) => {
        const selected = isSelected(pathname, item);

        return (
          <Pressable
            accessibilityLabel={item.label}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            key={String(item.href)}
            onPress={() =>
              router.push(
                item.label === 'Home' && capabilities.data?.provider && !capabilities.data.community
                  ? '/provider/requests'
                  : item.href,
              )
            }
            style={[styles.item, selected ? styles.selectedItem : null]}
          >
            <Ionicons
              name={item.icon}
              size={24}
              color={selected ? '#FFFFFF' : tokens.color.textSecondary}
              accessible={false}
            />
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
  },
  item: {
    alignItems: 'center',
    borderRadius: tokens.radius.md,
    flex: 1,
    justifyContent: 'center',
    minHeight: tokens.touch.min,
    paddingHorizontal: tokens.spacing.xs,
    paddingVertical: tokens.spacing.sm,
  },
  selectedItem: {
    backgroundColor: tokens.color.primary,
  },
  label: {
    color: tokens.color.textSecondary,
    fontSize: tokens.type.minimum,
    fontWeight: '700',
    textAlign: 'center',
  },
  selectedLabel: {
    color: '#FFFFFF',
  },
});
