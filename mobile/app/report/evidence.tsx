import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { tokens } from '@/theme/tokens';

export default function ReportEvidenceScreen() {
  const [requestId, setRequestId] = useState('');
  const [reason, setReason] = useState('Provider did not arrive');
  const [details, setDetails] = useState('');
  const [submittedRef, setSubmittedRef] = useState('');

  function submitReport() {
    const ref = `REP-${Date.now().toString().slice(-6)}`;
    setSubmittedRef(ref);
  }

  return (
    <Screen title="Report evidence">
      <View style={styles.notice}>
        <Text style={styles.noticeText}>
          Use this to record evidence for human review. Do not include private addresses, ID documents, or payment details.
        </Text>
      </View>

      <Text style={styles.label}>Request ID</Text>
      <TextInput
        value={requestId}
        onChangeText={setRequestId}
        placeholder="Example: req-102"
        style={styles.input}
        accessibilityLabel="Request ID"
      />

      <Text style={styles.label}>Reason</Text>
      <TextInput
        value={reason}
        onChangeText={setReason}
        style={styles.input}
        accessibilityLabel="Report reason"
      />

      <Text style={styles.label}>What happened?</Text>
      <TextInput
        value={details}
        onChangeText={setDetails}
        multiline
        placeholder="Describe what happened for moderator review."
        style={styles.textArea}
        accessibilityLabel="Report details"
      />

      <Pressable style={styles.button} onPress={submitReport}>
        <Text style={styles.buttonText}>Submit report evidence</Text>
      </Pressable>

      {submittedRef ? (
        <View style={styles.success}>
          <Text style={styles.successText}>Report evidence saved for review: {submittedRef}</Text>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  notice: {
    backgroundColor: '#FFF4D6',
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
  },
  noticeText: {
    color: tokens.color.textPrimary,
    fontSize: tokens.type.support,
    fontWeight: '700',
  },
  label: {
    color: tokens.color.textPrimary,
    fontSize: tokens.type.label,
    fontWeight: '700',
  },
  input: {
    minHeight: tokens.touch.min,
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderWidth: 1,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
    color: tokens.color.textPrimary,
  },
  textArea: {
    minHeight: 132,
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderWidth: 1,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
    color: tokens.color.textPrimary,
    textAlignVertical: 'top',
  },
  button: {
    minHeight: tokens.touch.min,
    justifyContent: 'center',
    backgroundColor: tokens.color.primary,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
  },
  buttonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '700',
  },
  success: {
    backgroundColor: '#EEF7F4',
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
  },
  successText: {
    color: tokens.color.textPrimary,
    fontSize: tokens.type.body,
    fontWeight: '700',
  },
});
