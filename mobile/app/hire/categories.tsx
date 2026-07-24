import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { categories } from '@/lib/mock-data';
import { tokens } from '@/theme/tokens';

export default function CategoriesScreen() {
  function openCategory(categoryId: string) {
    router.push({
      pathname: '/hire/providers',
      params: { categoryId },
    });
  }

  return (
    <Screen title="Hire help">
      <View style={styles.list}>
        {categories.map((category) => (
          <Pressable
            key={category.id}
            style={styles.card}
            onPress={() => openCategory(category.id)}
            accessibilityRole="button"
          >
            <Text style={styles.icon}>{category.icon}</Text>
            <View style={styles.copy}>
              <Text style={styles.name}>{category.name}</Text>
              <Text style={styles.description}>{category.description}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: tokens.spacing.md,
  },
  card: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.md,
    backgroundColor: tokens.color.surface,
    borderWidth: 1,
    borderColor: tokens.color.border,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
  },
  icon: {
    width: 32,
    color: tokens.color.primary,
    fontSize: tokens.type.label,
    fontWeight: '800',
  },
  copy: {
    flex: 1,
    gap: tokens.spacing.xs,
  },
  name: {
    color: tokens.color.textPrimary,
    fontSize: tokens.type.body,
    fontWeight: '700',
  },
  description: {
    color: tokens.color.textSecondary,
    fontSize: tokens.type.support,
  },
});