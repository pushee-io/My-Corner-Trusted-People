import { createElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { AppState, Text } from 'react-native';
import Listing from '../../app/marketplace/listing/[listingId]';
import {
  getMarketplaceListing,
  getMarketplaceViewer,
  listMarketplacePickupRequestsForListing,
} from '@/lib/marketplace-repository';
import { invalidateMediaSession } from '@/lib/media-session';

jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  TextInput: 'TextInput',
  Image: 'Image',
  Pressable: 'Pressable',
  StyleSheet: { create: (s: unknown) => s },
  AppState: { currentState: 'active', addEventListener: jest.fn(() => ({ remove: jest.fn() })) },
}));
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ listingId: 'listing' }),
  useFocusEffect: (effect: () => void | (() => void)) => {
    const React = jest.requireActual<typeof import('react')>('react');
    React.useEffect(effect, [effect]);
  },
}));
jest.mock('@/components/Screen', () => ({ Screen: 'Screen' }));
jest.mock('@/components/WebSafeLink', () => ({ WebSafeLink: 'Link' }));
jest.mock('@/components/StateBlocks', () => ({ EmptyState: 'EmptyState', LoadingState: 'LoadingState' }));
jest.mock('@/components/media/MediaGallery', () => ({ MediaGallery: 'Gallery' }));
jest.mock('@/components/media/ParentMediaEditor', () => ({ ParentMediaEditor: 'Editor' }));
jest.mock('@/components/media/MediaAvatar', () => ({
  MediaAvatar: 'Avatar',
  MediaAvatarCollection: ({ children }: { children: unknown }) => children,
}));
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    },
  },
}));
jest.mock('@/lib/marketplace-repository', () => ({
  getMarketplaceListing: jest.fn(),
  getMarketplaceViewer: jest.fn(),
  listMarketplacePickupRequestsForListing: jest.fn(),
  createMarketplacePickupRequest: jest.fn(),
  respondToMarketplacePickupRequest: jest.fn(),
}));
const pickup = {
  id: 'pickup',
  requesterId: 'buyer',
  requesterName: 'Approved buyer',
  proposedStart: '2026-10-09T10:00:00Z',
  proposedEnd: '2026-10-09T11:00:00Z',
  status: 'proposed',
  message: 'Interested',
};
let view: ReactTestRenderer;
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  jest.useFakeTimers();
  jest.clearAllMocks();
  jest.mocked(getMarketplaceListing).mockResolvedValue({
    id: 'listing',
    sellerId: 'seller',
    sellerName: 'Approved seller',
    title: 'Item',
    availability: 'available',
  } as never);
  jest.mocked(getMarketplaceViewer).mockResolvedValue({ id: 'seller' } as never);
  jest.mocked(listMarketplacePickupRequestsForListing).mockResolvedValue([]);
});
afterEach(async () => {
  if (view) await act(async () => view.unmount());
  jest.useRealTimers();
});
async function render() {
  await act(async () => {
    view = create(createElement(Listing));
  });
}
function expectIdentity(id: string, name: string) {
  const avatar = view.root.findAllByType('Avatar' as never).find((node) => node.props.profileId === id)!;
  expect(avatar).toBeDefined();
  expect(avatar.props.name).toBe(name);
  expect(avatar.parent!.findAllByType(Text).map((node) => node.children.join(''))).toEqual([name]);
}
it('renders the canonical seller name beside its avatar before listing media', async () => {
  await render();
  expectIdentity('seller', 'Approved seller');
});
it('shows a new buyer identity while the seller stays on the listing', async () => {
  await render();
  jest.mocked(listMarketplacePickupRequestsForListing).mockResolvedValue([pickup] as never);
  await act(async () => {
    jest.advanceTimersByTime(15000);
  });
  expectIdentity('buyer', 'Approved buyer');
});
it('reloads interested neighbors when the app returns to the foreground', async () => {
  await render();
  jest.mocked(listMarketplacePickupRequestsForListing).mockResolvedValue([pickup] as never);
  expect(AppState.addEventListener).toHaveBeenCalled();
  await act(async () => {
    jest.mocked(AppState.addEventListener).mock.calls[0][1]('background');
    jest.mocked(AppState.addEventListener).mock.calls[0][1]('active');
  });
  expectIdentity('buyer', 'Approved buyer');
});
it('clears buyer identities on account transition', async () => {
  jest.mocked(listMarketplacePickupRequestsForListing).mockResolvedValue([pickup] as never);
  await render();
  await act(async () => invalidateMediaSession());
  expect(JSON.stringify(view.toJSON())).not.toContain('Approved buyer');
});
it('does not render other buyers for a nonseller even if a response contains them', async () => {
  jest.mocked(getMarketplaceViewer).mockResolvedValue({ id: 'unrelated' } as never);
  jest.mocked(listMarketplacePickupRequestsForListing).mockResolvedValue([pickup] as never);
  await render();
  expect(JSON.stringify(view.toJSON())).not.toContain('Approved buyer');
});
