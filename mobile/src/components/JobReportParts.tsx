import { Pressable, StyleSheet, Text, View } from 'react-native';
import { tokens } from '@/theme/tokens';
import type { JobReportStatus } from '@/lib/job-report-repository';

export const reportStatusLabels: Record<JobReportStatus, string> = {
  open: 'Report received',
  reviewing: 'Under review',
  resolved: 'Resolved',
};

export function ReportButton({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[reportStyles.button, disabled && reportStyles.disabled]}
    >
      <Text style={reportStyles.buttonText}>{label}</Text>
    </Pressable>
  );
}

export function ReportLoadState({ loading, error }: { loading: boolean; error?: string }) {
  if (!loading && !error) return null;
  return (
    <View style={reportStyles.panel}>
      <Text accessibilityLiveRegion="polite" style={reportStyles.body}>
        {loading ? 'Loading report…' : error}
      </Text>
    </View>
  );
}

export const reportStyles = StyleSheet.create({
  panel: {
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderWidth: 1,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
    gap: tokens.spacing.sm,
  },
  title: { color: tokens.color.textPrimary, fontSize: tokens.type.card, fontWeight: '700' },
  body: { color: tokens.color.textPrimary, fontSize: tokens.type.body, lineHeight: 24 },
  note: { color: tokens.color.textSecondary, fontSize: tokens.type.support, lineHeight: 21 },
  error: { color: tokens.color.error, fontSize: tokens.type.body },
  input: {
    minHeight: 110,
    padding: tokens.spacing.md,
    borderWidth: 1,
    borderColor: tokens.color.border,
    borderRadius: tokens.radius.md,
    backgroundColor: tokens.color.surface,
    color: tokens.color.textPrimary,
    textAlignVertical: 'top',
    fontSize: tokens.type.body,
  },
  button: {
    minHeight: tokens.touch.min,
    padding: tokens.spacing.md,
    borderWidth: 1,
    borderColor: tokens.color.primary,
    borderRadius: tokens.radius.md,
    justifyContent: 'center',
  },
  buttonText: { color: tokens.color.primary, textAlign: 'center', fontSize: tokens.type.body, fontWeight: '700' },
  disabled: { opacity: 0.5 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.spacing.sm },
});
