import { useState } from 'react';
import { Pressable, Text } from 'react-native';
import { tokens } from '@/theme/tokens';
import { typography } from '@/theme/typography';

/** Shared compact action. Primary actions retain brand green; secondary actions are neutral. */
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
        borderWidth: 1,
        borderColor: disabled
          ? tokens.color.borderSubtle
          : focused
            ? tokens.color.focusRing
            : primary
              ? tokens.color.primary
              : tokens.color.controlBorder,
        backgroundColor: disabled
          ? tokens.color.disabledSurface
          : primary
            ? pressed
              ? tokens.color.primaryPressed
              : tokens.color.primary
            : pressed
              ? tokens.color.surfacePressed
              : tokens.color.surface,
      })}
    >
      <Text
        style={{
          ...typography.button,
          color: disabled ? tokens.color.disabledText : primary ? tokens.color.onPrimary : tokens.color.textPrimary,
          textAlign: 'center',
          flexShrink: 1,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
