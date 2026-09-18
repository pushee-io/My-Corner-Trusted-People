import { createElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { Pressable, Text, TextInput } from 'react-native';
import { router } from 'expo-router';
import Feed from '../../app/community/index';
import ReviewRequest from '../../app/hire/request/review';
import { createNeighborhoodFeedPost } from '@/lib/community-repository';
import { createJobRequest } from '@/lib/repository';
import { useMediaComposer } from '@/components/media/MediaComposer';

jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  TextInput: 'TextInput',
  Pressable: 'Pressable',
  StyleSheet: { create: (styles: unknown) => styles },
}));
jest.mock('expo-crypto', () => ({ randomUUID: () => '00000000-0000-4000-8000-000000000011' }));
jest.mock('expo-router', () => ({
  router: { replace: jest.fn() },
  useLocalSearchParams: () => ({ providerId: 'provider', title: 'Repair sink', description: 'A leak under the sink' }),
}));
jest.mock('@/components/Screen', () => ({ Screen: ({ children }: { children: unknown }) => children }));
jest.mock('@/components/WebSafeLink', () => ({ WebSafeLink: ({ children }: { children: unknown }) => children }));
jest.mock('@/components/StateBlocks', () => ({
  EmptyState: 'EmptyState',
  LoadingState: 'LoadingState',
  OfflineBanner: 'OfflineBanner',
  SuccessState: 'SuccessState',
}));
jest.mock('@/components/media/MediaComposer', () => ({ useMediaComposer: jest.fn(), MediaComposer: 'MediaComposer' }));
jest.mock('@/components/media/MediaGallery', () => ({ MediaGallery: 'MediaGallery' }));
jest.mock('@/components/media/MediaAvatar', () => ({
  MediaAvatar: 'MediaAvatar',
  MediaAvatarCollection: ({ children }: { children: unknown }) => children,
}));
jest.mock('@/lib/analytics', () => ({ trackEvent: jest.fn() }));
jest.mock('@/lib/moderation', () => ({ moderateText: jest.fn() }));
jest.mock('@/lib/feature-flags', () => ({ featureFlags: { ai_content_moderation: false } }));
jest.mock('@/lib/repository', () => ({
  createJobRequest: jest.fn(),
  getProvider: jest.fn(async () => ({ name: 'QA provider' })),
}));
jest.mock('@/lib/community-repository', () => ({
  getCurrentNeighborhood: jest.fn(async () => ({ id: 'area', name: 'QA neighborhood' })),
  listNeighborhoodFeedPosts: jest.fn(async () => []),
  subscribeToNeighborhoodFeedPosts: jest.fn(() => () => {}),
  createNeighborhoodFeedPost: jest.fn(),
}));
let renderer: ReactTestRenderer;
const upload = jest.fn(async () => ['photo']);
const attach = jest.fn(async () => {});
const clear = jest.fn();
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  jest.clearAllMocks();
  upload.mockResolvedValue(['photo']);
  attach.mockResolvedValue(undefined);
  jest.mocked(useMediaComposer).mockReturnValue({
    drafts: [{ kind: 'image' }],
    busy: false,
    uploadAll: upload,
    attach,
    clear,
  } as unknown as ReturnType<typeof useMediaComposer>);
});
afterEach(async () => {
  if (renderer) await act(async () => renderer.unmount());
});
function button(text: string) {
  return renderer.root
    .findAllByType(Pressable)
    .find((node) => node.findAllByType(Text).some((child) => child.children.join('').includes(text)))!;
}
it('Feed retains typed text after attachment failure and finishes the same post on retry', async () => {
  jest
    .mocked(createNeighborhoodFeedPost)
    .mockResolvedValue({ id: 'saved-post', authorName: 'QA', body: 'Original post', comments: [] } as never);
  attach.mockRejectedValueOnce(new Error('upload connection interrupted'));
  await act(async () => {
    renderer = create(createElement(Feed));
  });
  await act(async () => renderer.root.findByType(TextInput).props.onChangeText('Original post'));
  await act(async () => button('Post to feed').props.onPress());
  expect(renderer.root.findByType(TextInput).props.value).toBe('Original post');
  expect(renderer.root.findByType(TextInput).props.editable).toBe(false);
  expect(clear).not.toHaveBeenCalled();
  await act(async () => button('Post to feed').props.onPress());
  expect(createNeighborhoodFeedPost).toHaveBeenCalledTimes(1);
  expect(attach).toHaveBeenLastCalledWith('saved-post', ['photo']);
  expect(renderer.root.findAllByType(TextInput)[0].props.value).toBe('');
  expect(clear).toHaveBeenCalledTimes(1);
});
it('Hire navigates only after private attachments finish and retries the same request', async () => {
  jest.mocked(createJobRequest).mockResolvedValue({ id: 'saved-request', categoryId: 'plumbing' } as never);
  attach.mockRejectedValueOnce(new Error('attach response lost'));
  await act(async () => {
    renderer = create(createElement(ReviewRequest));
  });
  await act(async () => button('Submit request').props.onPress());
  expect(router.replace).not.toHaveBeenCalled();
  expect(clear).not.toHaveBeenCalled();
  await act(async () => button('Submit request').props.onPress());
  expect(createJobRequest).toHaveBeenCalledTimes(1);
  expect(createJobRequest).toHaveBeenCalledWith(
    expect.objectContaining({ title: 'Repair sink', photoCount: 1 }),
    '00000000-0000-4000-8000-000000000011',
  );
  expect(router.replace).toHaveBeenCalledTimes(1);
  expect(router.replace).toHaveBeenCalledWith({
    pathname: '/hire/request/status',
    params: { requestId: 'saved-request' },
  });
});
