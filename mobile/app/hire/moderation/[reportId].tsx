import { useLocalSearchParams } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { WebSafeLink } from '@/components/WebSafeLink';
import { ReportButton, ReportLoadState, reportStatusLabels, reportStyles as styles } from '@/components/JobReportParts';
import { useProtectedResource } from '@/hooks/useProtectedResource';
import { getJobModerationReport, resolveJobReport, type JobReportResolutionReason } from '@/lib/job-report-repository';

const reasons: { value: JobReportResolutionReason; label: string }[] = [
  { value: 'no_violation', label: 'No violation found' },
  { value: 'insufficient_evidence', label: 'Insufficient evidence' },
];

export default function JobModerationDetailScreen() {
  const { reportId } = useLocalSearchParams<{ reportId?: string }>();
  const [reason, setReason] = useState<JobReportResolutionReason>();
  const [notes, setNotes] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();
  const pending = useRef(false);
  const load = useCallback(async () => {
    setNotes('');
    setReason(undefined);
    setConfirm(false);
    setError(undefined);
    if (!reportId) throw new Error('Report unavailable.');
    return getJobModerationReport(reportId);
  }, [reportId]);
  const resource = useProtectedResource(load);
  const report = resource.data;

  async function resolve() {
    if (!reportId || !reason || !report || report.status === 'resolved' || pending.current) return;
    pending.current = true;
    setSaving(true);
    setError(undefined);
    try {
      await resolveJobReport(reportId, reason, notes);
      await resource.refresh();
    } catch {
      setError('Resolution was not confirmed. Refresh to check the saved status, then try again.');
    } finally {
      pending.current = false;
      setSaving(false);
      setConfirm(false);
    }
  }

  return (
    <Screen title="Review job report">
      <ReportLoadState loading={resource.loading} error={resource.error} />
      {report ? (
        <>
          <View style={styles.panel}>
            <Text style={styles.title}>{report.requestTitle}</Text>
            <Text accessibilityLiveRegion="polite" style={styles.body}>
              {reportStatusLabels[report.status]}
            </Text>
            <Text style={styles.body}>
              {report.reason} · {report.reporterName}
            </Text>
            <Text style={styles.note}>{report.neighborhoodName}</Text>
            <Text style={styles.note}>Reported {new Date(report.reportedAt).toLocaleString('en-GH')}</Text>
            <Text style={styles.note}>Request status: {report.requestStatus}</Text>
            <Text style={styles.note}>
              Job safety: {report.sessionState?.replaceAll('_', ' ') ?? 'No session started'}
            </Text>
            <Text selectable style={styles.note}>
              Request reference: {report.requestId}
            </Text>
            <Text style={styles.body}>{report.details}</Text>
          </View>
          <Text style={styles.note}>
            Exact service locations and private identity evidence are excluded from this review.
          </Text>
          <View style={styles.panel}>
            <Text style={styles.title}>History</Text>
            {report.auditHistory.map((entry, index) => (
              <View key={index}>
                <Text style={styles.body}>
                  {entry.action === 'job_report_resolved' ? 'Report resolved' : 'Report submitted'} · {entry.actorName}
                </Text>
                <Text style={styles.note}>{new Date(entry.createdAt).toLocaleString('en-GH')}</Text>
                {entry.reason ? (
                  <Text style={styles.note}>
                    {reasons.find((item) => item.value === entry.reason)?.label ?? 'Recorded reason'}
                  </Text>
                ) : null}
              </View>
            ))}
            {report.reviewNotes ? <Text style={styles.body}>Moderator notes: {report.reviewNotes}</Text> : null}
          </View>
          {report.status === 'resolved' ? (
            <Text accessibilityLiveRegion="polite" style={styles.body}>
              Review complete. No further action was taken. This outcome is available to the requester.
            </Text>
          ) : (
            <>
              <Text style={styles.title}>Resolve with no further action</Text>
              <Text style={styles.note}>
                Record a review outcome. This closes the report; the reported job and safety session remain closed.
              </Text>
              {reasons.map((item) => (
                <Pressable
                  key={item.value}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: reason === item.value, disabled: saving }}
                  disabled={saving}
                  style={styles.button}
                  onPress={() => {
                    setReason(item.value);
                    setConfirm(false);
                  }}
                >
                  <Text style={styles.buttonText}>
                    {reason === item.value ? '✓ ' : ''}
                    {item.label}
                  </Text>
                </Pressable>
              ))}
              <TextInput
                accessibilityLabel="Private moderator notes"
                multiline
                maxLength={500}
                value={notes}
                editable={!saving}
                onChangeText={setNotes}
                style={styles.input}
                placeholder="Optional moderator notes"
              />
              <Text style={styles.note}>
                Notes stay with the moderation team. Do not add home addresses, arrival codes, or identity documents.
              </Text>
              {error ? (
                <Text accessibilityLiveRegion="assertive" style={styles.error}>
                  {error}
                </Text>
              ) : null}
              {confirm ? (
                <>
                  <Text style={styles.body}>
                    Confirm this resolution? The requester will see that the review is complete and no further action
                    was taken.
                  </Text>
                  <ReportButton
                    label={saving ? 'Saving…' : 'Confirm resolution'}
                    disabled={saving}
                    onPress={() => void resolve()}
                  />
                  <ReportButton label="Keep reviewing" disabled={saving} onPress={() => setConfirm(false)} />
                </>
              ) : (
                <ReportButton label="Resolve report" disabled={saving || !reason} onPress={() => setConfirm(true)} />
              )}
            </>
          )}
        </>
      ) : null}
      <ReportButton label="Refresh" disabled={saving || resource.loading} onPress={() => void resource.refresh()} />
      <WebSafeLink href="/hire/moderation" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Back to job reports</Text>
        </Pressable>
      </WebSafeLink>
    </Screen>
  );
}
