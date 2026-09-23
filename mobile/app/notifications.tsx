import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { ReportButton, reportStyles as styles } from '@/components/JobReportParts';
import { useMessagingResource } from '@/hooks/useMessagingResource';
import { loadNotifications, messagingApi, type Notice } from '@/lib/messaging';
export default function Notifications() {
  const resource = useMessagingResource(loadNotifications);
  async function open(notice: Notice) {
    await messagingApi('read_notification', notice.id);
    void resource.refresh(true);
    if (!notice.targetId) return;
    if (notice.targetKind === 'message_received')
      router.push({ pathname: '/messages', params: { conversationId: notice.targetId } });
    else if (notice.targetKind?.startsWith('review_'))
      router.push({ pathname: '/hire/provider/[providerId]', params: { providerId: notice.targetId } });
  }
  return (
    <Screen title="Notifications" onRefresh={() => void resource.refresh()} refreshing={resource.loading}>
      {resource.error ? <Text style={styles.error}>{resource.error}</Text> : null}
      {resource.loading ? <Text style={styles.body}>Loading updates…</Text> : null}
      {resource.data?.length === 0 ? <Text style={styles.body}>No notifications yet.</Text> : null}
      {resource.data?.map((notice) => (
        <View key={notice.id} style={styles.panel}>
          <Text style={styles.title}>
            {notice.title}
            {notice.readAt ? '' : ' · New'}
          </Text>
          <Text style={styles.body}>{notice.body}</Text>
          <Text style={styles.note}>{new Date(notice.createdAt).toLocaleString()}</Text>
          <ReportButton
            label="Open update"
            onPress={() => {
              void open(notice).catch(() => void resource.refresh());
            }}
          />
        </View>
      ))}
    </Screen>
  );
}
