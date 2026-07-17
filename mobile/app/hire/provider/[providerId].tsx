import { Link, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { getProvider } from '@/lib/repository';
import { tokens } from '@/theme/tokens';

export default function ProviderProfileScreen() {
  const params = useLocalSearchParams<{ providerId?: string; categoryId?: string }>();
  const provider = getProvider(params.providerId ?? 'prov-01');

  if (!provider) {
    return (
      <Screen title="Provider not found">
        <Text style={styles.body}>This provider is not available in the current prototype.</Text>
      </Screen>
    );
  }

  return (
    <Screen title={provider.name}>
      <Text style={styles.headline}>{provider.headline}</Text>
      <Text style={styles.body}>{provider.neighborhood} · {provider.areaLabel}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trust signals</Text>
        {provider.trustSignals.map((signal) => (
          <View key={signal.id} style={styles.badge}>
            <Text style={styles.badgeText}>{signal.label}: {signal.value}</Text>
          </View>
        ))}
        <Text style={styles.note}>Trust signals help you make a decision. They are not a guarantee.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Service coverage</Text>
        <Text style={styles.body}>General area: {provider.areaLabel}</Text>
        <Text style={styles.note}>General area only — your exact address stays private until later steps.</Text>
      </View>

      <Link
        href={{
          pathname: '/hire/request/review',
          params: {
            requesterName: 'Akosua Mensah',
            providerId: provider.id,
            categoryId: params.categoryId ?? provider.categoryIds[0],
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  headline: { fontSize: tokens.type.card, fontWeight: '700', color: tokens.color.textPrimary },
  body: { fontSize: tokens.type.body, color: tokens.color.textPrimary },
  section: { gap: tokens.spacing.sm, backgroundColor: tokens.color.surface, borderRadius: tokens.radius.md, borderWidth: 1, borderColor: tokens.color.border, padding: tokens.spacing.lg },
  sectionTitle: { fontSize: tokens.type.card, fontWeight: '700', color: tokens.color.textPrimary },
  badge: { backgroundColor: '#EEF7F4', borderRadius: tokens.radius.sm, padding: tokens.spacing.sm },
  badgeText: { fontSize: tokens.type.support, color: tokens.color.textPrimary },
  note: { fontSize: tokens.type.support, color: tokens.color.textSecondary },
  button: { backgroundColor: tokens.color.primary, padding: tokens.spacing.lg, borderRadius: tokens.radius.md },
  buttonText: { color: '#FFFFFF', textAlign: 'center', fontWeight: '700' },
});
