import { createElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { Image, Modal, Pressable } from 'react-native';
import { MediaGallery } from '@/components/media/MediaGallery';
import { listMedia } from '@/lib/media-repository';
import { invalidateMediaSession } from '@/lib/media-session';
import type { DisplayMedia } from '@/lib/media-contract';

jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  Image: 'Image',
  Modal: 'Modal',
  Pressable: 'Pressable',
  StyleSheet: { create: (styles: unknown) => styles },
  AppState: { addEventListener: jest.fn(() => ({ remove: jest.fn() })) },
}));
// These tests keep the route focused and exercise real React effect cleanup on
// dependency changes. Navigation and native rendering remain device gates.
jest.mock('expo-router', () => ({
  useFocusEffect: (effect: () => void | (() => void)) => {
    const React = jest.requireActual<typeof import('react')>('react');
    React.useEffect(effect, [effect]);
  },
}));
jest.mock('expo-video', () => ({ useVideoPlayer: jest.fn(), VideoView: 'VideoView' }));
jest.mock('@/lib/media-repository', () => ({ listMedia: jest.fn() }));
jest.mock('@/components/media/MediaComposer', () => ({
  MediaAction: ({ label, action }: { label: string; action: () => void }) => {
    const React = jest.requireActual<typeof import('react')>('react');
    const Native = jest.requireMock('react-native') as typeof import('react-native');
    return React.createElement(Native.Pressable, { accessibilityLabel: label, onPress: action });
  },
}));

const read = jest.mocked(listMedia);
const photo: DisplayMedia = {
  id: 'fictional-photo',
  owner_profile_id: 'owner',
  parent_type: 'group_post',
  parent_id: '00000000-0000-4000-8000-000000000001',
  media_type: 'image',
  storage_path: 'owner/photo/media.jpg',
  poster_path: null,
  mime_type: 'image/jpeg',
  byte_size: 1024,
  width: 640,
  height: 480,
  duration_seconds: null,
  sort_order: 0,
  alt_text: '',
  processing_status: 'ready',
  moderation_status: 'not_run',
  created_at: '',
  updated_at: '',
  url: 'https://example.invalid/private-photo',
  expiresAt: Number.MAX_SAFE_INTEGER,
};
let renderer: ReactTestRenderer | undefined;
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
async function render(refreshKey = 0) {
  await act(async () => {
    const tree = createElement(MediaGallery, {
      parent: 'group_post',
      parentId: '00000000-0000-4000-8000-000000000001',
      refreshKey,
    });
    if (renderer) renderer.update(tree);
    else renderer = create(tree);
  });
}
async function press(label: string) {
  await act(async () => {
    renderer!.root
      .findAllByType(Pressable)
      .find((node) => node.props.accessibilityLabel === label)!
      .props.onPress();
  });
}
function expectClosed() {
  expect(renderer!.root.findAllByType(Modal).some((node) => node.props.visible)).toBe(false);
  expect(renderer!.root.findAllByType(Image).some((node) => node.props.accessibilityLabel === 'Expanded photo')).toBe(
    false,
  );
}

beforeAll(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});
beforeEach(() => {
  jest.clearAllMocks();
  invalidateMediaSession();
  read.mockReset().mockResolvedValue([photo]);
});
afterEach(async () => {
  await act(async () => {
    renderer?.unmount();
  });
  renderer = undefined;
});

test('closes an expanded photo during refresh and keeps it closed when authorization removes the asset', async () => {
  await render();
  await press('View photo 1');
  expect(renderer!.root.findByType(Modal).props.visible).toBe(true);
  const pending = deferred<DisplayMedia[]>();
  read.mockReturnValueOnce(pending.promise);
  await render(1);
  expectClosed();
  await act(async () => {
    pending.resolve([]);
  });
  expectClosed();
  expect(renderer!.root.findAllByType(Image)).toHaveLength(0);
});

test('a failed refresh and later successful retry never reopen the previously selected private photo', async () => {
  await render();
  await press('View photo 1');
  read.mockRejectedValueOnce(new Error('Access check unavailable'));
  await render(1);
  expectClosed();
  await press('Retry media');
  expectClosed();
  await press('View photo 1');
  expect(renderer!.root.findByType(Modal).props.visible).toBe(true);
});

test('ignores a late signed-photo response after a newer authorization refresh', async () => {
  read.mockResolvedValueOnce([{ ...photo, expiresAt: 0 }]);
  await render();
  const pending = deferred<DisplayMedia[]>();
  read.mockReturnValueOnce(pending.promise);
  await press('View photo 1');
  // The photo is still permitted but a response from the previous authorization
  // check must not silently reopen its viewer in the new one.
  await render(1);
  await act(async () => {
    pending.resolve([photo]);
  });
  expectClosed();
});

test('removes stale thumbnails when opening an expired URL discovers lost access', async () => {
  read.mockResolvedValueOnce([{ ...photo, expiresAt: 0 }]);
  await render();
  read.mockResolvedValue([]);
  await press('View photo 1');
  expectClosed();
  expect(renderer!.root.findAllByType(Image)).toHaveLength(0);
});

test('clears the expanded photo on an account transition', async () => {
  await render();
  await press('View photo 1');
  read.mockResolvedValue([]);
  await act(async () => {
    invalidateMediaSession();
  });
  expectClosed();
  expect(renderer!.root.findAllByType(Image)).toHaveLength(0);
});
