import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { signOutFromDevice } from '@/lib/auth';
import { getCommunityActionsReadDiagnostics } from '@/lib/community-actions-repository';
import { getSupabaseCommunityReadFailureDiagnostics } from '@/lib/community-actions-supabase-read-adapter';
import { getSupabaseCommunityReadClientDiagnostics } from '@/lib/community-actions-supabase-live-client';
import { tokens } from '@/theme/tokens';

const settings = [
  'Neighborhood: East Legon',
  'Language: English',
  'Data saver: On for pilot',
  'Reduced motion: Uses system setting',
  'Location sharing: General area only',
  'Notifications: In-app prototype updates only',
];

export default function SettingsScreen() {
  const readDiagnostics = getCommunityActionsReadDiagnostics();
  const supabaseDiagnostics = getSupabaseCommunityReadClientDiagnostics();
  const readFailureDiagnostics = getSupabaseCommunityReadFailureDiagnostics();
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string>();

  async function signOut() {
    setSignOutError(undefined);
    setSigningOut(true);

    try {
      await signOutFromDevice();
      router.replace('/');
    } catch (caught) {
      setSignOutError(caught instanceof Error ? caught.message : 'Could not sign out. Please try again.');
      setSigningOut(false);
    }
  }

  return (
    <Screen title="Settings">
      <Text style={styles.body}>
        Planned controls for account, location, notifications, display, language, privacy, and safety.
      </Text>
      <View style={styles.panel}>
        {settings.map((item) => (
          <Text key={item} style={styles.item}>
            {item}
          </Text>
        ))}
      </View>

      <View style={styles.panel}>
        <Text style={styles.label}>Account</Text>
        <Text style={styles.note}>Sign out removes the saved session from this device.</Text>
        {signOutError ? (
          <Text accessibilityRole="alert" style={styles.error}>
            {signOutError}
          </Text>
        ) : null}
        <Pressable
          accessibilityLabel="Sign out"
          accessibilityRole="button"
          accessibilityState={{ disabled: signingOut }}
          disabled={signingOut}
          onPress={signOut}
          style={[styles.signOutButton, signingOut ? styles.disabled : null]}
        >
          <Text style={styles.signOutButtonText}>{signingOut ? 'Signing out...' : 'Sign out'}</Text>
        </Pressable>
      </View>

      <View style={styles.panel}>
        <Text style={styles.label}>Developer diagnostics</Text>
        <Text style={styles.item}>Community reads: {readDiagnostics.activeMode}</Text>
        <Text style={styles.note}>Configured: {readDiagnostics.configuredMode}</Text>
        <Text style={styles.note}>Fallback reason: {readDiagnostics.fallbackReason}</Text>
        <Text style={styles.note}>
          Live Supabase reads: {readDiagnostics.isLiveSupabaseReadEnabled ? 'enabled' : 'disabled'}
        </Text>
        <Text style={styles.note}>Supabase client available: {String(supabaseDiagnostics.clientAvailable)}</Text>
        <Text style={styles.note}>Has Supabase URL: {String(supabaseDiagnostics.hasSupabaseUrl)}</Text>
        <Text style={styles.note}>Has Supabase anon key: {String(supabaseDiagnostics.hasSupabaseAnonKey)}</Text>
        <Text style={styles.note}>Supabase client failure: {supabaseDiagnostics.failureCode}</Text>
        <Text style={styles.note}>Last read table: {readFailureDiagnostics.tableName}</Text>
        <Text style={styles.note}>Last read failure: {readFailureDiagnostics.failureCode}</Text>
        <Text style={styles.note}>Last read message: {readFailureDiagnostics.sanitizedMessage}</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { color: tokens.color.textPrimary, fontSize: tokens.type.body },
  disabled: { opacity: 0.5 },
  error: { color: tokens.color.error, fontSize: tokens.type.support },
  item: { color: tokens.color.textPrimary, fontSize: tokens.type.body },
  label: { color: tokens.color.textPrimary, fontSize: tokens.type.label, fontWeight: '700' },
  note: { color: tokens.color.textSecondary, fontSize: tokens.type.support },
  panel: {
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderWidth: 1,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
    gap: tokens.spacing.md,
  },
  signOutButton: {
    alignItems: 'center',
    borderColor: tokens.color.error,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: tokens.touch.min,
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.md,
  },
  signOutButtonText: { color: tokens.color.error, fontWeight: '700', textAlign: 'center' },
});
