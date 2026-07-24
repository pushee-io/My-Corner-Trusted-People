import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { SuccessState } from '@/components/StateBlocks';
import { createJobRequest, getProvider } from '@/lib/repository';
import { moderateText } from '@/lib/moderation';
import { featureFlags } from '@/lib/feature-flags';
import { trackEvent } from '@/lib/analytics';
import { tokens } from '@/theme/tokens';
import type { ContactPreference, RequestUrgency } from '@/types/contracts';

export default function RequestReviewScreen() {
  const params = useLocalSearchParams<Record<string, string>>();
  const provider = getProvider(params.providerId ?? 'prov-01');

  async function submit() {
    const moderation = featureFlags.ai_content_moderation
      ? await moderateText(params.description ?? '')
      : { status: 'not_run' as const };
    const request = createJobRequest({
      requesterName: params.requesterName ?? 'Akosua Mensah',
      providerId: params.providerId ?? 'prov-01',
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
    request.moderationStatus = moderation.status;
    trackEvent('request_submitted', {
      requestId: request.id,
      categoryId: request.categoryId,
      moderationStatus: request.moderationStatus,
    });
    router.replace({ pathname: '/hire/request/confirmation', params: { requestId: request.id } });
  }

  return (
    <Screen title="Review request">
      <SuccessState
        title="Review before sending"
        body="Check the details. The provider sees your general area, not your exact home address."
      />
      <View style={styles.panel}>
        <Text style={styles.label}>Provider</Text>
        <Text style={styles.value}>{provider?.name ?? 'Selected provider'}</Text>
        <Text style={styles.label}>Title</Text>
        <Text style={styles.value}>{params.title}</Text>
        <Text style={styles.label}>Description</Text>
        <Text style={styles.value}>{params.description}</Text>
        <Text style={styles.label}>Timing</Text>
        <Text style={styles.value}>
          {params.preferredDate} · {params.preferredTime} · {params.urgency}
        </Text>
        <Text style={styles.label}>Area</Text>
        <Text style={styles.value}>{params.areaLabel}</Text>
        <Text style={styles.notice}>
          My Corner does not guarantee provider performance. Use the trust evidence, ask questions, and report anything
          unsafe.
        </Text>
      </View>
      <Pressable onPress={submit} style={styles.button}>
        <Text style={styles.buttonText}>Submit request</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderWidth: 1,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
    gap: tokens.spacing.sm,
  },
  label: { color: tokens.color.textSecondary, fontSize: tokens.type.label, fontWeight: '700' },
  value: { color: tokens.color.textPrimary, fontSize: tokens.type.body },
  notice: { color: tokens.color.textSecondary, fontSize: tokens.type.support },
  button: {
    minHeight: tokens.touch.min,
    justifyContent: 'center',
    backgroundColor: tokens.color.primary,
    padding: tokens.spacing.lg,
    borderRadius: tokens.radius.md,
  },
  buttonText: { color: '#FFFFFF', textAlign: 'center', fontWeight: '700' },
});
