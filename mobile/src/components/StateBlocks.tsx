import { useNetInfo } from '@react-native-community/netinfo';
import { StyleSheet, Text } from 'react-native';
import { ActionPill } from '@/components/ActionPill';
import { Surface } from '@/components/Surface';
import { isNetworkOffline } from '@/lib/network-status';
import { tokens } from '@/theme/tokens';
import { typography } from '@/theme/typography';

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <Surface>
      <Text accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      <Text style={styles.body}>{body}</Text>
    </Surface>
  );
}

export function ErrorState({ title, body, onRetry }: { title: string; body: string; onRetry?: () => void }) {
  return (
    <Surface accessibilityLiveRegion="polite">
      <Text accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      <Text style={styles.body}>{body}</Text>
      {onRetry ? <ActionPill label="Try again" onPress={onRetry} primary /> : null}
    </Surface>
  );
}

export function LoadingState({ title = 'Loading' }: { title?: string }) {
  return (
    <Surface accessibilityRole="progressbar" accessibilityLabel={title} accessibilityState={{ busy: true }}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>Please wait while My Corner gets this ready.</Text>
    </Surface>
  );
}

export function SuccessState({ title, body }: { title: string; body: string }) {
  return (
    <Surface tone="success" accessibilityLiveRegion="polite">
      <Text accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      <Text style={styles.body}>{body}</Text>
    </Surface>
  );
}

export function OfflineBanner({
  message = 'You appear to be offline. Some actions may not save until you reconnect.',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  const networkState = useNetInfo();

  if (!isNetworkOffline(networkState)) return null;

  return (
    <Surface tone="warning">
      <Text accessibilityLiveRegion="polite" style={styles.offlineText}>
        {message}
      </Text>
      {onRetry ? <ActionPill label="Try again" onPress={onRetry} /> : null}
    </Surface>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.card, color: tokens.color.textPrimary },
  body: { ...typography.body, color: tokens.color.textSecondary },
  offlineText: { ...typography.metadata, color: tokens.color.textPrimary },
});
