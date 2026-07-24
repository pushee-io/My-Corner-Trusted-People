import { StyleSheet, Text } from 'react-native';
import { ProviderCard } from '@/components/ProviderCard';
import { Screen } from '@/components/Screen';
import { getProvider } from '@/lib/repository';
import { testProvider } from '@/lib/session';
import { tokens } from '@/theme/tokens';

export default function ProviderProfilePreviewScreen() {
  const provider = getProvider(testProvider.providerId ?? 'prov-01');

  return (
    <Screen title="Profile preview">
      {provider ? <ProviderCard provider={provider} onPress={() => undefined} /> : null}
      <Text style={styles.note}>
        This is what requesters see. Trust signals are evidence, not a My Corner guarantee.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  note: { color: tokens.color.textSecondary, fontSize: tokens.type.support },
});
