import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { EmptyState, LoadingState } from '@/components/StateBlocks';
import { listMarketplaceMessages, sendMarketplaceMessage } from '@/lib/marketplace-repository';
import { tokens } from '@/theme/tokens';
import type { MarketplaceMessage } from '@/types/contracts';

export default function MessagesScreen() {
  const { requestId, listingTitle } = useLocalSearchParams<{ requestId?: string; listingTitle?: string }>();
  const [messages, setMessages] = useState<MarketplaceMessage[]>([]);
  const [body, setBody] = useState('');
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(Boolean(requestId));
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    if (!requestId) return;
    setError(undefined);
    try {
      setMessages(await listMarketplaceMessages(requestId));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not load messages.');
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  async function send() {
    const trimmed = body.trim();
    if (!requestId || !trimmed) return;
    setSending(true);
    setError(undefined);
    try {
      const message = await sendMarketplaceMessage(requestId, trimmed);
      setMessages((current) => [...current, message]);
      setBody('');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not send message.');
    } finally {
      setSending(false);
    }
  }

  if (!requestId) {
    return (
      <Screen title="Messages">
        <EmptyState title="Open a Marketplace conversation" body="Choose Messages from an active pickup request." />
      </Screen>
    );
  }

  return (
    <Screen title={listingTitle ? `Messages · ${listingTitle}` : 'Marketplace messages'} showBottomNavigation={false}>
      <View style={styles.notice}>
        <Text style={styles.noticeText}>
          Messages are private to buyer and seller, but are not end-to-end encrypted.
        </Text>
        <Text style={styles.noticeBody}>
          Do not send phone numbers or exact addresses here. Use protected pickup confirmation.
        </Text>
      </View>

      {loading ? <LoadingState title="Loading messages" /> : null}
      {error ? <EmptyState title="Message notice" body={error} /> : null}
      {!loading && !error && messages.length === 0 ? (
        <Text style={styles.empty}>No messages yet. Ask a short question about the item or pickup window.</Text>
      ) : null}

      <View accessibilityLabel="Marketplace conversation" style={styles.thread}>
        {messages.map((message) => (
          <View key={message.id} style={[styles.bubble, message.isOwn ? styles.ownBubble : styles.otherBubble]}>
            <Text style={styles.sender}>{message.isOwn ? 'You' : message.senderName}</Text>
            <Text style={styles.body}>{message.body}</Text>
            <Text style={styles.meta}>
              {new Date(message.createdAt).toLocaleString('en-GH', {
                dateStyle: 'medium',
                timeStyle: 'short',
                timeZone: 'Africa/Accra',
              })}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.composer}>
        <TextInput
          accessibilityLabel="Message buyer or seller"
          value={body}
          onChangeText={setBody}
          placeholder="Write a message"
          multiline
          maxLength={1000}
          style={styles.input}
          textAlignVertical="top"
        />
        <View style={styles.composerActions}>
          <Pressable accessibilityRole="button" onPress={() => void load()} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Refresh</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={sending || !body.trim()}
            onPress={() => void send()}
            style={[styles.button, sending || !body.trim() ? styles.disabled : null]}
          >
            <Text style={styles.buttonText}>{sending ? 'Sending...' : 'Send'}</Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { color: tokens.color.textPrimary, fontSize: tokens.type.body, lineHeight: 22 },
  bubble: { borderRadius: tokens.radius.md, gap: tokens.spacing.xs, maxWidth: '88%', padding: tokens.spacing.md },
  button: {
    backgroundColor: tokens.color.primary,
    borderRadius: tokens.radius.md,
    flex: 1,
    justifyContent: 'center',
    minHeight: tokens.touch.min,
    padding: tokens.spacing.md,
  },
  buttonText: { color: '#FFFFFF', fontWeight: '700', textAlign: 'center' },
  composer: {
    borderTopColor: tokens.color.border,
    borderTopWidth: 1,
    gap: tokens.spacing.sm,
    paddingTop: tokens.spacing.md,
  },
  composerActions: { flexDirection: 'row', gap: tokens.spacing.sm },
  disabled: { opacity: 0.55 },
  empty: { color: tokens.color.textSecondary, fontSize: tokens.type.support, lineHeight: 20, textAlign: 'center' },
  input: {
    borderColor: tokens.color.border,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    color: tokens.color.textPrimary,
    fontSize: tokens.type.body,
    minHeight: 88,
    padding: tokens.spacing.md,
  },
  meta: { color: tokens.color.textSecondary, fontSize: tokens.type.support },
  notice: {
    backgroundColor: '#FFF4D6',
    borderRadius: tokens.radius.md,
    gap: tokens.spacing.xs,
    padding: tokens.spacing.lg,
  },
  noticeBody: { color: tokens.color.textPrimary, fontSize: tokens.type.support, lineHeight: 20 },
  noticeText: { color: tokens.color.textPrimary, fontSize: tokens.type.support, fontWeight: '700' },
  otherBubble: {
    alignSelf: 'flex-start',
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderWidth: 1,
  },
  ownBubble: { alignSelf: 'flex-end', backgroundColor: '#E7F6EE' },
  secondaryButton: {
    borderColor: tokens.color.primary,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: tokens.touch.min,
    padding: tokens.spacing.md,
  },
  secondaryButtonText: { color: tokens.color.primary, fontWeight: '700', textAlign: 'center' },
  sender: { color: tokens.color.textPrimary, fontSize: tokens.type.support, fontWeight: '700' },
  thread: { gap: tokens.spacing.sm },
});
