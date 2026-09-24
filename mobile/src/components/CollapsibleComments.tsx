import { createContext, useContext, useEffect, useRef, useState, type PropsWithChildren, type ReactNode } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { subscribeMediaSession } from '@/lib/media-session';
import { tokens } from '@/theme/tokens';

export function useCommentDraft<T>(initial: T, scope?: string) {
  const initialValue = useRef(initial);
  const [draft, setDraft] = useState(initial);
  useEffect(() => {
    setDraft(initialValue.current);
    return subscribeMediaSession(() => setDraft(initialValue.current));
  }, [scope]);
  return [draft, setDraft] as const;
}

type Controller = { active?: string; open: (id: string) => void; close: () => void };
const CommentsContext = createContext<Controller | undefined>(undefined);
export function CommentsProvider({ children }: PropsWithChildren) {
  const [active, setActive] = useState<string>();
  useEffect(() => subscribeMediaSession(() => setActive(undefined)), []);
  useFocusEffect(useCallback(() => () => setActive(undefined), []));
  return (
    <CommentsContext.Provider value={{ active, open: setActive, close: () => setActive(undefined) }}>
      {children}
    </CommentsContext.Provider>
  );
}

// Drafts stay with the authorized screen, never in persistent/shared storage.
// A native Modal contains touches; its backdrop is a sibling of the thread.
export function CollapsibleComments({
  id,
  count,
  busy = false,
  error,
  children,
}: {
  id: string;
  count: number;
  busy?: boolean;
  error?: string;
  children: (focus: { onFocus: () => void; onBlur: () => void }) => ReactNode;
}) {
  const controller = useContext(CommentsContext);
  const [localOpen, setLocalOpen] = useState(false);
  const focused = useRef(false);
  const expanded = controller ? controller.active === id : localOpen;
  useEffect(() => {
    if (!expanded) focused.current = false;
  }, [expanded]);
  function close(outside = false) {
    if (busy || (outside && focused.current)) return;
    Keyboard.dismiss();
    focused.current = false;
    if (controller) controller.close();
    else setLocalOpen(false);
  }
  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${count} comments, ${expanded ? 'expanded' : 'collapsed'}`}
        accessibilityState={{ expanded }}
        style={styles.control}
        onPress={() => {
          if (controller) controller.open(id);
          else setLocalOpen(true);
        }}
      >
        <Text style={styles.controlText}>Comments ({count})</Text>
      </Pressable>
      <Modal visible={expanded} transparent animationType="fade" onRequestClose={() => close()}>
        <SafeAreaView style={styles.overlay}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close comments"
            style={StyleSheet.absoluteFill}
            onPress={() => close(true)}
          />
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.panel}>
            <View accessibilityViewIsModal style={styles.thread}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Hide comments"
                accessibilityState={{ expanded: true, disabled: busy }}
                disabled={busy}
                style={styles.control}
                onPress={() => close()}
              >
                <Text style={styles.controlText}>Hide comments</Text>
              </Pressable>
              <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
                <Text accessibilityRole="header" style={styles.heading}>
                  Comments ({count})
                </Text>
                {error ? (
                  <Text accessibilityRole="alert" style={styles.error}>
                    {error}
                  </Text>
                ) : null}
                {expanded
                  ? children({
                      onFocus: () => {
                        focused.current = true;
                      },
                      onBlur: () => {
                        focused.current = false;
                      },
                    })
                  : null}
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  control: { minHeight: 48, paddingHorizontal: 12, justifyContent: 'center', alignSelf: 'flex-start' },
  controlText: { color: tokens.color.primary, fontSize: 16, fontWeight: '700' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 20 },
  panel: { width: '100%', maxWidth: 760, maxHeight: '85%', alignSelf: 'center', flexShrink: 1 },
  thread: { flexShrink: 1, backgroundColor: tokens.color.surface, borderRadius: 16, padding: 12 },
  content: { gap: 12, paddingBottom: 20 },
  heading: { fontSize: 20, fontWeight: '700', color: tokens.color.textPrimary },
  error: { color: tokens.color.textPrimary },
});
