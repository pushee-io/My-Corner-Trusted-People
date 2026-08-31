import { type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { WebSafeLink } from '@/components/WebSafeLink';
import { Screen } from '@/components/Screen';
import { EmptyState } from '@/components/StateBlocks';
import { StatusPill } from '@/components/StatusPill';
import { getCurrentProfile } from '@/lib/auth';
import { getActiveLocationLabel } from '@/lib/location-context';
import { eventsRuntimeRepository, isEventsClientEnabled } from '@/lib/events-runtime-repository';
import { listRequesterRequests } from '@/lib/repository';
import { tokens } from '@/theme/tokens';
import type { JobRequest } from '@/types/contracts';

export default function HomeScreen() {
  const [requests, setRequests] = useState<JobRequest[]>([]);
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);
  const [eventsAvailable, setEventsAvailable] = useState(false);
  const [canModerateMarketplace, setCanModerateMarketplace] = useState(false);
  const latest = requests[0];

  useEffect(() => {
    async function loadRequests() {
      try {
        const items = await listRequesterRequests();

        setRequests([...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      } catch (caught) {
        if (__DEV__) {
          console.error('REQUEST_LOAD_FAILURE', caught);
        }

        setError(caught instanceof Error ? caught.message : 'Could not load requests.');
      } finally {
        setIsLoading(false);
      }
    }

    void loadRequests();
  }, []);

  useEffect(() => {
    getCurrentProfile()
      .then((profile) => setCanModerateMarketplace(profile.role === 'moderator' || profile.role === 'admin'))
      .catch(() => setCanModerateMarketplace(false));
  }, []);

  useEffect(() => {
    if (!isEventsClientEnabled()) return;
    eventsRuntimeRepository
      .isEnabled()
      .then(setEventsAvailable)
      .catch(() => setEventsAvailable(false));
  }, []);

  return (
    <Screen title="My Corner home">
      <Text style={styles.body}>{getActiveLocationLabel()}</Text>

      <View style={styles.grid}>
        <WebSafeLink href="/hire/categories" asChild>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>Hire help</Text>
          </Pressable>
        </WebSafeLink>

        <WebSafeLink href="/community" asChild>
          <Pressable style={styles.secondary}>
            <Text style={styles.secondaryText}>Neighborhood feed</Text>
          </Pressable>
        </WebSafeLink>

        <WebSafeLink href="/groups" asChild>
          <Pressable style={styles.secondary}>
            <Text style={styles.secondaryText}>Groups</Text>
          </Pressable>
        </WebSafeLink>

        {eventsAvailable ? (
          <WebSafeLink href={'/events' as Href} asChild>
            <Pressable accessibilityRole="button" style={styles.secondary}>
              <Text style={styles.secondaryText}>Events</Text>
            </Pressable>
          </WebSafeLink>
        ) : null}

        <WebSafeLink href="/agency-broadcasts" asChild>
          <Pressable style={styles.secondary}>
            <Text style={styles.secondaryText}>Agency broadcasts</Text>
          </Pressable>
        </WebSafeLink>

        <WebSafeLink href="/marketplace" asChild>
          <Pressable style={styles.secondary}>
            <Text style={styles.secondaryText}>Marketplace</Text>
          </Pressable>
        </WebSafeLink>

        {canModerateMarketplace ? (
          <WebSafeLink href="/marketplace/moderation" asChild>
            <Pressable accessibilityRole="button" style={styles.secondary}>
              <Text style={styles.secondaryText}>Marketplace reports</Text>
            </Pressable>
          </WebSafeLink>
        ) : null}

        <WebSafeLink href="/community/moderation" asChild>
          <Pressable style={styles.secondary}>
            <Text style={styles.secondaryText}>Moderation queue</Text>
          </Pressable>
        </WebSafeLink>

        <WebSafeLink href="/settings" asChild>
          <Pressable style={styles.secondary}>
            <Text style={styles.secondaryText}>Settings</Text>
          </Pressable>
        </WebSafeLink>
      </View>

      {error ? (
        <EmptyState title="Could not load requests" body={error} />
      ) : isLoading ? (
        <View style={styles.panel}>
          <Text style={styles.title}>Loading requests</Text>
          <Text style={styles.body}>Checking your live Supabase request history.</Text>
        </View>
      ) : latest ? (
        <WebSafeLink href={{ pathname: '/hire/request/status', params: { requestId: latest.id } }} asChild>
          <Pressable style={styles.panel}>
            <StatusPill status={latest.status} />
            <Text style={styles.title}>{latest.title}</Text>
            <Text style={styles.body}>Track provider response</Text>
          </Pressable>
        </WebSafeLink>
      ) : (
        <View style={styles.panel}>
          <Text style={styles.title}>No active requests</Text>
          <Text style={styles.body}>Start with Hire help to test the first flow.</Text>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { color: tokens.color.textPrimary, fontSize: tokens.type.body },
  title: { color: tokens.color.textPrimary, fontSize: tokens.type.card, fontWeight: '700' },
  grid: { gap: tokens.spacing.md },
  panel: {
    minHeight: tokens.touch.min,
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderWidth: 1,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
    gap: tokens.spacing.sm,
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
    backgroundColor: tokens.color.surface,
  },
  secondaryText: { color: tokens.color.primary, textAlign: 'center', fontWeight: '700' },
});
