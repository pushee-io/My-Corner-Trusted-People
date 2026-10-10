import { StyleSheet, Text, View } from 'react-native';
import { MediaAvatar } from '@/components/media/MediaAvatar';
import { tokens } from '@/theme/tokens';

/** Presentation only: name must come from the authorized canonical resolver. */
export function PublicIdentity({
  profileId,
  name,
  refreshKey,
}: {
  profileId: string;
  name: string;
  refreshKey?: number;
}) {
  return (
    <View style={styles.row}>
      <MediaAvatar profileId={profileId} name={name} refreshKey={refreshKey} />
      <Text style={styles.name}>{name}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: tokens.spacing.sm },
  name: { flexShrink: 1, color: tokens.color.textPrimary, fontSize: tokens.type.body, fontWeight: '700' },
});
