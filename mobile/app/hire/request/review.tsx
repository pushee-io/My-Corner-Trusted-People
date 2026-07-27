import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { EmptyState, SuccessState } from '@/components/StateBlocks';
import { createJobRequest, getProvider } from '@/lib/repository';
import { featureFlags } from '@/lib/feature-flags';
import { moderateText } from '@/lib/moderation';
import { trackEvent } from '@/lib/analytics';
import { tokens } from '@/theme/tokens';
import type { ContactPreference, Provider, RequestUrgency } from '@/types/contracts';

export default function RequestReviewScreen() {
  const params = useLocalSearchParams<Record<string, string>>();
  const [provider, setProvider] = useState<Provider>();
  const [error, setError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!params.providerId) return;
    getProvider(params.providerId).then(setProvider).catch((caught) => {
      setError(caught instanceof Error ? caught.message : 'Could not load provider.');
    });
  }, [params.providerId]);

  async function submit() {
    setError(undefined);
    setIsSubmitting(true);

    try {
      const moderation = featureFlags.ai_content_moderation
        ? await moderateText(params.description ?? '')
        : { status: 'not_run' as const };

      const request = await createJobRequest({
        requesterName: params.requesterName ?? 'Akosua Mensah',
        providerId: params.providerId ?? '',
        categoryId: params.categoryId ?? 'plumbing',
        neighborhood: params.neighborhood ?? 'East Legon',
        areaLabel: params.areaLabel ?? 'East Legon, general area only',
        title: params.title ?? 'Service request',
        description: params.description ?? '',
        originalUserText: params.originalUserText ?? params.description ?? '',
        urgency: (params.urgency ?? 'soon') as RequestUrgency,
        preferredDate: params.preferredDate ?? '2026-07-18',
        preferredTime: params.preferredTime ?? 'Afternoon',
        contactPreference: (params.contactPreference ?? 'app_update') as ContactPreference,
        photoCount: Number(params.photoCount ?? 0),
      });

      trackEvent('request_submitted', {
        requestId: request.id,
        categoryId: request.categoryId,
        moderationStatus: moderation.status,
      });

      router.replace({ pathname: '/hire/request/status', params: { requestId: request.id } });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not submit request.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Screen title="Review request">
      <SuccessState title="Review before sending" body="The provider sees your general area, not your exact home address." />
      {error ? <EmptyState title="Request not submitted" body={error} /> : null}

      <View style={styles.panel}>
        <Text style={styles.label}>Provider</Text>
        <Text style={styles.value}>{provider?.name ?? 'Selected provider'}</Text>
        <Text style={styles.label}>Title</Text>
        <Text style={styles.value}>{params.title ?? 'Service request'}</Text>
        <Text style={styles.label}>Description</Text>
        <Text style={styles.value}>{params.description ?? ''}</Text>
        <Text style={styles.label}>Timing</Text>
        <Text style={styles.value}>{params.preferredDate} · {params.preferredTime} · {params.urgency}</Text>
        <Text style={styles.label}>Area</Text>
        <Text style={styles.value}>{params.areaLabel}</Text>
        <Text style={styles.notice}>My Corner does not guarantee provider performance. Use the trust evidence and report anything unsafe.</Text>
      </View>

      <Pressable disabled={isSubmitting} onPress={submit} style={styles.button}>
        <Text style={styles.buttonText}>{isSubmitting ? 'Submitting...' : 'Submit request'}</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  panel: { backgroundColor: tokens.color.surface, borderColor: tokens.color.border, borderWidth: 1, borderRadius: tokens.radius.md, padding: tokens.spacing.lg, gap: tokens.spacing.sm },
  label: { color: tokens.color.textSecondary, fontSize: tokens.type.label, fontWeight: '700' },
  value: { color: tokens.color.textPrimary, fontSize: tokens.type.body },
  notice: { color: tokens.color.textSecondary, fontSize: tokens.type.support },
  button: { minHeight: tokens.touch.min, justifyContent: 'center', backgroundColor: tokens.color.primary, padding: tokens.spacing.lg, borderRadius: tokens.radius.md },
  buttonText: { color: '#FFFFFF', textAlign: 'center', fontWeight: '700' },
});
