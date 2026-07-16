import { Link, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { EmptyState } from '@/components/StateBlocks';
import { StatusPill } from '@/components/StatusPill';
import { getProvider, getRequest } from '@/lib/repository';
import { tokens } from '@/theme/tokens';

export default function RequestStatusScreen() {
  const params = useLocalSearchParams<{ requestId?: string }>();
  const request = getRequest(params.requestId ?? 'req-100');
  const provider = request ? getProvider(request.providerId) : undefined;

  if (!request) {
    return (
      <Screen title="Request status">
        <EmptyState title="Request not found" body="This prototype could not find the selected request." />
      </Screen>
    );
  }

  return (
    <Screen title="Request status">
      <View style={styles.panel}>
        <StatusPill status={request.status} />
        <Text style={styles.title}>{request.title}</Text>
        <Text style={styles.body}>{provider?.name ?? 'Selected provider'} · {request.areaLabel}</Text>
        {request.providerMessage ? <Text style={styles.message}>Provider note: {request.providerMessage}</Text> : null}
      </View>
      <View style={styles.panel}>
        <Text style={styles.section}>Timeline</Text>
        {request.statusTimeline.map((event) => (
          <View key={event.id} style={styles.timelineRow}>
            <Text style={styles.body}>{event.status}</Text>
            <Text style={styles.note}>{event.actor} · {new Date(event.createdAt).toLocaleString('en-GH')}</Text>
            {event.note ? <Text style={styles.note}>{event.note}</Text> : null}
          </View>
        ))}
      </View>
      <Link href={{ pathname: '/hire/request/report-cancel', params: { requestId: request.id } }} asChild>
        <Pressable style={styles.secondary}>
          <Text style={styles.secondaryText}>Cancel or report</Text>
        </Pressable>
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  panel: { backgroundColor: tokens.color.surface, borderColor: tokens.color.border, borderWidth: 1, borderRadius: tokens.radius.md, padding: tokens.spacing.lg, gap: tokens.spacing.sm },
  title: { color: tokens.color.textPrimary, fontSize: tokens.type.card, fontWeight: '700' },
  section: { color: tokens.color.textPrimary, fontSize: tokens.type.card, fontWeight: '700' },
  body: { color: tokens.color.textPrimary, fontSize: tokens.type.body },
  note: { color: tokens.color.textSecondary, fontSize: tokens.type.support },
  message: { color: tokens.color.primary, fontSize: tokens.type.body, fontWeight: '700' },
  timelineRow: { borderTopColor: tokens.color.border, borderTopWidth: 1, paddingTop: tokens.spacing.sm, gap: tokens.spacing.xs },
  secondary: { minHeight: tokens.touch.min, justifyContent: 'center', borderColor: tokens.color.error, borderWidth: 1, padding: tokens.spacing.lg, borderRadius: tokens.radius.md },
  secondaryText: { color: tokens.color.error, textAlign: 'center', fontWeight: '700' },
});
