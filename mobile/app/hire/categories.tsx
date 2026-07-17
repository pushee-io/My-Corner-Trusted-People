import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { categories } from '@/lib/mock-data';
import { tokens } from '@/theme/tokens';

export default function CategoriesScreen() {
  return (
    <Screen title="Hire help">
      <View style={styles.list}>
        {categories.map((category) => (
          <Link
            key={category.id}
            href={{
              pathname: '/hire/request/review',
              params: {
                requesterName: 'Akosua Mensah',
                providerId: 'prov-01',
                categoryId: category.id,
                neighborhood: 'East Legon',
                areaLabel: 'East Legon, general area only',
                title: `${category.name} help needed`,
                description: 'Water is leaking under the kitchen sink. I need someone to inspect it and repair the leak.',
                originalUserText: 'Water is leaking under the kitchen sink.',
                urgency: 'soon',
                preferredDate: '2026-07-18',
                preferredTime: 'Afternoon',
                contactPreference: 'app_update',
                photoCount: '0',
              },
            }}
            asChild
          >
            <Pressable style={styles.card}>
              <Text style={styles.icon}>{category.icon}</Text>
              <Text style={styles.cardText}>{category.name}</Text>
              <Text style={styles.description}>{category.description}</Text>
            </Pressable>
          </Link>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: tokens.spacing.md },
  card: { minHeight: 48, backgroundColor: tokens.color.surface, borderWidth: 1, borderColor: tokens.color.border, borderRadius: tokens.radius.md, padding: tokens.spacing.lg, gap: tokens.spacing.xs },
  icon: { fontSize: tokens.type.label, color: tokens.color.primary, fontWeight: '800' },
  cardText: { fontSize: tokens.type.body, color: tokens.color.textPrimary, fontWeight: '600' },
  description: { fontSize: tokens.type.support, color: tokens.color.textSecondary },
});
