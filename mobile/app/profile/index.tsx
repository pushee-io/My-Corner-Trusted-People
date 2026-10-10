import { getCurrentProfile } from '@/lib/auth';
import { loadOwnPublicName } from '@/lib/messaging';
import { useProtectedResource } from '@/hooks/useProtectedResource';
import { ParentMediaEditor } from '@/components/media/ParentMediaEditor';
import { ActionRow } from '@/components/ActionRow';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { tokens } from '@/theme/tokens';

async function loadProfile() {
  const [profile, publicName] = await Promise.all([getCurrentProfile(), loadOwnPublicName()]);
  return { ...profile, displayName: publicName.name ?? 'Neighbor' };
}
export default function ProfileScreen() {
  const resource = useProtectedResource(loadProfile, 0, { preserveDuringMediaPicker: true });
  const profile = resource.data;
  return (
    <Screen title="Profile">
      {resource.error ? (
        <Text accessibilityRole="alert" style={styles.body}>
          {resource.error}
        </Text>
      ) : null}
      {profile ? (
        <View style={styles.panel}>
          <Text accessibilityRole="header" style={styles.name}>
            {profile.displayName}
          </Text>
          <Text style={styles.body}>{profile.role}</Text>
          <ParentMediaEditor
            key={profile.id}
            parent="profile"
            parentId={profile.id}
            title="Profile picture"
            name={profile.displayName}
          />
        </View>
      ) : null}
      <Text accessibilityRole="header" style={styles.heading}>
        Public profile
      </Text>
      <ActionRow
        icon="person-outline"
        title="Public display name"
        onPress={() => router.push('/profile/public-name')}
      />
      <ActionRow
        icon="shield-checkmark-outline"
        title="Verification status"
        onPress={() => router.push('/profile/verification')}
      />
      <Text accessibilityRole="header" style={styles.heading}>
        Private account details
      </Text>
      <ActionRow
        icon="call-outline"
        title="Phone verification"
        onPress={() => router.push('/profile/phone-verification')}
      />
      <ActionRow icon="document-text-outline" title="Legal name" onPress={() => router.push('/profile/legal-name')} />
      <ActionRow icon="location-outline" title="Ghana address" onPress={() => router.push('/profile/address')} />
      <ActionRow icon="map-outline" title="Map confirmation" onPress={() => router.push('/profile/map-confirmation')} />
      <ActionRow
        icon="finger-print-outline"
        title="Manual biometric review"
        onPress={() => router.push('/profile/manual-biometric')}
      />
      <Text accessibilityRole="header" style={styles.heading}>
        Privacy and safety
      </Text>
      <ActionRow
        icon="eye-off-outline"
        title="Masked profile and map privacy"
        onPress={() => router.push('/profile/privacy')}
      />
      <ActionRow
        icon="lock-closed-outline"
        title="Address and identity providers"
        onPress={() => router.push('/location-privacy')}
      />
      <ActionRow icon="flag-outline" title="Report evidence" onPress={() => router.push('/report/evidence')} />
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
  name: { color: tokens.color.textPrimary, fontSize: tokens.type.section, fontWeight: '800' },
  heading: {
    color: tokens.color.textPrimary,
    fontSize: tokens.type.card,
    fontWeight: '700',
    marginTop: tokens.spacing.sm,
  },
  body: { color: tokens.color.textPrimary, fontSize: tokens.type.body },
});
