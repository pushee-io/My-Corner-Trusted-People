import { isFeatureEnabled } from '@/lib/feature-flags';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type EventsFlagState = 'loading' | 'enabled' | 'disabled';
let state: EventsFlagState = isFeatureEnabled('events') ? 'loading' : 'disabled';
let request: Promise<EventsFlagState> | undefined;
const listeners = new Set<(next: EventsFlagState) => void>();

function publish(next: EventsFlagState) {
  state = next;
  listeners.forEach((listener) => listener(next));
  return next;
}

export async function loadEventsFeatureFlag(): Promise<EventsFlagState> {
  if (!isFeatureEnabled('events')) {
    return publish('disabled');
  }

  if (request) {
    return request;
  }

  request = (async () => {
    try {
      const { data, error } = await supabase.from('feature_flags').select('enabled').eq('key', 'events').maybeSingle();

      return publish(!error && data?.enabled === true ? 'enabled' : 'disabled');
    } catch {
      return publish('disabled');
    }
  })();

  return request;
}

export function isEventsEnabled() {
  return state === 'enabled';
}

export function useEventsFeatureFlag() {
  const [current, setCurrent] = useState(state);
  useEffect(() => {
    listeners.add(setCurrent);
    void loadEventsFeatureFlag();
    return () => {
      listeners.delete(setCurrent);
    };
  }, []);
  return { enabled: current === 'enabled', loading: current === 'loading' };
}
