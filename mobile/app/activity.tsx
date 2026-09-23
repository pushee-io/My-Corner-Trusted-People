import { isEventsClientEnabled } from '@/lib/events-feature';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { ReportButton, reportStyles as styles } from '@/components/JobReportParts';
import { useProtectedResource } from '@/hooks/useProtectedResource';
import { loadMyReviews } from '@/lib/reviews';
import { listRequesterRequests } from '@/lib/repository';
function MyReviews() {
  const resource = useProtectedResource(loadMyReviews, 10000);
  return (
    <View style={styles.panel}>
      <Text style={styles.title}>Reviews written</Text>
      {resource.error ? <Text style={styles.note}>{resource.error}</Text> : null}
      {resource.data?.length === 0 ? (
        <Text style={styles.note}>You have not written a verified review yet.</Text>
      ) : null}
      {resource.data?.map((review) => (
        <View key={review.id} style={styles.panel}>
          <Text style={styles.body}>
            {review.title} · {review.rating}/5
          </Text>
          <Text style={styles.note}>
            {review.status === 'clean' ? 'Published' : review.status === 'blocked' ? 'Removed' : 'Under review'}
          </Text>
          <ReportButton
            label="Open reviewed job"
            onPress={() => router.push({ pathname: '/hire/request/status', params: { requestId: review.jobId } })}
          />
        </View>
      ))}
    </View>
  );
}
export default function Activity() {
  const resource = useProtectedResource(listRequesterRequests, 10000);
  return (
    <Screen title="My Activity" onRefresh={() => void resource.refresh()} refreshing={resource.loading}>
      <Text style={styles.note}>Your activity is private to your account.</Text>
      {resource.error ? <Text style={styles.error}>{resource.error}</Text> : null}
      <Text style={styles.title}>Hire requests</Text>
      {resource.data?.map((job) => (
        <View key={job.id} style={styles.panel}>
          <Text style={styles.body}>
            {job.title} · {job.status}
          </Text>
          <ReportButton
            label={job.status === 'Completed' ? 'Open completed job / review' : 'Open request'}
            onPress={() => router.push({ pathname: '/hire/request/status', params: { requestId: job.id } })}
          />
        </View>
      ))}
      <MyReviews />
      <ReportButton label="Marketplace" onPress={() => router.push('/marketplace')} />
      <ReportButton label="Groups" onPress={() => router.push('/groups')} />
      {isEventsClientEnabled() ? <ReportButton label="Events" onPress={() => router.push('/events')} /> : null}
    </Screen>
  );
}
