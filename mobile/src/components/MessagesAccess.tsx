import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useMessagingResource } from '@/hooks/useMessagingResource';
import { loadUnread } from '@/lib/messaging';
import { reportStyles as styles } from './JobReportParts';
export function MessagesAccess() {
  const resource = useMessagingResource(loadUnread);
  const unread = resource.data?.unread ?? 0;
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Messages, ${unread} unread`}
        onPress={() => router.push('/messages')}
        style={{ minHeight: 48, justifyContent: 'center' }}
      >
        <Text style={styles.body}>Messages{unread > 0 ? ` (${unread})` : ''}</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/notifications')}
        style={{ minHeight: 48, justifyContent: 'center' }}
      >
        <Text style={styles.body}>Notifications</Text>
      </Pressable>
    </View>
  );
}
