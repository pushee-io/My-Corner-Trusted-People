import { createElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { Keyboard } from 'react-native';
import { router } from 'expo-router';
import Marketplace from '../../app/marketplace';
import { createMarketplaceListing } from '@/lib/marketplace-repository';

let mockHardwareBack: (() => boolean) | undefined;
const mockClear = jest.fn();
const mockMedia = { busy: false, drafts: [] as { id: string }[] };
jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  TextInput: 'TextInput',
  Image: 'Image',
  Pressable: 'Pressable',
  ScrollView: 'ScrollView',
  RefreshControl: 'RefreshControl',
  StyleSheet: { create: (styles: unknown) => styles },
  useWindowDimensions: () => ({ width: 360, fontScale: 1 }),
  Keyboard: { dismiss: jest.fn(), isVisible: jest.fn(() => false) },
  BackHandler: {
    exitApp: jest.fn(),
    addEventListener: jest.fn((_event, handler) => {
      mockHardwareBack = handler;
      return { remove: jest.fn() };
    }),
  },
}));
jest.mock('expo-router', () => ({
  usePathname: () => '/marketplace',
  useFocusEffect: (effect: () => void | (() => void)) => {
    const React = jest.requireActual<typeof import('react')>('react');
    React.useEffect(effect, [effect]);
  },
  router: { canGoBack: () => true, back: jest.fn(), replace: jest.fn() },
}));
jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Icon' }));
jest.mock('react-native-safe-area-context', () => ({ SafeAreaView: 'SafeAreaView' }));
jest.mock('expo-file-system', () => ({ File: class {} }));
jest.mock('expo-image-manipulator', () => ({}));
jest.mock('expo-image-picker', () => ({}));
jest.mock('@/components/BottomNavigation', () => ({ BottomNavigation: 'BottomNavigation' }));
jest.mock('@/components/MessagesAccess', () => ({ MessagesAccess: 'MessagesAccess' }));
jest.mock('@/components/brand/MyCornerLogo', () => ({ MyCornerLogo: 'Logo' }));
jest.mock('@/components/CollapsibleComments', () => ({
  CommentsProvider: ({ children }: { children: unknown }) => children,
}));
jest.mock('@/components/WebSafeLink', () => ({ WebSafeLink: 'Link' }));
jest.mock('@/components/PublicIdentity', () => ({ PublicIdentity: 'PublicIdentity' }));
jest.mock('@/components/StateBlocks', () => ({ EmptyState: 'EmptyState', LoadingState: 'LoadingState' }));
jest.mock('@/components/media/MediaGallery', () => ({ MediaGallery: 'Gallery' }));
jest.mock('@/components/media/MediaAvatar', () => ({
  MediaAvatarCollection: ({ children }: { children: unknown }) => children,
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
    submit: (createListing: (id: string) => Promise<unknown>) => createListing('stable-id'),
  }),
}));
jest.mock('@/lib/marketplace-repository', () => ({
  getMarketplaceNeighborhood: async () => ({ id: 'area', name: 'QA neighborhood' }),
  listMarketplaceListings: async () => [{ id: 'existing', title: 'Existing item', sellerId: 'seller' }],
  createMarketplaceListing: jest.fn(),
}));

let view: ReactTestRenderer;
const output = () => JSON.stringify(view.toJSON());
const tabs = () => view.root.findAllByType('BottomNavigation' as never);
const field = (name: string) => view.root.findByProps({ accessibilityLabel: name });
async function press(label: string) {
  const button = view.root
    .findAllByType('Pressable' as never)
    .find(
      (node) =>
        node.props.accessibilityLabel === label ||
        node.findAllByType('Text' as never).some((text) => text.children.join('') === label),
    );
  expect(button).toBeDefined();
  await act(async () => button!.props.onPress());
}
async function type(name: string, value: string) {
  await act(async () => field(name).props.onChangeText(value));
}
beforeEach(async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  jest.clearAllMocks();
  jest.mocked(Keyboard.isVisible).mockReturnValue(false);
  mockMedia.drafts = [];
  jest.mocked(createMarketplaceListing).mockResolvedValue({ id: 'new', title: 'Chair', sellerId: 'seller' } as never);
  await act(async () => {
    view = create(createElement(Marketplace));
  });
});
afterEach(async () => {
  await act(async () => view.unmount());
});

it('keeps browse tabs, focuses creation, and uses Back to restore browse before router history', async () => {
  expect(tabs()).toHaveLength(1);
  expect(output()).toContain('Existing item');
  expect(view.root.findAllByType('TextInput' as never)).toHaveLength(0);
  await press('New listing');
  expect(tabs()).toHaveLength(0);
  expect(output()).not.toContain('Existing item');
  expect(field('Item name')).toBeDefined();
  await press('Go back');
  expect(tabs()).toHaveLength(1);
  expect(router.back).not.toHaveBeenCalled();
  await press('Go back');
  expect(router.back).toHaveBeenCalledTimes(1);
});

it('retains draft and media controller when returning to browse and resuming', async () => {
  await press('New listing');
  await type('Item name', 'Chair');
  await type('Item description', 'Good condition');
  await type('Price in Ghana cedis', '25');
  mockMedia.drafts = [{ id: 'video-draft' }];
  await press('Go back');
  await press('Continue listing');
  expect(field('Item name').props.value).toBe('Chair');
  expect(field('Item description').props.value).toBe('Good condition');
  expect(field('Price in Ghana cedis').props.value).toBe('25');
  expect(view.root.findByType('MediaComposer' as never).props.controller).toBe(mockMedia);
  expect(mockClear).not.toHaveBeenCalled();
});

it('hardware Back dismisses the keyboard before restoring browse', async () => {
  await press('New listing');
  jest.mocked(Keyboard.isVisible).mockReturnValue(true);
  await act(async () => {
    expect(mockHardwareBack!()).toBe(true);
  });
  expect(Keyboard.dismiss).toHaveBeenCalledTimes(1);
  expect(tabs()).toHaveLength(0);
  jest.mocked(Keyboard.isVisible).mockReturnValue(false);
  await act(async () => {
    expect(mockHardwareBack!()).toBe(true);
  });
  expect(tabs()).toHaveLength(1);
  expect(router.back).not.toHaveBeenCalled();
});

it('returns to browse only after successful posting and clears the completed draft', async () => {
  await press('New listing');
  await type('Item name', 'Chair');
  await type('Item description', 'Good condition');
  await press('Post listing');
  expect(createMarketplaceListing).toHaveBeenCalledWith(
    'area',
    expect.objectContaining({
      title: 'Chair',
      description: 'Good condition',
      pickupArea: 'QA neighborhood, general pickup area',
    }),
    'stable-id',
  );
  expect(mockClear).toHaveBeenCalledTimes(1);
  expect(tabs()).toHaveLength(1);
  expect(output()).toContain('Listing posted.');
  expect(output()).toContain('Chair');
  await press('New listing');
  expect(field('Item name').props.value).toBe('');
  expect(field('Item description').props.value).toBe('');
});

it('keeps invalid and failed submissions focused with the draft available for retry', async () => {
  await press('New listing');
  await press('Post listing');
  expect(createMarketplaceListing).not.toHaveBeenCalled();
  expect(tabs()).toHaveLength(0);
  await type('Item name', 'Chair');
  await type('Item description', 'Good condition');
  jest.mocked(createMarketplaceListing).mockRejectedValueOnce(new Error('Retry this submission'));
  await press('Post listing');
  expect(tabs()).toHaveLength(0);
  expect(field('Item name').props.value).toBe('Chair');
  expect(output()).toContain('Retry this submission');
  expect(mockClear).not.toHaveBeenCalled();
});
