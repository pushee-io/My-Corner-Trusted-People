import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from '@/lib/supabase';
import { listMedia, removeMedia, uploadMediaDraft } from '@/lib/media-repository';
import { invalidateMediaSession } from '@/lib/media-session';
import type { MediaDraft } from '@/lib/media-contract';

jest.mock('react-native', () => ({ Platform: { OS: 'android' } }));
jest.mock('expo-file-system', () => ({ File: jest.fn() }));
jest.mock('expo-file-system/legacy', () => ({
  createUploadTask: jest.fn(),
  FileSystemUploadType: { BINARY_CONTENT: 0 },
  FileSystemSessionType: { FOREGROUND: 0 },
}));
jest.mock('@/lib/supabase', () => ({
  supabase: { rpc: jest.fn(), from: jest.fn(), storage: { from: jest.fn() }, functions: { invoke: jest.fn() } },
}));

const client = supabase as unknown as {
  rpc: jest.Mock;
  from: jest.Mock;
  storage: { from: jest.Mock };
  functions: { invoke: jest.Mock };
};
const uploadTask = jest.mocked(FileSystem.createUploadTask);
const draft: MediaDraft = {
  id: 'fictional-asset',
  kind: 'image',
  uri: 'file:///test/photo.jpg',
  width: 640,
  height: 480,
  bytes: 1000,
  status: 'selected',
  progress: 0,
};
const asset = {
  id: draft.id,
  owner_profile_id: 'fictional-owner',
  storage_path: 'fictional-owner/fictional-asset/media.jpg',
  mime_type: 'image/jpeg',
  processing_status: 'uploading',
};
const storage = { createSignedUploadUrl: jest.fn(), createSignedUrls: jest.fn() };
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

beforeEach(() => {
  jest.resetAllMocks();
  invalidateMediaSession();
  client.rpc.mockResolvedValue({ data: asset, error: null });
  client.storage.from.mockReturnValue(storage);
  storage.createSignedUploadUrl.mockResolvedValue({
    data: { signedUrl: 'https://example.invalid/signed-upload' },
    error: null,
  });
  uploadTask.mockReturnValue({
    uploadAsync: jest.fn().mockResolvedValue({ status: 200, body: '' }),
    cancelAsync: jest.fn().mockResolvedValue(undefined),
  } as unknown as ReturnType<typeof FileSystem.createUploadTask>);
  client.functions.invoke.mockResolvedValue({ data: { status: 'ready' }, error: null });
});

it('reports ready only after server processing and uses the same upload id when retrying', async () => {
  client.functions.invoke.mockResolvedValueOnce({ data: { error: 'Processing interrupted.' }, error: null });
  const update = jest.fn();
  await expect(uploadMediaDraft('neighborhood_post', draft, update)).rejects.toThrow('Processing interrupted');
  expect(update).not.toHaveBeenCalledWith(expect.objectContaining({ status: 'ready' }));
  uploadTask.mockReturnValue({
    uploadAsync: jest.fn().mockResolvedValue({ status: 409, body: 'Duplicate' }),
    cancelAsync: jest.fn().mockResolvedValue(undefined),
  } as unknown as ReturnType<typeof FileSystem.createUploadTask>);
  await expect(uploadMediaDraft('neighborhood_post', draft, update)).resolves.toBe(draft.id);
  expect(client.rpc.mock.calls.map((call) => call[1].upload_id)).toEqual([draft.id, draft.id]);
  expect(update).toHaveBeenLastCalledWith({ status: 'ready', progress: 1, error: undefined });
});

it('does not re-upload or reprocess an already-ready retry', async () => {
  client.rpc.mockResolvedValue({ data: { ...asset, processing_status: 'ready' }, error: null });
  await expect(uploadMediaDraft('neighborhood_post', draft, jest.fn())).resolves.toBe(draft.id);
  expect(uploadTask).not.toHaveBeenCalled();
  expect(client.functions.invoke).not.toHaveBeenCalled();
});

it('rejects ordinary upload failures without publishing or processing', async () => {
  uploadTask.mockReturnValue({
    uploadAsync: jest.fn().mockResolvedValue({ status: 503, body: 'Unavailable' }),
    cancelAsync: jest.fn().mockResolvedValue(undefined),
  } as unknown as ReturnType<typeof FileSystem.createUploadTask>);
  await expect(uploadMediaDraft('neighborhood_post', draft, jest.fn())).rejects.toThrow('Your text is safe');
  expect(client.functions.invoke).not.toHaveBeenCalled();
  expect(draft.status).toBe('selected');
});

it('cancels a native upload synchronously when the account changes', async () => {
  const started = deferred<void>();
  const pending = deferred<null>();
  const cancel = jest.fn(async () => {
    pending.resolve(null);
  });
  uploadTask.mockReturnValue({
    uploadAsync: jest.fn(() => {
      started.resolve();
      return pending.promise;
    }),
    cancelAsync: cancel,
  } as unknown as ReturnType<typeof FileSystem.createUploadTask>);
  const update = jest.fn();
  const result = uploadMediaDraft('neighborhood_post', draft, update);
  const rejected = expect(result).rejects.toThrow('Your account changed');
  await started.promise;
  invalidateMediaSession();
  expect(cancel).toHaveBeenCalledTimes(1);
  await rejected;
  expect(client.functions.invoke).not.toHaveBeenCalled();
  expect(update).not.toHaveBeenCalledWith(expect.objectContaining({ status: 'ready' }));
});

it('aborts processing and rejects its late success after an account change', async () => {
  const started = deferred<AbortSignal>();
  const pending = deferred<{ data: { status: string }; error: null }>();
  client.functions.invoke.mockImplementation((_name, options) => {
    started.resolve(options.signal);
    return pending.promise;
  });
  const update = jest.fn();
  const result = uploadMediaDraft('neighborhood_post', draft, update);
  const rejected = expect(result).rejects.toThrow('Your account changed');
  const signal = await started.promise;
  invalidateMediaSession();
  expect(signal.aborted).toBe(true);
  pending.resolve({ data: { status: 'ready' }, error: null });
  await rejected;
  expect(update).not.toHaveBeenCalledWith(expect.objectContaining({ status: 'ready' }));
});

it('does not reveal signed URLs returned after an account switch', async () => {
  const query = { select: jest.fn(), eq: jest.fn(), in: jest.fn(), order: jest.fn() };
  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  query.in.mockReturnValue(query);
  query.order.mockResolvedValue({ data: [{ ...asset, processing_status: 'ready' }], error: null });
  client.from.mockReturnValue(query);
  const started = deferred<void>();
  const pending = deferred<{ data: { path: string; signedUrl: string }[]; error: null }>();
  storage.createSignedUrls.mockImplementation(() => {
    started.resolve();
    return pending.promise;
  });
  const result = listMedia('neighborhood_post', ['fictional-parent']);
  const rejected = expect(result).rejects.toThrow('Your account changed');
  await started.promise;
  invalidateMediaSession();
  pending.resolve({ data: [{ path: asset.storage_path, signedUrl: 'https://example.invalid/private' }], error: null });
  await rejected;
});

it('rejects late deletion completion across accounts', async () => {
  const pending = deferred<{ error: null }>();
  client.rpc.mockReturnValue(pending.promise);
  const result = removeMedia(draft.id);
  const rejected = expect(result).rejects.toThrow('Your account changed');
  invalidateMediaSession();
  pending.resolve({ error: null });
  await rejected;
});
