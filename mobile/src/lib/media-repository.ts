import { File } from 'expo-file-system';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';
import { assertMediaSession, mediaSessionRevision, subscribeMediaSession } from '@/lib/media-session';
import type { DisplayMedia, MediaAsset, MediaDraft, MediaParent } from '@/lib/media-contract';

const columns =
  'id,owner_profile_id,parent_type,parent_id,media_type,storage_path,poster_path,mime_type,byte_size,width,height,duration_seconds,sort_order,alt_text,processing_status,moderation_status,created_at,updated_at';
export async function mediaEnabled() {
  const revision = mediaSessionRevision();
  const { data, error } = await supabase
    .from('feature_flags')
    .select('enabled')
    .eq('key', 'shared_media_uploads')
    .maybeSingle();
  assertMediaSession(revision);
  return !error && data?.enabled === true;
}

async function uploadFile(
  path: string,
  uri: string,
  mime: string,
  progress: (value: number) => void,
  revision: number,
) {
  assertMediaSession(revision);
  const { data, error } = await supabase.storage.from('media-originals').createSignedUploadUrl(path);
  if (error || !data) throw new Error('Could not start the upload. Check your connection and retry.');
  assertMediaSession(revision);
  if (Platform.OS !== 'web') {
    const task = FileSystem.createUploadTask(
      data.signedUrl,
      uri,
      {
        httpMethod: 'PUT',
        uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
        sessionType: FileSystem.FileSystemSessionType.FOREGROUND,
        headers: { 'Content-Type': mime, 'x-upsert': 'false' },
      },
      ({ totalBytesSent, totalBytesExpectedToSend }) =>
        progress(totalBytesExpectedToSend ? totalBytesSent / totalBytesExpectedToSend : 0),
    );
    const unsubscribe = subscribeMediaSession(() => {
      void task.cancelAsync();
    });
    const timeout = setTimeout(() => {
      void task.cancelAsync();
    }, 90_000);
    try {
      const result = await task.uploadAsync();
      assertMediaSession(revision);
      if (
        !result ||
        (result.status >= 300 && !(result.status === 409 || /already exists|duplicate/i.test(result.body)))
      )
        throw new Error('Upload interrupted. Your text is safe; tap Retry.');
    } finally {
      clearTimeout(timeout);
      unsubscribe();
    }
  } else {
    // Blob + XHR provides real byte progress in the browser; native uses the
    // file upload task above and does not base64-copy entire videos into JS.
    const blob = await (await fetch(uri)).blob();
    assertMediaSession(revision);
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const unsubscribe = subscribeMediaSession(() => xhr.abort());
      xhr.open('PUT', data.signedUrl);
      xhr.setRequestHeader('Content-Type', mime);
      xhr.setRequestHeader('x-upsert', 'false');
      xhr.timeout = 90_000;
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) progress(event.loaded / event.total);
      };
      xhr.onload = () => {
        unsubscribe();
        if (xhr.status < 300 || xhr.status === 409 || /already exists|duplicate/i.test(xhr.responseText)) resolve();
        else reject(new Error('Upload interrupted. Tap Retry.'));
      };
      xhr.onerror =
        xhr.ontimeout =
        xhr.onabort =
          () => {
            unsubscribe();
            reject(new Error('Upload interrupted. Your text is safe; tap Retry.'));
          };
      xhr.send(blob);
    });
  }
  assertMediaSession(revision);
}

export async function uploadMediaDraft(
  parent: MediaParent,
  draft: MediaDraft,
  update: (patch: Partial<MediaDraft>) => void,
) {
  const revision = mediaSessionRevision();
  const { data, error } = await supabase.rpc('begin_media_upload', {
    surface: parent,
    kind: draft.kind,
    upload_id: draft.id,
  });
  assertMediaSession(revision);
  if (error || !data) throw new Error(error?.message ?? 'Could not start this upload.');
  const asset = data as MediaAsset;
  if (asset.processing_status === 'ready') {
    update({ status: 'ready', progress: 1, error: undefined });
    return draft.id;
  }
  update({ status: 'uploading', progress: 0, error: undefined });
  await uploadFile(
    asset.storage_path,
    draft.uri,
    asset.mime_type,
    (progress) => update({ progress: progress * 0.9 }),
    revision,
  );
  if (draft.kind === 'video')
    await uploadFile(
      `${asset.owner_profile_id}/${asset.id}/poster.jpg`,
      draft.posterUri!,
      'image/jpeg',
      () => {},
      revision,
    );
  update({ status: 'processing', progress: 0.95 });
  const controller = new AbortController();
  const unsubscribe = subscribeMediaSession(() => controller.abort());
  const timeout = setTimeout(() => controller.abort(), 45_000);
  const { data: result, error: processingError } = await supabase.functions
    .invoke('process-media', {
      body: { assetId: draft.id },
      signal: controller.signal,
    })
    .finally(() => {
      clearTimeout(timeout);
      unsubscribe();
    });
  assertMediaSession(revision);
  if (processingError || result?.status !== 'ready') {
    let message = result?.error;
    if (!message && processingError && 'context' in processingError) {
      try {
        message = (await (processingError.context as Response).json()).error;
      } catch {
        /* Use bounded user-facing fallback. */
      }
    }
    throw new Error(message || 'Media could not be processed. Your text is safe; tap Retry.');
  }
  update({ status: 'ready', progress: 1, error: undefined });
  return draft.id;
}

export async function attachMedia(parent: MediaParent, parentId: string, ids: string[], replace = false) {
  if (!ids.length && !replace) return;
  const revision = mediaSessionRevision();
  const { error } = await supabase.rpc('attach_media', {
    surface: parent,
    target: parentId,
    asset_ids: ids,
    replace_existing: replace,
  });
  assertMediaSession(revision);
  if (error) throw new Error('Could not save the attachments. Your text and uploads are safe; retry.');
}
export async function removeMedia(id: string) {
  const revision = mediaSessionRevision();
  const { error } = await supabase.rpc('remove_media', { asset_id: id });
  assertMediaSession(revision);
  if (error) throw new Error('Could not remove this attachment. Check your connection and retry.');
}
export async function listMedia(parent: MediaParent, parentIds: string[]): Promise<DisplayMedia[]> {
  if (!parentIds.length) return [];
  const revision = mediaSessionRevision();
  const { data, error } = await supabase
    .from('media_assets')
    .select(columns)
    .eq('parent_type', parent)
    .in('parent_id', parentIds)
    .eq('processing_status', 'ready')
    .order('sort_order');
  assertMediaSession(revision);
  if (error) throw new Error('Media is temporarily unavailable.');
  const assets = (data ?? []) as MediaAsset[];
  if (!assets.length) return [];
  const paths = assets.flatMap((a) => (a.poster_path ? [a.storage_path, a.poster_path] : [a.storage_path]));
  const { data: signed, error: signError } = await supabase.storage.from('shared-media').createSignedUrls(paths, 60);
  assertMediaSession(revision);
  if (signError) throw new Error('Media is temporarily unavailable.');
  const urls = new Map((signed ?? []).filter((x) => !x.error).map((x) => [x.path, x.signedUrl]));
  const expiresAt = Date.now() + 55_000;
  return assets.flatMap((asset) =>
    urls.get(asset.storage_path)
      ? [
          {
            ...asset,
            url: urls.get(asset.storage_path)!,
            posterUrl: asset.poster_path ? urls.get(asset.poster_path) : undefined,
            expiresAt,
          },
        ]
      : [],
  );
}

/** Read the selected file's size without base64-copying native video bytes. */
export async function localMediaByteSize(uri: string) {
  return Platform.OS === 'web' ? (await (await fetch(uri)).blob()).size : new File(uri).size;
}
