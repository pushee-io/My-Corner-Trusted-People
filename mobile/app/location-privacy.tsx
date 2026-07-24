import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { addressProviderPolicies, identityProviderPolicy, manualBiometricPolicy } from '@/lib/location-providers';
import { tokens } from '@/theme/tokens';

export default function LocationPrivacyScreen() {
  return (
    <Screen title="Location privacy">
      <View style={styles.notice}>
        <Text style={styles.noticeText}>
          My Corner does not use Google Address Validation API for Ghana. Residence proof is not inferred from maps, AI,
          Loqate, or GhanaPost GPS.
        </Text>
      </View>

      {addressProviderPolicies.map((policy) => (
        <View key={policy.provider} style={styles.card}>
          <Text style={styles.title}>{policy.provider}</Text>
          <Text style={styles.body}>{policy.purpose}</Text>
          <Text style={styles.meta}>Proof of residence: No</Text>
        </View>
      ))}

      <View style={styles.card}>
        <Text style={styles.title}>{identityProviderPolicy.provider}</Text>
        <Text style={styles.body}>{identityProviderPolicy.purpose}</Text>
        <Text style={styles.meta}>Ghana Card images collected: No</Text>
        <Text style={styles.meta}>Production access approved: No</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>{manualBiometricPolicy.provider}</Text>
        <Text style={styles.body}>{manualBiometricPolicy.purpose}</Text>
        <Text style={styles.meta}>Uses Ghana Card: No</Text>
        <Text style={styles.meta}>Ghana Card images collected: No</Text>
        <Text style={styles.meta}>AI final decision: No</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  notice: {
    backgroundColor: '#FFF4D6',
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
  },
  noticeText: {
    color: tokens.color.textPrimary,
    fontSize: tokens.type.support,
    fontWeight: '700',
  },
  card: {
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderWidth: 1,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
    gap: tokens.spacing.xs,
  },
  title: {
    color: tokens.color.textPrimary,
    fontSize: tokens.type.card,
    fontWeight: '700',
  },
  body: {
    color: tokens.color.textPrimary,
    fontSize: tokens.type.body,
  },
  meta: {
    color: tokens.color.textSecondary,
    fontSize: tokens.type.support,
  },
});
