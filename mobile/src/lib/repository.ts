import { providers, requests } from '@/lib/mock-data';
import type { JobRequest, JobRequestDraftInput, Provider, RequestStatus } from '@/types/contracts';

export function listProvidersByCategory(categoryId: string): Provider[] {
  return providers.filter((provider) => provider.categoryIds.includes(categoryId) && provider.isAcceptingRequests);
}

export function getProvider(providerId: string): Provider | undefined {
  return providers.find((provider) => provider.id === providerId);
}

export function createJobRequest(input: JobRequestDraftInput): JobRequest {
  const now = new Date().toISOString();
  const request: JobRequest = {
    ...input,
    id: `req-${requests.length + 101}`,
    status: 'Submitted',
    moderationStatus: 'not_run',
    createdAt: now,
    statusTimeline: [
      {
        id: `evt-${requests.length + 101}`,
        status: 'Submitted',
        actor: 'requester',
        createdAt: now,
      },
    ],
  };
  requests.unshift(request);
  return request;
}

export function listRequesterRequests(requesterName: string): JobRequest[] {
  return requests.filter((request) => request.requesterName === requesterName);
}

export function listProviderRequests(providerId: string): JobRequest[] {
  return requests.filter((request) => request.providerId === providerId);
}

export function updateRequestStatus(requestId: string, status: RequestStatus, providerMessage?: string): JobRequest | undefined {
  const request = requests.find((item) => item.id === requestId);
  if (!request) return undefined;

  request.status = status;
  if (providerMessage) request.providerMessage = providerMessage;
  request.statusTimeline.unshift({
    id: `evt-${request.statusTimeline.length + 1}-${status}`,
    status,
    actor: status === 'Cancelled' || status === 'Reported' ? 'requester' : 'provider',
    note: providerMessage,
    createdAt: new Date().toISOString(),
  });
  return request;
}

export function markRequestViewed(requestId: string): JobRequest | undefined {
  const request = requests.find((item) => item.id === requestId);
  if (!request || request.status !== 'Submitted') return request;
  return updateRequestStatus(requestId, 'Viewed', 'Provider opened the request.');
}

export function cancelRequest(requestId: string): JobRequest | undefined {
  return updateRequestStatus(requestId, 'Cancelled');
}

export function reportRequest(requestId: string): JobRequest | undefined {
  return updateRequestStatus(requestId, 'Reported');
}

export function getRequest(requestId: string): JobRequest | undefined {
  return requests.find((item) => item.id === requestId);
}
