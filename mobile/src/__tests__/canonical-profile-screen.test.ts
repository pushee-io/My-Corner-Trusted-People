import { createElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import ProfileScreen from '../../app/profile';
import { getCurrentProfile } from '@/lib/auth';
import { loadOwnPublicName } from '@/lib/messaging';
jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Icon' }));
jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  Pressable: 'Pressable',
  StyleSheet: { create: (s: unknown) => s },
}));
jest.mock('@/components/Screen', () => ({ Screen: 'Screen' }));
jest.mock('@/components/WebSafeLink', () => ({ WebSafeLink: 'Link' }));
jest.mock('@/components/media/ParentMediaEditor', () => ({ ParentMediaEditor: 'Editor' }));
jest.mock('@/lib/auth', () => ({ getCurrentProfile: jest.fn() }));
jest.mock('@/lib/messaging', () => ({ loadOwnPublicName: jest.fn() }));
jest.mock('@/hooks/useProtectedResource', () => ({
  useProtectedResource: (load: () => Promise<unknown>) => {
    const { useEffect, useState } = jest.requireActual<typeof import('react')>('react');
    const [data, setData] = useState<unknown>();
    useEffect(() => {
      void load().then(setData);
    }, [load]);
    return { data };
  },
}));
let view: ReactTestRenderer;
afterEach(async () => {
  if (view) await act(async () => view.unmount());
});
it.each(['Akosua Mensah', null])('self profile and avatar use canonical public name %s', async (name) => {
  jest
    .mocked(getCurrentProfile)
    .mockResolvedValue({ id: 'peer', displayName: 'Older raw identity', role: 'requester' } as Awaited<
      ReturnType<typeof getCurrentProfile>
    >);
  jest.mocked(loadOwnPublicName).mockResolvedValue({ name });
  await act(async () => {
    view = create(createElement(ProfileScreen));
  });
  expect(view.root.findByType('Editor' as never).props.name).toBe(name ?? 'Neighbor');
  expect(JSON.stringify(view.toJSON())).not.toContain('Older raw identity');
});
