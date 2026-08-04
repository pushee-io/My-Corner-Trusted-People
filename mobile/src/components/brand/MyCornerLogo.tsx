import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { tokens } from '@/theme/tokens';

export function MyCornerLogo() {
  const { fontScale } = useWindowDimensions();

  return (
    <View style={[styles.lockup, fontScale >= 1.6 ? styles.lockupStacked : null]}>
      <View style={styles.mark}>
        <View style={styles.cornerVertical} />
        <View style={styles.cornerHorizontal} />
        <View style={styles.personLeft} />
        <View style={styles.personRight} />
      </View>
      <View style={styles.textLockup}>
        <Text style={styles.name}>My Corner</Text>
        <Text style={styles.descriptor}>Trusted People</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  lockup: { alignItems: 'center', flexDirection: 'row', gap: tokens.spacing.sm },
  lockupStacked: { alignItems: 'flex-start', flexDirection: 'column' },
  textLockup: { flexShrink: 1, minWidth: 0 },
  mark: {
    width: 42,
    height: 42,
    borderRadius: tokens.radius.md,
    backgroundColor: tokens.color.primary,
    position: 'relative',
  },
  cornerVertical: {
    position: 'absolute',
    left: 11,
    top: 10,
    width: 6,
    height: 22,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  cornerHorizontal: {
    position: 'absolute',
    left: 11,
    top: 26,
    width: 22,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  personLeft: {
    position: 'absolute',
    left: 19,
    top: 13,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: tokens.color.secondary,
  },
  personRight: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: tokens.color.secondary,
  },
  name: { color: tokens.color.textPrimary, flexShrink: 1, fontSize: tokens.type.card, fontWeight: '800' },
  descriptor: {
    color: tokens.color.textSecondary,
    flexShrink: 1,
    fontSize: tokens.type.minimum,
    fontWeight: '700',
  },
});
