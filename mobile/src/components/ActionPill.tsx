import { useState } from 'react';
import { Pressable, Text } from 'react-native';
import { tokens } from '@/theme/tokens';

/** Shared compact action, using the Create Request AI control's color and spacing tokens. */
export function ActionPill({
  label,
  accessibilityLabel = label,
  onPress,
  primary = false,
  disabled = false,
}: {
  label: string;
  accessibilityLabel?: string;
  onPress: () => void;
  primary?: boolean;
  disabled?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      focusable
      disabled={disabled}
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => ({
        minHeight: tokens.touch.min,
        maxWidth: '100%',
        flexShrink: 1,
        alignSelf: 'flex-start',
        justifyContent: 'center',
        paddingHorizontal: tokens.spacing.lg,
        paddingVertical: tokens.spacing.sm,
        borderRadius: tokens.radius.pill,
        borderWidth: 2,
        borderColor: focused ? tokens.color.focusRing : primary ? tokens.color.primary : tokens.color.border,
        backgroundColor: primary
          ? pressed
            ? tokens.color.primaryPressed
            : tokens.color.primary
          : pressed
            ? tokens.color.border
            : tokens.color.surface,
        opacity: disabled ? 0.5 : 1,
      })}
    >
      <Text
        style={{
          color: primary ? '#FFFFFF' : tokens.color.primary,
          fontSize: tokens.type.body,
          fontWeight: '700',
          textAlign: 'center',
          flexShrink: 1,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
