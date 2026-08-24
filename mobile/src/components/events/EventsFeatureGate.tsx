import { router } from 'expo-router';
import { type PropsWithChildren, useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { eventsRuntimeRepository, isEventsClientEnabled } from '@/lib/events-runtime-repository';
import { tokens } from '@/theme/tokens';

type GateState = 'checking' | 'allowed' | 'disabled' | 'error';

export function EventsFeatureGate({ children }: PropsWithChildren) {
  const [state, setState] = useState<GateState>(isEventsClientEnabled() ? 'checking' : 'disabled');
  const [message, setMessage] = useState('Checking Events availability.');

  const checkAvailability = useCallback(() => {
    if (!isEventsClientEnabled()) {
      setState('disabled');
      return;
    }
    setMessage('Checking Events availability.');
    setState('checking');
    eventsRuntimeRepository
      .isEnabled()
      .then((enabled) => setState(enabled ? 'allowed' : 'disabled'))
      .catch((caught) => {
        setMessage(caught instanceof Error ? caught.message : 'Events availability could not be checked.');
        setState('error');
      });
  }, []);

  useEffect(() => {
    checkAvailability();
  }, [checkAvailability]);

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
            : 'Events is not available for your neighborhood right now. Try again later.'}
      </Text>
      {state !== 'checking' ? (
        <View style={styles.actions}>
          <Pressable
            accessibilityLabel="Check Events availability again"
            accessibilityRole="button"
            onPress={checkAvailability}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>Try again</Text>
          </Pressable>
          <Pressable
            accessibilityLabel="Return to My Corner home"
            accessibilityRole="button"
            onPress={() => router.replace('/home')}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Return home</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: tokens.spacing.md,
    padding: tokens.spacing.xl,
    backgroundColor: tokens.color.background,
  },
  title: { color: tokens.color.textPrimary, fontSize: tokens.type.section, fontWeight: '700' },
  body: { color: tokens.color.textPrimary, fontSize: tokens.type.body, lineHeight: 24 },
  actions: { gap: tokens.spacing.sm },
  button: {
    minHeight: tokens.touch.min,
    justifyContent: 'center',
    borderRadius: tokens.radius.md,
    backgroundColor: tokens.color.primary,
    padding: tokens.spacing.md,
  },
  buttonText: { color: '#FFFFFF', fontSize: tokens.type.body, fontWeight: '700', textAlign: 'center' },
  secondaryButton: {
    borderColor: tokens.color.primary,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: tokens.touch.min,
    padding: tokens.spacing.md,
  },
  secondaryButtonText: {
    color: tokens.color.primary,
    fontSize: tokens.type.body,
    fontWeight: '700',
    textAlign: 'center',
  },
});
