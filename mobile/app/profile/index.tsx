import { getCurrentProfile } from '@/lib/auth';
import { loadOwnPublicName } from '@/lib/messaging';
import { useProtectedResource } from '@/hooks/useProtectedResource';
import { ParentMediaEditor } from '@/components/media/ParentMediaEditor';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { WebSafeLink } from '@/components/WebSafeLink';
import { Screen } from '@/components/Screen';
import { tokens } from '@/theme/tokens';

async function loadProfile() {
  const [profile, publicName] = await Promise.all([getCurrentProfile(), loadOwnPublicName()]);
  return { ...profile, displayName: publicName.name ?? 'Neighbor' };
}

export default function ProfileScreen() {
  const resource = useProtectedResource(loadProfile, 0, { preserveDuringMediaPicker: true });
  const profile = resource.data;
  const error = resource.error;

  return (
    <Screen title="Profile">
      {error ? (
        <Text accessibilityRole="alert" style={styles.body}>
          {error}
        </Text>
      ) : null}
      {profile ? (
        <View style={styles.panel}>
          <Text style={styles.name}>{profile.displayName}</Text>
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

      <WebSafeLink href="/profile/public-name" asChild>
        <Pressable accessibilityRole="button" style={styles.secondary}>
          <Text style={styles.secondaryText}>Public display name</Text>
        </Pressable>
      </WebSafeLink>

      <WebSafeLink href="/profile/verification" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Verification status</Text>
        </Pressable>
      </WebSafeLink>

      <WebSafeLink href="/profile/phone-verification" asChild>
        <Pressable style={styles.secondary}>
          <Text style={styles.secondaryText}>Phone verification</Text>
        </Pressable>
      </WebSafeLink>

      <WebSafeLink href="/profile/legal-name" asChild>
        <Pressable style={styles.secondary}>
          <Text style={styles.secondaryText}>Legal name</Text>
        </Pressable>
      </WebSafeLink>

      <WebSafeLink href={{ pathname: '/profile/address' }} asChild>
        <Pressable style={styles.secondary}>
          <Text style={styles.secondaryText}>Ghana address</Text>
        </Pressable>
      </WebSafeLink>

      <WebSafeLink href={{ pathname: '/profile/map-confirmation' }} asChild>
        <Pressable style={styles.secondary}>
          <Text style={styles.secondaryText}>Map confirmation</Text>
        </Pressable>
      </WebSafeLink>

      <WebSafeLink href="/profile/manual-biometric" asChild>
        <Pressable style={styles.secondary}>
          <Text style={styles.secondaryText}>Manual biometric review</Text>
        </Pressable>
      </WebSafeLink>

      <WebSafeLink href={{ pathname: '/profile/privacy' }} asChild>
        <Pressable style={styles.secondary}>
          <Text style={styles.secondaryText}>Masked profile and map privacy</Text>
        </Pressable>
      </WebSafeLink>

      <WebSafeLink href={{ pathname: '/location-privacy' }} asChild>
        <Pressable style={styles.secondary}>
          <Text style={styles.secondaryText}>Address and identity providers</Text>
        </Pressable>
      </WebSafeLink>

      <WebSafeLink href="/report/evidence" asChild>
        <Pressable style={styles.secondary}>
          <Text style={styles.secondaryText}>Report evidence</Text>
        </Pressable>
      </WebSafeLink>
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
  name: {
    color: tokens.color.textPrimary,
    fontSize: tokens.type.section,
    fontWeight: '800',
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
  button: {
    minHeight: tokens.touch.min,
    justifyContent: 'center',
    backgroundColor: tokens.color.primary,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
  },
  buttonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '700',
  },
  secondary: {
    minHeight: tokens.touch.min,
    justifyContent: 'center',
    borderColor: tokens.color.primary,
    borderWidth: 1,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
  },
  secondaryText: {
    color: tokens.color.primary,
    textAlign: 'center',
    fontWeight: '700',
  },
});
