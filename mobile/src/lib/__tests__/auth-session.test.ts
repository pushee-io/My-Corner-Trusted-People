import { assertSupabaseConfigured, supabase } from '@/lib/supabase';
import { restoreSessionProfile } from '../auth';

jest.mock('@/lib/supabase', () => ({
  assertSupabaseConfigured: jest.fn(),
  supabase: {
    auth: {
      getSession: jest.fn(),
      getUser: jest.fn(),
    },
    from: jest.fn(),
  },
}));

type ProfileQuery = {
  select: jest.Mock;
  eq: jest.Mock;
  single: jest.Mock;
};

const mockedAssertSupabaseConfigured = jest.mocked(assertSupabaseConfigured);
const mockedSupabase = supabase as unknown as {
  auth: {
    getSession: jest.Mock;
    getUser: jest.Mock;
  };
  from: jest.Mock;
};
const profileQuery: ProfileQuery = {
  select: jest.fn(),
  eq: jest.fn(),
  single: jest.fn(),
};

describe('session restoration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    profileQuery.select.mockReturnValue(profileQuery);
    profileQuery.eq.mockReturnValue(profileQuery);
    mockedSupabase.from.mockReturnValue(profileQuery);
  });

  it('returns null when SecureStore has no Supabase session', async () => {
    mockedSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    await expect(restoreSessionProfile()).resolves.toBeNull();

    expect(mockedAssertSupabaseConfigured).toHaveBeenCalledTimes(1);
    expect(mockedSupabase.auth.getUser).not.toHaveBeenCalled();
  });

  it('validates a restored session and loads its My Corner profile', async () => {
    mockedSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'auth-requester' } } },
      error: null,
    });
    mockedSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'auth-requester' } },
      error: null,
    });
    profileQuery.single.mockResolvedValue({
      data: {
        id: 'profile-requester',
        auth_user_id: 'auth-requester',
        display_name: 'Ama Mensah',
        role: 'requester',
        phone_verified: true,
      },
      error: null,
    });

    await expect(restoreSessionProfile()).resolves.toEqual({
      id: 'profile-requester',
      authUserId: 'auth-requester',
      displayName: 'Ama Mensah',
      role: 'requester',
      phoneVerified: true,
    });

    expect(mockedSupabase.from).toHaveBeenCalledWith('profiles');
    expect(profileQuery.eq).toHaveBeenCalledWith('auth_user_id', 'auth-requester');
  });

  it('propagates restoration errors without clearing the stored session', async () => {
    const storageError = new Error('secure storage unavailable');
    mockedSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: storageError,
    });

    await expect(restoreSessionProfile()).rejects.toBe(storageError);
  });
});
