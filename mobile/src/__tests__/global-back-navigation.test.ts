import { createElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { BackHandler, Keyboard } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
jest.mock('@/components/AskMyCornerAccess', () => ({ AskMyCornerAccess: 'AskMyCornerAccess' }));
let mockHistory: string[];
let mockHardwareBack: (() => boolean) | undefined;
let mockWidth = 360;
const mockRemove = jest.fn();
jest.mock('react-native', () => ({
  View: 'View',
  Keyboard: { isVisible: jest.fn(() => false), dismiss: jest.fn() },
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
  expect(back()[0].props.style({ pressed: false })).toMatchObject({ minWidth: 48, minHeight: 48 });
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
  expect(renderer.root.findAllByType('MessagesAccess' as never)).toHaveLength(0);
  expect(renderer.root.findAllByType('MyCornerLogo' as never)).toHaveLength(0);
});
it('removes the hardware handler on unmount', async () => {
  await render();
  await act(async () => renderer.unmount());
  expect(mockRemove).toHaveBeenCalled();
});

it('Ask Android Back dismisses keyboard before navigating', async () => {
  mockHistory = ['/home', '/ask'];
  jest.mocked(Keyboard.isVisible).mockReturnValue(true);
  await render();
  await act(async () => {
    mockHardwareBack!();
  });
  expect(Keyboard.dismiss).toHaveBeenCalledTimes(1);
  expect(router.back).not.toHaveBeenCalled();
  jest.mocked(Keyboard.isVisible).mockReturnValue(false);
  await act(async () => {
    mockHardwareBack!();
  });
  expect(router.back).toHaveBeenCalledTimes(1);
});

it('keeps one branded Home header with messages access and no duplicate page title', async () => {
  await render();
  expect(renderer.root.findAllByType('MyCornerLogo' as never)).toHaveLength(1);
  expect(renderer.root.findAllByType('MessagesAccess' as never)).toHaveLength(1);
  expect(renderer.root.findAllByType('AskMyCornerAccess' as never)).toHaveLength(0);
  expect(renderer.root.findAllByProps({ accessibilityRole: 'header' })).toHaveLength(0);
});

it.each([
  '/hire/request/new',
  '/hire/request/review',
  '/reviews/write',
  '/groups/new',
  '/events/new',
  '/events/event-id/edit',
  '/profile/public-name',
  '/profile/phone-verification',
  '/profile/legal-name',
  '/profile/address',
  '/profile/map-confirmation',
  '/profile/location-consistency',
  '/profile/postcard-challenge',
  '/profile/manual-biometric',
  '/provider/request/respond',
])('keeps Back but hides global actions/tabs during focused form %s', async (path) => {
  mockHistory = ['/home', path];
  await render();
  expect(back()).toHaveLength(1);
  expect(renderer.root.findAllByType('BottomNavigation' as never)).toHaveLength(0);
  expect(renderer.root.findAllByType('MessagesAccess' as never)).toHaveLength(0);
  await act(async () => back()[0].props.onPress());
  expect(router.back).toHaveBeenCalledTimes(1);
});

it.each([
  '/home',
  '/hire/provider/qa',
  '/hire/request/status',
  '/hire/request/safety-session',
  '/profile',
  '/profile/verification',
  '/groups/group',
  '/events/event',
  '/search',
])('retains bottom navigation on browse/detail route %s', async (path) => {
  mockHistory = ['/home', path];
  await render();
  expect(renderer.root.findAllByType('BottomNavigation' as never)).toHaveLength(1);
});

it('respects explicit bottom-navigation opt out and keeps wrapping titles scalable', async () => {
  mockHistory = ['/home', '/messages'];
  await act(async () => {
    renderer = create(createElement(Screen, { title: 'A long public title', showBottomNavigation: false }));
  });
  expect(renderer.root.findAllByType('BottomNavigation' as never)).toHaveLength(0);
  const title = renderer.root.findByProps({ accessibilityRole: 'header' });
  expect(title.props.allowFontScaling).not.toBe(false);
  expect(title.props.numberOfLines).toBeUndefined();
  expect(back()).toHaveLength(1);
});

it('Home custom header preserves tabs and dismisses the inline input keyboard before exiting', async () => {
  mockHistory = ['/home'];
  jest.mocked(Keyboard.isVisible).mockReturnValue(true);
  await act(async () => {
    renderer = create(createElement(Screen, { title: 'Home', homeHeader: createElement('HomeHeader') }));
  });
  expect(renderer.root.findAllByType('HomeHeader' as never)).toHaveLength(1);
  expect(renderer.root.findAllByType('MyCornerLogo' as never)).toHaveLength(0);
  expect(renderer.root.findAllByType('MessagesAccess' as never)).toHaveLength(0);
  expect(renderer.root.findAllByType('BottomNavigation' as never)).toHaveLength(1);
  await act(async () => { mockHardwareBack!(); });
  expect(Keyboard.dismiss).toHaveBeenCalledTimes(1);
  expect(BackHandler.exitApp).not.toHaveBeenCalled();
  jest.mocked(Keyboard.isVisible).mockReturnValue(false);
});
