import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { tokens } from '@/theme/tokens';

export default function WelcomeScreen() {
  return (
    <Screen title="My Corner" showHeader={false} showTitle={false}>
      <View style={styles.heroLogo}>
        <View style={styles.heroMark}>
          <View style={styles.cornerVertical} />
          <View style={styles.cornerHorizontal} />
          <Text style={styles.markText}>MC</Text>
        </View>
        <View style={styles.heroText}>
          <Text style={styles.logoName}>My Corner</Text>
          <Text style={styles.logoDescriptor}>Trusted People</Text>
        </View>
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
    alignItems: 'center',
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: tokens.spacing.md,
    padding: tokens.spacing.lg,
  },
  heroMark: {
    alignItems: 'center',
    backgroundColor: tokens.color.primary,
    borderRadius: tokens.radius.md,
    height: 64,
    justifyContent: 'center',
    position: 'relative',
    width: 64,
  },
  cornerVertical: {
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    height: 34,
    left: 14,
    position: 'absolute',
    top: 14,
    width: 8,
  },
  cornerHorizontal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    bottom: 14,
    height: 8,
    left: 14,
    position: 'absolute',
    width: 34,
  },
  markText: {
    color: tokens.color.secondary,
    fontSize: tokens.type.card,
    fontWeight: '900',
  },
  heroText: { flex: 1 },
  logoName: { color: tokens.color.textPrimary, fontSize: 24, fontWeight: '900' },
  logoDescriptor: { color: tokens.color.textSecondary, fontSize: tokens.type.support, fontWeight: '700' },
  body: { fontSize: tokens.type.body, color: tokens.color.textPrimary },
  button: { backgroundColor: tokens.color.primary, padding: tokens.spacing.lg, borderRadius: tokens.radius.md },
  buttonText: { color: '#fff', fontWeight: '700', textAlign: 'center' },
});
