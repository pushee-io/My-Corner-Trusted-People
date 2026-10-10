import { CommunicationActions } from '@/components/CommunicationActions';
import { useMessagingResource } from '@/hooks/useMessagingResource';
import { loadUnread } from '@/lib/messaging';
export function MessagesAccess() {
  const resource = useMessagingResource(loadUnread);
  return <CommunicationActions unread={resource.data?.unread} />;
}
