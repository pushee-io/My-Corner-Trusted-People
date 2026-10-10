import { useNetInfo } from '@react-native-community/netinfo';
import { StyleSheet, Text, View } from 'react-native';
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
      <View style={styles.loadingRow}>
        <View
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={styles.brandLoader}
        >
          <View style={styles.goldRing} />
        </View>
        <Text style={styles.loadingTitle}>{title}</Text>
      </View>
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
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: tokens.spacing.md },
  loadingTitle: { ...typography.card, color: tokens.color.textPrimary, flex: 1 },
  // Static branded progress mark: no animation loop, including with Reduce Motion.
  brandLoader: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#171C1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  goldRing: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: tokens.color.gold,
    borderTopColor: '#171C1A',
  },
  title: { ...typography.card, color: tokens.color.textPrimary },
  body: { ...typography.body, color: tokens.color.textSecondary },
  offlineText: { ...typography.metadata, color: tokens.color.textPrimary },
});
