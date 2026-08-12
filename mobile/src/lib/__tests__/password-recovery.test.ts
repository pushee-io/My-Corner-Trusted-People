import { assertSupabaseConfigured, supabase } from '@/lib/supabase';
import {
  createPasswordRecoverySession,
  requestPasswordReset,
  updateRecoveredPassword,
} from '../auth';

jest.mock('@/lib/supabase', () => ({
  assertSupabaseConfigured: jest.fn(),
  supabase: {
    auth: {
      resetPasswordForEmail: jest.fn(),
      setSession: jest.fn(),
      signOut: jest.fn(),
      updateUser: jest.fn(),
    },
  },
}));

const mockedAssertSupabaseConfigured = jest.mocked(assertSupabaseConfigured);
const mockedSupabase = supabase as unknown as {
  auth: {
    resetPasswordForEmail: jest.Mock;
    setSession: jest.Mock;
    signOut: jest.Mock;
    updateUser: jest.Mock;
  };
};

describe('password recovery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('normalizes the email and sends recovery back to the registered app scheme', async () => {
    mockedSupabase.auth.resetPasswordForEmail.mockResolvedValue({ error: null });

    await requestPasswordReset('  Pilot@Example.COM ');

    expect(mockedAssertSupabaseConfigured).toHaveBeenCalledTimes(1);
    expect(mockedSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('pilot@example.com', {
      redirectTo: 'mycorner://reset-password',
    });
  });

  it('rejects malformed email locally and presents a generic provider failure', async () => {
    await expect(requestPasswordReset('not-an-email')).rejects.toThrow('Enter a valid email address.');
    expect(mockedSupabase.auth.resetPasswordForEmail).not.toHaveBeenCalled();

    mockedSupabase.auth.resetPasswordForEmail.mockResolvedValue({
      error: new Error('account lookup detail'),
    });
    await expect(requestPasswordReset('pilot@example.com')).rejects.toThrow(
      'We could not send recovery instructions. Please try again later.',
    );
  });

  it('creates a recovery session only from a complete recovery link', async () => {
    mockedSupabase.auth.setSession.mockResolvedValue({ error: null });

    await createPasswordRecoverySession(
      'mycorner://reset-password#access_token=access-123&refresh_token=refresh-456&type=recovery',
    );

    expect(mockedSupabase.auth.setSession).toHaveBeenCalledWith({
      access_token: 'access-123',
      refresh_token: 'refresh-456',
    });

    await expect(createPasswordRecoverySession('mycorner://reset-password?type=recovery')).rejects.toThrow(
      'This password recovery link is invalid or has expired.',
    );
  });

  it('updates a strong-enough password and clears the temporary local session', async () => {
    mockedSupabase.auth.updateUser.mockResolvedValue({ error: null });
    mockedSupabase.auth.signOut.mockResolvedValue({ error: null });

    await updateRecoveredPassword('new-password-123');

    expect(mockedSupabase.auth.updateUser).toHaveBeenCalledWith({ password: 'new-password-123' });
    expect(mockedSupabase.auth.signOut).toHaveBeenCalledWith({ scope: 'local' });
  });

  it('rejects short passwords and does not pretend failed updates succeeded', async () => {
    await expect(updateRecoveredPassword('short')).rejects.toThrow(
      'Use at least 10 characters for your new password.',
    );
    expect(mockedSupabase.auth.updateUser).not.toHaveBeenCalled();

    mockedSupabase.auth.updateUser.mockResolvedValue({ error: new Error('provider detail') });
    await expect(updateRecoveredPassword('new-password-123')).rejects.toThrow(
      'Could not update your password. Request a new recovery link and try again.',
    );
    expect(mockedSupabase.auth.signOut).not.toHaveBeenCalled();
  });
});
