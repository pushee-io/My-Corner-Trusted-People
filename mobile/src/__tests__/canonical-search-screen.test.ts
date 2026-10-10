import { createElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import SearchScreen from '../../app/search';
import { Keyboard } from 'react-native';
const blur = jest.fn();
jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Icon' }));
jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  TextInput: 'TextInput',
  Pressable: 'Pressable',
  Image: 'Image',
  Keyboard: { dismiss: jest.fn() },
  StyleSheet: { create: (s: unknown) => s },
}));
jest.mock('expo-router', () => ({ useLocalSearchParams: () => ({}) }));
jest.mock('@/components/Screen', () => ({ Screen: ({ children }: { children: unknown }) => children }));
jest.mock('@/components/AskMyCornerAccess', () => ({
  AskMyCornerAccess: ({ beforeOpen }: { beforeOpen: () => void }) =>
    jest.requireActual('react').createElement('AskPill', { onPress: beforeOpen }),
}));
jest.mock('@/components/media/MediaThumbnail', () => ({ MediaThumbnail: () => null }));
jest.mock('@/components/WebSafeLink', () => ({ WebSafeLink: 'Link' }));
jest.mock('@/components/StateBlocks', () => ({
  EmptyState: 'EmptyState',
  ErrorState: 'ErrorState',
  LoadingState: 'LoadingState',
}));
jest.mock('@/lib/search-repository', () => ({ searchRepository: { search: jest.fn() } }));
jest.mock('@/hooks/useProtectedResource', () => ({
  useProtectedResource: () => ({ loading: false, data: [], refresh: jest.fn() }),
}));
let renderer: ReactTestRenderer;
beforeEach(async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  jest.clearAllMocks();
  await act(async () => {
    renderer = create(createElement(SearchScreen), {
      createNodeMock: (e) => (e.type === 'TextInput' ? { blur } : null),
    });
  });
});
afterEach(async () => act(() => renderer.unmount()));
it('shows both Search choices for a one-word query and dismisses keyboard on Search, Enter and AI', async () => {
  const input = renderer.root.findByType('TextInput' as never);
  await act(async () => input.props.onChangeText('plumber'));
  expect(renderer.root.findAllByType('AskPill' as never)).toHaveLength(1);
  const search = renderer.root.findByProps({ accessibilityLabel: 'Search' });
  await act(async () => search.props.onPress());
  await act(async () => input.props.onSubmitEditing());
  await act(async () => renderer.root.findByType('AskPill' as never).props.onPress());
  expect(Keyboard.dismiss).toHaveBeenCalledTimes(3);
  expect(blur).toHaveBeenCalledTimes(3);
});

it('keeps discovery design and routes Events between Groups and Agency updates', () => {
  const links = renderer.root.findAllByType('Link' as never);
  expect(links.map((link) => link.props.href)).toEqual([
    '/hire/categories',
    '/community',
    '/marketplace',
    '/groups',
    '/events',
    '/agency-broadcasts',
  ]);
  const text = JSON.stringify(renderer.toJSON());
  expect(text).toContain('YOUR NEIGHBORHOOD, WITHIN REACH');
  expect(text).toContain('What are you looking for?');
  expect(links[4].findAllByType('Icon' as never)[0].props.name).toBe('calendar-outline');
});
