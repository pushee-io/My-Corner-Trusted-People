// A native camera/picker temporarily backgrounds the app. Its editor must stay
// mounted until the result returns; account/route invalidation still wins.
import { mediaSessionRevision } from './media-session';

const active = new Map<object, number>();
export function beginMediaPickerActivity() {
  const operation = {};
  active.set(operation, mediaSessionRevision());
  return () => {
    active.delete(operation);
  };
}
export function isMediaPickerActive() {
  return [...active.values()].some((revision) => revision === mediaSessionRevision());
}
