import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useSyncExternalStore,
  type PropsWithChildren,
} from 'react';
import { useMediaComposer, type MediaComposerController } from './MediaComposer';
import { useMediaSubmission } from './useMediaSubmission';
import { mediaSessionRevision, subscribeMediaSession } from '@/lib/media-session';
import type { JobRequest } from '@/types/contracts';

type RequestMedia = {
  trustAccepted: boolean;
  assertTrustAccepted: () => void;
  acceptTrust: () => void;
  media: MediaComposerController;
  submission: ReturnType<typeof useMediaSubmission<JobRequest>>;
};
const RequestMediaContext = createContext<RequestMedia | undefined>(undefined);

// Create and Review share local files and one retry-safe request identity. A
// route/provider/account change invalidates the scope; nothing goes in URLs or
// persistent storage, and late picker/upload results cannot enter another form.
export function RequestMediaProvider({ children, scope }: PropsWithChildren<{ scope: string | null }>) {
  const revision = useSyncExternalStore(subscribeMediaSession, mediaSessionRevision, mediaSessionRevision);
  const key = JSON.stringify([scope, revision]);
  const [acceptance, setAcceptance] = useState<string>();
  useEffect(() => setAcceptance(undefined), [key]);
  const trustAccepted = scope !== null && acceptance === key;
  const current = useRef({ key, acceptance });
  current.current = { key, acceptance };
  const assertTrustAccepted = () => {
    if (
      scope === null ||
      mediaSessionRevision() !== revision ||
      current.current.key !== key ||
      current.current.acceptance !== key
    )
      throw new Error('Review and accept the trust acknowledgement before submitting.');
  };
  const acceptTrust = () => {
    if (scope !== null) setAcceptance(key);
  };
  const media = useMediaComposer('service_request', scope);
  const submission = useMediaSubmission<JobRequest>(media, JSON.stringify(scope));
  return (
    <RequestMediaContext.Provider value={{ media, submission, trustAccepted, acceptTrust, assertTrustAccepted }}>
      {children}
    </RequestMediaContext.Provider>
  );
}

export function useRequestMedia() {
  const value = useContext(RequestMediaContext);
  if (!value) throw new Error('Request media must be inside the request flow.');
  return value;
}
