import { displayError } from '@/lib/display-error';

describe('displayError', () => {
  it('keeps ordinary application error messages', () => {
    expect(displayError(new Error('Sign in before using live data.'), 'Could not load requests.')).toBe(
      'Sign in before using live data.',
    );
  });

  it('turns network failures into a useful connectivity state', () => {
    expect(displayError({ message: 'TypeError: Network request failed' }, 'Could not load requests.')).toBe(
      'Could not reach My Corner. Check your connection and try again.',
    );
  });

  it('shows only the safe Supabase reference code for plain object errors', () => {
    expect(
      displayError(
        { code: '42501', message: 'internal database details must stay hidden' },
        'Could not load requests.',
      ),
    ).toBe('Could not load requests. Reference: 42501.');
  });
});
