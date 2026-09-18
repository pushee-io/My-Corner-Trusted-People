import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import * as Crypto from 'expo-crypto';
import type { MediaComposerController } from './MediaComposer';
import { MediaSubmission } from '@/lib/media-submission';
import { assertMediaSession, mediaSessionRevision, subscribeMediaSession } from '@/lib/media-session';

export function useMediaSubmission<T extends { id: string }>(media: MediaComposerController, scope = '') {
  const revision = useSyncExternalStore(subscribeMediaSession, mediaSessionRevision, mediaSessionRevision);
  const [generation, setGeneration] = useState(0);
  const [busyKey, setBusyKey] = useState<string>();
  const [, redraw] = useState(0);
  const mounted = useRef(false);
  const key = `${revision}:${scope}:${generation}`;
  const currentKey = useRef(key);
  currentKey.current = key;
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const submission = useMemo(
    () =>
      new MediaSubmission<T>(Crypto.randomUUID(), () => {
        assertMediaSession(revision);
        if (!mounted.current || currentKey.current !== key) throw new Error('This form has closed.');
      }),
    [revision, key],
  );

  return {
    busy: busyKey === key,
    locked: submission.locked,
    async submit(create: (id: string) => Promise<T>) {
      if (submission.busy) return;
      setBusyKey(key);
      try {
        return await submission.run({
          upload: media.uploadAll,
          create,
          attach: media.attach,
          saving: () => redraw((value) => value + 1),
        });
      } finally {
        if (mounted.current && currentKey.current === key) setBusyKey(undefined);
      }
    },
    clear() {
      media.clear();
      setGeneration((value) => value + 1);
    },
  };
}
