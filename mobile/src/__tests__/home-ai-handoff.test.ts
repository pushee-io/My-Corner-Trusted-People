import { createElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import Ask from '../../app/ask';
import { askNeighborhood } from '@/lib/neighborhood-assistant';
let mockContext: { id: string; name: string } | undefined;
let mockParams: { question: string; fromHome?: string };
jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  TextInput: 'TextInput',
  Pressable: 'Pressable',
  KeyboardAvoidingView: 'KeyboardAvoidingView',
  Platform: { OS: 'android' },
  Keyboard: { dismiss: jest.fn() },
  AppState: { addEventListener: () => ({ remove: jest.fn() }) },
  StyleSheet: { create: (s: unknown) => s },
}));
jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
  useLocalSearchParams: () => mockParams,
  useFocusEffect: (fn: () => () => void) => {
    const React = jest.requireActual<typeof import('react')>('react');
    React.useEffect(fn, [fn]);
  },
}));
jest.mock('@/components/Screen', () => ({ Screen: ({ children }: { children: unknown }) => children }));
jest.mock('@/lib/media-session', () => ({ subscribeMediaSession: () => () => {} }));
jest.mock('@/lib/ask-quota', () => ({ loadAskQuota: jest.fn(), quotaMessage: jest.fn() }));
jest.mock('@/lib/neighborhood-assistant', () => ({
  loadAskContext: jest.fn(),
  askNeighborhood: jest.fn(),
  askErrorMessage: () => 'Request unavailable',
}));
jest.mock('@/hooks/useProtectedResource', () => ({
  useProtectedResource: (load: unknown) => ({
    data: load === jest.requireMock('@/lib/neighborhood-assistant').loadAskContext ? mockContext : undefined,
    loading: !mockContext,
    refresh: jest.fn(),
  }),
}));
let view: ReactTestRenderer;
beforeEach(() => {
  jest.clearAllMocks();
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  mockContext = undefined;
  mockParams = { question: 'Who can help nearby?', fromHome: '1' };
  jest.mocked(askNeighborhood).mockResolvedValue({ notice: 'Result', sources: [], excerpts: [] } as never);
});
afterEach(async () => {
  if (view) await act(async () => view.unmount());
});
it('waits for authorized context then submits Home question exactly once through the existing AI path', async () => {
  await act(async () => {
    view = create(createElement(Ask));
  });
  expect(askNeighborhood).not.toHaveBeenCalled();
  mockContext = { id: 'authorized-area', name: 'Osu' };
  await act(async () => view.update(createElement(Ask)));
  expect(askNeighborhood).toHaveBeenCalledWith('Who can help nearby?', [], 'authorized-area');
  await act(async () => view.update(createElement(Ask)));
  expect(askNeighborhood).toHaveBeenCalledTimes(1);
});
it('preserves the existing explicit confirmation for questions passed from Search', async () => {
  mockParams = { question: 'Who can help nearby?' };
  mockContext = { id: 'authorized-area', name: 'Osu' };
  await act(async () => {
    view = create(createElement(Ask));
  });
  expect(askNeighborhood).not.toHaveBeenCalled();
  expect(JSON.stringify(view.toJSON())).toContain('Ask about: Who can help nearby?');
});
