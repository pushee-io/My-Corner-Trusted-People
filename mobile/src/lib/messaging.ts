import { supabase } from '@/lib/supabase';
import { mediaSessionRevision } from '@/lib/media-session';
export type Neighbor = { id: string; name: string; neighborhood: string; canMessage?: boolean };
export type InboxItem = {
  id: string;
  kind: 'marketplace' | 'neighbor';
  peerId: string;
  name: string;
  preview?: string;
  updatedAt: string;
  unread: number;
};
export type Inbox = { unread: number; conversations: InboxItem[] };
export type ChatMessage = { id: string; seq: number; isOwn: boolean; body: string; createdAt: string; nonce: string };
export type Thread = {
  id: string;
  name: string;
  peerId: string;
  canSend: boolean;
  blockedByMe: boolean;
  messages: ChatMessage[];
  nextBefore: number | null;
};
export type CommunicationPreferences = {
  discoverable: boolean;
  allowNeighborMessages: boolean;
  notifyMessages: boolean;
  notifyReviews: boolean;
};
export type Notice = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  readAt?: string;
  isRequester?: boolean;
  targetKind?: string;
  targetId?: string;
};
export type MessageReport = {
  id: string;
  reason: string;
  createdAt: string;
  evidence: { body: string; sender: string; createdAt: string }[];
};
async function communityApi<T>(endpoint: string, args: object): Promise<T> {
  const revision = mediaSessionRevision();
  const { data, error } = await supabase.rpc(endpoint, args);
  if (revision !== mediaSessionRevision()) throw new Error('Your account changed. Open the conversation again.');
  if (error) {
    if (error.code === 'PGRST202') throw new Error('Messages are not available yet.');
    throw new Error(error.message || 'Messages are unavailable. Please retry.');
  }
  return data as T;
}
export const messagingApi = <T>(action: string, target?: string, payload: object = {}) =>
  communityApi<T>('messaging_api', { action, target: target ?? null, payload });
export const notificationApi = <T>(action: string, target?: string) =>
  communityApi<T>('notification_api', { action, target: target ?? null });
export const loadInbox = () => messagingApi<Inbox>('inbox');
export const loadOwnPublicName = () => communityApi<{ name: string | null }>('own_public_name', {});
export async function saveOwnPublicName(name: string) {
  const clean = name.trim();
  if (clean.length < 2 || clean.length > 80 || /[\u0000-\u001f\u007f]/.test(clean))
    throw new Error('Use a public display name of 2–80 characters.');
  return communityApi<{ name: string }>('own_public_name', { new_name: clean });
}
export const loadUnread = () => messagingApi<{ unread: number }>('unread');
export const loadNotifications = () => notificationApi<Notice[]>('list');
export const loadCommunicationPreferences = () => messagingApi<CommunicationPreferences>('settings');
export const loadMessageReports = () => messagingApi<MessageReport[]>('reports');
export const findNeighbors = (query: string) => messagingApi<Neighbor[]>('neighbors', undefined, { query });
export async function resolveMarketplaceThread(requestId: string) {
  return messagingApi<{ conversationId: string }>('resolve_marketplace', requestId);
}
export async function sendChatMessage(conversationId: string, body: string, nonce: string) {
  const text = body.trim();
  if (!text || text.length > 1000) throw new Error('Write a message of 1–1000 characters.');
  return messagingApi<{ id: string; seq: number }>('send', conversationId, { body: text, nonce });
}
