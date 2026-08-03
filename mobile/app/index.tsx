import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { tokens } from '@/theme/tokens';

export default function WelcomeScreen() {
  const { fontScale, width } = useWindowDimensions();
  const stackLockup = fontScale >= 1.6 || width < 340;

  return (
    <Screen title="My Corner" showBottomNavigation={false}>
      <View style={[styles.heroLogo, stackLockup ? styles.heroLogoStacked : null]}>
        <View style={styles.heroMark}>
          <View style={styles.cornerVertical} />
          <View style={styles.cornerHorizontal} />
          <Text style={styles.markText}>MC</Text>
        </View>
        <View style={styles.heroText}>
          <Text style={styles.logoName}>My Corner</Text>
          <Text style={styles.logoDescriptor}>Trusted People</Text>
        </View>
      </View>
      <Text style={styles.body}>No Wahala — Hire without headache.</Text>
      <Text style={styles.body}>Find trusted local help, review visible trust signals, and send a clear request.</Text>
      <Link href="/sign-in" asChild>
        <Pressable accessibilityRole="button" style={styles.button}>
          <Text style={styles.buttonText}>Enter app</Text>
        </Pressable>
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroLogo: {
    alignItems: 'center',
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: tokens.spacing.md,
    padding: tokens.spacing.lg,
  },
  heroLogoStacked: { alignItems: 'flex-start', flexDirection: 'column' },
  heroMark: {
    alignItems: 'center',
    backgroundColor: tokens.color.primary,
    borderRadius: tokens.radius.md,
    flexShrink: 0,
    height: 64,
    justifyContent: 'center',
    position: 'relative',
    width: 64,
  },
  cornerVertical: {
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    height: 34,
    left: 14,
    position: 'absolute',
    top: 14,
    width: 8,
  },
  cornerHorizontal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    bottom: 14,
    height: 8,
    left: 14,
    position: 'absolute',
    width: 34,
  },
  markText: {
    color: tokens.color.secondary,
    fontSize: tokens.type.card,
    fontWeight: '900',
  },
  heroText: { flexShrink: 1, minWidth: 0 },
  logoName: { color: tokens.color.textPrimary, flexShrink: 1, fontSize: 24, fontWeight: '900' },
  logoDescriptor: {
    color: tokens.color.textSecondary,
    flexShrink: 1,
    fontSize: tokens.type.support,
    fontWeight: '700',
  },
  body: { color: tokens.color.textPrimary, flexShrink: 1, fontSize: tokens.type.body },
  button: {
    alignItems: 'center',
    backgroundColor: tokens.color.primary,
    borderRadius: tokens.radius.md,
    justifyContent: 'center',
    minHeight: tokens.touch.min,
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.md,
  },
  buttonText: { color: '#fff', flexShrink: 1, fontWeight: '700', textAlign: 'center' },
});
