import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type PropsWithChildren,
} from 'react';
import { useMediaComposer, type MediaComposerController } from './MediaComposer';
import { useMediaSubmission } from './useMediaSubmission';
import { mediaSessionRevision, subscribeMediaSession } from '@/lib/media-session';
import type { JobRequest } from '@/types/contracts';

type RequestMedia = {
  acknowledgementAccepted: boolean;
  assertAcknowledgementAccepted: () => void;
  setAcknowledgementAccepted: (accepted: boolean) => void;
  media: MediaComposerController;
  submission: ReturnType<typeof useMediaSubmission<JobRequest>>;
};
const RequestMediaContext = createContext<RequestMedia | undefined>(undefined);

// Create and Review share local files and one retry-safe request identity. A
// route/provider/account change invalidates the scope; nothing goes in URLs or
// persistent storage, and late picker/upload results cannot enter another form.
export function RequestMediaProvider({ children, scope }: PropsWithChildren<{ scope: string | null }>) {
  const revision = useSyncExternalStore(subscribeMediaSession, mediaSessionRevision, mediaSessionRevision);
  const key = useMemo(() => ({ scope, revision }), [scope, revision]);
  const [acceptance, setAcceptance] = useState<typeof key>();
  useEffect(() => setAcceptance(undefined), [key]);
  const acknowledgementAccepted = scope !== null && acceptance === key;
  const current = useRef({ key, acceptance });
  current.current = { key, acceptance };
  const assertAcknowledgementAccepted = () => {
    if (
      scope === null ||
      mediaSessionRevision() !== revision ||
      current.current.key !== key ||
      current.current.acceptance !== key
    )
      throw new Error('Select the trust acknowledgement checkbox before submitting.');
  };
  const setAcknowledgementAccepted = (accepted: boolean) => {
    if (scope === null || mediaSessionRevision() !== revision || current.current.key !== key) return;
    const next = accepted === true ? key : undefined;
    // Revoke immediately: an already-captured submit handler must not see the
    // previous acceptance while React batches the checkbox state update.
    current.current.acceptance = next;
    setAcceptance(next);
  };
  const media = useMediaComposer('service_request', scope);
  const submission = useMediaSubmission<JobRequest>(media, JSON.stringify(scope));
  return (
    <RequestMediaContext.Provider
      value={{ media, submission, acknowledgementAccepted, setAcknowledgementAccepted, assertAcknowledgementAccepted }}
    >
      {children}
    </RequestMediaContext.Provider>
  );
}

export function useRequestMedia() {
  const value = useContext(RequestMediaContext);
  if (!value) throw new Error('Request media must be inside the request flow.');
  return value;
}
