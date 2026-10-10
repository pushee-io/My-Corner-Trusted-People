import { createElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { router } from 'expo-router';
import { HomeHireAction } from '@/components/HomeDashboard';
import { WebSafeLink } from '@/components/WebSafeLink';
jest.mock('react-native', () => ({
  View: 'View', Text: 'Text', Image: 'Image', Pressable: 'Pressable',
  Platform: { OS: 'android' }, StyleSheet: { create: (s: unknown) => s },
}));
jest.mock('expo-router', () => ({ Link: 'NativeLink', router: { push: jest.fn() } }));
jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Icon' }));
jest.mock('@/hooks/useAICharacter', () => ({ useAICharacter: jest.fn() }));
jest.mock('@/components/media/MediaAvatar', () => ({ MediaAvatar: 'Avatar' }));
let view: ReactTestRenderer;
beforeEach(() => { jest.clearAllMocks(); Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true }); });
afterEach(async () => { await act(async () => view?.unmount()); });
it('keeps the native Hire CTA green and readable, pressed and routed once', async () => {
  await act(async () => { view = create(createElement(HomeHireAction)); });
  const target = view.root.findByType('Pressable' as never);
  expect(view.root.findAllByType('NativeLink' as never)).toHaveLength(0);
  const normal = Object.assign({}, ...target.props.style({ pressed: false }).filter(Boolean));
  const pressed = Object.assign({}, ...target.props.style({ pressed: true }).filter(Boolean));
  expect(normal.backgroundColor).toBe('#0E6B50');
  expect(normal.minHeight).toBeGreaterThanOrEqual(48);
  expect(pressed.backgroundColor).toBe('#0A5A43');
  expect(target.findByType('Text' as never).props.style.color).toBe('#FFFFFF');
  expect(normal.opacity).toBeUndefined();
  await act(async () => target.props.onPress({}));
  expect(router.push).toHaveBeenCalledTimes(1);
  expect(router.push).toHaveBeenCalledWith('/hire/categories');
});
it('retains the native Link for static styles and ignores disabled dynamic-style actions', async () => {
  const child = createElement('Pressable' as never, { style: { padding: 12 } });
  await act(async () => { view = create(createElement(WebSafeLink, { asChild: true, href: '/home', children: child })); });
  expect(view.root.findAllByType('NativeLink' as never)).toHaveLength(1);
  await act(async () => view.update(createElement(WebSafeLink, {
    asChild: true, href: '/home',
    children: createElement('Pressable' as never, { disabled: true, style: () => ({ padding: 12 }) }),
  })));
  await act(async () => view.root.findByType('Pressable' as never).props.onPress({}));
  expect(router.push).not.toHaveBeenCalled();
});
