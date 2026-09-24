import { createElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { router } from 'expo-router';
import Providers from '../../app/hire/providers';
import ProviderProfile from '../../app/hire/provider/[providerId]';
import { VerifiedReviews, ProviderReputationSummary } from '@/components/VerifiedReviews';
import { loadReputation, verifiedReviewCount, type Reputation } from '@/lib/reviews';

const mockProvider = {
  id: 'provider',
  name: 'QA PipeCare',
  categoryIds: ['plumbing'],
  trustSignals: [],
  neighborhood: 'QA',
  areaLabel: 'General area',
  headline: 'Plumbing',
};
let mockData: Reputation;
jest.mock('react-native', () => ({
  Text: 'Text',
  View: 'View',
  TextInput: 'TextInput',
  Pressable: 'Pressable',
  StyleSheet: { create: (s: unknown) => s },
}));
jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
  useLocalSearchParams: () => ({ providerId: 'provider', categoryId: 'plumbing' }),
}));
jest.mock('@/components/Screen', () => ({ Screen: ({ children }: { children: unknown }) => children }));
jest.mock('@/components/WebSafeLink', () => ({ WebSafeLink: 'WebSafeLink' }));
jest.mock('@/components/media/MediaAvatar', () => ({ MediaAvatar: () => null }));
jest.mock('@/components/StateBlocks', () => ({
  EmptyState: 'EmptyState',
  ErrorState: 'ErrorState',
  OfflineBanner: 'OfflineBanner',
}));
jest.mock('@/lib/repository', () => ({ getProvider: async () => mockProvider }));
jest.mock('@/lib/day2b-read-repository', () => ({
  loadDay2BProvidersByCategory: async () => ({ items: [mockProvider], fromCache: false }),
}));
jest.mock('@/lib/reviews', () => ({
  ...jest.requireActual('@/lib/reviews'),
  loadReputation: jest.fn(async () => mockData),
}));
jest.mock('@/lib/supabase', () => ({ supabase: { rpc: jest.fn() } }));
jest.mock('@/hooks/useProtectedResource', () => ({
  useProtectedResource: (load: () => Promise<unknown>) => {
    const { useEffect } = jest.requireActual<typeof import('react')>('react');
    useEffect(() => {
      void load();
    }, [load]);
    return { data: mockData, loading: false, refresh: jest.fn() };
  },
}));
let renderer: ReactTestRenderer;
const review = {
  id: 'review',
  rating: 4,
  title: 'Professional and responsive',
  body: 'Communicated clearly and completed the work.',
  recommends: true,
  author: 'Ama K.',
  createdAt: '2026-09-23',
  updatedAt: '2026-09-23',
  canRespond: false,
  response: 'Thank you for choosing us.',
};
async function render(element: ReturnType<typeof createElement>) {
  await act(async () => {
    renderer = create(element);
  });
}
function output() {
  return JSON.stringify(renderer.toJSON());
}
async function press(label: string) {
  const button = renderer.root
    .findAllByType('Pressable' as never)
    .find((n) => n.findAllByType('Text' as never).some((t) => t.children.join('') === label));
  expect(button).toBeDefined();
  await act(async () => button!.props.onPress());
}
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  jest.clearAllMocks();
  mockData = {
    average: 4,
    count: 1,
    completedJobs: 1,
    recommendationPercent: null,
    reviews: [review],
    nextCursor: null,
  };
});
afterEach(async () => {
  if (renderer) await act(async () => renderer.unmount());
});
it('opens the actual profile when a neighbor taps a provider card', async () => {
  await render(createElement(Providers));
  const card = renderer.root
    .findAllByType('Pressable' as never)
    .find((n) => n.props.accessibilityLabel?.startsWith('QA PipeCare'));
  await act(async () => card!.props.onPress());
  expect(router.push).toHaveBeenCalledWith({
    pathname: '/hire/provider/[providerId]',
    params: { providerId: 'provider', categoryId: 'plumbing' },
  });
});
it('renders the review, badge, recommendation and matching response on the actual provider route', async () => {
  await render(createElement(ProviderProfile));
  for (const value of [
    'Reviews',
    'Professional and responsive',
    'Communicated clearly',
    'Verified Job',
    'Ama K.',
    'Thank you for choosing us.',
    'Provider response',
    'Would recommend to a neighbor: ',
    'Yes',
    '★★★★',
    '1 verified review',
  ])
    expect(output()).toContain(value);
  expect(output()).not.toContain('1 verified reviews');
  expect(renderer.root.findByProps({ accessibilityLabel: '4 out of 5 stars' })).toBeDefined();
  const link = renderer.root.findByType('WebSafeLink' as never);
  expect(link.props.href).toEqual({
    pathname: '/hire/request/new',
    params: { providerId: 'provider', categoryId: 'plumbing' },
  });
});
it.each([
  [1, '1 verified review'],
  [2, '2 verified reviews'],
  [12, '12 verified reviews'],
])('uses correct grammar for %s', (count, label) => expect(verifiedReviewCount(count as number)).toBe(label));
it('shows an honest zero state without a rating', async () => {
  mockData = { ...mockData, average: 0, count: 0, reviews: [] };
  await render(createElement(VerifiedReviews, { providerId: 'provider' }));
  expect(output()).toContain('No verified reviews yet.');
  expect(output()).not.toContain('out of 5');
});
it('does not request review history for a summary card', async () => {
  await render(createElement(ProviderReputationSummary, { providerId: 'provider' }));
  expect(loadReputation).toHaveBeenCalledWith('provider');
});
it('loads recent reviews then bounded newest-first pages using server cursors', async () => {
  mockData = { ...mockData, count: 12, nextCursor: { createdAt: '2026-09-23', id: 'review' } };
  await render(createElement(VerifiedReviews, { providerId: 'provider' }));
  expect(loadReputation).toHaveBeenLastCalledWith('provider', 3, undefined);
  await press('See all reviews');
  expect(loadReputation).toHaveBeenLastCalledWith('provider', 10, undefined);
  await press('Older reviews');
  expect(loadReputation).toHaveBeenLastCalledWith('provider', 10, mockData.nextCursor);
  await press('Newest reviews');
  expect(loadReputation).toHaveBeenLastCalledWith('provider', 10, undefined);
});
it('renders a negative recommendation and no unrelated response', async () => {
  mockData = { ...mockData, reviews: [{ ...review, recommends: false, response: undefined }] };
  await render(createElement(VerifiedReviews, { providerId: 'provider' }));
  expect(output()).toContain('No');
  expect(output()).not.toContain('Provider response');
});
