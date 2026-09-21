import { partitionRequests } from '@/lib/active-requests';
import type { JobRequest } from '@/types/contracts';
const request = (id: string, providerId = 'provider-a', status: JobRequest['status'] = 'Submitted'): JobRequest =>
  ({ id, providerId, status, createdAt: '2026-09-21T10:00:00Z', statusTimeline: [] }) as unknown as JobRequest;
it.each([1, 2, 6])('shows all %i active requests to one provider', (count) => {
  expect(partitionRequests(Array.from({ length: count }, (_, i) => request(String(i)))).active).toHaveLength(count);
});
it('keeps requests for different providers', () => {
  expect(partitionRequests([request('a'), request('b', 'provider-b')]).active).toHaveLength(2);
});
it('separates history without hiding reported or in-progress jobs', () => {
  const result = partitionRequests(
    ['Submitted', 'Viewed', 'Accepted', 'In progress', 'Reported', 'Completed', 'Declined', 'Cancelled'].map(
      (status, i) => request(String(i), 'p', status as JobRequest['status']),
    ),
  );
  expect(result.active).toHaveLength(5);
  expect(result.past).toHaveLength(3);
});
it('orders by latest activity and removes duplicate records', () => {
  const updated = {
    ...request('b'),
    statusTimeline: [{ id: 'e', status: 'Viewed', actor: 'provider', createdAt: '2026-09-21T11:00:00Z' }],
  } as JobRequest;
  expect(partitionRequests([request('a'), updated, request('a')]).active.map((r) => r.id)).toEqual(['b', 'a']);
});
it('handles an empty history', () => {
  expect(partitionRequests([])).toEqual({ active: [], past: [] });
});
