import { validateReview, submitReview } from '../lib/reviews';
const mockRpc = jest.fn();
jest.mock('../lib/supabase', () => ({ supabase: { rpc: (...args: unknown[]) => mockRpc(...args) } }));
const valid = { rating: 4, title: 'Good repair', body: 'Clear communication and careful work.', recommends: true };
describe('verified review input and submission', () => {
  beforeEach(() => mockRpc.mockReset());
  it.each([0, 6, 2.5, NaN])('rejects invalid star value %s', (rating) => {
    expect(validateReview({ ...valid, rating })).toBeDefined();
  });
  it('requires an explicit recommendation and meaningful content', () => {
    expect(validateReview({ ...valid, recommends: null })).toBeDefined();
    expect(validateReview({ ...valid, body: 'short' })).toBeDefined();
    expect(validateReview({ ...valid, title: '<b>title</b>' })).toBeDefined();
    expect(validateReview(valid)).toBeUndefined();
  });
  it('does not send invalid content and trims plain text before sending', async () => {
    await expect(submitReview('job', { ...valid, rating: 0 })).rejects.toThrow();
    expect(mockRpc).not.toHaveBeenCalled();
    mockRpc.mockResolvedValue({ data: { id: 'review', status: 'clean' }, error: null });
    await submitReview('job', { ...valid, title: '  Good repair  ' });
    expect(mockRpc).toHaveBeenCalledWith('review_api', { action: 'submit', target: 'job', payload: valid });
  });
  it('preserves server rejection, so client eligibility cannot bypass completed-job rules', async () => {
    mockRpc.mockResolvedValue({
      data: null,
      error: { code: '42501', message: 'Only your completed job can be reviewed.' },
    });
    await expect(submitReview('job', valid)).rejects.toThrow('completed job');
  });
});
