import { StyleSheet, Text, View } from 'react-native';
import type { RequestStatus } from '@/types/contracts';
import { tokens } from '@/theme/tokens';

export function StatusPill({ status }: { status: RequestStatus }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.text}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF7F4',
    borderRadius: tokens.radius.pill,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.xs,
  },
  text: {
    color: tokens.color.textPrimary,
    fontSize: tokens.type.support,
    fontWeight: '700',
  },
});
