import * as Crypto from 'expo-crypto';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { PermissionsAndroid, Platform } from 'react-native';
import { localMediaByteSize } from '@/lib/media-repository';
import { mediaLimits, validateMediaDrafts, type MediaDraft, type MediaParent } from '@/lib/media-contract';
import { releaseLocalMediaUris, retainLocalMedia } from '@/lib/media-local-files';
import { assertMediaSession, mediaSessionRevision } from '@/lib/media-session';

export async function preparePhoto(uri: string, width: number, height: number, maxEdge = 1600) {
  const context = ImageManipulator.ImageManipulator.manipulate(uri);
  if (Math.max(width, height) > maxEdge) context.resize(width >= height ? { width: maxEdge } : { height: maxEdge });
  const rendered = await context.renderAsync();
  const photo = await rendered.saveAsync({ format: ImageManipulator.SaveFormat.JPEG, compress: 0.72 });
  return { ...photo, bytes: await localMediaByteSize(photo.uri) };
}

async function videoPoster(uri: string) {
  if (Platform.OS !== 'web') {
    const thumbnail = await VideoThumbnails.getThumbnailAsync(uri, { time: 0, quality: 0.65 });
    try {
      return (await preparePhoto(thumbnail.uri, thumbnail.width, thumbnail.height, 640)).uri;
    } finally {
      await releaseLocalMediaUris([thumbnail.uri]).catch(() => {});
    }
  }
  // Only a local, user-selected file is loaded to produce its preview.
  return new Promise<string>((resolve, reject) => {
    const video = document.createElement('video');
    video.muted = true;
    video.preload = 'auto';
    video.src = uri;
    const release = () => {
      clearTimeout(timeout);
      video.onerror = null;
      video.onloadeddata = null;
      video.removeAttribute('src');
      video.load();
    };
    const timeout = setTimeout(() => {
      release();
      reject(new Error('Could not preview this video.'));
    }, 15_000);
    video.onerror = () => {
      release();
      reject(new Error('Use a standard MP4 video.'));
    };
    video.onloadeddata = () => {
      clearTimeout(timeout);
      const canvas = document.createElement('canvas');
      const scale = Math.min(1, 640 / Math.max(video.videoWidth, video.videoHeight));
      canvas.width = Math.round(video.videoWidth * scale);
      canvas.height = Math.round(video.videoHeight * scale);
      const context = canvas.getContext('2d');
      if (!context) {
        release();
        reject(new Error('Could not preview this video.'));
        return;
      }
      try {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      } catch {
        reject(new Error('Could not preview this video.'));
      } finally {
        release();
      }
    };
  });
}
export async function pickMedia(
  parent: MediaParent,
  source: 'camera' | 'library',
  kind: 'image' | 'video',
): Promise<MediaDraft | null> {
  const revision = mediaSessionRevision();
  if (kind === 'video' && !mediaLimits[parent].videos) throw new Error('Choose a photo for this picture.');
  if (source === 'camera') {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted)
      throw new Error(
        'Camera access is off. Allow camera access in device Settings, or choose a saved photo or video.',
      );
  }
  if (source === 'camera' && kind === 'video' && Platform.OS === 'android') {
    const permission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
    if (permission !== PermissionsAndroid.RESULTS.GRANTED)
      throw new Error('Microphone access is off. Allow it in device Settings, or choose a saved video.');
  }
  // Android's system picker grants access only to selected items. A broad media
  // library permission is not required and is deliberately not requested.
  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: kind === 'image' ? ['images'] : ['videos'],
    allowsEditing: kind === 'image' && ['profile', 'group_avatar'].includes(parent),
    aspect: [1, 1],
    quality: 0.85,
    exif: false,
    videoMaxDuration: 30,
    videoQuality: ImagePicker.UIImagePickerControllerQualityType.Medium,
    videoExportPreset: ImagePicker.VideoExportPreset.MediumQuality,
  };
  const result =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);
  if (result.canceled || !result.assets[0]) return null;
  const asset = result.assets[0];
  const temporaryUris: string[] = [asset.uri];
  try {
    const photo =
      kind === 'image'
        ? await preparePhoto(
            asset.uri,
            asset.width,
            asset.height,
            parent === 'profile' || parent === 'group_avatar' ? 512 : 1600,
          )
        : undefined;
    if (photo) temporaryUris.push(photo.uri);
    const draft: MediaDraft = {
      id: Crypto.randomUUID(),
      kind,
      uri: photo?.uri ?? asset.uri,
      width: photo?.width ?? asset.width,
      height: photo?.height ?? asset.height,
      bytes: photo?.bytes ?? asset.fileSize ?? (await localMediaByteSize(asset.uri)),
      seconds: kind === 'video' ? (asset.duration ?? 0) / 1000 : undefined,
      posterUri: kind === 'video' ? 'pending-preview' : undefined,
      status: 'selected',
      progress: 0,
    };
    const error = validateMediaDrafts(parent, [draft]);
    if (error) throw new Error(error);
    if (kind === 'video') draft.posterUri = await videoPoster(asset.uri);
    if (draft.posterUri) temporaryUris.push(draft.posterUri);
    assertMediaSession(revision);
    retainLocalMedia(draft.id, temporaryUris);
    return draft;
  } catch (error) {
    await releaseLocalMediaUris(temporaryUris).catch(() => {});
    throw error;
  }
}
