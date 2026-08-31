import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { restoreSessionProfile } from '@/lib/auth';
import { tokens } from '@/theme/tokens';

export default function WelcomeScreen() {
  const { fontScale, width } = useWindowDimensions();
  const [restoringSession, setRestoringSession] = useState(true);
  const stackLockup = fontScale >= 1.6 || width < 340;

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      try {
        const profile = await restoreSessionProfile();
        if (!active || !profile) return;

        router.replace(profile.role === 'provider' ? '/provider/requests' : '/neighborhood');
      } catch {
        // Keep the welcome and sign-in flow available when restoration fails.
      } finally {
        if (active) setRestoringSession(false);
      }
    }

    void restoreSession();

    return () => {
      active = false;
    };
  }, []);

  if (restoringSession) {
    return (
      <Screen title="My Corner" showBottomNavigation={false}>
        <View accessibilityLiveRegion="polite" style={styles.restoring}>
          <ActivityIndicator color={tokens.color.primary} />
          <Text style={styles.body}>Restoring your session...</Text>
        </View>
      </Screen>
    );
  }

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
      <Pressable
        accessibilityLabel="Enter My Corner"
        accessibilityRole="button"
        onPress={() => router.push('/sign-in')}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Enter app</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  restoring: {
    alignItems: 'center',
    flex: 1,
    gap: tokens.spacing.md,
    justifyContent: 'center',
    minHeight: 240,
  },
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
