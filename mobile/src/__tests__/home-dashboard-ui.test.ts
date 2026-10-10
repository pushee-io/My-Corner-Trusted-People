jest.mock('@/components/AICharacterPresentation', () => ({ AICharacterPresentation: 'AnimatedCharacter' }));
jest.mock('@/hooks/useAICharacter', () => ({
  useAICharacter: () => ({
    character: jest.requireActual('@/lib/ai-characters').defaultAICharacter,
    selectCharacter: jest.fn(),
  }),
}));
import { createElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { router } from 'expo-router';
import {
  HomeAICard,
  HomeFeedPreview,
  HomeHeader,
  HomeMarketplaceShowcase,
  HomeBroadcastPreview,
} from '@/components/HomeDashboard';
jest.mock('react-native', () => ({
  useWindowDimensions: () => ({ fontScale: 1 }),
  View: 'View',
  Text: 'Text',
  Image: 'Image',
  Pressable: 'Pressable',
  TextInput: 'TextInput',
  ScrollView: 'ScrollView',
  Keyboard: { dismiss: jest.fn() },
  StyleSheet: { create: (s: unknown) => s },
}));
jest.mock('expo-router', () => ({ router: { push: jest.fn() }, useFocusEffect: () => {} }));
jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Icon' }));
jest.mock('../../assets/my-corner-ai/characters/character-woman-kente.png', () => 1);
jest.mock('@/components/WebSafeLink', () => ({ WebSafeLink: 'Link' }));
jest.mock('@/components/media/MediaAvatar', () => ({ MediaAvatar: 'Avatar' }));
let view: ReactTestRenderer;
const button = (label: string) =>
  view.root.findAllByType('Pressable' as never).find((n) => n.props.accessibilityLabel === label)!;
beforeEach(() => {
  jest.clearAllMocks();
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
});
afterEach(async () => {
  if (view) await act(async () => view.unmount());
});
it('puts one send action inside the input row and hands the typed question to Ask once', async () => {
  await act(async () => {
    view = create(createElement(HomeAICard, { available: true, loading: false, neighborhood: 'Osu' }));
  });
  const field = () => view.root.findByType('TextInput' as never);
  expect(field().props.value).toBe('');
  expect(button('Send neighborhood question').props.disabled).toBe(true);
  await act(async () => field().props.onChangeText('  Who can repair my sink?  '));
  const send = button('Send neighborhood question');
  expect(send.parent?.parent).toBe(field().parent);
  await act(async () => send.props.onPress());
  expect(router.push).toHaveBeenCalledTimes(1);
  expect(router.push).toHaveBeenCalledWith({
    pathname: '/ask',
    params: { question: 'Who can repair my sink?', fromHome: '1', submission: expect.any(String) },
  });
  expect(field().props.value).toBe('');
});
it('disables AI without context and never substitutes a neighborhood', async () => {
  await act(async () => {
    view = create(createElement(HomeAICard, { available: false, loading: false }));
  });
  expect(view.root.findByType('TextInput' as never).props.editable).toBe(false);
  await act(async () => button('Send neighborhood question').props.onPress());
  expect(router.push).not.toHaveBeenCalled();
  expect(JSON.stringify(view.toJSON())).not.toContain('East Legon');
});
it('keeps compact communication routes and does not invent unread counts', async () => {
  await act(async () => {
    view = create(createElement(HomeHeader, { location: 'Osu · Accra', unread: 3, notifications: 2 }));
  });
  await act(async () => button('Messages, 3 unread').props.onPress());
  await act(async () => button('Notifications, 2 unread recent updates').props.onPress());
  expect(jest.mocked(router.push).mock.calls).toEqual([['/messages'], ['/notifications']]);
  await act(async () => view.update(createElement(HomeHeader, { location: 'Neighborhood unavailable' })));
  expect(button('Messages')).toBeDefined();
  expect(JSON.stringify(view.toJSON())).not.toContain('3 unread');
});
it('links Feed preview to the exact post with canonical identity, bounded text and no fake badge/share', async () => {
  const post = {
    id: 'post',
    authorId: 'public-id',
    authorName: 'Approved public name',
    body: 'Long text '.repeat(100),
    createdAt: '2026-01-01',
    likedByMe: true,
    likeCount: 2,
    comments: [],
  };
  await act(async () => {
    view = create(createElement(HomeFeedPreview, { post: post as never }));
  });
  expect(view.root.findByType('Link' as never).props.href).toEqual({
    pathname: '/community',
    params: { postId: 'post' },
  });
  expect(view.root.findByType('Avatar' as never).props).toMatchObject({
    profileId: 'public-id',
    name: 'Approved public name',
  });
  expect(
    view.root.findAllByType('Text' as never).find((n) => n.children.includes(post.body))?.props.numberOfLines,
  ).toBe(3);
  expect(JSON.stringify(view.toJSON())).not.toMatch(/Verified|Share post/);
});
it('opens exact listing and broadcast destinations with real prices and agency identity', async () => {
  await act(async () => {
    view = create(
      createElement(HomeMarketplaceShowcase, {
        listings: [{ id: 'listing', title: 'Listing title', priceGhs: 0 }] as never,
      }),
    );
  });
  expect(view.root.findByType('Link' as never).props.href).toEqual({
    pathname: '/marketplace/listing/[listingId]',
    params: { listingId: 'listing' },
  });
  expect(JSON.stringify(view.toJSON())).toContain('GHS 0.00');
  await act(async () =>
    view.update(
      createElement(HomeBroadcastPreview, {
        broadcast: { id: 'broadcast', agencyName: 'Authorized agency', title: 'Notice', body: 'Information' } as never,
      }),
    ),
  );
  expect(view.root.findByType('Link' as never).props.href).toEqual({
    pathname: '/agency-broadcasts',
    params: { broadcastId: 'broadcast' },
  });
  expect(JSON.stringify(view.toJSON())).toContain('Authorized agency');
  expect(JSON.stringify(view.toJSON())).not.toContain('Emergency');
});

it('opens the dedicated AI experience without sending a blank question', async () => {
  await act(async () => {
    view = create(createElement(HomeAICard, { available: true, loading: false }));
  });
  await act(async () => button('Open Ask My Corner AI').props.onPress());
  expect(router.push).toHaveBeenCalledWith('/ask');
});
it('blocks rapid duplicate Home send taps before React rerenders', async () => {
  await act(async () => {
    view = create(createElement(HomeAICard, { available: true, loading: false }));
  });
  await act(async () => view.root.findByType('TextInput' as never).props.onChangeText('Who can help me?'));
  const send = button('Send neighborhood question').props.onPress;
  await act(async () => {
    send();
    send();
  });
  expect(router.push).toHaveBeenCalledTimes(1);
});

it('shows the brand, location pin and full-art animated character presentation', async () => {
  await act(async () => {
    view = create(createElement(HomeHeader, { location: 'Osu · Accra' }));
  });
  expect(JSON.stringify(view.toJSON())).toContain('Trusted People');
  expect(view.root.findAllByType('Icon' as never).some((node) => node.props.name === 'location-sharp')).toBe(true);
  await act(async () => {
    view.update(createElement(HomeAICard, { available: true, loading: false }));
  });
  expect(view.root.findByType('AnimatedCharacter' as never).props.character.full).toBeDefined();
});
