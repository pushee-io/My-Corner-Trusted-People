import { createElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { MediaAvatar, MediaAvatarCollection } from '@/components/media/MediaAvatar';
import { listMedia } from '@/lib/media-repository';
import { useParentMedia } from '@/components/media/MediaGallery';
import { PublicIdentity } from '@/components/PublicIdentity';
jest.mock('react-native', () => ({
  Image: 'Image',
  View: 'View',
  Text: 'Text',
  StyleSheet: { create: (s: unknown) => s },
}));
jest.mock('expo-router', () => ({
  useFocusEffect: (cb: () => () => void) => {
    const { useEffect } = jest.requireActual<typeof import('react')>('react');
    useEffect(cb, [cb]);
  },
}));
jest.mock('@/lib/media-repository', () => ({ listMedia: jest.fn() }));
jest.mock('@/components/media/MediaGallery', () => ({ useParentMedia: jest.fn(() => ({ items: [] })) }));
jest.mock('@/lib/media-session', () => ({ mediaSessionRevision: () => 0, subscribeMediaSession: () => () => {} }));
it('batches distinct peer avatars once and keeps each public name/photo matched', async () => {
  const ids = [1, 2, 3].map((n) => `97000000-0000-4000-8000-00000000000${n}`);
  jest
    .mocked(listMedia)
    .mockResolvedValue([{ parent_id: ids[1], url: 'https://example.test/kwame.jpg' }] as Awaited<
      ReturnType<typeof listMedia>
    >);
  let view: ReactTestRenderer;
  await act(async () => {
    view = create(
      createElement(
        MediaAvatarCollection,
        // React receives required children through the positional arguments below.
        { profileIds: [...ids, ids[0]] } as Parameters<typeof MediaAvatarCollection>[0],
        ...ids.map((id, i) =>
          createElement(MediaAvatar, {
            key: id,
            profileId: id,
            name: ['Akosua Mensah', 'Kwame Owusu', 'Ama Boateng'][i],
          }),
        ),
      ),
    );
  });
  expect(listMedia).toHaveBeenCalledTimes(1);
  expect(listMedia).toHaveBeenCalledWith('profile', ids);
  expect(jest.mocked(useParentMedia).mock.calls.every((call) => call[1] === undefined)).toBe(true);
  expect(view!.root.findByType('Image' as never).props).toMatchObject({
    source: { uri: 'https://example.test/kwame.jpg' },
    accessibilityLabel: 'Kwame Owusu profile photo',
  });
  await act(async () => view!.unmount());
});

it('keeps visible names with photo/fallback and refreshes a replaced buyer photo for unchanged IDs', async () => {
  const seller = '98000000-0000-4000-8000-000000000001';
  const buyer = '98000000-0000-4000-8000-000000000002';
  jest
    .mocked(listMedia)
    .mockClear()
    .mockResolvedValue([{ parent_id: seller, url: 'https://example.test/seller.jpg' }] as Awaited<
      ReturnType<typeof listMedia>
    >);
  const render = (refreshKey: number) =>
    createElement(
      MediaAvatarCollection,
      { profileIds: [seller, buyer], refreshKey } as Parameters<typeof MediaAvatarCollection>[0],
      createElement(PublicIdentity, { profileId: seller, name: 'Approved seller' }),
      createElement(PublicIdentity, { profileId: buyer, name: 'Approved buyer' }),
    );
  let view!: ReactTestRenderer;
  await act(async () => {
    view = create(render(1));
  });
  expect(view.root.findAllByType('Text' as never).map((node) => node.children.join(''))).toEqual([
    'Approved seller',
    'AB',
    'Approved buyer',
  ]);
  expect(view.root.findByType('Image' as never).props.accessibilityLabel).toBe('Approved seller profile photo');
  jest.mocked(listMedia).mockResolvedValue([
    { parent_id: seller, url: 'https://example.test/seller.jpg' },
    { parent_id: buyer, url: 'https://example.test/new-buyer.jpg' },
  ] as Awaited<ReturnType<typeof listMedia>>);
  await act(async () => view.update(render(2)));
  expect(listMedia).toHaveBeenCalledTimes(2);
  expect(
    view.root.findAllByType('Image' as never).map((node) => [node.props.accessibilityLabel, node.props.source.uri]),
  ).toEqual([
    ['Approved seller profile photo', 'https://example.test/seller.jpg'],
    ['Approved buyer profile photo', 'https://example.test/new-buyer.jpg'],
  ]);
  await act(async () => view.unmount());
});
