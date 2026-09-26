import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import * as Crypto from 'expo-crypto';
import { Screen } from '@/components/Screen';
import { MediaAvatar, MediaAvatarCollection } from '@/components/media/MediaAvatar';
import { ReportButton, reportStyles as styles } from '@/components/JobReportParts';
import { useMessagingResource, usePrivateSessionKey } from '@/hooks/useMessagingResource';
import { useProtectedResource } from '@/hooks/useProtectedResource';
import { loadInbox, messagingApi, resolveMarketplaceThread, sendChatMessage, type Thread } from '@/lib/messaging';

function InboxScreen() {
  const resource = useMessagingResource(loadInbox);
  return (
    <Screen title="Messages" onRefresh={() => void resource.refresh()} refreshing={resource.loading}>
      <ReportButton label="Find neighbors" onPress={() => router.push('/neighbors')} />
      <ReportButton label="Public display name" onPress={() => router.push('/profile/public-name')} />
      <ReportButton label="Message privacy and notifications" onPress={() => router.push('/message-settings')} />
      {resource.loading ? <Text style={styles.body}>Loading conversations…</Text> : null}
      {resource.error ? (
        <>
          <Text style={styles.error}>{resource.error}</Text>
          <ReportButton label="Retry" onPress={() => void resource.refresh()} />
        </>
      ) : null}
      {resource.data?.conversations.length === 0 ? (
        <Text style={styles.body}>
          No conversations yet. Message an eligible neighbor or open Messages from a Marketplace pickup request.
        </Text>
      ) : null}
      <MediaAvatarCollection profileIds={resource.data?.conversations.map((item) => item.peerId) ?? []}>
        {resource.data?.conversations.map((item) => (
          <View key={item.id} style={styles.panel}>
            <MediaAvatar profileId={item.peerId} name={item.name} />
            <Text style={styles.title}>
              {item.name}
              {item.unread ? ` · ${item.unread} unread` : ''}
            </Text>
            <Text style={styles.body}>{item.preview || 'Start the conversation'}</Text>
            <Text style={styles.note}>{new Date(item.updatedAt).toLocaleString()}</Text>
            <ReportButton
              label={`Open conversation with ${item.name}`}
              onPress={() => router.push({ pathname: '/messages', params: { conversationId: item.id } })}
            />
          </View>
        ))}
      </MediaAvatarCollection>
    </Screen>
  );
}
function Conversation({ conversationId }: { conversationId: string }) {
  const [before, setBefore] = useState<number>();
  const load = useCallback(
    () => messagingApi<Thread>('thread', conversationId, before ? { before } : {}),
    [conversationId, before],
  );
  const resource = useMessagingResource(load);
  const data = resource.data;
  const [body, setBody] = useState('');
  const [pending, setPending] = useState<{ body: string; nonce: string; state: 'sending' | 'failed' | 'sent' }>();
  const [notice, setNotice] = useState('');
  const [report, setReport] = useState<{ messageId?: string }>();
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const sending = useRef(false);
  const alive = useRef(true);
  const seen = useRef(0);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  useEffect(() => {
    if (pending && data?.messages.some((message) => message.nonce === pending.nonce)) setPending(undefined);
  }, [data?.messages, pending]);
  const newest = data?.messages.at(-1)?.seq ?? 0;
  useEffect(() => {
    if (!newest || newest <= seen.current) return;
    seen.current = newest;
    void messagingApi('read', conversationId, { through: newest }).catch(() => {
      seen.current = 0;
    });
  }, [conversationId, newest]);
  async function send(retry = false) {
    if (sending.current || !data?.canSend) return;
    const draft =
      retry && pending ? pending : { body: body.trim(), nonce: Crypto.randomUUID(), state: 'sending' as const };
    if (!draft.body) return;
    sending.current = true;
    setPending({ ...draft, state: 'sending' });
    setBody('');
    setNotice('');
    try {
      await sendChatMessage(conversationId, draft.body, draft.nonce);
      if (!alive.current) return;
      setPending({ ...draft, state: 'sent' });
      setBefore(undefined);
      void resource.refresh(true);
    } catch (e) {
      if (alive.current) {
        setPending({ ...draft, state: 'failed' });
        setNotice(e instanceof Error ? e.message : 'Message failed. Retry when connected.');
      }
    } finally {
      sending.current = false;
    }
  }
  async function action(kind: 'block' | 'unblock' | 'report') {
    setBusy(true);
    setNotice('');
    try {
      await messagingApi(kind, conversationId, kind === 'report' ? { reason, messageId: report?.messageId } : {});
      if (!alive.current) return;
      setReport(undefined);
      setReason('');
      setNotice(
        kind === 'report'
          ? 'Report received. Moderators can review the evidence you submitted.'
          : kind === 'block'
            ? 'User blocked. You can still view this conversation.'
            : 'User unblocked.',
      );
      void resource.refresh(true);
    } catch (e) {
      if (alive.current) setNotice(e instanceof Error ? e.message : 'Could not complete this action.');
    } finally {
      if (alive.current) setBusy(false);
    }
  }
  return (
    <Screen
      title={data?.name ? `Messages · ${data.name}` : 'Messages'}
      showBottomNavigation={false}
      onRefresh={() => void resource.refresh()}
      refreshing={resource.loading}
    >
      <ReportButton label="All messages" onPress={() => router.replace('/messages')} />
      <Text style={styles.note}>
        Messages are private to participants, but are not end-to-end encrypted. Report only the evidence you want
        moderators to review. For Marketplace, use protected pickup confirmation for exact addresses.
      </Text>
      {resource.loading ? <Text style={styles.body}>Loading conversation…</Text> : null}
      {resource.error ? (
        <>
          <Text style={styles.error}>{resource.error}</Text>
          <ReportButton label="Retry conversation" onPress={() => void resource.refresh()} />
        </>
      ) : null}
      {data ? (
        <>
          <MediaAvatar profileId={data.peerId} name={data.name} />
          {before ? <ReportButton label="Latest messages" onPress={() => setBefore(undefined)} /> : null}
          {data.messages.length === 50 && data.nextBefore ? (
            <ReportButton label="Older messages" onPress={() => setBefore(data.nextBefore!)} />
          ) : null}
          {data.messages.length === 0 ? <Text style={styles.body}>No messages here yet.</Text> : null}
          {data.messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.panel,
                {
                  alignSelf: message.isOwn ? 'flex-end' : 'flex-start',
                  maxWidth: '92%',
                  backgroundColor: message.isOwn ? '#E7F6EE' : '#FFFFFF',
                },
              ]}
            >
              <Text style={styles.note}>
                {message.isOwn ? 'You' : data.name} · {new Date(message.createdAt).toLocaleString()}
              </Text>
              <Text style={styles.body}>{message.body}</Text>
              {message.isOwn ? (
                <Text style={styles.note}>Sent</Text>
              ) : (
                <ReportButton
                  label="Report message"
                  onPress={() => {
                    setReport({ messageId: message.id });
                    setReason('');
                  }}
                />
              )}
            </View>
          ))}
          {pending && !data.messages.some((m) => m.nonce === pending.nonce) ? (
            <View style={styles.panel}>
              <Text style={styles.body}>{pending.body}</Text>
              <Text accessibilityLiveRegion="polite" style={styles.note}>
                {pending.state === 'sending'
                  ? 'Sending…'
                  : pending.state === 'failed'
                    ? 'Failed to confirm send'
                    : 'Sent'}
              </Text>
              {pending.state === 'failed' ? (
                <ReportButton label="Retry same message" disabled={!data.canSend} onPress={() => void send(true)} />
              ) : null}
            </View>
          ) : null}
          {!data.canSend ? (
            <Text style={styles.note}>
              This conversation is unavailable for sending. You can still view its history.
            </Text>
          ) : null}
          <TextInput
            accessibilityLabel="Write a private message"
            value={body}
            onChangeText={setBody}
            multiline
            maxLength={1000}
            editable={data.canSend}
            placeholder="Write a message"
            style={styles.input}
          />
          <ReportButton
            label={pending?.state === 'sending' ? 'Sending…' : 'Send'}
            disabled={!data.canSend || !body.trim() || pending?.state === 'sending' || pending?.state === 'failed'}
            onPress={() => void send()}
          />
          <ReportButton
            label={data.blockedByMe ? 'Unblock user' : 'Block user'}
            disabled={busy}
            onPress={() => void action(data.blockedByMe ? 'unblock' : 'block')}
          />
          <ReportButton
            label="Report conversation / user"
            disabled={busy}
            onPress={() => {
              setReport({});
              setReason('');
            }}
          />
          {report ? (
            <View style={styles.panel}>
              <Text style={styles.note}>
                {report.messageId
                  ? 'This report shares the selected message with authorized moderators.'
                  : 'This report shares the latest 10 messages with authorized moderators.'}
              </Text>
              <TextInput
                accessibilityLabel="Message report reason"
                multiline
                maxLength={500}
                value={reason}
                onChangeText={setReason}
                style={styles.input}
              />
              <ReportButton
                label="Submit report and evidence"
                disabled={busy || reason.trim().length < 5}
                onPress={() => void action('report')}
              />
              <ReportButton
                label="Cancel report"
                disabled={busy}
                onPress={() => {
                  setReport(undefined);
                  setReason('');
                }}
              />
            </View>
          ) : null}
        </>
      ) : null}
      {notice ? (
        <Text accessibilityLiveRegion="polite" style={styles.note}>
          {notice}
        </Text>
      ) : null}
    </Screen>
  );
}
function MarketplaceConversation({ requestId }: { requestId: string }) {
  const resource = useProtectedResource(useCallback(() => resolveMarketplaceThread(requestId), [requestId]));
  return resource.data ? (
    <Conversation conversationId={resource.data.conversationId} />
  ) : (
    <Screen title="Messages">
      <Text style={styles.body}>{resource.loading ? 'Opening pickup conversation…' : resource.error}</Text>
      <ReportButton label="Retry" onPress={() => void resource.refresh()} />
    </Screen>
  );
}
export default function MessagesScreen() {
  const { conversationId, requestId } = useLocalSearchParams<{ conversationId?: string; requestId?: string }>();
  const sessionKey = usePrivateSessionKey();
  return conversationId ? (
    <Conversation key={`${sessionKey}-${conversationId}`} conversationId={conversationId} />
  ) : requestId ? (
    <MarketplaceConversation key={`${sessionKey}-${requestId}`} requestId={requestId} />
  ) : (
    <InboxScreen key={sessionKey} />
  );
}
