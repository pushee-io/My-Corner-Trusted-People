import { Pressable, StyleSheet, Text, View } from 'react-native';
import { tokens } from '@/theme/tokens';

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <View style={styles.block}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
    </View>
  );
}

export function ErrorState({ title, body, onRetry }: { title: string; body: string; onRetry?: () => void }) {
  return (
    <View style={styles.block}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
      {onRetry ? (
        <Pressable accessibilityRole="button" onPress={onRetry} style={styles.button}>
          <Text style={styles.buttonText}>Try again</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function LoadingState({ title = 'Loading' }: { title?: string }) {
  return (
    <View style={styles.block} accessibilityRole="progressbar">
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>Please wait while My Corner gets this ready.</Text>
    </View>
  );
}

export function SuccessState({ title, body }: { title: string; body: string }) {
  return (
    <View style={styles.success}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
    </View>
  );
}

export function OfflineBanner({
  message = 'You appear to be offline. Some actions may not save until you reconnect.',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <View style={styles.offline}>
      <Text accessibilityLiveRegion="polite" style={styles.offlineText}>
        {message}
      </Text>
      {onRetry ? (
        <Pressable accessibilityRole="button" onPress={onRetry} style={styles.offlineRetry}>
          <Text style={styles.offlineRetryText}>Try again</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderWidth: 1,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
    gap: tokens.spacing.sm,
  },
  title: { fontSize: tokens.type.card, fontWeight: '700', color: tokens.color.textPrimary },
  body: { fontSize: tokens.type.body, color: tokens.color.textSecondary },
  button: {
    alignItems: 'center',
    backgroundColor: tokens.color.primary,
    borderRadius: tokens.radius.md,
    justifyContent: 'center',
    minHeight: tokens.touch.min,
    padding: tokens.spacing.md,
  },
  buttonText: { color: '#FFFFFF', textAlign: 'center', fontWeight: '700' },
  offline: { backgroundColor: '#FFF4D6', padding: tokens.spacing.md, borderRadius: tokens.radius.md },
  offlineText: { color: tokens.color.textPrimary, fontSize: tokens.type.support },
  offlineRetry: { alignSelf: 'flex-start', minHeight: tokens.touch.min, justifyContent: 'center' },
  offlineRetryText: { color: tokens.color.primary, fontWeight: '700' },
  success: {
    backgroundColor: '#EEF7F4',
    borderColor: tokens.color.success,
    borderWidth: 1,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
    gap: tokens.spacing.sm,
  },
});
