import { createElement, Fragment } from 'react';
import { act, create, type ReactTestRenderer, type ReactTestInstance } from 'react-test-renderer';
import { Alert, Image, Pressable, Text, TextInput } from 'react-native';
import { router, Stack, useGlobalSearchParams, useLocalSearchParams, usePathname } from 'expo-router';
import RequestLayout from '../../app/hire/request/_layout';
import NewRequest from '../../app/hire/request/new';
import ReviewRequest from '../../app/hire/request/review';
import { structureServiceRequest } from '@/lib/ai';
import { pickMedia } from '@/lib/media-picker';
import { attachMedia, mediaEnabled, uploadMediaDraft } from '@/lib/media-repository';
import { releaseLocalMedia } from '@/lib/media-local-files';
import { createJobRequest } from '@/lib/repository';
import { invalidateMediaSession } from '@/lib/media-session';
import { trustAcknowledgementText } from '@/components/TrustAcknowledgement';
import type { MediaDraft } from '@/lib/media-contract';

jest.mock('react-native', () => ({
  Alert: { alert: jest.fn() },
  View: 'View',
  Text: 'Text',
  TextInput: 'TextInput',
  Pressable: 'Pressable',
  Image: 'Image',
  StyleSheet: { create: (styles: unknown) => styles },
}));
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn() },
  Stack: jest.fn(),
  useGlobalSearchParams: jest.fn(),
  useLocalSearchParams: jest.fn(),
  usePathname: jest.fn(),
}));
jest.mock('expo-crypto', () => ({ randomUUID: () => '00000000-0000-4000-8000-000000000011' }));
jest.mock('@/components/Screen', () => ({
  Screen: ({ children, footer }: { children: unknown; footer?: unknown }) => [children, footer],
}));
jest.mock('@/components/StateBlocks', () => ({
  OfflineBanner: 'OfflineBanner',
  EmptyState: 'EmptyState',
  SuccessState: 'SuccessState',
}));
jest.mock('@/lib/ai', () => ({ structureServiceRequest: jest.fn() }));
jest.mock('@/lib/analytics', () => ({ trackEvent: jest.fn() }));
jest.mock('@/lib/feature-flags', () => ({ featureFlags: {} }));
jest.mock('@/lib/moderation', () => ({ moderateText: jest.fn() }));
jest.mock('@/lib/mock-data', () => ({ categories: [{ id: 'plumbing', name: 'Plumbing' }] }));
jest.mock('@/lib/session', () => ({ testRequester: { name: 'QA requester', neighborhood: 'East Legon' } }));
jest.mock('@/lib/repository', () => ({
  getProvider: jest.fn(async (id: string) => ({ id, name: 'QA provider', categoryIds: ['plumbing'] })),
  createJobRequest: jest.fn(),
}));
jest.mock('@/lib/media-picker', () => ({ pickMedia: jest.fn() }));
jest.mock('@/lib/media-local-files', () => ({ releaseLocalMedia: jest.fn(async () => {}) }));
jest.mock('@/lib/media-repository', () => ({
  mediaEnabled: jest.fn(),
  uploadMediaDraft: jest.fn(),
  attachMedia: jest.fn(),
  removeMedia: jest.fn(),
}));

const photo: MediaDraft = {
  id: 'qa-photo',
  kind: 'image',
  uri: 'file:///private/photo.jpg',
  width: 640,
  height: 480,
  bytes: 1024,
  status: 'selected',
  progress: 0,
};
const video: MediaDraft = {
  ...photo,
  id: 'qa-video',
  kind: 'video',
  uri: 'file:///private/video.mp4',
  posterUri: 'file:///private/poster.jpg',
  seconds: 14,
};
let renderer: ReactTestRenderer | undefined;
let params: Record<string, string>;
let currentPath: string;
const newPath = '/hire/request/new';
const reviewPath = '/hire/request/review';

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
async function navigate(path: string, next = params) {
  currentPath = path;
  params = next;
  jest.mocked(usePathname).mockReturnValue(path);
  jest.mocked(useLocalSearchParams).mockReturnValue(params);
  jest.mocked(useGlobalSearchParams).mockReturnValue(params);
  await act(async () => {
    if (renderer) renderer.update(createElement(RequestLayout));
    else renderer = create(createElement(RequestLayout));
  });
}
function screen() {
  return renderer!.root.findByType(currentPath === reviewPath ? ReviewRequest : NewRequest);
}
function button(label: string, root = screen()) {
  return root
    .findAllByType(Pressable)
    .find((node) => node.findAllByType(Text).some((text) => text.children.join('').includes(label)))!;
}
async function press(label: string) {
  const target = button(label);
  expect(target).toBeDefined();
  expect(target.props.disabled).not.toBe(true);
  await act(async () => target.props.onPress());
}
function previews(root: ReactTestInstance = screen()) {
  return root.findAllByType(Image).map((node) => node.props.source.uri);
}
function checkbox(root = screen()) {
  return root.findAllByType(Pressable).find((node) => node.props.accessibilityRole === 'checkbox')!;
}
async function toggleAcknowledgement(root = screen()) {
  await act(async () => checkbox(root).props.onPress());
}
async function fillForm(accept = true) {
  await act(async () => {
    screen()
      .findAllByType(TextInput)
      .find((node) => node.props.accessibilityLabel === 'Job title')!
      .props.onChangeText('Repair kitchen sink');
    screen()
      .findAllByType(TextInput)
      .find((node) => node.props.accessibilityLabel === 'Job description')!
      .props.onChangeText('Fictional leak under the sink');
  });
  if (accept) await toggleAcknowledgement();
}
async function chooseBoth() {
  await press('Add media');
  await press('Choose photo');
  await press('Choose video');
}
async function review() {
  await press('Review request');
  const target = jest.mocked(router.push).mock.calls.at(-1)![0] as { pathname: string; params: Record<string, string> };
  // Device file paths and signed URLs never enter navigation parameters.
  expect(JSON.stringify(target)).not.toMatch(/file:|https:|qa-photo|qa-video/);
  await navigate(target.pathname, target.params);
}

beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  jest.clearAllMocks();
  invalidateMediaSession();
  params = { providerId: 'provider-a', categoryId: 'plumbing' };
  // Keep Create mounted behind Review, as the native stack does. The layout,
  // composer, submission and both screens are real; only navigation/native IO
  // are mocked. Changing paths exercises the real layout's scope decisions.
  jest.mocked(Stack).mockImplementation(function StackHarness() {
    const path = usePathname();
    return createElement(
      Fragment,
      null,
      createElement(NewRequest),
      path === reviewPath ? createElement(ReviewRequest) : null,
    );
  });
  jest.mocked(mediaEnabled).mockResolvedValue(true);
  jest
    .mocked(pickMedia)
    .mockImplementation(async (_parent, _source, kind) => ({ ...(kind === 'image' ? photo : video) }));
  jest.mocked(uploadMediaDraft).mockImplementation(async (_parent, draft, progress) => {
    progress?.({ status: 'ready', progress: 1 });
    return draft.id;
  });
  jest.mocked(attachMedia).mockResolvedValue(undefined);
  jest.mocked(createJobRequest).mockResolvedValue({ id: 'saved-request', categoryId: 'plumbing' } as never);
});
afterEach(async () => {
  await act(async () => renderer?.unmount());
  renderer = undefined;
});

test('Create selects real photos/video, Review and Back retain them, and attachment retry creates one request', async () => {
  await navigate(newPath);
  await fillForm();
  await chooseBoth();
  expect(pickMedia).toHaveBeenNthCalledWith(1, 'service_request', 'library', 'image');
  expect(pickMedia).toHaveBeenNthCalledWith(2, 'service_request', 'library', 'video');
  expect(previews()).toEqual([photo.uri, video.posterUri]);
  await review();
  expect(previews()).toEqual([photo.uri, video.posterUri]);
  await navigate(newPath);
  expect(previews()).toEqual([photo.uri, video.posterUri]);
  expect(screen().findAllByType(TextInput)[0].props.value).toBe('Repair kitchen sink');
  await review();
  jest.mocked(attachMedia).mockRejectedValueOnce(new Error('Connection interrupted'));
  await press('Submit request');
  expect(router.replace).not.toHaveBeenCalled();
  expect(previews()).toEqual([photo.uri, video.posterUri]);
  await navigate(newPath);
  expect(
    screen()
      .findAllByType(TextInput)
      .every((node) => node.props.editable === false),
  ).toBe(true);
  expect(button('Add media').props.disabled).toBe(true);
  await review();
  await press('Submit request');
  expect(createJobRequest).toHaveBeenCalledTimes(1);
  expect(createJobRequest).toHaveBeenCalledWith(
    expect.objectContaining({ title: 'Repair kitchen sink', photoCount: 1, providerId: 'provider-a' }),
    '00000000-0000-4000-8000-000000000011',
  );
  expect(attachMedia).toHaveBeenLastCalledWith('service_request', 'saved-request', [photo.id, video.id], false);
  expect(uploadMediaDraft).toHaveBeenCalledTimes(2);
  expect(router.replace).toHaveBeenCalledTimes(1);
  expect(previews()).toEqual([]);
  expect(releaseLocalMedia).toHaveBeenCalledWith([photo.id, video.id]);
});

test('leaving the form and changing accounts discard local attachments', async () => {
  await navigate(newPath);
  await chooseBoth();
  await navigate('/community');
  expect(previews()).toEqual([]);
  expect(releaseLocalMedia).toHaveBeenCalledWith([photo.id, video.id]);
  await navigate(newPath);
  // The controls remain expanded but the previous draft is gone.
  await press('Choose photo');
  expect(previews()).toEqual([photo.uri]);
  await act(async () => invalidateMediaSession());
  expect(previews()).toEqual([]);
});

test('a late picker result from another provider is released without overwriting the new draft', async () => {
  await navigate(newPath);
  const pending = deferred<MediaDraft | null>();
  jest.mocked(pickMedia).mockReturnValueOnce(pending.promise);
  await press('Add media');
  await press('Choose photo');
  await navigate(newPath, { providerId: 'provider-b', categoryId: 'plumbing' });
  await press('Choose video');
  await act(async () => pending.resolve(photo));
  expect(previews()).toEqual([video.posterUri]);
  expect(releaseLocalMedia).toHaveBeenCalledWith([photo.id]);
  expect(button('Choose video').props.disabled).toBe(false);
});

test('leaving during upload prevents a late completion from creating a request', async () => {
  await navigate(newPath);
  await fillForm();
  await chooseBoth();
  await review();
  const pending = deferred<string>();
  jest.mocked(uploadMediaDraft).mockReturnValueOnce(pending.promise);
  // Submit remains pending while navigation changes the active flow.
  let submission!: Promise<void>;
  await act(async () => {
    submission = button('Submit request').props.onPress();
  });
  await navigate('/community');
  // Returning to the same provider is a new draft, not the old async operation.
  await navigate(newPath);
  await act(async () => {
    pending.resolve(photo.id);
    await submission;
  });
  expect(createJobRequest).not.toHaveBeenCalled();
  expect(attachMedia).not.toHaveBeenCalled();
  expect(router.replace).not.toHaveBeenCalled();
});

test('leaving and returning to the same provider rejects an old picker result', async () => {
  await navigate(newPath);
  const pending = deferred<MediaDraft | null>();
  jest.mocked(pickMedia).mockReturnValueOnce(pending.promise);
  await press('Add media');
  await press('Choose photo');
  await navigate('/community');
  await navigate(newPath);
  await act(async () => pending.resolve(photo));
  expect(previews()).toEqual([]);
  expect(releaseLocalMedia).toHaveBeenCalledWith([photo.id]);
});

test('picker cancellation and upload failure preserve form text and selections', async () => {
  await navigate(newPath);
  await fillForm();
  jest.mocked(pickMedia).mockResolvedValueOnce(null);
  await press('Add media');
  await press('Choose photo');
  expect(previews()).toEqual([]);
  await press('Choose photo');
  await review();
  jest.mocked(uploadMediaDraft).mockRejectedValueOnce(new Error('Offline. Retry when connected.'));
  await press('Submit request');
  expect(createJobRequest).not.toHaveBeenCalled();
  await navigate(newPath);
  expect(screen().findAllByType(TextInput)[0].props.value).toBe('Repair kitchen sink');
  expect(previews()).toEqual([photo.uri]);
  await review();
  await press('Submit request');
  expect(createJobRequest).toHaveBeenCalledTimes(1);
});

const aiSuggestion = {
  title: 'Kitchen sink leak',
  description: 'Water is leaking under the sink.',
  urgency: 'flexible' as const,
  missingInfo: [],
  safetyWarning: '',
};
function titleField() {
  return screen()
    .findAllByType(TextInput)
    .find((node) => node.props.accessibilityLabel === 'Job title')!;
}
test('AI suggestions require explicit acceptance, remain editable and never submit', async () => {
  await navigate(newPath);
  await fillForm();
  jest.mocked(structureServiceRequest).mockResolvedValue(aiSuggestion);
  await press('Structure with AI');
  expect(titleField().props.value).toBe('Repair kitchen sink');
  expect(createJobRequest).not.toHaveBeenCalled();
  await press('Use suggested title and description');
  expect(titleField().props.value).toBe('Kitchen sink leak');
  await act(async () => titleField().props.onChangeText('My own edited title'));
  expect(titleField().props.value).toBe('My own edited title');
  expect(createJobRequest).not.toHaveBeenCalled();
});
test('AI failure preserves manual entry and the review flow', async () => {
  await navigate(newPath);
  await fillForm();
  jest.mocked(structureServiceRequest).mockRejectedValue(new Error('Service unavailable; continue manually.'));
  await press('Structure with AI');
  expect(titleField().props.value).toBe('Repair kitchen sink');
  await review();
  expect(currentPath).toBe(reviewPath);
});
test('AI results from a previous account are discarded', async () => {
  await navigate(newPath);
  await fillForm();
  let resolve!: (value: typeof aiSuggestion) => void;
  jest.mocked(structureServiceRequest).mockReturnValue(
    new Promise((yes) => {
      resolve = yes;
    }),
  );
  await act(async () => {
    void button('Structure with AI').props.onPress();
  });
  await act(async () => invalidateMediaSession());
  await act(async () => resolve(aiSuggestion));
  expect(button('Use suggested title and description')).toBeUndefined();
});

it('shows one bordered checkbox, initially unchecked, with full text and no confirmation UI', async () => {
  await navigate(newPath);
  const control = checkbox();
  expect(control.props.accessibilityLabel).toBe(trustAcknowledgementText);
  expect(control.props.accessibilityState).toEqual({ checked: false, disabled: false });
  expect(
    screen()
      .findAllByType(Text)
      .filter((node) => node.children.join('') === trustAcknowledgementText),
  ).toHaveLength(1);
  expect(control.props.style[0]).toMatchObject({ borderWidth: 1, minHeight: 48, padding: 12 });
  expect(button('Review and Accept')).toBeUndefined();
  expect(button('Accepted')).toBeUndefined();
  await toggleAcknowledgement();
  expect(checkbox().props.accessibilityState.checked).toBe(true);
  expect(
    screen()
      .findAllByType(Text)
      .some((node) => node.children.join('') === '✓'),
  ).toBe(true);
  expect(Alert.alert).not.toHaveBeenCalled();
});
it('blocks unchecked continuation even if its disabled handler is called directly', async () => {
  await navigate(newPath);
  await fillForm(false);
  expect(button('Review request').props.disabled).toBe(true);
  await act(async () => button('Review request').props.onPress());
  expect(router.push).not.toHaveBeenCalled();
  await toggleAcknowledgement();
  await review();
  expect(button('Submit request').props.disabled).toBe(false);
});
it('rejects direct Review and acceptance flags injected in route parameters', async () => {
  await navigate(reviewPath, { ...params, acknowledgementAccepted: 'true', trustAccepted: 'true' });
  expect(button('Submit request').props.disabled).toBe(true);
  await act(async () => button('Submit request').props.onPress());
  expect(createJobRequest).not.toHaveBeenCalled();
  expect(uploadMediaDraft).not.toHaveBeenCalled();
});
it('preserves acceptance through Review and Back; unchecking blocks both actions again', async () => {
  await navigate(newPath);
  await fillForm();
  await review();
  expect(button('Submit request').props.disabled).toBe(false);
  await navigate(newPath);
  expect(checkbox().props.accessibilityState.checked).toBe(true);
  await toggleAcknowledgement();
  expect(checkbox().props.accessibilityState.checked).toBe(false);
  expect(button('Review request').props.disabled).toBe(true);
  await navigate(reviewPath);
  expect(button('Submit request').props.disabled).toBe(true);
  await act(async () => button('Submit request').props.onPress());
  expect(createJobRequest).not.toHaveBeenCalled();
  await navigate(newPath);
  await toggleAcknowledgement();
  await review();
  await press('Submit request');
  expect(createJobRequest).toHaveBeenCalledTimes(1);
  expect(router.replace).toHaveBeenCalledWith({
    pathname: '/hire/request/status',
    params: { requestId: 'saved-request' },
  });
});
it('clears on provider/account changes and ignores acceptance callbacks from a previous visit', async () => {
  await navigate(newPath);
  const staleCheck = checkbox().props.onPress;
  await fillForm();
  await navigate(newPath, { providerId: 'provider-b' });
  expect(checkbox().props.accessibilityState.checked).toBe(false);
  await navigate(newPath, { providerId: 'provider-a' });
  await act(async () => staleCheck());
  expect(checkbox().props.accessibilityState.checked).toBe(false);
  await fillForm();
  await act(async () => invalidateMediaSession());
  expect(checkbox().props.accessibilityState.checked).toBe(false);
});
it('rejects a captured submit handler immediately after unchecking before React rerenders', async () => {
  await navigate(newPath);
  await fillForm();
  await review();
  const staleSubmit = button('Submit request').props.onPress;
  const uncheck = checkbox(renderer!.root.findByType(NewRequest)).props.onPress;
  await act(async () => {
    uncheck();
    await staleSubmit();
  });
  expect(createJobRequest).not.toHaveBeenCalled();
  expect(uploadMediaDraft).not.toHaveBeenCalled();
  expect(attachMedia).not.toHaveBeenCalled();
});
it('checks acceptance after asynchronous media upload before creating the request', async () => {
  await navigate(newPath);
  await fillForm();
  await chooseBoth();
  await review();
  const uncheck = checkbox(renderer!.root.findByType(NewRequest)).props.onPress;
  const upload = deferred<string>();
  jest.mocked(uploadMediaDraft).mockReturnValueOnce(upload.promise);
  let pending!: Promise<void>;
  await act(async () => {
    pending = button('Submit request').props.onPress();
  });
  await act(async () => uncheck());
  await act(async () => {
    upload.resolve(photo.id);
    await pending;
  });
  expect(createJobRequest).not.toHaveBeenCalled();
  expect(router.replace).not.toHaveBeenCalled();
});
it('requires acknowledgement again for retrying an already created request attachment', async () => {
  await navigate(newPath);
  await fillForm();
  await chooseBoth();
  await review();
  jest.mocked(attachMedia).mockRejectedValueOnce(new Error('Connection interrupted'));
  await press('Submit request');
  const staleRetry = button('Submit request').props.onPress;
  await navigate(newPath);
  expect(checkbox().props.disabled).toBe(false);
  await act(async () => {
    checkbox().props.onPress();
    await staleRetry();
  });
  expect(attachMedia).toHaveBeenCalledTimes(1);
  await toggleAcknowledgement();
  await review();
  await press('Submit request');
  expect(attachMedia).toHaveBeenCalledTimes(2);
  expect(createJobRequest).toHaveBeenCalledTimes(1);
});
