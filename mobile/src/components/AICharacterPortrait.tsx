import { Image, StyleSheet, View } from 'react-native';
import type { AICharacter } from '@/lib/ai-characters';
import { tokens } from '@/theme/tokens';

export function AICharacterPortrait({
  character,
  size = 88,
  selected = true,
}: {
  character: AICharacter;
  size?: number;
  selected?: boolean;
}) {
  return (
    <View
      style={[
        styles.frame,
        { width: size, height: size, borderColor: selected ? tokens.color.gold : tokens.color.borderSubtle },
      ]}
    >
      <Image
        source={character.portrait}
        resizeMode="contain"
        style={styles.image}
        accessibilityLabel={character.label}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  frame: {
    borderWidth: 2,
    borderRadius: 20,
    padding: 4,
    backgroundColor: '#F3F4EA',
    overflow: 'hidden',
    flexShrink: 0,
  },
  image: { width: '100%', height: '100%' },
});
