import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { tokens } from '@/theme/tokens';

export default function NeighborhoodScreen() {
  return (
    <Screen title="Choose your neighborhood">
      <Text style={styles.text}>Pilot location: Accra, Ghana.</Text>
      <Text style={styles.text}>Selected neighborhood: East Legon</Text>
      <View style={styles.notice}>
        <Text style={styles.noticeText}>Only your general service area is used for browsing. Exact addresses stay private in this slice.</Text>
      </View>
      <Link href="/home" asChild>
        <Pressable style={styles.button}><Text style={styles.buttonText}>Confirm neighborhood</Text></Pressable>
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  text: { fontSize: tokens.type.body, color: tokens.color.textPrimary },
  notice: { backgroundColor: '#EEF7F4', borderRadius: tokens.radius.md, padding: tokens.spacing.md },
  noticeText: { fontSize: tokens.type.support, color: tokens.color.textPrimary },
  button: { backgroundColor: tokens.color.primary, padding: tokens.spacing.lg, borderRadius: tokens.radius.md },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: '700' },
});
