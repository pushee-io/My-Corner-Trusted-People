import { createElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { AppState, Pressable, Text } from 'react-native';
import ProfileScreen from '../../app/profile';
import { pickMedia } from '@/lib/media-picker';
import { attachMedia, uploadMediaDraft } from '@/lib/media-repository';
import { invalidateMediaSession } from '@/lib/media-session';
import { getCurrentProfile } from '@/lib/auth';
import type { MediaDraft } from '@/lib/media-contract';

jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  Image: 'Image',
  Pressable: 'Pressable',
  StyleSheet: { create: (s: unknown) => s },
  AppState: { currentState: 'active', addEventListener: jest.fn(() => ({ remove: jest.fn() })) },
}));
jest.mock('expo-router', () => ({
  useFocusEffect: (effect: () => void | (() => void)) => {
    const React = jest.requireActual<typeof import('react')>('react');
    React.useEffect(effect, [effect]);
  },
}));
jest.mock('@/components/Screen', () => ({ Screen: 'Screen' }));
jest.mock('@/components/WebSafeLink', () => ({ WebSafeLink: 'Link' }));
jest.mock('@/components/media/MediaGallery', () => ({
  MediaGallery: 'Gallery',
  useParentMedia: () => ({ items: [] }),
}));
jest.mock('@/components/media/MediaAvatar', () => ({ AvatarImage: 'Avatar' }));
jest.mock('@/lib/auth', () => ({ getCurrentProfile: jest.fn() }));
jest.mock('@/lib/messaging', () => ({ loadOwnPublicName: async () => ({ name: 'Approved name' }) }));
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    },
  },
}));
jest.mock('@/lib/media-picker', () => ({ pickMedia: jest.fn() }));
jest.mock('@/lib/media-local-files', () => ({ releaseLocalMedia: jest.fn(async () => {}) }));
jest.mock('@/lib/media-repository', () => ({
  mediaEnabled: async () => true,
  attachMedia: jest.fn(),
  uploadMediaDraft: jest.fn(),
  removeMedia: jest.fn(),
}));
const draft: MediaDraft = {
  id: 'new-photo',
  kind: 'image',
  uri: 'file:///normalized.jpg',
  width: 512,
  height: 512,
  bytes: 1000,
  status: 'selected',
  progress: 0,
};
let view: ReactTestRenderer;
function button(label: string) {
  return view.root
    .findAllByType(Pressable)
    .find((node) => node.findAllByType(Text).some((text) => text.children.join('') === label));
}
async function appState(value: 'background' | 'active') {
  await act(async () => {
    jest.mocked(AppState.addEventListener).mock.calls[0][1](value);
  });
}
beforeEach(async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  jest.clearAllMocks();
  jest.mocked(getCurrentProfile).mockResolvedValue({ id: 'owner', role: 'requester' } as never);
  jest.mocked(attachMedia).mockResolvedValue(undefined);
  jest.mocked(uploadMediaDraft).mockImplementation(async (_parent, _draft, patch) => {
    patch({ status: 'ready' });
    return _draft.id;
  });
  await act(async () => {
    view = create(createElement(ProfileScreen));
  });
  await act(async () => button('Add media')!.props.onPress());
});
afterEach(async () => {
  await act(async () => view.unmount());
});

it('keeps the same editor through native picker background/return and attaches the selected photo', async () => {
  let finish!: (result: MediaDraft) => void;
  jest.mocked(pickMedia).mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  await act(async () => button('Choose photo')!.props.onPress());
  await appState('background');
  await appState('active');
  await act(async () => finish(draft));
  expect(button('Save media')).toBeDefined();
  await act(async () => button('Save media')!.props.onPress());
  expect(attachMedia).toHaveBeenCalledWith('profile', 'owner', ['new-photo'], false);
  expect(JSON.stringify(view.toJSON())).toContain('Media saved.');
});

it('retains an uploaded draft after attach failure and retries without uploading again', async () => {
  jest.mocked(pickMedia).mockResolvedValue(draft);
  jest.mocked(attachMedia).mockRejectedValueOnce(new Error('Could not save media. Retry.'));
  await act(async () => button('Choose photo')!.props.onPress());
  await act(async () => button('Save media')!.props.onPress());
  expect(JSON.stringify(view.toJSON())).toContain('Could not save media. Retry.');
  await act(async () => button('Save media')!.props.onPress());
  expect(uploadMediaDraft).toHaveBeenCalledTimes(1);
  expect(attachMedia).toHaveBeenCalledTimes(2);
});

it('discards picker results after an account change', async () => {
  let finish!: (result: MediaDraft) => void;
  jest.mocked(pickMedia).mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  await act(async () => button('Choose photo')!.props.onPress());
  await act(async () => invalidateMediaSession());
  await act(async () => finish(draft));
  expect(button('Save media')).toBeUndefined();
  expect(attachMedia).not.toHaveBeenCalled();
});

it('removes the editor if foreground authorization fails', async () => {
  jest.mocked(getCurrentProfile).mockRejectedValueOnce(new Error('Access denied'));
  await appState('background');
  await appState('active');
  expect(view.root.findAllByType('Avatar' as never)).toHaveLength(0);
  expect(JSON.stringify(view.toJSON())).toContain('This view is unavailable');
});

it('still clears the profile on ordinary backgrounding without a picker', async () => {
  await appState('background');
  expect(view.root.findAllByType('Avatar' as never)).toHaveLength(0);
});

it('shows picker errors and permits selecting again', async () => {
  jest.mocked(pickMedia).mockRejectedValueOnce(new Error('This file could not be read. Choose it again.'));
  await act(async () => button('Choose photo')!.props.onPress());
  expect(JSON.stringify(view.toJSON())).toContain('This file could not be read');
  jest.mocked(pickMedia).mockResolvedValueOnce(draft);
  await act(async () => button('Choose photo')!.props.onPress());
  expect(button('Save media')).toBeDefined();
});
