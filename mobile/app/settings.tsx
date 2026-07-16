import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { tokens } from '@/theme/tokens';

const settings = [
  'Neighborhood: East Legon',
  'Language: English',
  'Data saver: On for pilot',
  'Reduced motion: Uses system setting',
  'Location sharing: General area only',
  'Notifications: In-app prototype updates only',
];

export default function SettingsScreen() {
  return (
    <Screen title="Settings">
      <Text style={styles.body}>Planned controls for account, location, notifications, display, language, privacy, and safety.</Text>
      <View style={styles.panel}>
        {settings.map((item) => (
          <Text key={item} style={styles.item}>{item}</Text>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { color: tokens.color.textPrimary, fontSize: tokens.type.body },
  panel: { backgroundColor: tokens.color.surface, borderColor: tokens.color.border, borderWidth: 1, borderRadius: tokens.radius.md, padding: tokens.spacing.lg, gap: tokens.spacing.md },
  item: { color: tokens.color.textPrimary, fontSize: tokens.type.body },
});
