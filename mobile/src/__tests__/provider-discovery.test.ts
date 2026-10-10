import { createElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { router } from 'expo-router';
import ProvidersScreen from '../../app/hire/providers';
jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
  useLocalSearchParams: () => ({ categoryId: 'plumbing' }),
}));
jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  TextInput: 'TextInput',
  Pressable: 'Pressable',
  Keyboard: { dismiss: jest.fn() },
  StyleSheet: { create: (styles: unknown) => styles },
}));
jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Icon' }));
jest.mock('@/components/Screen', () => ({ Screen: 'Screen' }));
jest.mock('@/components/ProviderCard', () => ({ ProviderCard: 'ProviderCard' }));
jest.mock('@/components/StateBlocks', () => ({
  EmptyState: 'EmptyState',
  ErrorState: 'ErrorState',
  LoadingState: 'LoadingState',
}));
jest.mock('@/lib/day2b-read-repository', () => ({ loadDay2BProvidersByCategory: jest.fn() }));
const mockProviders = [
  { id: 'a', name: 'Ama', headline: 'Pipe repairs', areaLabel: 'Osu', phoneVerified: true, isAcceptingRequests: false },
  { id: 'b', name: 'Kojo', headline: 'Plumbing', areaLabel: 'Accra', phoneVerified: false, isAcceptingRequests: true },
];
jest.mock('@/hooks/useProtectedResource', () => ({
  useProtectedResource: () => ({ data: { items: mockProviders }, refresh: jest.fn() }),
}));
let view: ReactTestRenderer;
const cards = () => view.root.findAllByType('ProviderCard' as never);
const press = (label: string) =>
  view.root.findAllByType('Pressable' as never).find((node) => node.props.accessibilityLabel === label)!;
beforeEach(async () => {
  jest.clearAllMocks();
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  await act(async () => {
    view = create(createElement(ProvidersScreen));
  });
});
afterEach(async () => {
  await act(async () => view.unmount());
});
it('filters only loaded providers using actual availability and verification evidence', async () => {
  expect(cards()).toHaveLength(2);
  await act(async () => press('Accepting requests').props.onPress());
  expect(cards().map((node) => node.props.provider.id)).toEqual(['b']);
  await act(async () => press('Phone verified').props.onPress());
  expect(cards().map((node) => node.props.provider.id)).toEqual(['a']);
  expect(press('Phone verified').props.accessibilityState.selected).toBe(true);
  expect(JSON.stringify(view.toJSON())).not.toContain('Top response rate');
});
it('searches authorized public fields and keeps category context when opening a provider', async () => {
  const input = view.root.findByType('TextInput' as never);
  await act(async () => input.props.onChangeText('  OSU  '));
  expect(cards().map((node) => node.props.provider.id)).toEqual(['a']);
  await act(async () => cards()[0].props.onPress());
  expect(router.push).toHaveBeenCalledWith({
    pathname: '/hire/provider/[providerId]',
    params: { providerId: 'a', categoryId: 'plumbing' },
  });
  await act(async () => press('Clear provider search').props.onPress());
  expect(cards()).toHaveLength(2);
  await act(async () => input.props.onChangeText('not in the authorized result'));
  expect(cards()).toHaveLength(0);
});
