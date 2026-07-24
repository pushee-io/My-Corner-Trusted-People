import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { StatusPill } from '@/components/StatusPill';
import { listProviderRequests } from '@/lib/repository';
import { testProvider } from '@/lib/session';
import { tokens } from '@/theme/tokens';

export default function ProviderHomeScreen() {
  const requests = listProviderRequests(testProvider.providerId ?? 'prov-01');
  const latest = requests[0];

  return (
    <Screen title="Provider home">
      <Text style={styles.body}>Signed in as {testProvider.name}. This is a test provider account.</Text>
      {latest ? (
        <View style={styles.panel}>
          <StatusPill status={latest.status} />
          <Text style={styles.title}>{latest.title}</Text>
          <Text style={styles.body}>{latest.areaLabel}</Text>
        </View>
      ) : null}
      <Link href="/provider/requests" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Incoming requests</Text>
        </Pressable>
      </Link>
      <Link href="/provider/availability" asChild>
        <Pressable style={styles.secondary}>
          <Text style={styles.secondaryText}>Availability</Text>
        </Pressable>
      </Link>
      <Link href="/provider/profile-preview" asChild>
        <Pressable style={styles.secondary}>
          <Text style={styles.secondaryText}>Profile preview</Text>
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
