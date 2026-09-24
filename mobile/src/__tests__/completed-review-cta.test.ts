import { createElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { router } from 'expo-router';
import Safety from '../../app/hire/request/safety-session';
import ReviewScreen from '../../app/reviews/write';
import { loadReviewJob, submitReview } from '@/lib/reviews';
let mockSession: Record<string, unknown>;
let mockReview: Record<string, unknown>;
jest.mock('react-native', () => ({
  Text: 'Text',
  View: 'View',
  TextInput: 'TextInput',
  Pressable: 'Pressable',
  StyleSheet: { create: (s: unknown) => s },
}));
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: jest.fn(() => true) },
  useLocalSearchParams: () => ({ requestId: 'job' }),
}));
jest.mock('@/components/Screen', () => ({ Screen: ({ children }: { children: unknown }) => children }));
jest.mock('@/components/WebSafeLink', () => ({ WebSafeLink: 'WebSafeLink' }));
jest.mock('@/components/StateBlocks', () => ({ EmptyState: 'EmptyState' }));
jest.mock('@/lib/job-safety-repository', () => ({ getJobSafetySession: async () => mockSession }));
jest.mock('@/lib/reviews', () => ({
  loadReviewJob: jest.fn(async () => mockReview),
  reviewApi: jest.fn(async () => ({})),
  submitReview: jest.fn(async () => ({ status: 'clean' })),
}));
jest.mock('@/hooks/useProtectedResource', () => ({
  useProtectedResource: (load: () => Promise<unknown>) => {
    const React = jest.requireActual<typeof import('react')>('react');
    const [data, setData] = React.useState<unknown>();
    React.useEffect(() => {
      void load().then(setData);
    }, [load]);
    return { data, refresh: async () => setData(await load()) };
  },
}));
let renderer: ReactTestRenderer;
async function render(screen = Safety) {
  await act(async () => {
    renderer = create(createElement(screen));
  });
}
const output = () => JSON.stringify(renderer.toJSON());
async function press(label: string) {
  const b = renderer.root
    .findAllByType('Pressable' as never)
    .find((n) => n.findAllByType('Text' as never).some((t) => t.children.join('') === label));
  expect(b).toBeDefined();
  await act(async () => b!.props.onPress());
}
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  jest.clearAllMocks();
  mockSession = { jobRequestId: 'job', viewerRole: 'requester', state: 'completed' };
  mockReview = {
    providerName: 'Example Plumbing',
    providerId: 'provider',
    completed: true,
    canReview: true,
    canEdit: false,
  };
});
afterEach(async () => {
  if (renderer) await act(async () => renderer.unmount());
});
it('completed requester sees dynamic CTA and the correct job route', async () => {
  await render();
  expect(output()).toContain('Session complete');
  await press('Review Example Plumbing');
  expect(loadReviewJob).toHaveBeenCalledWith('job');
  expect(router.push).toHaveBeenCalledWith({ pathname: '/reviews/write', params: { requestId: 'job' } });
});
it.each([
  ['provider', 'completed'],
  ['requester', 'active'],
])('no requester review data for %s/%s', async (viewerRole, state) => {
  mockSession = { ...mockSession, viewerRole, state };
  await render();
  expect(loadReviewJob).not.toHaveBeenCalled();
  expect(output()).not.toContain('Review Example Plumbing');
});
it('honors server refusal even when session is complete', async () => {
  mockReview = { ...mockReview, completed: false, canReview: false };
  await render();
  expect(output()).not.toContain('Review Example Plumbing');
});
it.each([true, false])('existing review replaces duplicate CTA (editable %s)', async (canEdit) => {
  mockReview = {
    ...mockReview,
    canReview: false,
    canEdit,
    review: { rating: 4, title: 'Good work', body: 'Careful work.', recommends: true, status: 'clean' },
  };
  await render();
  expect(output()).not.toContain('Review Example Plumbing');
  await press(canEdit ? 'View / Edit Review' : 'View your review');
});
it('saved review shows confirmation and Done returns to originating session', async () => {
  await render(ReviewScreen);
  await press('Submit review');
  expect(submitReview).toHaveBeenCalledTimes(1);
  expect(output()).toContain('Thanks for helping neighbors make informed decisions.');
  expect(output()).not.toContain('Submit review');
  await press('Done');
  expect(router.back).toHaveBeenCalled();
});
it('locked existing review is readable without editor', async () => {
  mockReview = {
    ...mockReview,
    canReview: false,
    review: { rating: 4, title: 'Careful plumbing', body: 'Good communication.', recommends: true, status: 'clean' },
  };
  await render(ReviewScreen);
  expect(output()).toContain('Careful plumbing');
  expect(output()).not.toContain('Submit review');
});
