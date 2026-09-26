import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { MediaAvatar, MediaAvatarCollection } from '@/components/media/MediaAvatar';
import { listMedia } from '@/lib/media-repository';
import { useParentMedia } from '@/components/media/MediaGallery';
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
      <MediaAvatarCollection profileIds={[...ids, ids[0]]}>
        {ids.map((id, i) => (
          <MediaAvatar key={id} profileId={id} name={['Akosua Mensah', 'Kwame Owusu', 'Ama Boateng'][i]} />
        ))}
      </MediaAvatarCollection>,
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
