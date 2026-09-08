import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { createProtectedResource, type ResourceState } from '@/lib/protected-resource';
import { supabase } from '@/lib/supabase';

export function useProtectedResource<T>(load: () => Promise<T>) {
  const [state, setState] = useState<ResourceState<T>>({ loading: true });
  const resource = useRef<ReturnType<typeof createProtectedResource<T>> | null>(null);

  useFocusEffect(
    useCallback(() => {
      const current = createProtectedResource(load, setState);
      resource.current = current;
      void current.refresh();
      let authRefresh: ReturnType<typeof setTimeout> | undefined;
      const { data } = supabase.auth.onAuthStateChange((event) => {
        if (event === 'INITIAL_SESSION') return;
        clearTimeout(authRefresh);
        current.clear();
        // Run Supabase calls after its synchronous auth callback returns.
        if (event !== 'SIGNED_OUT') authRefresh = setTimeout(() => void current.refresh(), 0);
      });
      const appState = AppState.addEventListener('change', (next) => {
        current.clear();
        if (next === 'active') void current.refresh();
      });
      return () => {
        clearTimeout(authRefresh);
        data.subscription.unsubscribe();
        appState.remove();
        current.clear();
        current.dispose();
        resource.current = null;
      };
    }, [load]),
  );

  const refresh = useCallback(() => resource.current?.refresh(), []);
  return { ...state, refresh };
}
