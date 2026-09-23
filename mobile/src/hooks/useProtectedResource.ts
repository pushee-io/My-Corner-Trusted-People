import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { createProtectedResource, type ResourceState } from '@/lib/protected-resource';
import { supabase } from '@/lib/supabase';
import { subscribeMediaSession } from '@/lib/media-session';

export function useProtectedResource<T>(load: () => Promise<T>, refreshIntervalMs = 0) {
  const [state, setState] = useState<ResourceState<T> & { owner?: typeof load }>({ loading: true });
  const resource = useRef<ReturnType<typeof createProtectedResource<T>> | null>(null);

  useFocusEffect(
    useCallback(() => {
      const current = createProtectedResource(load, (next) => setState({ ...next, owner: load }));
      resource.current = current;
      void current.refresh();
      let signedOut = false;
      const unsubscribeSession = subscribeMediaSession(() => {
        signedOut = true;
        current.clear();
      });
      const interval =
        refreshIntervalMs > 0
          ? setInterval(() => {
              if (!signedOut && AppState.currentState === 'active') void current.refresh(true);
            }, refreshIntervalMs)
          : undefined;
      let authRefresh: ReturnType<typeof setTimeout> | undefined;
      const { data } = supabase.auth.onAuthStateChange((event) => {
        if (event === 'INITIAL_SESSION') return;
        clearTimeout(authRefresh);
        current.clear();
        signedOut = event === 'SIGNED_OUT';
        // Run Supabase calls after its synchronous auth callback returns.
        if (event !== 'SIGNED_OUT') authRefresh = setTimeout(() => void current.refresh(), 0);
      });
      const appState = AppState.addEventListener('change', (next) => {
        current.clear();
        if (next === 'active' && !signedOut) void current.refresh();
      });
      return () => {
        clearTimeout(authRefresh);
        clearInterval(interval);
        unsubscribeSession();
        data.subscription.unsubscribe();
        appState.remove();
        current.clear();
        current.dispose();
        resource.current = null;
      };
    }, [load, refreshIntervalMs]),
  );

  const refresh = useCallback((background = false) => resource.current?.refresh(background), []);
  return { ...(state.owner === load ? state : { loading: true }), refresh };
}
