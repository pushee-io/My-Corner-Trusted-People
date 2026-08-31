import { Link, type Href, usePathname } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { tokens } from '@/theme/tokens';
import { isEventsClientEnabled } from '@/lib/events-feature';

type BottomNavigationItem = {
  label: string;
  href: Href;
  match: string[];
};

export const bottomNavigationItems: BottomNavigationItem[] = [
  { label: 'Home', href: '/home', match: ['/home', '/neighborhood', '/provider'] },
  { label: 'Hire', href: '/hire/categories', match: ['/hire'] },
  { label: 'Search', href: '/search', match: ['/search'] },
  {
    label: 'Community',
    href: '/community',
    match: ['/community', '/groups', '/agency-broadcasts', ...(isEventsClientEnabled() ? ['/events'] : [])],
  },
  { label: 'Market', href: '/marketplace', match: ['/marketplace'] },
  { label: 'Settings', href: '/settings', match: ['/settings'] },
];

function isSelected(pathname: string, item: BottomNavigationItem) {
  return item.match.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <View accessibilityRole="tablist" style={styles.container}>
      {bottomNavigationItems.map((item) => {
        const selected = isSelected(pathname, item);

        return (
          <Link key={String(item.href)} href={item.href} asChild>
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              style={StyleSheet.flatten([styles.item, selected ? styles.selectedItem : undefined])}
            >
              <Text style={StyleSheet.flatten([styles.label, selected ? styles.selectedLabel : undefined])}>
                {item.label}
              </Text>
            </Pressable>
          </Link>
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
