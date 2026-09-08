import { useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { WebSafeLink } from '@/components/WebSafeLink';
import { Screen } from '@/components/Screen';
import { EmptyState } from '@/components/StateBlocks';
import { StatusPill } from '@/components/StatusPill';
import { ReportButton, reportStatusLabels } from '@/components/JobReportParts';
import { useProtectedResource } from '@/hooks/useProtectedResource';
import { getRequesterJobReport } from '@/lib/job-report-repository';
import { getProvider, getRequest } from '@/lib/repository';
import { tokens } from '@/theme/tokens';

export default function RequestStatusScreen() {
  const params = useLocalSearchParams<{ requestId?: string }>();
  const requestId = params.requestId;
  const resource = useProtectedResource(
    useCallback(async () => {
      if (!requestId) throw new Error('No request ID was provided.');
      const [request, report] = await Promise.all([getRequest(requestId), getRequesterJobReport(requestId)]);
      if (!request) throw new Error('Request unavailable.');
      const provider = await getProvider(request.providerId);
      return { request, provider, report };
    }, [requestId]),
  );
  const { error, loading: isLoading } = resource;
  const { request, provider, report } = resource.data ?? {};

  if (error || isLoading || !request) {
    return (
      <Screen title="Request status">
        <EmptyState
          title={isLoading ? 'Loading request' : 'Request not found'}
          body={error ?? 'Checking live Supabase status.'}
        />
        <ReportButton label="Refresh" disabled={isLoading} onPress={() => void resource.refresh()} />
      </Screen>
    );
  }

  return (
    <Screen title="Request status">
      <ReportButton label="Refresh status" disabled={isLoading} onPress={() => void resource.refresh()} />
      {report ? (
        <View style={styles.panel}>
          <Text accessibilityLiveRegion="polite" style={styles.section}>
            {reportStatusLabels[report.status]}
          </Text>
          <Text style={styles.body}>{report.outcome ?? 'Your concern has been saved for moderator review.'}</Text>
          <Text style={styles.note}>Submitted {new Date(report.submittedAt).toLocaleString('en-GH')}</Text>
          {report.resolvedAt ? (
            <Text style={styles.note}>Reviewed {new Date(report.resolvedAt).toLocaleString('en-GH')}</Text>
          ) : null}
        </View>
      ) : null}
      <View style={styles.panel}>
        <StatusPill status={request.status} />
        <Text style={styles.title}>{request.title}</Text>
        <Text style={styles.body}>
          {provider?.name ?? 'Selected provider'} · {request.areaLabel}
        </Text>
        {request.providerMessage ? <Text style={styles.message}>Provider note: {request.providerMessage}</Text> : null}
      </View>

      {['Accepted', 'In progress', 'Completed'].includes(request.status) ? (
        <WebSafeLink href={{ pathname: '/hire/request/safety-session', params: { requestId: request.id } }} asChild>
          <Pressable style={styles.primary}>
            <Text style={styles.primaryText}>Open job safety session</Text>
          </Pressable>
        </WebSafeLink>
      ) : null}

      <View style={styles.panel}>
        <Text style={styles.section}>Timeline</Text>
        {(request.statusTimeline ?? []).map((event) => (
          <View key={event.id} style={styles.timelineRow}>
            <Text style={styles.body}>{event.status}</Text>
            <Text style={styles.note}>
              {event.actor} · {new Date(event.createdAt).toLocaleString('en-GH')}
            </Text>
            {event.note ? <Text style={styles.note}>{event.note}</Text> : null}
          </View>
        ))}
      </View>

      {['Submitted', 'Viewed', 'Accepted', 'In progress'].includes(request.status) ||
      (request.status === 'Reported' && !report) ? (
        <WebSafeLink href={{ pathname: '/hire/request/report-cancel', params: { requestId: request.id } }} asChild>
          <Pressable style={styles.secondary}>
            <Text style={styles.secondaryText}>Cancel or report</Text>
          </Pressable>
        </WebSafeLink>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderWidth: 1,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
    gap: tokens.spacing.sm,
  },
  title: { color: tokens.color.textPrimary, fontSize: tokens.type.card, fontWeight: '700' },
  section: { color: tokens.color.textPrimary, fontSize: tokens.type.card, fontWeight: '700' },
  body: { color: tokens.color.textPrimary, fontSize: tokens.type.body },
  note: { color: tokens.color.textSecondary, fontSize: tokens.type.support },
  message: { color: tokens.color.primary, fontSize: tokens.type.body, fontWeight: '700' },
  primary: {
    minHeight: tokens.touch.min,
    justifyContent: 'center',
    backgroundColor: tokens.color.primary,
    padding: tokens.spacing.lg,
    borderRadius: tokens.radius.md,
  },
  primaryText: { color: '#FFFFFF', textAlign: 'center', fontWeight: '700' },
  timelineRow: {
    borderTopColor: tokens.color.border,
    borderTopWidth: 1,
    paddingTop: tokens.spacing.sm,
    gap: tokens.spacing.xs,
  },
  secondary: {
    minHeight: tokens.touch.min,
    justifyContent: 'center',
    borderColor: tokens.color.error,
    borderWidth: 1,
    padding: tokens.spacing.lg,
    borderRadius: tokens.radius.md,
  },
  secondaryText: { color: tokens.color.error, textAlign: 'center', fontWeight: '700' },
});
