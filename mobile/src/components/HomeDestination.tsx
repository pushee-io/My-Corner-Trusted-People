import { Ionicons } from '@expo/vector-icons';
import type { Href } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { WebSafeLink } from '@/components/WebSafeLink';
import { tokens } from '@/theme/tokens';

/** Wrapping destinations use existing routes and caller-owned capability gates. */
export function HomeDestination({
  href,
  label,
  icon,
  primary = false,
}: {
  href: Href;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  primary?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const color = primary ? tokens.color.onPrimary : tokens.color.textPrimary;
  return (
    <WebSafeLink href={href} asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={({ pressed }) => [
          styles.destination,
          {
            borderColor: focused ? tokens.color.focusRing : tokens.color.borderSubtle,
            backgroundColor: primary
              ? pressed
                ? tokens.color.primaryPressed
                : tokens.color.primary
              : pressed
                ? tokens.color.surfacePressed
                : tokens.color.surface,
          },
        ]}
      >
        <Ionicons name={icon} size={22} color={color} accessible={false} />
        <Text style={[styles.label, { color }]}>{label}</Text>
      </Pressable>
    </WebSafeLink>
  );
}

const styles = StyleSheet.create({
  destination: {
    flexBasis: 144,
    flexGrow: 1,
    minWidth: 0,
    minHeight: tokens.touch.min,
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.sm,
    padding: tokens.spacing.md,
    borderWidth: 1,
    borderRadius: tokens.radius.control,
  },
  label: { ...tokens.typography.button, flex: 1 },
});
