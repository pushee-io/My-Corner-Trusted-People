import { MediaAvatar } from '@/components/media/MediaAvatar';
import { MediaGallery } from '@/components/media/MediaGallery';
import { useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import { useProtectedResource } from '@/hooks/useProtectedResource';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { WebSafeLink } from '@/components/WebSafeLink';
import { Screen } from '@/components/Screen';
import { EmptyState } from '@/components/StateBlocks';
import { StatusPill } from '@/components/StatusPill';
import { markRequestViewed } from '@/lib/repository';
import { tokens } from '@/theme/tokens';
import { ReportButton } from '@/components/JobReportParts';

export default function ProviderRequestDetailScreen() {
  const params = useLocalSearchParams<{ requestId?: string }>();
  const requestId = params.requestId;
  const resource = useProtectedResource(
    useCallback(async () => {
      if (!requestId) throw new Error('No request ID was provided.');
      return markRequestViewed(requestId);
    }, [requestId]),
    10_000,
  );
  const { data: request, error, loading: isLoading } = resource;

  if (error || isLoading || !request) {
    return (
      <Screen
        title="Request detail"
        onRefresh={() => {
          void resource.refresh();
        }}
        refreshing={isLoading}
      >
        <ReportButton
          label="Refresh request"
          disabled={isLoading}
          onPress={() => {
            void resource.refresh();
          }}
        />
        <EmptyState
          title={isLoading ? 'Loading request' : 'Request not found'}
          body={error ?? 'Opening the live request.'}
        />
      </Screen>
    );
  }

  return (
    <Screen
      title="Request detail"
      onRefresh={() => {
        void resource.refresh();
      }}
      refreshing={isLoading}
    >
      <ReportButton
        label="Refresh request"
        disabled={isLoading}
        onPress={() => {
          void resource.refresh();
        }}
      />
      <View style={styles.panel}>
        <MediaAvatar profileId={request.requesterProfileId} name={request.requesterName} />
        <StatusPill status={request.status} />
        <Text style={styles.title}>{request.title}</Text>
        <Text style={styles.body}>{request.description}</Text>
        <Text style={styles.note}>General area: {request.areaLabel}</Text>
        <Text style={styles.note}>
          Preferred: {request.preferredDate} · {request.preferredTime}
        </Text>
        <Text style={styles.notice}>Exact requester address is not shown in this workflow.</Text>
      </View>

      {['Submitted', 'Viewed'].includes(request.status) ? (
        <>
          <WebSafeLink
            href={{ pathname: '/provider/request/respond', params: { requestId: request.id, decision: 'Accepted' } }}
            asChild
          >
            <Pressable style={styles.button}>
              <Text style={styles.buttonText}>Accept request</Text>
            </Pressable>
          </WebSafeLink>

          <WebSafeLink
            href={{ pathname: '/provider/request/respond', params: { requestId: request.id, decision: 'Declined' } }}
            asChild
          >
            <Pressable style={styles.secondary}>
              <Text style={styles.secondaryText}>Decline request</Text>
            </Pressable>
          </WebSafeLink>
        </>
      ) : null}

      <MediaGallery parent="service_request" parentId={request.id} />

      {['Accepted', 'In progress', 'Completed'].includes(request.status) ? (
        <WebSafeLink href={{ pathname: '/hire/request/safety-session', params: { requestId: request.id } }} asChild>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>Open job safety session</Text>
          </Pressable>
        </WebSafeLink>
      ) : null}
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
  title: { color: tokens.color.textPrimary, fontSize: tokens.type.card, fontWeight: '700' },
  body: { color: tokens.color.textPrimary, fontSize: tokens.type.body },
  note: { color: tokens.color.textSecondary, fontSize: tokens.type.support },
  notice: {
    backgroundColor: '#FFF4D6',
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.md,
    color: tokens.color.textPrimary,
  },
  button: {
    minHeight: tokens.touch.min,
    justifyContent: 'center',
    backgroundColor: tokens.color.primary,
    padding: tokens.spacing.lg,
    borderRadius: tokens.radius.md,
  },
  buttonText: { color: '#FFFFFF', textAlign: 'center', fontWeight: '700' },
  secondary: {
    minHeight: tokens.touch.min,
    justifyContent: 'center',
    borderColor: tokens.color.primary,
    borderWidth: 1,
    padding: tokens.spacing.lg,
    borderRadius: tokens.radius.md,
  },
  secondaryText: { color: tokens.color.primary, textAlign: 'center', fontWeight: '700' },
});
