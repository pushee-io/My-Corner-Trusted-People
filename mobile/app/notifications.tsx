import { ActionRow } from '@/components/ActionRow';
import { noticeHref } from '@/lib/communication-notices';
import { router } from 'expo-router';
import { Text } from 'react-native';
import { Screen } from '@/components/Screen';
import { ReportButton, reportStyles as styles } from '@/components/JobReportParts';
import { useMessagingResource } from '@/hooks/useMessagingResource';
import { loadNotifications, notificationApi, type Notice } from '@/lib/messaging';
export default function Notifications() {
  const resource = useMessagingResource(loadNotifications);
  async function open(notice: Notice) {
    await notificationApi('read', notice.id);
    void resource.refresh(true);
    if (!notice.targetId) return;
    router.push(noticeHref(notice));
  }
  return (
    <Screen title="Notifications" onRefresh={() => void resource.refresh()} refreshing={resource.loading}>
      {resource.error ? (
        <>
          <Text accessibilityRole="alert" style={styles.error}>
            {resource.error}
          </Text>
          <ReportButton label="Retry notifications" onPress={() => void resource.refresh()} />
        </>
      ) : null}
      {resource.loading ? <Text style={styles.body}>Loading updates…</Text> : null}
      {resource.data?.length === 0 ? <Text style={styles.body}>No notifications yet.</Text> : null}
      {resource.data?.map((notice) => (
        <ActionRow
          key={notice.id}
          title={notice.title}
          detail={notice.body}
          icon={
            notice.targetKind === 'message_received'
              ? 'chatbubble-outline'
              : notice.targetKind?.startsWith('event_')
                ? 'calendar-outline'
                : 'notifications-outline'
          }
          meta={`${new Date(notice.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}${notice.readAt ? '' : ' · New'}`}
          unread={!notice.readAt}
          label={`Open update: ${notice.title}${notice.readAt ? '' : ', unread'}`}
          onPress={() => {
            void open(notice).catch(() => void resource.refresh());
          }}
        />
      ))}
    </Screen>
  );
}
