import { createElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { BackHandler } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
let mockHistory: string[];
let mockHardwareBack: (() => boolean) | undefined;
let mockWidth = 360;
const mockRemove = jest.fn();
jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  Pressable: 'Pressable',
  ScrollView: 'ScrollView',
  RefreshControl: 'RefreshControl',
  StyleSheet: { create: (s: unknown) => s },
  useWindowDimensions: () => ({ width: mockWidth, fontScale: 1 }),
  BackHandler: {
    exitApp: jest.fn(),
    addEventListener: jest.fn((_event, handler) => {
      mockHardwareBack = handler;
      return { remove: mockRemove };
    }),
  },
}));
jest.mock('expo-router', () => ({
  usePathname: () => mockHistory[mockHistory.length - 1],
  useFocusEffect: (callback: () => () => void) => {
    const React = jest.requireActual<typeof import('react')>('react');
    React.useEffect(callback, [callback]);
  },
  router: {
    canGoBack: jest.fn(() => mockHistory.length > 1),
    back: jest.fn(() => mockHistory.pop()),
    replace: jest.fn((path: string) => {
      mockHistory[mockHistory.length - 1] = path;
    }),
  },
}));
jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Ionicons' }));
jest.mock('react-native-safe-area-context', () => ({ SafeAreaView: 'SafeAreaView' }));
jest.mock('@/components/BottomNavigation', () => ({ BottomNavigation: 'BottomNavigation' }));
jest.mock('@/components/MessagesAccess', () => ({ MessagesAccess: 'MessagesAccess' }));
jest.mock('@/components/brand/MyCornerLogo', () => ({ MyCornerLogo: 'MyCornerLogo' }));
jest.mock('@/components/CollapsibleComments', () => ({
  CommentsProvider: ({ children }: { children: unknown }) => children,
}));
let renderer: ReactTestRenderer;
const back = () => renderer.root.findAllByProps({ accessibilityLabel: 'Go back' });
async function render(showTitle = true) {
  await act(async () => {
    renderer = create(createElement(Screen, { title: 'Job safety session', showTitle }, createElement('Content')));
  });
}
async function update() {
  await act(async () => renderer.update(createElement(Screen, { title: 'Current page' }, createElement('Content'))));
}
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  jest.clearAllMocks();
  mockHistory = ['/home'];
  mockWidth = 360;
});
afterEach(async () => {
  if (renderer) await act(async () => renderer.unmount());
});
it.each(['/home', '/'])('hides Back at root %s', async (path) => {
  mockHistory = [path];
  await render();
  expect(back()).toHaveLength(0);
});
it.each([
  '/hire/categories',
  '/community',
  '/groups/group',
  '/events/event',
  '/marketplace',
  '/search',
  '/settings',
  '/messages',
  '/notifications',
  '/hire/request/safety-session',
])('shows accessible Back on %s', async (path) => {
  mockHistory = ['/home', path];
  await render();
  expect(back()).toHaveLength(1);
  expect(back()[0].props.accessibilityRole).toBe('button');
  expect(back()[0].props.style).toMatchObject({ width: 48, height: 48 });
});
it('pops the real nested history until Home, then hides the arrow', async () => {
  mockHistory = [
    '/home',
    '/hire/categories',
    '/hire/provider/provider',
    '/hire/request/status',
    '/hire/request/safety-session',
  ];
  await render();
  for (const expected of ['/hire/request/status', '/hire/provider/provider', '/hire/categories', '/home']) {
    await act(async () => back()[0].props.onPress());
    await update();
    expect(mockHistory.at(-1)).toBe(expected);
  }
  expect(back()).toHaveLength(0);
  expect(router.replace).not.toHaveBeenCalled();
});
it('deep-link/no-history Back safely replaces with Home', async () => {
  mockHistory = ['/messages/thread'];
  await render();
  await act(async () => back()[0].props.onPress());
  await update();
  expect(router.replace).toHaveBeenCalledWith('/home');
  expect(back()).toHaveLength(0);
});
it('hardware Back follows the same history and fallback, and Home exits', async () => {
  mockHistory = ['/home', '/settings'];
  await render();
  await act(async () => {
    expect(mockHardwareBack!()).toBe(true);
  });
  expect(router.back).toHaveBeenCalled();
  await update();
  await act(async () => {
    mockHardwareBack!();
  });
  expect(BackHandler.exitApp).toHaveBeenCalledTimes(1);
  mockHistory = ['/notifications'];
  await update();
  await act(async () => {
    mockHardwareBack!();
  });
  expect(router.replace).toHaveBeenCalledWith('/home');
});
it.each([360, 1280])('keeps the header outside scrolling content at width %s', async (width) => {
  mockWidth = width;
  mockHistory = ['/home', '/hire/categories'];
  await render(false);
  expect(back()).toHaveLength(1);
  expect(
    renderer.root.findByType('ScrollView' as never).findAllByProps({ accessibilityLabel: 'Go back' }),
  ).toHaveLength(0);
  expect(renderer.root.findAllByType('MessagesAccess' as never)).toHaveLength(1);
});
it('removes the hardware handler on unmount', async () => {
  await render();
  await act(async () => renderer.unmount());
  expect(mockRemove).toHaveBeenCalled();
});
