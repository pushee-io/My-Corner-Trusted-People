import { createElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { Pressable, Keyboard } from 'react-native';
import { router } from 'expo-router';
import { BottomNavigation } from '@/components/BottomNavigation';
let mockPath = '/home';
let mockCapabilities: unknown = { loading: true };
jest.mock('expo-router', () => ({ usePathname: () => mockPath, router: { navigate: jest.fn() } }));
jest.mock('react-native', () => ({
  View: 'View',
  Pressable: 'Pressable',
  Keyboard: { dismiss: jest.fn() },
  StyleSheet: { create: (v: unknown) => v },
}));
jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Icon' }));
jest.mock('@/components/NavigationArtwork', () => ({ NavigationArtwork: 'Artwork' }));
jest.mock('@/hooks/useProtectedResource', () => ({ useProtectedResource: () => mockCapabilities }));
jest.mock('@/lib/capabilities', () => ({ getCurrentCapabilities: jest.fn() }));
jest.mock('@/lib/events-feature', () => ({ isEventsClientEnabled: () => true }));
let view: ReactTestRenderer;
const tabs = () => view.root.findAllByType(Pressable);
const tab = (label: string) => tabs().find((node) => node.props.accessibilityLabel === label)!;
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  jest.clearAllMocks();
  mockPath = '/home';
  mockCapabilities = { loading: true };
});
afterEach(async () => {
  await act(async () => view?.unmount());
});
it('preserves six tab positions during capabilities hydration without enabling restricted tabs', async () => {
  await act(async () => {
    view = create(createElement(BottomNavigation));
  });
  const labels = tabs().map((t) => t.props.accessibilityLabel);
  expect(tab('Market').props.disabled).toBe(true);
  mockCapabilities = { data: { community: true } };
  await act(async () => view.update(createElement(BottomNavigation)));
  expect(tabs().map((t) => t.props.accessibilityLabel)).toEqual(labels);
  expect(tab('Market').props.disabled).toBe(false);
});
it('does not navigate to the current destination and reuses native navigate across ten cycles', async () => {
  mockCapabilities = { data: { community: true } };
  await act(async () => {
    view = create(createElement(BottomNavigation));
  });
  await act(async () => tab('Home').props.onPress());
  expect(router.navigate).not.toHaveBeenCalled();
  for (let cycle = 0; cycle < 10; cycle++) {
    for (const [label, path] of [
      ['Community', '/community'],
      ['Market', '/marketplace'],
      ['Hire', '/hire/categories'],
      ['Home', '/home'],
    ]) {
      await act(async () => tab(label).props.onPress());
      expect(router.navigate).toHaveBeenLastCalledWith(path);
      mockPath = path;
      await act(async () => view.update(createElement(BottomNavigation)));
      const count = jest.mocked(router.navigate).mock.calls.length;
      await act(async () => tab(label).props.onPress());
      expect(router.navigate).toHaveBeenCalledTimes(count);
    }
  }
  expect(router.navigate).toHaveBeenCalledTimes(40);
  expect(Keyboard.dismiss).toHaveBeenCalled();
});

it('retains provider-only Home destination and restricted community tabs', async () => {
  mockPath = '/hire/categories';
  mockCapabilities = { data: { provider: true, community: false } };
  await act(async () => {
    view = create(createElement(BottomNavigation));
  });
  expect(tab('Community').props.disabled).toBe(true);
  expect(tab('Market').props.disabled).toBe(true);
  await act(async () => tab('Home').props.onPress());
  expect(router.navigate).toHaveBeenCalledWith('/provider/requests');
});

it('preserves selected semantics, touch size, press and focus feedback', async () => {
  mockCapabilities = { data: { community: true } };
  mockPath = '/hire/provider/qa';
  await act(async () => {
    view = create(createElement(BottomNavigation));
  });
  expect(tab('Hire').props.accessibilityState).toEqual({ selected: true, disabled: false });
  const normal = Object.assign({}, ...tab('Hire').props.style({ pressed: false }).filter(Boolean));
  const pressed = Object.assign({}, ...tab('Hire').props.style({ pressed: true }).filter(Boolean));
  expect(normal.minHeight).toBeGreaterThanOrEqual(48);
  expect(normal.minWidth).toBeGreaterThanOrEqual(48);
  expect(pressed.backgroundColor).not.toBe(normal.backgroundColor);
  await act(async () => tab('Hire').props.onFocus());
  const focused = Object.assign({}, ...tab('Hire').props.style({ pressed: false }).filter(Boolean));
  expect(focused.borderColor).not.toBe(normal.borderColor);
  expect(focused.borderWidth).toBe(normal.borderWidth);
});

it.each([
  ['/home', 'Home'],
  ['/marketplace/listing/item', 'Market'],
  ['/settings/privacy', 'Settings'],
  ['/search', 'Search'],
  ['/community', 'Community'],
  ['/hire/provider/person', 'Hire'],
])('keeps only the current destination green at %s, including capability refresh', async (path, label) => {
  mockCapabilities = { loading: true };
  mockPath = path;
  await act(async () => {
    view = create(createElement(BottomNavigation));
  });
  expect(tabs().filter((node) => node.props.accessibilityState.selected)).toHaveLength(1);
  for (const node of tabs()) {
    const icon = node.findAll((child) => child.type === ('Icon' as never) || child.type === ('Artwork' as never))[0];
    expect(icon.props.color === '#0E6B50').toBe(node.props.accessibilityLabel === label);
  }
});
