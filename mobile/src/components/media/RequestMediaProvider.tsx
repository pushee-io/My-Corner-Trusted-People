import { createContext, useContext, type PropsWithChildren } from 'react';
import { useMediaComposer, type MediaComposerController } from './MediaComposer';
import { useMediaSubmission } from './useMediaSubmission';
import type { JobRequest } from '@/types/contracts';

type RequestMedia = {
  media: MediaComposerController;
  submission: ReturnType<typeof useMediaSubmission<JobRequest>>;
};
const RequestMediaContext = createContext<RequestMedia | undefined>(undefined);

// Create and Review share local files and one retry-safe request identity. A
// route/provider/account change invalidates the scope; nothing goes in URLs or
// persistent storage, and late picker/upload results cannot enter another form.
export function RequestMediaProvider({ children, scope }: PropsWithChildren<{ scope: string | null }>) {
  const media = useMediaComposer('service_request', scope);
  const submission = useMediaSubmission<JobRequest>(media, JSON.stringify(scope));
  return <RequestMediaContext.Provider value={{ media, submission }}>{children}</RequestMediaContext.Provider>;
}

export function useRequestMedia() {
  const value = useContext(RequestMediaContext);
  if (!value) throw new Error('Request media must be inside the request flow.');
  return value;
}
