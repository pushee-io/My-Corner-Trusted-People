import { createElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import Feed from '../../app/community/index';
import {
  createNeighborhoodFeedComment,
  createNeighborhoodFeedPost,
  getCurrentNeighborhood,
  reportNeighborhoodFeedPost,
  subscribeToNeighborhoodFeedPosts,
  toggleNeighborhoodFeedLike,
} from '@/lib/community-repository';

let mockPostId: string | undefined;
const mockMedia = { busy: false, drafts: [] as { id: string }[] };
const mockClear = jest.fn();
const mockPost = {
  id: 'post-one',
  authorId: 'public-author',
  authorName: 'QA neighbor with a long public name',
  body: 'A long local update. '.repeat(20),
  createdAt: '2026-10-10T00:00:00Z',
  comments: [],
  likeCount: 2,
  likedByMe: false,
  isReported: false,
  moderationStatus: 'clean',
};
jest.mock('react-native', () => ({
  Share: { share: jest.fn(async () => ({})) },
  View: 'View',
  Text: 'Text',
  TextInput: 'TextInput',
  Pressable: 'Pressable',
  Modal: 'Modal',
  ScrollView: 'ScrollView',
  KeyboardAvoidingView: 'KeyboardAvoidingView',
  Platform: { OS: 'android' },
  Keyboard: { dismiss: jest.fn() },
  StyleSheet: { create: (styles: unknown) => styles },
}));
jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Icon' }));
jest.mock('react-native-safe-area-context', () => ({ SafeAreaView: 'SafeAreaView' }));
jest.mock('expo-router', () => ({ useLocalSearchParams: () => ({ postId: mockPostId }) }));
jest.mock('@/components/Screen', () => ({ Screen: ({ children }: { children: unknown }) => children }));
jest.mock('@/components/WebSafeLink', () => ({ WebSafeLink: 'Link' }));
jest.mock('@/components/StateBlocks', () => ({
  EmptyState: 'EmptyState',
  LoadingState: 'LoadingState',
  OfflineBanner: 'OfflineBanner',
}));
jest.mock('@/components/CollapsibleComments', () => ({
  ...jest.requireActual('@/components/CollapsibleComments'),
  dismissCommentKeyboard: jest.fn(),
}));
jest.mock('@/components/media/MediaComposer', () => ({
  MediaComposer: 'MediaComposer',
  useMediaComposer: () => mockMedia,
}));
jest.mock('@/components/media/useMediaSubmission', () => ({
  useMediaSubmission: () => ({
    busy: false,
    locked: false,
    clear: mockClear,
    submit: (createPost: (id: string) => Promise<unknown>) => createPost('stable-post-id'),
  }),
}));
jest.mock('@/components/media/MediaGallery', () => ({ MediaGallery: 'Gallery' }));
jest.mock('@/components/media/MediaAvatar', () => ({
  MediaAvatar: 'Avatar',
  MediaAvatarCollection: ({ children }: { children: unknown }) => children,
}));
jest.mock('@/lib/community-repository', () => ({
  getCurrentNeighborhood: jest.fn(async () => ({ id: 'authorized-area', name: 'QA neighborhood' })),
  listNeighborhoodFeedPosts: jest.fn(async () => [mockPost, { ...mockPost, id: 'post-two', body: 'Second update' }]),
  subscribeToNeighborhoodFeedPosts: jest.fn(() => () => {}),
  createNeighborhoodFeedPost: jest.fn(),
  createNeighborhoodFeedComment: jest.fn(),
  reportNeighborhoodFeedPost: jest.fn(),
  reportNeighborhoodFeedComment: jest.fn(),
  toggleNeighborhoodFeedLike: jest.fn(),
}));
let view: ReactTestRenderer;
const buttons = (label: string) =>
  view.root.findAllByType('Pressable' as never).filter((node) => node.props.accessibilityLabel === label);
const field = (label: string) =>
  view.root.findAllByType('TextInput' as never).find((node) => node.props.accessibilityLabel === label)!;
async function press(label: string, index = 0) {
  expect(buttons(label)[index]).toBeDefined();
  await act(async () => buttons(label)[index].props.onPress());
}
async function render() {
  await act(async () => {
    view = create(createElement(Feed));
  });
}
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  jest.clearAllMocks();
  mockPostId = undefined;
  mockMedia.drafts = [];
  jest.mocked(getCurrentNeighborhood).mockResolvedValue({ id: 'authorized-area', name: 'QA neighborhood' } as never);
});
afterEach(async () => {
  await act(async () => view.unmount());
});

it('opens a compact composer and preserves text and selected media across close and resume', async () => {
  await render();
  expect(view.root.findAllByType('TextInput' as never)).toHaveLength(0);
  await press('What’s happening, neighbor?');
  await act(async () => field('Neighborhood feed post').props.onChangeText('Unsent local update'));
  mockMedia.drafts = [{ id: 'selected-photo' }];
  await press('Close composer');
  expect(view.root.findAllByType('TextInput' as never)).toHaveLength(0);
  expect(mockClear).not.toHaveBeenCalled();
  await press('Continue your post');
  expect(field('Neighborhood feed post').props.value).toBe('Unsent local update');
  expect(view.root.findByType('MediaComposer' as never).props.controller).toBe(mockMedia);
});

it('returns to browsing after success and retains the composer after a failed submission', async () => {
  await render();
  await press('What’s happening, neighbor?');
  await act(async () => field('Neighborhood feed post').props.onChangeText('New local update'));
  jest.mocked(createNeighborhoodFeedPost).mockRejectedValueOnce(new Error('Try again'));
  await press('Post to feed');
  expect(field('Neighborhood feed post').props.value).toBe('New local update');
  expect(mockClear).not.toHaveBeenCalled();
  jest.mocked(createNeighborhoodFeedPost).mockResolvedValueOnce({ ...mockPost, id: 'new-post' } as never);
  await press('Post to feed');
  expect(createNeighborhoodFeedPost).toHaveBeenLastCalledWith('authorized-area', 'New local update', 'stable-post-id');
  expect(mockClear).toHaveBeenCalledTimes(1);
  expect(buttons('What’s happening, neighbor?')).toHaveLength(1);
  expect(view.root.findAllByType('Gallery' as never).map((node) => node.props.parentId)).toContain('new-post');
});

it('keeps public identity, media parent, reactions and reporting tied to the selected post', async () => {
  mockPostId = 'post-one';
  await render();
  expect(view.root.findAllByType('Gallery' as never).map((node) => node.props.parentId)).toEqual(['post-one']);
  expect(view.root.findByType('Gallery' as never).props.parent).toBe('neighborhood_post');
  const profileLink = view.root.findAllByType('Link' as never).find((node) => typeof node.props.href === 'object')!;
  expect(profileLink.props.href.params.profileId).toBe('public-author');
  jest.mocked(toggleNeighborhoodFeedLike).mockResolvedValueOnce({ likedByMe: true, likeCount: 3 });
  await press('Like post, 2 likes');
  expect(toggleNeighborhoodFeedLike).toHaveBeenCalledWith(mockPost);
  expect(buttons('Unlike post, 3 likes')[0].props.accessibilityState.selected).toBe(true);
  expect(buttons('Report post')).toHaveLength(0);
  await press('Post options');
  await press('Report post');
  expect(reportNeighborhoodFeedPost).toHaveBeenCalledWith('post-one');
  expect(buttons('Post reported')[0].props.disabled).toBe(true);
  expect(buttons('Share post link')).toHaveLength(1);
});

it('retains failed reply text, clears a successful reply, and updates the open comment count', async () => {
  mockPostId = 'post-one';
  await render();
  await press('0 comments, collapsed');
  await act(async () => field('Reply to feed post').props.onChangeText('Thanks for the update'));
  jest.mocked(createNeighborhoodFeedComment).mockRejectedValueOnce(new Error('Reply connection failed'));
  await press('Reply');
  expect(field('Reply to feed post').props.value).toBe('Thanks for the update');
  jest.mocked(createNeighborhoodFeedComment).mockResolvedValueOnce({
    id: 'reply-one',
    postId: 'post-one',
    authorName: 'QA reply author',
    body: 'Thanks for the update',
  } as never);
  await press('Reply');
  expect(createNeighborhoodFeedComment).toHaveBeenLastCalledWith('post-one', 'Thanks for the update');
  expect(field('Reply to feed post').props.value).toBe('');
  expect(buttons('1 comments, expanded')).toHaveLength(1);
  expect(buttons('Reply')[0].props.disabled).toBe(true);
});

it('does not render posts or subscribe when neighborhood authorization fails', async () => {
  jest.mocked(getCurrentNeighborhood).mockRejectedValueOnce(new Error('Neighborhood verification required'));
  await render();
  expect(view.root.findAllByType('Gallery' as never)).toHaveLength(0);
  expect(subscribeToNeighborhoodFeedPosts).not.toHaveBeenCalled();
  expect(JSON.stringify(view.toJSON())).toContain('Neighborhood verification required');
});
