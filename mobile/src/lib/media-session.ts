// No URLs, blobs or credentials persist across an explicit account transition.
let revision = 0;
const listeners = new Set<() => void>();
export function mediaSessionRevision() {
  return revision;
}
export function invalidateMediaSession() {
  revision += 1;
  listeners.forEach((listener) => listener());
}
export function subscribeMediaSession(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
export function assertMediaSession(expected: number) {
  if (revision !== expected) throw new Error('Your account changed. Choose the media again.');
}
