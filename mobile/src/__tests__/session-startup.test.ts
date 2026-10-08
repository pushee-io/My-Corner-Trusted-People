import { createElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { Pressable, Text } from 'react-native';
import { router } from 'expo-router';
import Welcome from '../../app/index';
import { restoreSessionProfile, SessionReauthenticationRequired } from '@/lib/auth';
jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  Pressable: 'Pressable',
  ActivityIndicator: 'Spinner',
  StyleSheet: { create: (v: unknown) => v },
  useWindowDimensions: () => ({ width: 400, fontScale: 1 }),
}));
jest.mock('expo-router', () => ({ router: { replace: jest.fn(), push: jest.fn() } }));
jest.mock('@/components/Screen', () => ({ Screen: ({ children }: { children: unknown }) => children }));
jest.mock('@/lib/auth', () => ({
  restoreSessionProfile: jest.fn(),
  SessionReauthenticationRequired: class extends Error {},
}));
let view: ReactTestRenderer;
beforeEach(() => {
  jest.clearAllMocks();
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
});
afterEach(async () => {
  await act(async () => view?.unmount());
});
const texts = () =>
  view.root
    .findAllByType(Text)
    .map((t) => t.children.join(''))
    .join(' ');
it('holds the hydration screen until the persisted session resolves, then opens the authenticated route', async () => {
  let resolve!: (value: unknown) => void;
  jest.mocked(restoreSessionProfile).mockReturnValue(
    new Promise((done) => {
      resolve = done;
    }) as never,
  );
  await act(async () => {
    view = create(createElement(Welcome));
  });
  expect(texts()).toContain('Restoring your session');
  expect(texts()).not.toContain('Enter My Corner');
  await act(async () => resolve({ role: 'requester' }));
  expect(router.replace).toHaveBeenCalledWith('/neighborhood');
});
it('shows Retry rather than sign-in on profile/backend failure and restores on retry', async () => {
  jest
    .mocked(restoreSessionProfile)
    .mockRejectedValueOnce(new Error('temporary backend failure'))
    .mockResolvedValueOnce({ role: 'requester' } as never);
  await act(async () => {
    view = create(createElement(Welcome));
  });
  expect(texts()).toContain('Try again');
  expect(texts()).not.toContain('Enter My Corner');
  expect(router.replace).not.toHaveBeenCalled();
  await act(async () => view.root.findByType(Pressable).props.onPress());
  expect(router.replace).toHaveBeenCalledWith('/neighborhood');
});
it.each(['signed out', 'revoked'])('opens authentication only for %s', async (kind) => {
  if (kind === 'revoked') jest.mocked(restoreSessionProfile).mockRejectedValue(new SessionReauthenticationRequired());
  else jest.mocked(restoreSessionProfile).mockResolvedValue(null);
  await act(async () => {
    view = create(createElement(Welcome));
  });
  expect(texts()).toContain('Enter My Corner');
  expect(router.replace).not.toHaveBeenCalled();
});
