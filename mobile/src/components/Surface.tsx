import { StyleSheet, View, type ViewProps } from 'react-native';
import { tokens } from '@/theme/tokens';

type SurfaceTone = 'default' | 'muted' | 'success' | 'warning';

/** Presentation only. Child controls retain their own accessibility and behavior. */
export function Surface({ tone = 'default', style, ...props }: ViewProps & { tone?: SurfaceTone }) {
  return <View {...props} style={[styles.base, styles[tone], style]} />;
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: tokens.color.surface,
    borderWidth: 1,
    borderColor: tokens.color.borderSubtle,
    borderRadius: tokens.radius.card,
    padding: tokens.layout.cardInset,
    gap: tokens.spacing.sm,
  },
  default: {},
  muted: { backgroundColor: tokens.color.surfaceMuted },
  success: { backgroundColor: tokens.color.successSurface },
  warning: { backgroundColor: tokens.color.warningSurface },
});
