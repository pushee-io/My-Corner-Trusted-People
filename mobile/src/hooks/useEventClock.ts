import { useCallback, useState } from 'react';
import { AppState } from 'react-native';
import { useFocusEffect } from 'expo-router';

/** Reclassify locally at event boundaries, without polling the data service. */
export function useEventClock(events: { startsAt: string; endsAt?: string }[]) {
  const [now, setNow] = useState(Date.now);
  const boundaries = JSON.stringify(events.flatMap((event) => [event.startsAt, event.endsAt].filter(Boolean)));
  useFocusEffect(
    useCallback(() => {
      let timer: ReturnType<typeof setTimeout> | undefined;
      const update = () => {
        clearTimeout(timer);
        if (AppState.currentState !== 'active') return;
        const time = Date.now();
        setNow(time);
        const next = (JSON.parse(boundaries) as string[]).map(Date.parse).filter((value) => value > time);
        if (next.length) timer = setTimeout(update, Math.min(60000, Math.min(...next) - time + 1));
      };
      update();
      const subscription = AppState.addEventListener('change', update);
      return () => {
        clearTimeout(timer);
        subscription.remove();
      };
    }, [boundaries]),
  );
  return now;
}
