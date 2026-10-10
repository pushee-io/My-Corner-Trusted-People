import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { AccessibilityInfo, Animated, AppState, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { aiCharacters, type AICharacter, type AICharacterId } from '@/lib/ai-characters';
import { AICharacterPortrait } from '@/components/AICharacterPortrait';
import { tokens } from '@/theme/tokens';

export type AIMotionState = 'idle' | 'thinking' | 'answer' | 'attention';
const messages: Record<AIMotionState, string> = {
  idle: 'How can I help?',
  thinking: 'Checking your neighborhood…',
  answer: 'Here is what I found.',
  attention: 'Let’s try another way.',
};
export function AICharacterExperience({ character, selectCharacter, state }: {
  character: AICharacter;
  selectCharacter: (id: AICharacterId) => void;
  state: AIMotionState;
}) {
  const progress = useRef(new Animated.Value(0)).current;
  const [reduceMotion, setReduceMotion] = useState(true);
  const [active, setActive] = useState(false);
  useFocusEffect(useCallback(() => {
    setActive(AppState.currentState === 'active');
    const subscription = AppState.addEventListener('change', (next) => setActive(next === 'active'));
    return () => { setActive(false); subscription.remove(); };
  }, []));
  useEffect(() => {
    let disposed = false;
    void AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (!disposed) setReduceMotion(value);
    }).catch(() => {});
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => { disposed = true; subscription.remove(); };
  }, []);
  useEffect(() => {
    progress.stopAnimation();
    progress.setValue(0);
    if (reduceMotion || !active || state === 'attention') return;
    const duration = state === 'thinking' ? 900 : state === 'answer' ? 250 : 1800;
    const sequence = Animated.sequence([
      Animated.timing(progress, { toValue: 1, duration, useNativeDriver: true }),
      Animated.timing(progress, { toValue: 0, duration, useNativeDriver: true }),
    ]);
    const animation = state === 'answer' ? sequence : Animated.loop(sequence);
    animation.start();
    return () => { animation.stop(); progress.stopAnimation(); progress.setValue(0); };
  }, [active, progress, reduceMotion, state, character.id]);
  return (
    <View style={styles.container}>
      <View style={[styles.stage, state === 'attention' && styles.attention]}>
        <View style={styles.introduction}>
          <Text accessibilityRole="header" style={styles.title}>Your neighborhood concierge</Text>
          <Text accessibilityLiveRegion="polite" style={styles.message}>{messages[state]}</Text>
          <Text style={styles.hint}>Answers grounded in your neighborhood.</Text>
        </View>
        <Animated.View style={{ transform: [
          { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [0, state === 'answer' ? -6 : -3] }) },
          { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [1, 1.015] }) },
        ] }}>
          <Image source={character.full} resizeMode="contain" style={styles.character}
            accessibilityLabel={character.label} />
        </Animated.View>
      </View>
      <Text style={styles.selectorLabel}>Choose your My Corner AI character</Text>
      <View accessibilityRole="radiogroup" style={styles.selector}>
        {aiCharacters.map((option) => (
          <Pressable key={option.id} accessibilityRole="radio"
            accessibilityLabel={option.label} accessibilityState={{ checked: option.id === character.id }}
            onPress={() => selectCharacter(option.id)}
            style={({ pressed }) => [styles.option, pressed && styles.pressed]}>
            <AICharacterPortrait character={option} size={58} selected={option.id === character.id} />
            <Text style={[styles.choice, option.id === character.id && styles.chosen]}>
              {option.id === character.id ? 'Selected' : 'Choose'}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { gap: 8 },
  stage: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#144C43', borderRadius: 16, padding: 12, borderWidth: 2, borderColor: '#144C43', gap: 4 },
  attention: { borderColor: tokens.color.gold },
  introduction: { flex: 1, minWidth: 0, gap: 8 },
  title: { color: tokens.color.onPrimary, fontSize: 17, lineHeight: 23, fontWeight: '700' },
  message: { color: tokens.color.onPrimary, fontSize: 15, lineHeight: 21 },
  hint: { color: '#DCECE3', fontSize: 12, lineHeight: 18 },
  character: { width: 118, height: 174 },
  selectorLabel: { color: tokens.color.textSecondary, ...tokens.typography.caption },
  selector: { flexDirection: 'row', justifyContent: 'space-between', gap: 2 },
  option: { minHeight: 80, minWidth: 58, alignItems: 'center', borderRadius: 12, paddingVertical: 4, gap: 2 },
  pressed: { backgroundColor: tokens.color.surfacePressed },
  choice: { color: tokens.color.textSecondary, fontSize: 12, lineHeight: 18 },
  chosen: { color: tokens.color.primary, fontWeight: '700' },
});
