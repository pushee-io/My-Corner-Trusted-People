import { createElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { reputationSignals } from '@/lib/reputation-signals';
import { VerifiedProviderBadge, TrustSignals } from '@/components/TrustSignals';
jest.mock('react-native', () => ({ View: 'View', Text: 'Text', StyleSheet: { create: (s: unknown) => s } }));
jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Icon' }));
let view: ReactTestRenderer;
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
});
afterEach(async () => {
  await act(async () => view?.unmount());
});
it('does not label an unverified provider as verified', async () => {
  await act(async () => {
    view = create(createElement(VerifiedProviderBadge, { phoneVerified: false }));
  });
  expect(view.toJSON()).toBeNull();
  await act(async () => {
    view.update(createElement(VerifiedProviderBadge, { phoneVerified: true }));
  });
  expect(JSON.stringify(view.toJSON())).toContain('Phone verified');
  expect(JSON.stringify(view.toJSON())).not.toContain('Verified provider');
});
it('retains exact trust evidence values, including an unavailable response metric', async () => {
  await act(async () => {
    view = create(
      createElement(TrustSignals, {
        signals: [
          { id: 'response', label: 'Response rate', value: 'Not enough data' },
          { id: 'jobs', label: 'Completed jobs', value: '0' },
        ],
      }),
    );
  });
  const output = JSON.stringify(view.toJSON());
  expect(output).toContain('Not enough data');
  expect(output).toContain('Completed jobs: 0');
  expect(output).not.toContain('100%');
});

it('uses only supplied reputation evidence, preserving zero values and unknowns', () => {
  expect(reputationSignals(undefined)).toEqual([]);
  expect(reputationSignals({ average: 0, verifiedCount: 0, completedJobs: 0, recommendationPercent: null })).toEqual([
    { id: 'reviews', label: 'Verified reviews', value: 'No verified reviews yet.' },
    { id: 'jobs', label: 'Confirmed My Corner jobs', value: '0' },
  ]);
  const evidence = reputationSignals({ average: 4.5, verifiedCount: 2, recommendationPercent: 0 });
  expect(evidence).toContainEqual({ id: 'reviews', label: 'Verified reviews', value: '4.5 / 5 · 2 verified reviews' });
  expect(evidence).toContainEqual({ id: 'recommend', label: 'Would recommend', value: '0%' });
  expect(JSON.stringify(evidence)).not.toMatch(/Phone verified|Confirmed My Corner jobs|100%/);
});
