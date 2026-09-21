import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';
import { subscribeMediaSession } from '@/lib/media-session';

const files = new Map<string, Set<string>>();
// Only temporary files created inside this app's cache or local browser blobs
// can be released. Never delete a photo-library/content/document URI.
export async function releaseLocalMediaUris(uris: (string | undefined)[]) {
  for (const uri of new Set(uris)) {
    if (!uri) continue;
    if (Platform.OS === 'web') {
      if (uri.startsWith('blob:')) URL.revokeObjectURL(uri);
    } else if (
      FileSystem.cacheDirectory &&
      uri.startsWith(FileSystem.cacheDirectory) &&
      !uri.includes('..') &&
      !uri.includes('%') &&
      /\/(ImagePicker|ImageManipulator|VideoThumbnails)\/[^/]+\.[a-z0-9]+$/i.test(uri)
    ) {
      await FileSystem.deleteAsync(uri, { idempotent: true });
    }
  }
}
export function retainLocalMedia(id: string, uris: (string | undefined)[]) {
  files.set(id, new Set(uris.filter((uri): uri is string => !!uri)));
}
export async function releaseLocalMedia(ids: string[]) {
  for (const id of ids) {
    const uris = files.get(id);
    if (!uris) continue;
    try {
      await releaseLocalMediaUris([...uris]);
      files.delete(id);
    } catch {
      // Keep failed cleanup registered for another disposal/account transition.
    }
  }
}
subscribeMediaSession(() => {
  void releaseLocalMedia([...files.keys()]);
});
