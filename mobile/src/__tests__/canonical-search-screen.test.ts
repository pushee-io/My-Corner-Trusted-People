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
jest.mock('@/components/WebSafeLink', () => ({ WebSafeLink: ({ children }: { children: unknown }) => children }));
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
