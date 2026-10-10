import { Pressable, StyleSheet, Text, View } from 'react-native';
import { tokens } from '@/theme/tokens';

export const trustAcknowledgementText =
  'I understand My Corner shows trust evidence but does not guarantee provider conduct';

export function TrustAcknowledgement({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={trustAcknowledgementText}
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      onPress={() => {
        if (!disabled) onChange(!checked);
      }}
      style={[styles.row, disabled && styles.disabled]}
    >
      <View
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[styles.checkbox, checked && styles.checked]}
      >
        {checked ? <Text style={styles.checkmark}>✓</Text> : null}
      </View>
      <Text style={styles.text}>{trustAcknowledgementText}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.md,
    minHeight: tokens.touch.min,
    padding: tokens.spacing.md,
    backgroundColor: tokens.color.surface,
    borderWidth: 1,
    borderColor: tokens.color.border,
    borderRadius: tokens.radius.md,
  },
  checkbox: {
    width: 20,
    height: 20,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: tokens.color.textSecondary,
    borderRadius: 4,
  },
  checked: { backgroundColor: tokens.color.primary, borderColor: tokens.color.primary },
  checkmark: { color: tokens.color.surface, fontSize: tokens.type.support, lineHeight: 18, fontWeight: '700' },
  text: { flex: 1, color: tokens.color.textPrimary, fontSize: tokens.type.support, lineHeight: 20 },
  disabled: { opacity: 0.55 },
});
