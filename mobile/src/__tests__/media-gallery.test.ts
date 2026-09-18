import { createElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { AppState, Image, Modal, Pressable, View } from 'react-native';
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
jest.mock('expo-video', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const players: { released: boolean; muted: boolean; play: jest.Mock; pause: jest.Mock }[] = [];
  return {
    VideoView: 'VideoView',
    players,
    useVideoPlayer: (source: { uri: string }, setup: (player: (typeof players)[number]) => void) => {
      const player = React.useMemo(() => {
        const instance = {
          released: false,
          muted: false,
          play: jest.fn(),
          pause: jest.fn(() => {
            if (instance.released) throw new Error('Native player has already been released');
          }),
        };
        setup(instance);
        players.push(instance);
        return instance;
        // Expo owns one player per source, not per setup callback.
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [source.uri]);
      // Match Expo's useReleasingSharedObject: its passive cleanup is registered
      // before the consuming component's effects and releases on unmount.
      React.useEffect(
        () => () => {
          player.released = true;
        },
        [player],
      );
      return player;
    },
  };
});
jest.mock('@/lib/media-repository', () => ({ listMedia: jest.fn() }));
jest.mock('@/components/media/MediaComposer', () => ({
  MediaAction: ({ label, action }: { label: string; action: () => void }) => {
    const React = jest.requireActual<typeof import('react')>('react');
    const Native = jest.requireMock('react-native') as typeof import('react-native');
    return React.createElement(Native.Pressable, { accessibilityLabel: label, onPress: action });
  },
}));

const read = jest.mocked(listMedia);
const players = (
  jest.requireMock('expo-video') as {
    players: { released: boolean; muted: boolean; play: jest.Mock; pause: jest.Mock }[];
  }
).players;
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
  players.length = 0;
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

test('closing and reopening video never calls a released native player', async () => {
  read.mockResolvedValue([{ ...photo, media_type: 'video', duration_seconds: 14 }]);
  await render();
  await press('Play video 1, starts muted');
  expect(players[0].muted).toBe(true);
  expect(players[0].play).toHaveBeenCalledTimes(1);
  await press('Close video');
  expect(players[0].released).toBe(true);
  expect(players[0].pause).not.toHaveBeenCalled();
  await press('Play video 1, starts muted');
  expect(players).toHaveLength(2);
  const onStateChange = jest.mocked(AppState.addEventListener).mock.calls.at(-1)![1];
  await act(async () => onStateChange('background'));
  expect(players[1].pause).toHaveBeenCalledTimes(1);
  await press('Close video');
  expect(players[1].released).toBe(true);
  // A native event queued before unsubscription must also be harmless.
  await act(async () => onStateChange('background'));
  expect(players[1].pause).toHaveBeenCalledTimes(1);
});

test('authorization refresh releases a playing video without reopening it', async () => {
  read.mockResolvedValue([{ ...photo, media_type: 'video', duration_seconds: 14 }]);
  await render();
  await press('Play video 1, starts muted');
  await render(1);
  expect(players[0].released).toBe(true);
  expect(players[0].pause).not.toHaveBeenCalled();
  expect(renderer!.root.findAllByType(Pressable).some((node) => node.props.accessibilityLabel === 'Close video')).toBe(
    false,
  );
});

test.each([
  { width: 720, height: 1280, container: 340, expectedHeight: 400 },
  { width: 720, height: 1280, container: 820, expectedHeight: 400 },
  { width: 1920, height: 1080, container: 340, expectedHeight: 191.25 },
  { width: 1920, height: 1080, container: 820, expectedHeight: 400 },
])('poster and playback fill the centered frame at $container dp for $width × $height media', async (size) => {
  read.mockResolvedValue([{ ...photo, media_type: 'video', width: size.width, height: size.height }]);
  await render();
  const viewport = () =>
    renderer!.root.findAllByType(View).find((node) => node.props.testID === `media-viewport-${photo.id}`)!;
  const measure = async (width: number) => {
    await act(async () => viewport().props.onLayout({ nativeEvent: { layout: { width } } }));
    return Object.assign({}, ...viewport().props.style);
  };
  expect(await measure(size.container)).toMatchObject({
    width: '100%',
    height: size.expectedHeight,
    alignItems: 'center',
  });
  const poster = renderer!.root.findByType(Image);
  expect(poster.props.resizeMode).toBe('contain');
  expect(poster.props.style).toEqual({ width: '100%', height: '100%' });
  const posterStyle = poster.props.style;
  await press('Play video 1, starts muted');
  expect(await measure(size.container)).toMatchObject({ width: '100%', height: size.expectedHeight });
  const video = renderer!.root.findByType(jest.requireMock('expo-video').VideoView);
  expect(video.props.contentFit).toBe('contain');
  expect(video.props.style).toEqual(posterStyle);
  // Container changes after rotation must update height without fixing width.
  expect(await measure(240)).toMatchObject({ width: '100%', height: Math.min((240 * size.height) / size.width, 400) });
});
