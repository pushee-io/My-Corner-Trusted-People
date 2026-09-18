import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { MediaComposer } from '@/components/media/MediaComposer';
import { useRequestMedia } from '@/components/media/RequestMediaProvider';
import { OfflineBanner } from '@/components/StateBlocks';
import { structureServiceRequest } from '@/lib/ai';
import { trackEvent } from '@/lib/analytics';
import { featureFlags } from '@/lib/feature-flags';
import { categories } from '@/lib/mock-data';
import { getProvider } from '@/lib/repository';
import { validateRequestDraft } from '@/lib/request-validation';
import { testRequester } from '@/lib/session';
import { tokens } from '@/theme/tokens';
import type { ContactPreference, Provider, RequestUrgency } from '@/types/contracts';

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

function tomorrowDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function NewRequestScreen() {
  const params = useLocalSearchParams<{ providerId?: string; categoryId?: string }>();
  const [provider, setProvider] = useState<Provider>();
  const [isProviderLoaded, setIsProviderLoaded] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [preferredDate, setPreferredDate] = useState(tomorrowDate);
  const [preferredTime, setPreferredTime] = useState('Afternoon');
  const [urgency, setUrgency] = useState<RequestUrgency>('soon');
  const [contactPreference, setContactPreference] = useState<ContactPreference>('app_update');
  const { media, submission } = useRequestMedia();
  const photoCount = media.drafts.filter((item) => item.kind === 'image').length;
  const editingDisabled = submission.busy || submission.locked;
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadProvider() {
      const nextProvider = await getProvider(params.providerId ?? 'prov-01');

      if (!isMounted) return;
      setProvider(nextProvider);
      setIsProviderLoaded(true);
    }

    loadProvider();

    return () => {
      isMounted = false;
    };
  }, [params.providerId]);

  const category = useMemo(
    () => categories.find((item) => item.id === (params.categoryId ?? provider?.categoryIds[0])),
    [params.categoryId, provider],
  );

  const draft = useMemo(
    () => ({
      requesterName: testRequester.name,
      providerId: provider?.id ?? params.providerId ?? 'prov-01',
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
    }),
    [
      category?.id,
      contactPreference,
      description,
      params.providerId,
      photoCount,
      preferredDate,
      preferredTime,
      provider?.id,
      title,
      urgency,
    ],
  );

  function reviewRequest() {
    if (submission.busy || media.busy) return;
    const validation = validateRequestDraft(draft, consentAccepted);

    if (!validation.valid) {
      setError(Object.values(validation.errors)[0] ?? 'Please complete the request.');
      return;
    }

    trackEvent('request_review_started', {
      categoryId: draft.categoryId,
      providerId: draft.providerId,
      urgency,
    });

    router.push({
      pathname: '/hire/request/review',
      params: {
        ...draft,
        photoCount: String(draft.photoCount),
      },
    });
  }

  async function useAiStructurer() {
    if (editingDisabled) return;
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
      <Text style={styles.summary}>
        Requesting {category?.name ?? 'help'} from{' '}
        {isProviderLoaded ? (provider?.name ?? 'selected provider') : 'selected provider'}.
      </Text>

      <Text style={styles.label}>Job title</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        style={styles.input}
        placeholder="Example: Kitchen sink leak"
        accessibilityLabel="Job title"
        editable={!editingDisabled}
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        multiline
        style={[styles.input, styles.multiline]}
        placeholder="Describe what you need, where generally, and any access notes."
        accessibilityLabel="Job description"
        editable={!editingDisabled}
      />

      <Pressable disabled={editingDisabled} onPress={useAiStructurer} style={styles.secondaryButton}>
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
        editable={!editingDisabled}
      />

      <Text style={styles.label}>Preferred time</Text>
      <TextInput
        value={preferredTime}
        onChangeText={setPreferredTime}
        style={styles.input}
        accessibilityLabel="Preferred time"
        editable={!editingDisabled}
      />

      <Text style={styles.label}>Urgency</Text>
      <View style={styles.optionRow}>
        {urgencyOptions.map((option) => (
          <Pressable
            key={option.value}
            disabled={editingDisabled}
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
            disabled={editingDisabled}
            onPress={() => setContactPreference(option.value)}
            style={[styles.chip, contactPreference === option.value ? styles.chipSelected : null]}
          >
            <Text style={styles.chipText}>{option.label}</Text>
          </Pressable>
        ))}
      </View>

      <MediaComposer controller={media} title="Photos or video of the work" disabled={editingDisabled} />
      <Text style={styles.help}>Attachments are private to you and the assigned provider.</Text>
      {submission.locked ? (
        <Text style={styles.help}>Continue to Review to finish this same request and its attachments.</Text>
      ) : null}

      <Pressable disabled={editingDisabled} onPress={() => setConsentAccepted((value) => !value)} style={styles.notice}>
        <Text style={styles.noticeText}>
          {consentAccepted ? 'Selected: ' : ''}I understand My Corner shows trust evidence but does not guarantee
          provider conduct.
        </Text>
      </Pressable>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable disabled={submission.busy || media.busy} onPress={reviewRequest} style={styles.button}>
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
  help: { color: tokens.color.textSecondary, fontSize: tokens.type.support },
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
