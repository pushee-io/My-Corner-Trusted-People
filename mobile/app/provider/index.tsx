import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { EmptyState } from '@/components/StateBlocks';
import { StatusPill } from '@/components/StatusPill';
import { listProviderRequests } from '@/lib/repository';
import { testProvider } from '@/lib/session';
import { tokens } from '@/theme/tokens';
import type { JobRequest } from '@/types/contracts';

export default function ProviderHomeScreen() {
  const [requests, setRequests] = useState<JobRequest[]>([]);
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);
  const latest = requests[0];

  useEffect(() => {
    listProviderRequests()
      .then(setRequests)
      .catch((caught) => setError(caught instanceof Error ? caught.message : 'Could not load provider requests.'))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <Screen title="Provider home">
      <Text style={styles.body}>Signed in as {testProvider.name}. This is a test provider account.</Text>

      {error ? (
        <EmptyState title="Could not load requests" body={error} />
      ) : isLoading ? (
        <View style={styles.panel}>
          <Text style={styles.title}>Loading requests</Text>
          <Text style={styles.body}>Checking live incoming jobs.</Text>
        </View>
      ) : latest ? (
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

      <Link href="/community" asChild>
        <Pressable style={styles.secondary}>
          <Text style={styles.secondaryText}>Neighborhood feed</Text>
        </Pressable>
      </Link>

      <Link href="/community/moderation" asChild>
        <Pressable style={styles.secondary}>
          <Text style={styles.secondaryText}>Moderation queue</Text>
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
