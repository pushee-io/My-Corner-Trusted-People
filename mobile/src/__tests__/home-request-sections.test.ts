jest.mock('@/hooks/useAICharacter', () => ({
  useAICharacter: () => ({ character: jest.requireActual('@/lib/ai-characters').defaultAICharacter, selectCharacter: jest.fn() }),
}));
import { createElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import HomeScreen from '../../app/home';
import type { JobRequest } from '@/types/contracts';

let mockRequests: JobRequest[] = [];
let mockCapabilities = { community: true, provider: false, moderator: false, neighborhoodId: 'area' };
let mockNeighborhood: { name: string; city: string } | null = { name: 'Osu', city: 'Accra' };
jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  Pressable: 'Pressable',
  Image: 'Image',
  TextInput: 'TextInput',
  ScrollView: 'ScrollView',
  Keyboard: { dismiss: jest.fn() },
  StyleSheet: { create: (s: unknown) => s },
}));
jest.mock('expo-router', () => ({ router: { push: jest.fn() }, useFocusEffect: () => {} }));
jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Icon' }));
jest.mock('../../assets/my-corner-ai/characters/character-woman-kente.png', () => 1);
jest.mock('@/components/Screen', () => ({
  Screen: ({ children, homeHeader }: { children: unknown; homeHeader: unknown }) => [homeHeader, children],
}));
jest.mock('@/components/WebSafeLink', () => ({ WebSafeLink: 'Link' }));
jest.mock('@/components/media/MediaAvatar', () => ({ MediaAvatar: 'Avatar' }));
jest.mock('@/components/StatusPill', () => ({ StatusPill: () => null }));
jest.mock('@/components/StateBlocks', () => ({ EmptyState: 'EmptyState' }));
jest.mock('@/lib/capabilities', () => ({ getCurrentCapabilities: jest.fn() }));
jest.mock('@/lib/verified-neighborhood', () => ({ loadVerifiedNeighborhood: jest.fn() }));
jest.mock('@/lib/neighborhood-assistant', () => ({ loadAskContext: jest.fn() }));
jest.mock('@/lib/messaging', () => ({ loadUnread: jest.fn() }));
jest.mock('@/lib/home-dashboard', () => ({
  loadHomeFeed: jest.fn(),
  loadHomeMarketplace: jest.fn(),
  loadHomeBroadcast: jest.fn(),
  loadHomeNotificationCount: jest.fn(),
  previewImage: jest.fn(),
}));
jest.mock('@/hooks/useMessagingResource', () => ({
  usePrivateSessionKey: () => 'session',
  useMessagingResource: () => ({ data: undefined, refresh: jest.fn() }),
}));
jest.mock('@/lib/repository', () => ({ getProvider: jest.fn(), listRequesterRequests: jest.fn() }));
jest.mock('@/hooks/useProtectedResource', () => ({
  useProtectedResource: (load: unknown) => {
    const data =
      load === jest.requireMock('@/lib/verified-neighborhood').loadVerifiedNeighborhood
        ? mockNeighborhood
        : load === jest.requireMock('@/lib/capabilities').getCurrentCapabilities
          ? mockCapabilities
          : load === jest.requireMock('@/lib/neighborhood-assistant').loadAskContext
            ? { id: 'area', name: mockNeighborhood?.name }
            : Object.values(jest.requireMock('@/lib/home-dashboard')).includes(load)
              ? undefined
              : { requests: mockRequests, providers: { a: 'Provider A', b: 'Provider B' } };
    return { data, loading: false, refresh: jest.fn() };
  },
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
const routes = () => view.root.findAllByType('Link' as never).map((node) => node.props.href);
async function render() {
  await act(async () => {
    view = create(createElement(HomeScreen));
  });
}
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  mockCapabilities = { community: true, provider: false, moderator: false, neighborhoodId: 'area' };
  mockNeighborhood = { name: 'Osu', city: 'Accra' };
});
afterEach(async () => {
  if (view) await act(async () => view.unmount());
});

it('starts compact, preserves both counts and opens every active and past request', async () => {
  mockRequests = [
    request('1', 'a', 'Submitted'),
    request('2', 'a', 'Accepted'),
    request('3', 'b', 'In progress'),
    request('4', 'a', 'Completed'),
    request('5', 'b', 'Cancelled'),
  ];
  await render();
  expect(toggle('Active Requests (3)').props.accessibilityState.expanded).toBe(false);
  expect(toggle('Past Requests (2)').props.accessibilityState.expanded).toBe(false);
  for (const id of ['1', '2', '3', '4', '5']) expect(output()).not.toContain(`Request ${id}`);
  await act(async () => toggle('Active Requests (3)').props.onPress());
  for (const id of ['1', '2', '3']) expect(output()).toContain(`Request ${id}`);
  await act(async () => toggle('Past Requests (2)').props.onPress());
  for (const id of ['4', '5']) expect(output()).toContain(`Request ${id}`);
  await act(async () => toggle('Active Requests (3)').props.onPress());
  for (const id of ['1', '2', '3']) expect(output()).not.toContain(`Request ${id}`);
});
it('updates counts while collapsed and shows every request when reopened', async () => {
  mockRequests = [request('1', 'a', 'Submitted')];
  await render();
  mockRequests = Array.from({ length: 28 }, (_, i) => request(String(i + 1), 'a', 'Submitted'));
  await act(async () => view.update(createElement(HomeScreen)));
  expect(toggle('Active Requests (28)').props.accessibilityState.expanded).toBe(false);
  await act(async () => toggle('Active Requests (28)').props.onPress());
  for (let i = 1; i <= 28; i++) expect(output()).toContain(`Request ${i}`);
  expect(routes()).toContainEqual({ pathname: '/hire/request/status', params: { requestId: '28' } });
});
it('keeps both empty counts and accessible toggles', async () => {
  mockRequests = [];
  await render();
  expect(toggle('Active Requests (0)').props.accessibilityRole).toBe('button');
  expect(toggle('Past Requests (0)').props.accessibilityRole).toBe('button');
});
it('uses verified membership and clears the old neighborhood when context disappears', async () => {
  await render();
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
it('uses the specified dashboard order and removes directory sections', async () => {
  await render();
  const text = output();
  const order = [
    'Ask My Corner AI',
    'Hire Trusted Local Help',
    'LATEST FEED UPDATES',
    'MARKETPLACE SHOWCASE',
    'AGENCY BROADCAST',
    'My Requests',
  ];
  for (let i = 1; i < order.length; i++) expect(text.indexOf(order[i - 1])).toBeLessThan(text.indexOf(order[i]));
  expect(text).not.toContain('Explore your neighborhood');
  expect(text).not.toContain('Your corner');
  expect(routes().filter((route) => route === '/hire/categories')).toHaveLength(1);
});
it('preserves provider and moderation access and removes previews when capabilities disappear', async () => {
  mockCapabilities = { community: false, provider: true, moderator: false, neighborhoodId: 'area' };
  await render();
  expect(routes()).toContain('/provider/requests');
  expect(routes()).toContain('/hire/categories');
  expect(routes()).not.toContain('/community');
  expect(routes()).not.toContain('/marketplace');
  mockCapabilities = { community: true, provider: false, moderator: true, neighborhoodId: 'area' };
  await act(async () => view.update(createElement(HomeScreen)));
  expect(routes()).toContain('/community');
  expect(routes()).toContain('/marketplace');
  await act(async () => toggle('Moderation tools').props.onPress());
  expect(routes()).toContain('/community/moderation');
  mockCapabilities = { community: false, provider: false, moderator: false, neighborhoodId: 'area' };
  await act(async () => view.update(createElement(HomeScreen)));
  expect(routes()).not.toContain('/community/moderation');
  expect(routes()).not.toContain('/marketplace');
});
