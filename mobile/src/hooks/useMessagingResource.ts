import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { useFocusEffect } from 'expo-router';
import { AppState } from 'react-native';
import { supabase } from '@/lib/supabase';
import { mediaSessionRevision, subscribeMediaSession } from '@/lib/media-session';
import { useProtectedResource } from './useProtectedResource';

// Realtime is a refresh signal only. Never append unvalidated payloads to private state.
export function useMessagingResource<T>(load: () => Promise<T>) {
  const resource = useProtectedResource(load, 10000);
  const refresh = resource.refresh;
  useFocusEffect(
    useCallback(() => {
      let stopped = false;
      let generation = 0;
      let channel: ReturnType<typeof supabase.channel> | undefined;
      let timer: ReturnType<typeof setTimeout> | undefined;
      const invalidate = () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          if (!stopped && AppState.currentState === 'active') void refresh(true);
        }, 120);
      };
      const reconnect = async () => {
        const token = ++generation;
        if (channel) {
          void supabase.removeChannel(channel);
          channel = undefined;
        }
        const { data } = await supabase.auth.getSession();
        if (stopped || token !== generation || !data.session) return;
        channel = supabase.channel(`private-inbox-${Math.random().toString(36).slice(2)}`);
        for (const table of ['marketplace_messages', 'marketplace_conversations', 'notifications']) {
          channel.on('postgres_changes', { event: '*', schema: 'public', table }, invalidate);
        }
        channel.subscribe((status) => {
          if (status === 'SUBSCRIBED') invalidate();
        });
      };
      void reconnect().catch(() => undefined); // Polling remains available if session lookup fails.
      const auth = supabase.auth.onAuthStateChange((event) => {
        if (event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') return;
        ++generation;
        if (channel) {
          void supabase.removeChannel(channel);
          channel = undefined;
        }
        clearTimeout(timer);
        if (event !== 'SIGNED_OUT')
          timer = setTimeout(() => {
            void reconnect().catch(() => undefined);
          }, 0);
      });
      return () => {
        stopped = true;
        ++generation;
        clearTimeout(timer);
        auth.data.subscription.unsubscribe();
        if (channel) void supabase.removeChannel(channel);
      };
    }, [refresh]),
  );
  return resource;
}

// Also reset drafts on external auth events, not just app-initiated account switches.
export function usePrivateSessionKey() {
  const revision = useSyncExternalStore(subscribeMediaSession, mediaSessionRevision, mediaSessionRevision);
  const [authRevision, setAuthRevision] = useState(0);
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT' || event === 'SIGNED_IN') setAuthRevision((value) => value + 1);
    });
    return () => data.subscription.unsubscribe();
  }, []);
  return `${revision}-${authRevision}`;
}
