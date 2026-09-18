import * as FileSystem from 'expo-file-system/legacy';
import { retainLocalMedia, releaseLocalMedia, releaseLocalMediaUris } from '@/lib/media-local-files';
import { invalidateMediaSession } from '@/lib/media-session';

jest.mock('react-native', () => ({ Platform: { OS: 'android' } }));
jest.mock('expo-file-system/legacy', () => ({ cacheDirectory: 'file:///app/cache/', deleteAsync: jest.fn() }));
const remove = jest.mocked(FileSystem.deleteAsync);
beforeEach(() => {
  remove.mockReset();
  remove.mockResolvedValue();
});
test('disposal deletes only SDK temporary media and never library or other app files', async () => {
  await releaseLocalMediaUris([
    'content://library/photo',
    'file:///photos/photo.jpg',
    'file:///app/cache/unrelated.jpg',
    'file:///app/cache/ImagePicker/../../secret.jpg',
    'file:///app/cache/ImagePicker/photo.jpg',
    'file:///app/cache/ImageManipulator/photo.jpg',
  ]);
  expect(remove.mock.calls.map((call) => call[0])).toEqual([
    'file:///app/cache/ImagePicker/photo.jpg',
    'file:///app/cache/ImageManipulator/photo.jpg',
  ]);
});
test('failed deletion retries on account change and cleared drafts are released once', async () => {
  retainLocalMedia('draft-a', ['file:///app/cache/ImagePicker/a.mp4']);
  remove.mockRejectedValueOnce(new Error('busy'));
  await releaseLocalMedia(['draft-a']);
  invalidateMediaSession();
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(remove).toHaveBeenCalledTimes(2);
  await releaseLocalMedia(['draft-a']);
  expect(remove).toHaveBeenCalledTimes(2);
});
