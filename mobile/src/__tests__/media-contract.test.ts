import { mediaLimits, validateMediaDrafts, type MediaDraft } from '@/lib/media-contract';
import {
  assertMediaSession,
  invalidateMediaSession,
  mediaSessionRevision,
  subscribeMediaSession,
} from '@/lib/media-session';

const image: MediaDraft = {
  id: 'one',
  kind: 'image',
  uri: 'file:///photo.jpg',
  width: 512,
  height: 512,
  bytes: 1024,
  status: 'selected',
  progress: 0,
};
const video: MediaDraft = {
  ...image,
  id: 'two',
  kind: 'video',
  uri: 'file:///clip.mp4',
  posterUri: 'file:///poster.jpg',
  seconds: 12,
};
describe('shared media selection and account isolation', () => {
  it('accepts photos/video for each permitted surface while keeping reports out', () => {
    for (const [parent, policy] of Object.entries(mediaLimits)) {
      const key = parent as keyof typeof mediaLimits;
      if (policy.images) expect(validateMediaDrafts(key, [image])).toBeUndefined();
      if (policy.videos) expect(validateMediaDrafts(key, [video])).toBeUndefined();
    }
    expect(mediaLimits).not.toHaveProperty('report');
  });
  it('enforces separate image/video counts and rejects invalid dimensions, size and duration', () => {
    expect(validateMediaDrafts('profile', [video])).toBeTruthy();
    expect(validateMediaDrafts('service_request', [video, { ...video, id: 'three' }])).toBeTruthy();
    for (const change of [{ width: 0 }, { height: 1921 }, { bytes: 0 }, { bytes: 7 * 1024 * 1024 }])
      expect(validateMediaDrafts('profile', [{ ...image, ...change }])).toBeTruthy();
    for (const seconds of [0, NaN, 31])
      expect(validateMediaDrafts('service_request', [{ ...video, seconds }])).toBeTruthy();
  });
  it('invalidates pending uploads and visible media synchronously at account transition', () => {
    const previous = mediaSessionRevision();
    const cancelled = jest.fn();
    const stop = subscribeMediaSession(cancelled);
    invalidateMediaSession();
    expect(cancelled).toHaveBeenCalledTimes(1);
    expect(() => assertMediaSession(previous)).toThrow('account changed');
    expect(() => assertMediaSession(mediaSessionRevision())).not.toThrow();
    stop();
  });
});
