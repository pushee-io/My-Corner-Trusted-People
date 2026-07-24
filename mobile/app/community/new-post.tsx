import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { createDay2BLocalPost, getDay2BFeedUnlockStatus } from '@/lib/day2b-verification';
import { tokens } from '@/theme/tokens';
import type { FeedUnlockResult } from '@/types/contracts';

export default function NewLocalPostScreen() {
  const [unlock, setUnlock] = useState<FeedUnlockResult>();
  const [body, setBody] = useState('Looking for someone who can inspect a small leak this week.');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadUnlock() {
      const result = await getDay2BFeedUnlockStatus();
      setUnlock(result.data);
      setError(result.error ?? '');
    }

    void loadUnlock();
  }, []);

  async function submit() {
    setSubmitting(true);
    setError('');

    const result = await createDay2BLocalPost(body);
    if (!result.data) {
      setError(result.error ?? 'Verify your neighborhood before posting to the private feed.');
      setSubmitting(false);
      return;
    }

    router.replace('/community');
  }

  if (unlock?.canPost === false) {
    return (
      <Screen title="Create local post">
        <View style={styles.notice}>
          <Text style={styles.noticeText}>{unlock.message}</Text>
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable style={styles.button} onPress={() => router.push('/profile/phone-verification')}>
          <Text style={styles.buttonText}>Start resident verification</Text>
        </Pressable>
      </Screen>
    );
  }

  return (
    <Screen title="Create local post">
      <View style={styles.notice}>
        <Text style={styles.noticeText}>This post is written through Supabase and protected by neighborhood RLS.</Text>
      </View>
      <TextInput
        value={body}
        onChangeText={setBody}
        multiline
        style={styles.textArea}
        accessibilityLabel="Post details"
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable onPress={submit} style={styles.button} disabled={submitting}>
        <Text style={styles.buttonText}>{submitting ? 'Posting...' : 'Post to verified neighborhood'}</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  notice: { backgroundColor: '#FFF4D6', borderRadius: tokens.radius.md, padding: tokens.spacing.lg },
  noticeText: { color: tokens.color.textPrimary, fontSize: tokens.type.support, fontWeight: '700' },
  textArea: {
    minHeight: 128,
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderWidth: 1,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
    textAlignVertical: 'top',
  },
  button: {
    minHeight: tokens.touch.min,
    justifyContent: 'center',
    backgroundColor: tokens.color.primary,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
  },
  buttonText: { color: '#FFFFFF', textAlign: 'center', fontWeight: '700' },
  error: { color: tokens.color.error, fontSize: tokens.type.support, fontWeight: '700' },
});
