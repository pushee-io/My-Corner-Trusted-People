import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { getCommunityActionsReadDiagnostics } from '@/lib/community-actions-repository';
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
        <Text style={styles.label}>Developer diagnostics</Text>
        <Text style={styles.item}>{readDiagnostics.label}</Text>
        <Text style={styles.note}>Configured: {readDiagnostics.configuredMode}</Text>
        <Text style={styles.note}>
          Live Supabase reads: {readDiagnostics.isLiveSupabaseReadEnabled ? 'enabled' : 'disabled'}
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { color: tokens.color.textPrimary, fontSize: tokens.type.body },
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
});
