import { createElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import HomeScreen from '../../app/home';
import type { JobRequest } from '@/types/contracts';

let mockRequests: JobRequest[] = [];
jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  Pressable: 'Pressable',
  StyleSheet: { create: (s: unknown) => s },
}));
jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Icon' }));
jest.mock('@/components/Screen', () => ({ Screen: ({ children }: { children: unknown }) => children }));
jest.mock('@/components/WebSafeLink', () => ({ WebSafeLink: ({ children }: { children: unknown }) => children }));
jest.mock('@/components/AskMyCornerAccess', () => ({ AskMyCornerAccess: () => null }));
jest.mock('@/components/StatusPill', () => ({ StatusPill: () => null }));
jest.mock('@/components/StateBlocks', () => ({ EmptyState: 'EmptyState' }));
jest.mock('@/lib/capabilities', () => ({ getCurrentCapabilities: jest.fn() }));
jest.mock('@/lib/auth', () => ({ getCurrentProfile: async () => ({ role: 'requester' }) }));
jest.mock('@/lib/location-context', () => ({ getActiveLocationLabel: () => 'East Legon' }));
jest.mock('@/lib/events-runtime-repository', () => ({ isEventsClientEnabled: () => false }));
jest.mock('@/lib/repository', () => ({ getProvider: jest.fn(), listRequesterRequests: jest.fn() }));
jest.mock('@/hooks/useProtectedResource', () => ({
  useProtectedResource: () => ({
    data: { requests: mockRequests, providers: { a: 'Provider A', b: 'Provider B' } },
    loading: false,
    refresh: jest.fn(),
  }),
}));
const request = (id: string, providerId: string, status: JobRequest['status']): JobRequest =>
  ({
    id,
    providerId,
    status,
    title: `Request ${id}`,
    createdAt: '2026-09-25T12:00:00Z',
    statusTimeline: [],
  }) as unknown as JobRequest;
let view: ReactTestRenderer;
const toggle = (label: string) =>
  view.root.findAllByType('Pressable' as never).find((n) => n.props.accessibilityLabel === label)!;
const output = () => JSON.stringify(view.toJSON());
afterEach(async () => {
  if (view) await act(async () => view.unmount());
});
it('shows all active requests, collapses history by default and preserves visible counts', async () => {
  mockRequests = [
    request('1', 'a', 'Submitted'),
    request('2', 'a', 'Accepted'),
    request('3', 'b', 'In progress'),
    request('4', 'a', 'Completed'),
    request('5', 'b', 'Cancelled'),
  ];
  await act(async () => {
    view = create(createElement(HomeScreen));
  });
  expect(toggle('Active Requests (3)').props.accessibilityState.expanded).toBe(true);
  expect(toggle('Past Requests (2)').props.accessibilityState.expanded).toBe(false);
  for (const id of ['1', '2', '3']) expect(output()).toContain(`Request ${id}`);
  for (const id of ['4', '5']) expect(output()).not.toContain(`Request ${id}`);
  await act(async () => toggle('Active Requests (3)').props.onPress());
  expect(toggle('Active Requests (3)').props.accessibilityState.expanded).toBe(false);
  for (const id of ['1', '2', '3']) expect(output()).not.toContain(`Request ${id}`);
  await act(async () => toggle('Past Requests (2)').props.onPress());
  for (const id of ['4', '5']) expect(output()).toContain(`Request ${id}`);
  await act(async () => toggle('Active Requests (3)').props.onPress());
  for (const id of ['1', '2', '3']) expect(output()).toContain(`Request ${id}`);
});
it('updates counts while collapsed and shows every request when reopened', async () => {
  mockRequests = [request('1', 'a', 'Submitted')];
  await act(async () => {
    view = create(createElement(HomeScreen));
  });
  await act(async () => toggle('Active Requests (1)').props.onPress());
  mockRequests = Array.from({ length: 6 }, (_, i) => request(String(i + 1), 'a', 'Submitted'));
  await act(async () => view.update(createElement(HomeScreen)));
  expect(toggle('Active Requests (6)').props.accessibilityState.expanded).toBe(false);
  await act(async () => toggle('Active Requests (6)').props.onPress());
  for (let i = 1; i <= 6; i++) expect(output()).toContain(`Request ${i}`);
});
it('keeps both empty counts and accessible toggles', async () => {
  mockRequests = [];
  await act(async () => {
    view = create(createElement(HomeScreen));
  });
  expect(toggle('Active Requests (0)').props.accessibilityRole).toBe('button');
  expect(toggle('Past Requests (0)').props.accessibilityRole).toBe('button');
});
