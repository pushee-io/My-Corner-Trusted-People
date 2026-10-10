import { useCommunication } from '@/components/CommunicationContext';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { IconButton } from '@/components/IconButton';

export function CommunicationActions({ unread, notifications }: { unread?: number; notifications?: number }) {
  const shared = useCommunication();
  unread ??= shared.unread;
  notifications ??= shared.notifications;
  return (
    <View style={styles.row}>
      <IconButton
        icon="chatbubble-outline"
        label={unread === undefined ? 'Messages' : `Messages, ${unread} unread`}
        count={unread}
        onPress={() => router.push('/messages')}
      />
      <IconButton
        icon="notifications-outline"
        label={notifications === undefined ? 'Notifications' : `Notifications, ${notifications} unread recent updates`}
        count={notifications}
        onPress={() => router.push('/notifications')}
      />
    </View>
  );
}
const styles = StyleSheet.create({ row: { flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 0 } });
