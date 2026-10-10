import { useEffect, useSyncExternalStore } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { defaultAICharacter, findAICharacter, type AICharacterId } from '@/lib/ai-characters';

// Device-local cosmetic preference only: no identity, question, conversation or credentials.
const key = 'mycorner.ai-character.v1';
let selected = defaultAICharacter.id as AICharacterId;
let hydrated: Promise<void> | undefined;
let revision = 0;
let writes = Promise.resolve();
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
const snapshot = () => selected;
export async function loadAICharacterPreference() {
  if (!hydrated) {
    const current = revision;
    hydrated = (async () => {
      try {
        const value =
          Platform.OS === 'web'
            ? typeof window !== 'undefined'
              ? window.localStorage.getItem(key)
              : null
            : await SecureStore.getItemAsync(key);
        if (current === revision) {
          selected = findAICharacter(value).id;
          listeners.forEach((listener) => listener());
        }
      } catch {
        // Storage denial must not block the assistant. Keep the in-memory choice.
      }
    })();
  }
  return hydrated;
}
export function selectAICharacter(id: AICharacterId) {
  selected = findAICharacter(id).id;
  revision += 1;
  listeners.forEach((listener) => listener());
  const value = selected;
  writes = writes.then(async () => {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') window.localStorage.setItem(key, value);
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch {
      // Cosmetic preference still works for this session.
    }
  });
}
export function useAICharacter() {
  const id = useSyncExternalStore(subscribe, snapshot, () => defaultAICharacter.id);
  useEffect(() => {
    void loadAICharacterPreference();
  }, []);
  return { character: findAICharacter(id), selectCharacter: selectAICharacter };
}
