import { useCallback, useEffect, useState, type PropsWithChildren } from 'react';
import { AppState, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useMessagingResource, usePrivateSessionKey } from '@/hooks/useMessagingResource';
import { loadNotifications, loadUnread, notificationApi, type Notice } from '@/lib/messaging';
import { subscribeMediaSession } from '@/lib/media-session';
import { createNoticeTracker, noticeHref } from '@/lib/communication-notices';
import { CommunicationContext as Context, useCommunication } from '@/components/CommunicationContext';
import { NoticeToast } from '@/components/NoticeToast';

const tracker = createNoticeTracker();
export async function loadCommunicationSnapshot() {
  const [messages, notices] = await Promise.all([loadUnread(), loadNotifications()]);
  return { unread: messages.unread, notices };
}
export function CommunicationProvider({ children }: PropsWithChildren) {
  const session = usePrivateSessionKey();
  const resource = useMessagingResource(loadCommunicationSnapshot);
  const [pending, setPending] = useState<{ session: string; notices: Notice[] }>({ session, notices: [] });
  useEffect(() => {
    const clear = () => { tracker.reset(); setPending({ session, notices: [] }); };
    const unsubscribe = subscribeMediaSession(clear);
    const app = AppState.addEventListener('change', (state) => { if (state !== 'active') clear(); });
    return () => { unsubscribe(); app.remove(); };
  }, [session]);
  useEffect(() => {
    if (!resource.data) { setPending({ session, notices: [] }); return; }
    const incoming = tracker.receive(session, resource.data.notices);
    setPending((current) => ({
      session,
      notices: [...(current.session === session ? current.notices.filter((notice) => resource.data!.notices.some((item) => item.id === notice.id && !item.readAt)) : []), ...incoming].slice(-3),
    }));
  }, [resource.data, session]);
  const dismiss = useCallback(() => setPending((current) => ({ ...current, notices: current.notices.slice(1) })), []);
  const notice = resource.data && pending.session === session ? pending.notices[0] : undefined;
  const open = () => {
    if (!notice) return;
    // Let the destination recheck access even if marking read encounters a network error.
    void notificationApi('read', notice.id).then(() => resource.refresh(true)).catch(() => {});
    dismiss();
    const href = noticeHref(notice);
    if (href) router.push(href);
  };
  return <Context.Provider value={{ unread: resource.data?.unread, notifications: resource.data?.notices.filter((item) => !item.readAt).length, notice, dismiss, open }}>{children}</Context.Provider>;
}
export function CommunicationOverlay() {
  const { notice, dismiss, open } = useCommunication();
  if (!notice) return null;
  return <View pointerEvents="box-none" style={styles.overlay}><NoticeToast key={notice.id} notice={notice} onDismiss={dismiss} onOpen={open} /></View>;
}
const styles = StyleSheet.create({ overlay: { position: 'absolute', top: 4, left: 12, right: 12, zIndex: 1000, elevation: 10 } });
