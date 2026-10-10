import { createElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import Notifications from '../../app/notifications';
import { router } from 'expo-router';
import { notificationApi } from '@/lib/messaging';
let mockEvents = false;
let mockNotices: unknown[] = [];
const mockRefresh = jest.fn();
jest.mock('react-native', () => ({ View: 'View', Text: 'Text', Pressable: 'Pressable', StyleSheet: { create: (s: unknown) => s } }));
jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Icon' }));
jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('@/components/Screen', () => ({ Screen: 'Screen' }));
jest.mock('@/lib/events-feature', () => ({ isEventsClientEnabled: () => mockEvents }));
jest.mock('@/hooks/useMessagingResource', () => ({ useMessagingResource: () => ({ data: mockNotices, loading: false, refresh: mockRefresh }) }));
jest.mock('@/lib/messaging', () => ({ loadNotifications: jest.fn(), notificationApi: jest.fn() }));
let view: ReactTestRenderer;
beforeEach(() => {
  jest.clearAllMocks();
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  mockEvents = false;
  jest.mocked(notificationApi).mockResolvedValue(undefined as never);
});
afterEach(async () => { await act(async () => view?.unmount()); });
async function open(kind: string) {
  mockNotices = [{ id: 'notice', targetId: 'target', targetKind: kind, title: 'Update', body: 'Authorized notice', createdAt: '2026-10-10T08:00:00Z' }];
  await act(async () => { view = create(createElement(Notifications)); });
  expect(JSON.stringify(view.toJSON())).toContain('unread');
  const row = view.root.findByType('Pressable' as never);
  await act(async () => row.props.onPress());
}
it('marks a message notice read and opens the same authorized conversation', async () => {
  await open('message_received');
  expect(notificationApi).toHaveBeenCalledWith('read', 'notice');
  expect(router.push).toHaveBeenCalledWith({ pathname: '/messages', params: { conversationId: 'target' } });
});
it('keeps disabled Events routes closed', async () => {
  await open('event_reminder');
  expect(router.push).not.toHaveBeenCalled();
});
it('does not navigate if marking read fails', async () => {
  jest.mocked(notificationApi).mockRejectedValue(new Error('offline'));
  await open('message_received');
  expect(router.push).not.toHaveBeenCalled();
  expect(mockRefresh).toHaveBeenCalled();
});
