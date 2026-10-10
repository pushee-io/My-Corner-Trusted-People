import { createElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import HomeScreen from '../../app/home';
import type { JobRequest } from '@/types/contracts';

let mockRequests: JobRequest[] = [];
let mockCapabilities = { community: true, provider: false, moderator: false };
let mockNeighborhood: { name: string; city: string } | null = { name: 'Osu', city: 'Accra' };
jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  Pressable: 'Pressable',
  StyleSheet: { create: (s: unknown) => s },
}));
jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Icon' }));
jest.mock('@/components/Screen', () => ({ Screen: ({ children }: { children: unknown }) => children }));
jest.mock('@/components/WebSafeLink', () => ({ WebSafeLink: 'Link' }));
jest.mock('@/components/AskMyCornerAccess', () => ({ AskMyCornerAccess: () => null }));
jest.mock('@/components/StatusPill', () => ({ StatusPill: () => null }));
jest.mock('@/components/StateBlocks', () => ({ EmptyState: 'EmptyState' }));
jest.mock('@/lib/capabilities', () => ({ getCurrentCapabilities: jest.fn() }));
jest.mock('@/lib/auth', () => ({ getCurrentProfile: async () => ({ role: 'requester' }) }));
jest.mock('@/lib/verified-neighborhood', () => ({ loadVerifiedNeighborhood: jest.fn() }));
jest.mock('@/lib/events-runtime-repository', () => ({ isEventsClientEnabled: () => false }));
jest.mock('@/lib/repository', () => ({ getProvider: jest.fn(), listRequesterRequests: jest.fn() }));
jest.mock('@/hooks/useProtectedResource', () => ({
  useProtectedResource: (load: unknown) => ({
    data:
      load === jest.requireMock('@/lib/verified-neighborhood').loadVerifiedNeighborhood
        ? mockNeighborhood
        : load === jest.requireMock('@/lib/capabilities').getCurrentCapabilities
          ? mockCapabilities
          : { requests: mockRequests, providers: { a: 'Provider A', b: 'Provider B' } },
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

it('uses verified membership and clears the old neighborhood when context disappears', async () => {
  mockNeighborhood = { name: 'Osu', city: 'Accra' };
  await act(async () => {
    view = create(createElement(HomeScreen));
  });
  expect(output()).toContain('Osu · Accra');
  expect(output()).not.toContain('East Legon');
  mockNeighborhood = null;
  await act(async () => view.update(createElement(HomeScreen)));
  expect(output()).not.toContain('Osu · Accra');
  expect(output()).toContain('Verify your neighborhood');
  mockNeighborhood = { name: 'East Legon', city: 'Accra' };
  await act(async () => view.update(createElement(HomeScreen)));
  expect(output()).toContain('East Legon · Accra');
});

it('puts active requests before secondary destinations and keeps their exact routes', async () => {
  mockRequests = [request('selected', 'a', 'Submitted')];
  await act(async () => {
    view = create(createElement(HomeScreen));
  });
  const labels = view.root.findAllByType('Text' as never).map((node) => node.children.join(''));
  expect(labels.indexOf('Active Requests (1)')).toBeLessThan(labels.indexOf('Explore your neighborhood'));
  expect(view.root.findAllByType('Link' as never).map((node) => node.props.href)).toContainEqual({
    pathname: '/hire/request/status',
    params: { requestId: 'selected' },
  });
});

it('shows only authorized destinations and removes moderation when capabilities disappear', async () => {
  mockCapabilities = { community: false, provider: true, moderator: false };
  await act(async () => {
    view = create(createElement(HomeScreen));
  });
  const routes = () => view.root.findAllByType('Link' as never).map((node) => node.props.href);
  expect(routes()).toContain('/provider/requests');
  expect(routes()).toContain('/hire/categories');
  expect(routes()).not.toContain('/community');
  expect(routes()).not.toContain('/marketplace');
  expect(routes()).not.toContain('/community/moderation');
  mockCapabilities = { community: true, provider: false, moderator: true };
  await act(async () => view.update(createElement(HomeScreen)));
  expect(routes()).toContain('/community');
  expect(routes()).toContain('/marketplace');
  expect(routes()).toContain('/community/moderation');
  expect(routes()).not.toContain('/events');
  mockCapabilities = { community: true, provider: false, moderator: false };
  await act(async () => view.update(createElement(HomeScreen)));
  expect(routes()).not.toContain('/community/moderation');
});
