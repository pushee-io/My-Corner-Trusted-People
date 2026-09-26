import { createElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import MessagesScreen from '../../app/messages';
import PublicNameScreen from '../../app/profile/public-name';
import { saveOwnPublicName } from '@/lib/messaging';

let mockData: unknown;
let mockParams: { conversationId?: string } = {};
let mockSession = 'one';
const mockRefresh = jest.fn();
jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  TextInput: 'TextInput',
  Pressable: 'Pressable',
  StyleSheet: { create: (s: unknown) => s },
}));
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: () => mockParams,
}));
jest.mock('expo-crypto', () => ({ randomUUID: () => 'nonce' }));
jest.mock('@/components/Screen', () => ({ Screen: 'Screen' }));
jest.mock('@/components/media/MediaAvatar', () => ({ MediaAvatar: 'Avatar', MediaAvatarCollection: 'Avatars' }));
jest.mock('@/hooks/useMessagingResource', () => ({
  useMessagingResource: () => ({ data: mockData, loading: false, refresh: mockRefresh }),
  usePrivateSessionKey: () => mockSession,
}));
jest.mock('@/hooks/useProtectedResource', () => ({
  useProtectedResource: () => ({ data: mockData, loading: false, refresh: mockRefresh }),
}));
jest.mock('@/lib/messaging', () => ({
  loadInbox: jest.fn(),
  loadOwnPublicName: jest.fn(),
  saveOwnPublicName: jest.fn(),
  messagingApi: jest.fn(),
}));
let view: ReactTestRenderer;
beforeEach(() => {
  mockParams = {};
  mockSession = 'one';
  jest.clearAllMocks();
});
afterEach(async () => {
  if (view) await act(async () => view.unmount());
});
it('inbox shows distinct public names, avatars, preview, timestamp and unread count', async () => {
  mockData = {
    conversations: ['Akosua Mensah', 'Kwame Owusu', 'Ama Boateng', 'Neighbor'].map((name, i) => ({
      id: String(i),
      peerId: `peer-${i}`,
      name,
      preview: `Latest message ${i}`,
      updatedAt: '2026-09-25T12:00:00Z',
      unread: i === 0 ? 2 : 0,
    })),
  };
  await act(async () => {
    view = create(createElement(MessagesScreen));
  });
  const output = JSON.stringify(view.toJSON());
  for (const name of ['Akosua Mensah', 'Kwame Owusu', 'Ama Boateng', 'Neighbor']) expect(output).toContain(name);
  expect(output).toContain('Latest message 0');
  expect(output).toContain('2 unread');
  expect(output).toContain(new Date('2026-09-25T12:00:00Z').toLocaleString());
  expect(view.root.findAllByType('Avatars' as never)[0].props.profileIds).toHaveLength(4);
  expect(view.root.findAllByType('Avatar' as never)).toHaveLength(4);
});
it('conversation header uses the same public peer name', async () => {
  mockParams = { conversationId: 'thread' };
  mockData = { name: 'Ama Boateng', peerId: 'peer', canSend: true, messages: [] };
  await act(async () => {
    view = create(createElement(MessagesScreen));
  });
  expect(view.root.findByType('Screen' as never).props.title).toBe('Messages · Ama Boateng');
});
it('public-name form starts empty for missing public identity and saves only explicit input', async () => {
  mockData = { name: null };
  jest.mocked(saveOwnPublicName).mockResolvedValue({ name: 'Akosua Mensah' });
  await act(async () => {
    view = create(createElement(PublicNameScreen));
  });
  expect(view.root.findByType('TextInput' as never).props.value).toBe('');
  await act(async () => view.root.findByType('TextInput' as never).props.onChangeText('Akosua Mensah'));
  await act(async () => view.root.findByType('Pressable' as never).props.onPress());
  expect(saveOwnPublicName).toHaveBeenCalledWith('Akosua Mensah');
  mockSession = 'two';
  await act(async () => view.update(createElement(PublicNameScreen)));
  expect(view.root.findByType('TextInput' as never).props.value).toBe('');
});
