import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { AccessibilityInfo, Animated, AppState, Image, StyleSheet, View } from 'react-native';
import type { AICharacter } from '@/lib/ai-characters';
import { tokens } from '@/theme/tokens';

export type AIMotionState = 'idle' | 'thinking' | 'answer' | 'attention';

// Frame the approved original from headwrap through waving arm. No generated art.
export function AICharacterPresentation({
  character,
  state = 'idle',
  size = 108,
}: {
  character: AICharacter;
  state?: AIMotionState;
  size?: number;
}) {
  const progress = useRef(new Animated.Value(0)).current;
  const [reduceMotion, setReduceMotion] = useState(true);
  const [active, setActive] = useState(false);
  useFocusEffect(
    useCallback(() => {
      setActive(AppState.currentState === 'active');
      const subscription = AppState.addEventListener('change', (next) => setActive(next === 'active'));
      return () => {
        setActive(false);
        subscription.remove();
      };
    }, []),
  );
  useEffect(() => {
    let disposed = false;
    void AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => {
        if (!disposed) setReduceMotion(value);
      })
      .catch(() => {});
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      disposed = true;
      subscription.remove();
    };
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
    return () => {
      animation.stop();
      progress.stopAnimation();
      progress.setValue(0);
    };
  }, [active, progress, reduceMotion, state, character.id]);
  return (
    <View style={[styles.frame, { width: size, height: size }, state === 'attention' && styles.attention]}>
      <Animated.View
        style={{
          width: size,
          height: size,
          transform: [
            {
              translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [0, state === 'answer' ? -4 : -2] }),
            },
            { rotate: progress.interpolate({ inputRange: [0, 1], outputRange: ['-1deg', '1deg'] }) },
          ],
        }}
      >
        <Image
          source={character.full}
          resizeMode="contain"
          style={{ width: size * 1.32, height: size * 1.76, left: -size * 0.16, top: 5 }}
          accessibilityLabel={character.label}
        />
      </Animated.View>
    </View>
  );
}
const styles = StyleSheet.create({
  frame: {
    borderWidth: 2,
    borderColor: tokens.color.gold,
    borderRadius: 24,
    backgroundColor: '#F3F4EA',
    overflow: 'hidden',
    flexShrink: 0,
  },
  attention: { borderColor: tokens.color.secondary },
});
