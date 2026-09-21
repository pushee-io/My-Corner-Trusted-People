import type { JobRequest } from '@/types/contracts';

export function requestUpdatedAt(request: JobRequest): string {
  return (
    [request.createdAt, ...(request.statusTimeline ?? []).map((event) => event.createdAt)].sort().at(-1) ??
    request.createdAt
  );
}
export function partitionRequests(requests: JobRequest[]) {
  const sorted = [...new Map(requests.map((request) => [request.id, request])).values()].sort(
    (a, b) => requestUpdatedAt(b).localeCompare(requestUpdatedAt(a)) || a.id.localeCompare(b.id),
  );
  const isPast = (request: JobRequest) => ['Completed', 'Declined', 'Cancelled'].includes(request.status);
  return { active: sorted.filter((request) => !isPast(request)), past: sorted.filter(isPast) };
}
