import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { StatusPill } from '@/components/StatusPill';
import { listRequesterRequests } from '@/lib/repository';
import { testRequester } from '@/lib/session';
import { tokens } from '@/theme/tokens';

export default function HomeScreen() {
  const requests = listRequesterRequests(testRequester.name);
  const latest = requests[0];

  return (
    <Screen title="My Corner home">
      <Text style={styles.body}>East Legon · Accra pilot</Text>

      <Link href="/hire/categories" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Hire help</Text>
        </Pressable>
      </Link>

      <Link href="/community" asChild>
        <Pressable style={styles.secondary}>
          <Text style={styles.secondaryText}>Community</Text>
        </Pressable>
      </Link>

      {latest ? (
        <Link href={{ pathname: '/hire/request/status', params: { requestId: latest.id } }} asChild>
          <Pressable style={styles.panel}>
            <StatusPill status={latest.status} />
            <Text style={styles.title}>{latest.title}</Text>
            <Text style={styles.body}>Track provider response</Text>
          </Pressable>
        </Link>
      ) : (
        <View style={styles.panel}>
          <Text style={styles.title}>No active requests</Text>
          <Text style={styles.body}>Start with Hire help to test the first flow.</Text>
        </View>
      )}

      <Link href="/profile" asChild>
        <Pressable style={styles.secondary}>
          <Text style={styles.secondaryText}>Profile</Text>
        </Pressable>
      </Link>

      <Link href="/settings" asChild>
        <Pressable style={styles.secondary}>
          <Text style={styles.secondaryText}>Settings</Text>
        </Pressable>
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    color: tokens.color.textPrimary,
    fontSize: tokens.type.body,
  },
  title: {
    color: tokens.color.textPrimary,
    fontSize: tokens.type.card,
    fontWeight: '700',
  },
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
    padding: tokens.spacing.lg,
    borderRadius: tokens.radius.md,
  },
  secondaryText: {
    color: tokens.color.primary,
    textAlign: 'center',
    fontWeight: '700',
  },
});
