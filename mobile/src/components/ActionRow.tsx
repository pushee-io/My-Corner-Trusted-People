import type { ReactNode } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { tokens } from '@/theme/tokens';

export function ActionRow({ title, detail, meta, leading, icon, unread, label, detailLines, onPress }: {
  title: string; detail?: string; detailLines?: number; meta?: string; leading?: ReactNode;
  icon?: keyof typeof Ionicons.glyphMap; unread?: boolean; label?: string; onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label ?? title} onPress={onPress}
      style={({ pressed }) => [styles.row, unread ? styles.unread : null, pressed ? styles.pressed : null]}>
      {leading ?? (icon ? <Ionicons name={icon} size={24} color={tokens.color.primary} accessible={false} /> : null)}
      <View style={styles.copy}>
        <Text style={[styles.title, unread ? styles.bold : null]}>{title}</Text>
        {detail ? <Text numberOfLines={detailLines} style={styles.detail}>{detail}</Text> : null}
        {meta ? <Text style={styles.meta}>{meta}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={tokens.color.textSecondary} accessible={false} />
    </Pressable>
  );
}
const styles = StyleSheet.create({
  row: { minHeight: tokens.touch.min, flexDirection: 'row', alignItems: 'center', gap: tokens.spacing.md,
    padding: tokens.spacing.md, backgroundColor: tokens.color.surface, borderWidth: 1,
    borderColor: tokens.color.border, borderRadius: tokens.radius.md },
  copy: { flex: 1, minWidth: 0, gap: tokens.spacing.xs },
  title: { color: tokens.color.textPrimary, fontSize: tokens.type.body, fontWeight: '600' },
  bold: { fontWeight: '800' },
  detail: { color: tokens.color.textSecondary, fontSize: tokens.type.support, lineHeight: 20 },
  meta: { color: tokens.color.textSecondary, fontSize: tokens.type.minimum },
  unread: { borderLeftWidth: 3, borderLeftColor: tokens.color.primary },
  pressed: { backgroundColor: tokens.color.surfacePressed },
});
