import { Link, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { EmptyState } from '@/components/StateBlocks';
import { StatusPill } from '@/components/StatusPill';
import { getRequest, markRequestViewed } from '@/lib/repository';
import { tokens } from '@/theme/tokens';

export default function ProviderRequestDetailScreen() {
  const params = useLocalSearchParams<{ requestId?: string }>();
  const requestId = params.requestId ?? 'req-100';
  const request = getRequest(requestId);

  useEffect(() => {
    markRequestViewed(requestId);
  }, [requestId]);

  if (!request) {
    return (
      <Screen title="Request detail">
        <EmptyState title="Request not found" body="This test request is not available." />
      </Screen>
    );
  }

  return (
    <Screen title="Request detail">
      <View style={styles.panel}>
        <StatusPill status={request.status} />
        <Text style={styles.title}>{request.title}</Text>
        <Text style={styles.body}>{request.description}</Text>
        <Text style={styles.note}>General area: {request.areaLabel}</Text>
        <Text style={styles.note}>
          Preferred: {request.preferredDate} · {request.preferredTime}
        </Text>
        <Text style={styles.notice}>Exact requester address is not shown in this workflow.</Text>
      </View>
      <Link
        href={{ pathname: '/provider/request/respond', params: { requestId: request.id, decision: 'Accepted' } }}
        asChild
      >
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Accept request</Text>
        </Pressable>
      </Link>
      <Link
        href={{ pathname: '/provider/request/respond', params: { requestId: request.id, decision: 'Declined' } }}
        asChild
      >
        <Pressable style={styles.secondary}>
          <Text style={styles.secondaryText}>Decline request</Text>
        </Pressable>
      </Link>
      <Link href={{ pathname: '/provider/request/status-update', params: { requestId: request.id } }} asChild>
        <Pressable style={styles.secondary}>
          <Text style={styles.secondaryText}>Update status</Text>
        </Pressable>
      </Link>
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
