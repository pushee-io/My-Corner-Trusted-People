import { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { WebSafeLink } from '@/components/WebSafeLink';
import { ReportButton, ReportLoadState, reportStatusLabels, reportStyles as styles } from '@/components/JobReportParts';
import { useProtectedResource } from '@/hooks/useProtectedResource';
import { listJobModerationQueue, type JobReportStatus } from '@/lib/job-report-repository';

const filters: { label: string; value: JobReportStatus | 'all' }[] = [
  { label: 'Open', value: 'open' },
  { label: 'Reviewing', value: 'reviewing' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'All', value: 'all' },
];

export default function JobModerationQueueScreen() {
  const [filter, setFilter] = useState<JobReportStatus | 'all'>('open');
  const resource = useProtectedResource(useCallback(() => listJobModerationQueue(filter), [filter]));
  return (
    <Screen title="Job reports">
      <Text style={styles.body}>Review safety concerns and record a reason for each resolution.</Text>
      <View style={styles.filters} accessibilityRole="tablist">
        {filters.map((item) => (
          <Pressable
            key={item.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: filter === item.value }}
            style={styles.button}
            onPress={() => setFilter(item.value)}
          >
            <Text style={styles.buttonText}>
              {filter === item.value ? '✓ ' : ''}
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>
      <ReportButton label="Refresh reports" disabled={resource.loading} onPress={() => void resource.refresh()} />
      <ReportLoadState loading={resource.loading} error={resource.error} />
      {resource.data?.length === 0 ? <Text style={styles.body}>No reports in this view.</Text> : null}
      {resource.data?.map((item) => (
        <WebSafeLink
          key={item.reportId}
          asChild
          href={{ pathname: '/hire/moderation/[reportId]', params: { reportId: item.reportId } }}
        >
          <Pressable accessibilityRole="button" style={styles.panel}>
            <Text style={styles.title}>{item.requestTitle}</Text>
            <Text style={styles.body}>
              {reportStatusLabels[item.status]} · {item.reason}
            </Text>
            <Text style={styles.note}>{item.neighborhoodName}</Text>
            <Text style={styles.note}>Reported {new Date(item.reportedAt).toLocaleString('en-GH')}</Text>
          </Pressable>
        </WebSafeLink>
      ))}
      <Text style={styles.note}>Showing up to 100 reports, oldest first. Refresh or reopen this view for updates.</Text>
      <WebSafeLink href="/marketplace/moderation" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Marketplace reports</Text>
        </Pressable>
      </WebSafeLink>
    </Screen>
  );
}
