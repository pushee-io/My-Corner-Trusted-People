import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { OfflineBanner } from '@/components/StateBlocks';
import { categories } from '@/lib/mock-data';
import { getProvider } from '@/lib/repository';
import { trackEvent } from '@/lib/analytics';
import { structureServiceRequest } from '@/lib/ai';
import { featureFlags } from '@/lib/feature-flags';
import { validateRequestDraft } from '@/lib/request-validation';
import { testRequester } from '@/lib/session';
import { tokens } from '@/theme/tokens';
import type { ContactPreference, RequestUrgency } from '@/types/contracts';

const urgencyOptions: { label: string; value: RequestUrgency }[] = [
  { label: 'Flexible', value: 'flexible' },
  { label: 'Soon', value: 'soon' },
  { label: 'Urgent', value: 'urgent' },
];

const contactOptions: { label: string; value: ContactPreference }[] = [
  { label: 'App update', value: 'app_update' },
  { label: 'Phone call', value: 'phone_call' },
  { label: 'SMS', value: 'sms' },
];

export default function NewRequestScreen() {
  const params = useLocalSearchParams<{ providerId?: string; categoryId?: string }>();
  const provider = getProvider(params.providerId ?? 'prov-01');
  const category = categories.find((item) => item.id === (params.categoryId ?? provider?.categoryIds[0]));
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [preferredDate, setPreferredDate] = useState('2026-07-18');
  const [preferredTime, setPreferredTime] = useState('Afternoon');
  const [urgency, setUrgency] = useState<RequestUrgency>('soon');
  const [contactPreference, setContactPreference] = useState<ContactPreference>('app_update');
  const [photoCount, setPhotoCount] = useState(0);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [error, setError] = useState('');

  const draft = {
    requesterName: testRequester.name,
    providerId: provider?.id ?? 'prov-01',
    categoryId: category?.id ?? 'plumbing',
    neighborhood: testRequester.neighborhood,
    areaLabel: `${testRequester.neighborhood}, general area only`,
    title,
    description,
    originalUserText: description,
    urgency,
    preferredDate,
    preferredTime,
    contactPreference,
    photoCount,
  };

  function reviewRequest() {
    const validation = validateRequestDraft(draft, consentAccepted);
    if (!validation.valid) {
      setError(Object.values(validation.errors)[0] ?? 'Please complete the request.');
      return;
    }

    trackEvent('request_review_started', { categoryId: draft.categoryId, providerId: draft.providerId, urgency });
    router.push({
      pathname: '/hire/request/review',
      params: {
        ...draft,
        photoCount: String(draft.photoCount),
      },
    });
  }

  function useSampleRequest() {
    const sampleDraft = {
      ...draft,
      title: title || 'Kitchen sink leak',
      description:
        description || 'Water is leaking under the kitchen sink. I need someone to inspect it and repair the leak.',
    };

    trackEvent('request_sample_used', {
      categoryId: sampleDraft.categoryId,
      providerId: sampleDraft.providerId,
      urgency,
    });

    router.push({
      pathname: '/hire/request/review',
      params: {
        ...sampleDraft,
        originalUserText: sampleDraft.description,
        photoCount: String(sampleDraft.photoCount),
      },
    });
  }

  useEffect(() => {
    const timeout = setTimeout(useSampleRequest, 1200);
    return () => clearTimeout(timeout);
  }, []);

  async function useAiStructurer() {
    if (!featureFlags.ai_service_request_structurer) {
      setError('AI structuring is currently off. You can still submit the request manually.');
      return;
    }
    const result = await structureServiceRequest(description);
    setTitle(result.title ?? title);
    setDescription(result.description ?? description);
  }

  return (
    <Screen title="Create request">
      <OfflineBanner />
      <Text style={styles.noticeText}>Prototype note: this screen will continue to review automatically.</Text>
      <Text style={styles.summary}>
        Requesting {category?.name ?? 'help'} from {provider?.name ?? 'selected provider'}.
      </Text>
      <Pressable onPress={useSampleRequest} style={styles.button}>
        <Text style={styles.buttonText}>Use sample request and review</Text>
      </Pressable>
      <Text style={styles.label}>Job title</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        style={styles.input}
        placeholder="Example: Kitchen sink leak"
        accessibilityLabel="Job title"
      />
      <Text style={styles.label}>Description</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        multiline
        style={[styles.input, styles.multiline]}
        placeholder="Describe what you need, where generally, and any access notes."
        accessibilityLabel="Job description"
      />
      <Pressable onPress={useAiStructurer} style={styles.secondaryButton}>
        <Text style={styles.secondaryText}>Structure with AI</Text>
      </Pressable>
      <Text style={styles.label}>General area</Text>
      <Text style={styles.readonly}>{draft.areaLabel}</Text>
      <Text style={styles.label}>Preferred date</Text>
      <TextInput
        value={preferredDate}
        onChangeText={setPreferredDate}
        style={styles.input}
        accessibilityLabel="Preferred date"
      />
      <Text style={styles.label}>Preferred time</Text>
      <TextInput
        value={preferredTime}
        onChangeText={setPreferredTime}
        style={styles.input}
        accessibilityLabel="Preferred time"
      />
      <Text style={styles.label}>Urgency</Text>
      <View style={styles.optionRow}>
        {urgencyOptions.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => setUrgency(option.value)}
            style={[styles.chip, urgency === option.value ? styles.chipSelected : null]}
          >
            <Text style={styles.chipText}>{option.label}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.label}>Contact preference</Text>
      <View style={styles.optionRow}>
        {contactOptions.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => setContactPreference(option.value)}
            style={[styles.chip, contactPreference === option.value ? styles.chipSelected : null]}
          >
            <Text style={styles.chipText}>{option.label}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable onPress={() => setPhotoCount((count) => Math.min(count + 1, 3))} style={styles.photoBox}>
        <Text style={styles.photoText}>Optional photos: {photoCount}. Add photo placeholder</Text>
      </Pressable>
      <Pressable onPress={() => setConsentAccepted((value) => !value)} style={styles.notice}>
        <Text style={styles.noticeText}>
          {consentAccepted ? 'Selected: ' : ''}I understand My Corner shows trust evidence but does not guarantee
          provider conduct.
        </Text>
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable onPress={reviewRequest} style={styles.button}>
        <Text style={styles.buttonText}>Review request</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  summary: { fontSize: tokens.type.body, color: tokens.color.textPrimary },
  label: { fontSize: tokens.type.label, color: tokens.color.textSecondary, fontWeight: '700' },
  input: {
    minHeight: tokens.touch.min,
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderWidth: 1,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.md,
    fontSize: tokens.type.body,
  },
  multiline: { minHeight: 120, textAlignVertical: 'top' },
  readonly: {
    padding: tokens.spacing.md,
    backgroundColor: '#EEF7F4',
    borderRadius: tokens.radius.md,
    color: tokens.color.textPrimary,
  },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.spacing.sm },
  chip: {
    minHeight: tokens.touch.min,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: tokens.color.border,
    borderRadius: tokens.radius.pill,
    paddingHorizontal: tokens.spacing.md,
  },
  chipSelected: { backgroundColor: '#FFF4D6', borderColor: tokens.color.primary },
  chipText: { color: tokens.color.textPrimary, fontWeight: '700' },
  photoBox: {
    minHeight: tokens.touch.min,
    justifyContent: 'center',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: tokens.color.border,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.md,
  },
  photoText: { color: tokens.color.textPrimary },
  notice: {
    minHeight: tokens.touch.min,
    justifyContent: 'center',
    backgroundColor: '#FFF4D6',
    padding: tokens.spacing.md,
    borderRadius: tokens.radius.md,
  },
  noticeText: { color: tokens.color.textPrimary, fontSize: tokens.type.support },
  button: {
    minHeight: tokens.touch.min,
    justifyContent: 'center',
    backgroundColor: tokens.color.primary,
    padding: tokens.spacing.lg,
    borderRadius: tokens.radius.md,
  },
  buttonText: { color: '#FFFFFF', textAlign: 'center', fontWeight: '700' },
  secondaryButton: {
    minHeight: tokens.touch.min,
    justifyContent: 'center',
    borderColor: tokens.color.primary,
    borderWidth: 1,
    padding: tokens.spacing.md,
    borderRadius: tokens.radius.md,
  },
  secondaryText: { color: tokens.color.primary, textAlign: 'center', fontWeight: '700' },
  error: { color: tokens.color.error, fontWeight: '700' },
});
