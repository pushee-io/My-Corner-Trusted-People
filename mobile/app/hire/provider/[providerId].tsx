import { Link, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { getProvider } from '@/lib/repository';
import { tokens } from '@/theme/tokens';
import type { Provider } from '@/types/contracts';

export default function ProviderProfileScreen() {
  const params = useLocalSearchParams<{
    providerId?: string | string[];
    categoryId?: string | string[];
  }>();

  const rawProviderId = params.providerId;
  const rawCategoryId = params.categoryId;

  const providerId = Array.isArray(rawProviderId) ? rawProviderId[0] : rawProviderId;

  const categoryId = Array.isArray(rawCategoryId) ? rawCategoryId[0] : rawCategoryId;

  const [provider, setProvider] = useState<Provider | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProvider() {
      if (!providerId) {
        if (!cancelled) {
          setProvider(null);
          setLoadError('The provider ID is missing from this page.');
          setIsLoading(false);
        }

        return;
      }

      setIsLoading(true);
      setLoadError(null);

      try {
        const result = await getProvider(providerId);

        if (!cancelled) {
          setProvider(result ?? null);
        }
      } catch {
        if (!cancelled) {
          setProvider(null);
          setLoadError('We could not load this provider. Please try again.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadProvider();

    return () => {
      cancelled = true;
    };
  }, [providerId]);

  if (!providerId) {
    return (
      <Screen title="Provider unavailable">
        <Text style={styles.body}>This provider page is missing a valid provider ID.</Text>
      </Screen>
    );
  }

  if (isLoading) {
    return (
      <Screen title="Provider">
        <Text style={styles.body}>Loading provider...</Text>
      </Screen>
    );
  }

  if (loadError) {
    return (
      <Screen title="Unable to load provider">
        <Text style={styles.body}>{loadError}</Text>
      </Screen>
    );
  }

  if (!provider) {
    return (
      <Screen title="Provider not found">
        <Text style={styles.body}>This provider is not available in the current prototype.</Text>
      </Screen>
    );
  }

  const selectedCategoryId = categoryId ?? provider.categoryIds[0];
  const canStartRequest = Boolean(selectedCategoryId);

  return (
    <Screen title={provider.name}>
      <Text style={styles.headline}>{provider.headline}</Text>

      <Text style={styles.body}>
        {provider.neighborhood} · {provider.areaLabel}
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trust signals</Text>

        {provider.trustSignals.map((signal) => (
          <View key={signal.id} style={styles.badge}>
            <Text style={styles.badgeText}>
              {signal.label}: {signal.value}
            </Text>
          </View>
        ))}

        <Text style={styles.note}>Trust signals help you make a decision. They are not a guarantee.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Service coverage</Text>

        <Text style={styles.body}>General area: {provider.areaLabel}</Text>

        <Text style={styles.note}>General area only — your exact address stays private until later steps.</Text>
      </View>

      {canStartRequest && selectedCategoryId ? (
        <Link
          href={{
            pathname: '/hire/request/review',
            params: {
              requesterName: 'Akosua Mensah',
              providerId: provider.id,
              categoryId: selectedCategoryId,
              neighborhood: 'East Legon',
              areaLabel: 'East Legon, general area only',
              title: 'Kitchen sink leak',
              description: 'Water is leaking under the kitchen sink. I need someone to inspect it and repair the leak.',
              originalUserText: 'Water is leaking under the kitchen sink.',
              urgency: 'soon',
              preferredDate: '2026-07-18',
              preferredTime: 'Afternoon',
              contactPreference: 'app_update',
              photoCount: '0',
            },
          }}
          asChild
        >
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>Start request</Text>
          </Pressable>
        </Link>
      ) : (
        <View style={styles.unavailableBox}>
          <Text style={styles.note}>This provider does not currently have an available service category.</Text>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headline: {
    fontSize: tokens.type.card,
    fontWeight: '700',
    color: tokens.color.textPrimary,
  },
  body: {
    fontSize: tokens.type.body,
    color: tokens.color.textPrimary,
  },
  section: {
    gap: tokens.spacing.sm,
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    borderColor: tokens.color.border,
    padding: tokens.spacing.lg,
  },
  sectionTitle: {
    fontSize: tokens.type.card,
    fontWeight: '700',
    color: tokens.color.textPrimary,
  },
  badge: {
    backgroundColor: '#EEF7F4',
    borderRadius: tokens.radius.sm,
    padding: tokens.spacing.sm,
  },
  badgeText: {
    fontSize: tokens.type.support,
    color: tokens.color.textPrimary,
  },
  note: {
    fontSize: tokens.type.support,
    color: tokens.color.textSecondary,
  },
  button: {
    backgroundColor: tokens.color.primary,
    padding: tokens.spacing.lg,
    borderRadius: tokens.radius.md,
  },
  buttonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '700',
  },
  unavailableBox: {
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    borderColor: tokens.color.border,
    padding: tokens.spacing.lg,
  },
});
