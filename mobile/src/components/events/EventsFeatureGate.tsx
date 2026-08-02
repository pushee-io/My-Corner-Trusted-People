import { router } from 'expo-router';
import { type PropsWithChildren, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { eventsRuntimeRepository, isEventsClientEnabled } from '@/lib/events-runtime-repository';
import { tokens } from '@/theme/tokens';

type GateState = 'checking' | 'allowed' | 'disabled' | 'error';

export function EventsFeatureGate({ children }: PropsWithChildren) {
  const [state, setState] = useState<GateState>(isEventsClientEnabled() ? 'checking' : 'disabled');
  const [message, setMessage] = useState('Checking Events availability.');

  useEffect(() => {
    if (!isEventsClientEnabled()) return;
    eventsRuntimeRepository
      .isEnabled()
      .then((enabled) => setState(enabled ? 'allowed' : 'disabled'))
      .catch((caught) => {
        setMessage(caught instanceof Error ? caught.message : 'Events availability could not be checked.');
        setState('error');
      });
  }, []);

  if (state === 'allowed') return <>{children}</>;

  return (
    <View accessibilityLiveRegion="polite" style={styles.container}>
      <Text accessibilityRole="header" style={styles.title}>
        {state === 'checking' ? 'Checking Events' : 'Events is not available'}
      </Text>
      <Text style={styles.body}>
        {state === 'checking'
          ? message
          : state === 'error'
            ? 'We could not safely open Events. Check your connection or sign in again.'
            : 'Events is currently disabled while verification and safety checks are completed.'}
      </Text>
      {state !== 'checking' ? (
        <Pressable accessibilityLabel="Return to My Corner home" accessibilityRole="button" onPress={() => router.replace('/home')} style={styles.button}>
          <Text style={styles.buttonText}>Return home</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', gap: tokens.spacing.md, padding: tokens.spacing.xl, backgroundColor: tokens.color.background },
  title: { color: tokens.color.textPrimary, fontSize: tokens.type.section, fontWeight: '700' },
  body: { color: tokens.color.textPrimary, fontSize: tokens.type.body, lineHeight: 24 },
  button: { minHeight: tokens.touch.min, justifyContent: 'center', borderRadius: tokens.radius.md, backgroundColor: tokens.color.primary, padding: tokens.spacing.md },
  buttonText: { color: '#FFFFFF', fontSize: tokens.type.body, fontWeight: '700', textAlign: 'center' },
});
