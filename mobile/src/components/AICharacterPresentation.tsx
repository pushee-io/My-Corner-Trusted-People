import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { AccessibilityInfo, Animated, AppState, Image, StyleSheet, View } from 'react-native';
import type { AICharacter, AICharacterId } from '@/lib/ai-characters';
import {
  characterExpressionAt,
  subtractArtRect,
  type ArtRect,
  type AIMotionState,
  type CharacterExpression,
} from '@/lib/ai-character-motion';
import { tokens } from '@/theme/tokens';

export type { AIMotionState } from '@/lib/ai-character-motion';
type Rig = { crop: ArtRect; head: ArtRect; limb?: ArtRect & { pivotX: number; pivotY: number; degrees: number } };
// Coordinates in the approved 1086 × 1448 art. No body/face mesh warping.
const rigs: Record<AICharacterId, Rig> = {
  'woman-kente': {
    crop: { x: 150, y: 0, width: 700, height: 700 },
    head: { x: 381, y: 0, width: 333, height: 386 },
    limb: { x: 190, y: 284, width: 158, height: 164, pivotX: 280, pivotY: 437, degrees: 16 },
  },
  'older-man': {
    crop: { x: 90, y: 0, width: 800, height: 800 },
    head: { x: 402, y: 0, width: 300, height: 346 },
    limb: { x: 130, y: 214, width: 226, height: 388, pivotX: 320, pivotY: 555, degrees: 7 },
  },
  'woman-purple': { crop: { x: 265, y: 0, width: 560, height: 560 }, head: { x: 393, y: 7, width: 253, height: 290 } },
  'young-man': { crop: { x: 300, y: 0, width: 490, height: 490 }, head: { x: 447, y: 3, width: 184, height: 224 } },
};

/** Also used by visual QA: real production layers at a deterministic sample. */
export function AICharacterArt({
  character,
  size,
  expression = 'happy',
  limbProgress = 0,
  headProgress = 0,
}: {
  character: AICharacter;
  size: number;
  expression?: CharacterExpression;
  limbProgress?: number | Animated.Value;
  headProgress?: number | Animated.Value;
}) {
  const rig = rigs[character.id];
  const scale = size / rig.crop.width;
  // Retain original jaw/neck and wrist/elbow pixels behind the articulated layers.
  // The overlap avoids a transparent seam as the head/limb rotates.
  const cuts = [
    { ...rig.head, height: rig.head.height - 38 },
    ...(rig.limb ? [{ ...rig.limb, height: rig.limb.height - (character.id === 'older-man' ? 64 : 14) }] : []),
  ];
  const parts = cuts.reduce((remaining, cut) => remaining.flatMap((part) => subtractArtRect(part, cut)), [rig.crop]);
  const position = (rect: ArtRect) => ({
    position: 'absolute' as const,
    left: (rect.x - rig.crop.x) * scale,
    top: (rect.y - rig.crop.y) * scale,
    width: rect.width * scale,
    height: rect.height * scale,
  });
  const original = (rect: ArtRect) => (
    <View style={{ width: rect.width * scale, height: rect.height * scale, overflow: 'hidden' }}>
      <Image
        source={character.full}
        accessible={false}
        resizeMode="stretch"
        style={{
          position: 'absolute',
          width: 1086 * scale,
          height: 1448 * scale,
          left: -rect.x * scale,
          top: -rect.y * scale,
        }}
      />
    </View>
  );
  const rotation = (progress: number | Animated.Value, degrees: number) =>
    typeof progress === 'number'
      ? `${progress * degrees}deg`
      : progress.interpolate({ inputRange: [-1, 0, 1], outputRange: [`-${degrees}deg`, '0deg', `${degrees}deg`] });
  return (
    <View testID="character-art" accessibilityLabel={character.label} style={{ width: size, height: size }}>
      {parts.map((rect, i) => (
        <View key={i} style={position(rect)}>
          {original(rect)}
        </View>
      ))}
      {rig.limb ? (
        <Animated.View
          testID="character-independent-limb"
          style={[
            position(rig.limb),
            {
              transform: [
                { translateX: (rig.limb.pivotX - rig.limb.x - rig.limb.width / 2) * scale },
                { translateY: (rig.limb.pivotY - rig.limb.y - rig.limb.height / 2) * scale },
                { rotate: rotation(limbProgress, rig.limb.degrees) },
                { translateX: -(rig.limb.pivotX - rig.limb.x - rig.limb.width / 2) * scale },
                { translateY: -(rig.limb.pivotY - rig.limb.y - rig.limb.height / 2) * scale },
              ],
            },
          ]}
        >
          {original(rig.limb)}
        </Animated.View>
      ) : null}
      <Animated.View
        testID={`character-expression-${expression}`}
        style={[position(rig.head), { transform: [{ rotate: rotation(headProgress, 3) }] }]}
      >
        {(Object.keys(character.expressions) as CharacterExpression[]).map((frame) => (
          <Image
            key={frame}
            source={character.expressions[frame]}
            accessible={false}
            resizeMode="contain"
            style={{ position: 'absolute', width: '100%', height: '100%', opacity: frame === expression ? 1 : 0 }}
          />
        ))}
      </Animated.View>
    </View>
  );
}

export function AICharacterPresentation({
  character,
  state = 'idle',
  size = 108,
}: {
  character: AICharacter;
  state?: AIMotionState;
  size?: number;
}) {
  const limb = useRef(new Animated.Value(0)).current;
  const head = useRef(new Animated.Value(0)).current;
  const [expression, setExpression] = useState<CharacterExpression>('happy');
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
    limb.stopAnimation();
    head.stopAnimation();
    limb.setValue(0);
    head.setValue(0);
    setExpression('happy');
    if (reduceMotion || !active) return;
    const start = Date.now();
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      setExpression(characterExpressionAt(state, Date.now() - start));
      timer = setTimeout(tick, 120);
    };
    tick();
    const timing = (value: Animated.Value, toValue: number, duration: number) =>
      Animated.timing(value, { toValue, duration, useNativeDriver: true, isInteraction: false });
    const wave = Animated.sequence([
      timing(limb, -1, 240),
      timing(limb, 1, 350),
      timing(limb, -0.8, 320),
      timing(limb, 0.8, 320),
      timing(limb, 0, 240),
    ]);
    const nod = Animated.sequence([timing(head, -0.7, 450), timing(head, 0.7, 700), timing(head, 0, 450)]);
    if (state === 'idle' || state === 'answer' || state === 'happy') wave.start();
    const thought = state === 'thinking' ? Animated.loop(nod) : nod;
    if (state === 'thinking' || state === 'listening' || state === 'answer') thought.start();
    return () => {
      clearTimeout(timer);
      wave.stop();
      thought.stop();
      limb.stopAnimation();
      head.stopAnimation();
    };
  }, [active, reduceMotion, state, character.id, limb, head]);
  return (
    <View style={[styles.frame, { width: size, height: size }, state === 'attention' && styles.attention]}>
      <AICharacterArt
        character={character}
        size={size - 4}
        expression={expression}
        limbProgress={limb}
        headProgress={head}
      />
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
