import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { IconButton } from '@/components/IconButton';
import type { Notice } from '@/lib/messaging';
import { tokens } from '@/theme/tokens';

export function NoticeToast({ notice, onOpen, onDismiss }: { notice: Notice; onOpen: () => void; onDismiss: () => void }) {
  const offset = useRef(new Animated.Value(0)).current;
  const [reduceMotion, setReduceMotion] = useState(true);
  const closing = useRef(false);
  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((value) => { if (active) setReduceMotion(value); }).catch(() => {});
    const listener = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => { active = false; listener.remove(); };
  }, []);
  useEffect(() => {
    if (reduceMotion) { offset.setValue(0); return; }
    offset.setValue(-140);
    const animation = Animated.timing(offset, { toValue: 0, duration: 220, useNativeDriver: true });
    animation.start();
    return () => animation.stop();
  }, [offset, reduceMotion]);
  const dismiss = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    if (reduceMotion) { onDismiss(); return; }
    Animated.timing(offset, { toValue: -180, duration: 170, useNativeDriver: true }).start(({ finished }) => {
      if (finished) onDismiss();
    });
  }, [offset, onDismiss, reduceMotion]);
  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    void AccessibilityInfo.isScreenReaderEnabled().then((enabled) => {
      if (!stopped && !enabled) timer = setTimeout(dismiss, 8000);
    }).catch(() => { if (!stopped) timer = setTimeout(dismiss, 8000); });
    return () => { stopped = true; clearTimeout(timer); offset.stopAnimation(); };
  }, [dismiss, offset]);
  const pan = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_event, gesture) => Math.abs(gesture.dy) > 8,
    onPanResponderMove: (_event, gesture) => { if (!reduceMotion) offset.setValue(Math.min(0, gesture.dy)); },
    onPanResponderRelease: (_event, gesture) => {
      if (Math.abs(gesture.dy) > 35 || Math.abs(gesture.vy) > 0.5) dismiss();
      else Animated.timing(offset, { toValue: 0, duration: reduceMotion ? 0 : 150, useNativeDriver: true }).start();
    },
    onPanResponderTerminate: () => offset.setValue(0),
  }), [dismiss, offset, reduceMotion]);
  return (
    <Animated.View {...pan.panHandlers} style={[styles.toast, notice.priority === 'emergency' && styles.emergency, { transform: [{ translateY: offset }] }]}>
      <Pressable accessibilityRole="button" accessibilityLabel={`Open update: ${notice.title}`}
        onPress={onOpen} style={styles.content}>
        <Ionicons name={notice.priority === 'emergency' ? 'alert-circle-outline' : 'notifications-outline'} size={24} color={tokens.color.primary} accessible={false} />
        <View style={styles.copy}>
          <Text accessibilityRole="alert" style={styles.title}>{notice.title}</Text>
          <Text style={styles.body}>Open to view this update.</Text>
        </View>
      </Pressable>
      <IconButton icon="close" label="Dismiss update" onPress={dismiss} />
    </Animated.View>
  );
}
const styles = StyleSheet.create({
  toast: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: tokens.color.surface, borderWidth: 1, borderLeftWidth: 4, borderColor: tokens.color.primary, borderRadius: 16, padding: 8, elevation: 8, shadowColor: '#102A43', shadowOpacity: 0.14, shadowRadius: 14, shadowOffset: { width: 0, height: 4 } },
  emergency: { borderColor: tokens.color.error },
  content: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 4, minHeight: 56 },
  copy: { flex: 1, gap: 2 },
  title: { color: tokens.color.textPrimary, fontSize: 15, lineHeight: 21, fontWeight: '700' },
  body: { color: tokens.color.textSecondary, fontSize: 13, lineHeight: 19 },
});
