import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { categories } from '@/lib/mock-data';
import { tokens } from '@/theme/tokens';

const categoryIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  plumbing: 'water-outline',
  electrical: 'flash-outline',
  cleaning: 'sparkles-outline',
  carpentry: 'hammer-outline',
  'air-conditioning': 'snow-outline',
  'appliance-repair': 'construct-outline',
  'moving-delivery': 'car-outline',
  painting: 'color-palette-outline',
};

export default function CategoriesScreen() {
  function openCategory(categoryId: string) {
    router.push({
      pathname: '/hire/providers',
      params: { categoryId },
    });
  }

  return (
    <Screen title="Hire help">
      <Text style={styles.heading}>What can we help with?</Text>
      <Text style={styles.description}>Find local expertise and compare the trust evidence.</Text>
      <View style={styles.list}>
        {categories.map((category) => (
          <Pressable
            key={category.id}
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
            onPress={() => openCategory(category.id)}
            accessibilityRole="button"
          >
            <View style={styles.icon}>
              <Ionicons name={categoryIcons[category.id] ?? 'construct-outline'} size={24} color={tokens.color.primary} accessible={false} />
            </View>
            <View style={styles.copy}>
              <Text style={styles.name}>{category.name}</Text>
              <Text style={styles.description}>{category.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={tokens.color.textSecondary} accessible={false} />
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { color: tokens.color.ink, fontSize: 26, lineHeight: 32, fontWeight: '800' },
  pressed: { backgroundColor: tokens.color.surfacePressed },
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
    borderRadius: tokens.radius.card,
    padding: tokens.spacing.lg,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.color.successSurface,
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
