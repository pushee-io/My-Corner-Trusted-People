import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Screen } from '@/components/Screen';
import { tokens } from '@/theme/tokens';

export default function SignInScreen() {
  return (
    <Screen title="Sign in">
      <Text style={styles.text}>Use a safe seeded account to continue this prototype.</Text>
      <Text style={styles.helper}>Requester: Akosua Mensah · Provider: Kwame PipeCare</Text>
      <Link href="/neighborhood" asChild>
        <Pressable style={styles.button}><Text style={styles.buttonText}>Continue as requester</Text></Pressable>
      </Link>
      <Link href="/provider" asChild>
        <Pressable style={styles.secondary}><Text style={styles.secondaryText}>Continue as provider</Text></Pressable>
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  text: { fontSize: tokens.type.body, color: tokens.color.textPrimary },
  helper: { fontSize: tokens.type.support, color: tokens.color.textSecondary },
  button: { backgroundColor: tokens.color.primary, padding: tokens.spacing.lg, borderRadius: tokens.radius.md },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: '700' },
  secondary: { borderColor: tokens.color.primary, borderWidth: 1, padding: tokens.spacing.lg, borderRadius: tokens.radius.md },
  secondaryText: { color: tokens.color.primary, textAlign: 'center', fontWeight: '700' },
});
