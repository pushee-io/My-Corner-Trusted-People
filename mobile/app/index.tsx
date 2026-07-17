import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { MyCornerLogo } from '@/components/brand/MyCornerLogo';
import { tokens } from '@/theme/tokens';

export default function WelcomeScreen() {
  return (
    <Screen title="My Corner">
      <View style={styles.heroLogo}>
        <MyCornerLogo />
      </View>
      <Text style={styles.body}>No Wahala — Hire without headache.</Text>
      <Text style={styles.body}>Find trusted local help, review visible trust signals, and send a clear request.</Text>
      <Link href="/sign-in" asChild>
        <Pressable style={styles.button}><Text style={styles.buttonText}>Enter app</Text></Pressable>
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroLogo: {
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    padding: tokens.spacing.lg,
  },
  body: { fontSize: tokens.type.body, color: tokens.color.textPrimary },
  button: { backgroundColor: tokens.color.primary, padding: tokens.spacing.lg, borderRadius: tokens.radius.md },
  buttonText: { color: '#fff', fontWeight: '700', textAlign: 'center' },
});
