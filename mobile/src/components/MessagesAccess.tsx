import { IconButton } from '@/components/IconButton';
import { router } from 'expo-router';
import { View } from 'react-native';
import { useMessagingResource } from '@/hooks/useMessagingResource';
import { loadUnread } from '@/lib/messaging';
import { tokens } from '@/theme/tokens';
export function MessagesAccess() {
  const resource = useMessagingResource(loadUnread);
  const unread = resource.data?.unread ?? 0;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing.xs }}>
      <IconButton
        icon="chatbubble-outline"
        label={`Messages, ${unread} unread`}
        count={unread}
        onPress={() => router.push('/messages')}
      />
      <IconButton icon="notifications-outline" label="Notifications" onPress={() => router.push('/notifications')} />
    </View>
  );
}
