import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { tokens } from '@/theme/tokens';

/** Standard actions only; callers supply a complete spoken label, including counts. */
export function IconButton({
  icon,
  label,
  hint,
  onPress,
  count = 0,
  disabled = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  hint?: string;
  onPress: () => void;
  count?: number;
  disabled?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => ({
        ...styles.button,
        borderColor: focused ? tokens.color.focusRing : 'transparent',
        backgroundColor: pressed && !disabled ? tokens.color.surfacePressed : 'transparent',
      })}
    >
      <Ionicons
        name={icon}
        size={24}
        color={disabled ? tokens.color.disabledText : tokens.color.textPrimary}
        accessible={false}
      />
      {count > 0 ? (
        <View
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={styles.badge}
        >
          <Text style={styles.count}>{count > 99 ? '99+' : count}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: tokens.touch.min,
    minHeight: tokens.touch.min,
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing.xs,
    padding: tokens.spacing.sm,
    borderWidth: 1,
    borderRadius: tokens.radius.control,
  },
  badge: {
    minWidth: 20,
    paddingHorizontal: tokens.spacing.xs,
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.color.primary,
    alignItems: 'center',
  },
  count: { color: tokens.color.onPrimary, ...tokens.typography.caption, fontWeight: '700' },
});
