import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { createLocalPost } from '@/lib/community-repository';
import { tokens } from '@/theme/tokens';

export default function NewLocalPostScreen() {
  const [title, setTitle] = useState('Need a good plumber recommendation');
  const [body, setBody] = useState('Looking for someone who can inspect a small leak this week.');

  function submit() {
    createLocalPost({ title, body });
    router.replace('/community');
  }

  return (
    <Screen title="Create local post">
      <View style={styles.notice}>
        <Text style={styles.noticeText}>This post stays inside East Legon. Do not include exact home addresses.</Text>
      </View>
      <TextInput value={title} onChangeText={setTitle} style={styles.input} accessibilityLabel="Post title" />
      <TextInput
        value={body}
        onChangeText={setBody}
        multiline
        style={styles.textArea}
        accessibilityLabel="Post details"
      />
      <Pressable onPress={submit} style={styles.button}>
        <Text style={styles.buttonText}>Post to East Legon</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  notice: { backgroundColor: '#FFF4D6', borderRadius: tokens.radius.md, padding: tokens.spacing.lg },
  noticeText: { color: tokens.color.textPrimary, fontSize: tokens.type.support, fontWeight: '700' },
  input: {
    minHeight: tokens.touch.min,
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderWidth: 1,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
  },
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
});
