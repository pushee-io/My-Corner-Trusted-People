import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '@/components/Screen';
import {
  createManualBiometricReview,
  getManualBiometricReview,
  updateManualBiometricHumanDecision,
} from '@/lib/manual-biometric';
import { tokens } from '@/theme/tokens';

export default function ManualBiometricScreen() {
  const [consentCaptured, setConsentCaptured] = useState(false);
  const [evidenceNote, setEvidenceNote] = useState('Live selfie matched manually by test reviewer.');
  const [review, setReview] = useState(getManualBiometricReview());
  const [errors, setErrors] = useState<string[]>([]);

  function submitForReview() {
    const result = createManualBiometricReview({
      consentCaptured,
      evidenceNote,
    });

    setErrors(result.errors);
    if (result.review) {
      setReview(result.review);
    }
  }

  function setHumanDecision(status: 'passed' | 'failed' | 'cancelled') {
    setReview(updateManualBiometricHumanDecision(status));
  }

  return (
    <Screen title="Manual biometric review">
      <View style={styles.notice}>
        <Text style={styles.noticeText}>
          Test mode only. This flow does not use Ghana Card, does not collect Ghana Card images, and does not allow AI to make the final identity decision.
        </Text>
      </View>

      <Pressable
        style={[styles.consentBox, consentCaptured && styles.consentBoxSelected]}
        onPress={() => setConsentCaptured((value) => !value)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: consentCaptured }}
      >
        <Text style={styles.body}>
          {consentCaptured ? 'Consent captured' : 'Tap to capture explicit consent'}
        </Text>
      </Pressable>

      <Text style={styles.label}>Human-review evidence note</Text>
      <TextInput
        value={evidenceNote}
        onChangeText={setEvidenceNote}
        multiline
        style={styles.textArea}
        accessibilityLabel="Manual biometric evidence note"
      />

      {errors.map((error) => (
        <Text key={error} style={styles.error}>{error}</Text>
      ))}

      <Pressable style={styles.button} onPress={submitForReview}>
        <Text style={styles.buttonText}>Submit for human review</Text>
      </Pressable>

      {review ? (
        <View style={styles.card}>
          <Text style={styles.title}>Review status: {review.status}</Text>
          <Text style={styles.body}>Provider: {review.provider}</Text>
          <Text style={styles.meta}>Review mode: human review only</Text>
          <Text style={styles.meta}>Uses Ghana Card: No</Text>
          <Text style={styles.meta}>Ghana Card images: No</Text>
          <Text style={styles.meta}>AI final decision: No</Text>
          <Text style={styles.meta}>Raw biometric media retained: No</Text>

          <Pressable style={styles.secondary} onPress={() => setHumanDecision('passed')}>
            <Text style={styles.secondaryText}>Mark passed by human reviewer</Text>
          </Pressable>

          <Pressable style={styles.secondary} onPress={() => setHumanDecision('failed')}>
            <Text style={styles.secondaryText}>Mark failed by human reviewer</Text>
          </Pressable>

          <Pressable style={styles.danger} onPress={() => setHumanDecision('cancelled')}>
            <Text style={styles.dangerText}>Cancel review</Text>
          </Pressable>
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
  consentBox: {
    minHeight: tokens.touch.min,
    justifyContent: 'center',
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderWidth: 1,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
  },
  consentBoxSelected: {
    borderColor: tokens.color.primary,
    backgroundColor: '#EEF7F4',
  },
  label: {
    color: tokens.color.textPrimary,
    fontSize: tokens.type.label,
    fontWeight: '700',
  },
  textArea: {
    minHeight: 120,
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
  card: {
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderWidth: 1,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
    gap: tokens.spacing.sm,
  },
  title: {
    color: tokens.color.textPrimary,
    fontSize: tokens.type.card,
    fontWeight: '700',
  },
  body: {
    color: tokens.color.textPrimary,
    fontSize: tokens.type.body,
  },
  meta: {
    color: tokens.color.textSecondary,
    fontSize: tokens.type.support,
  },
  secondary: {
    minHeight: tokens.touch.min,
    justifyContent: 'center',
    borderColor: tokens.color.primary,
    borderWidth: 1,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
  },
  secondaryText: {
    color: tokens.color.primary,
    textAlign: 'center',
    fontWeight: '700',
  },
  danger: {
    minHeight: tokens.touch.min,
    justifyContent: 'center',
    borderColor: tokens.color.error,
    borderWidth: 1,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
  },
  dangerText: {
    color: tokens.color.error,
    textAlign: 'center',
    fontWeight: '700',
  },
  error: {
    color: tokens.color.error,
    fontSize: tokens.type.support,
    fontWeight: '700',
  },
});
