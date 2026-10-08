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
