import { assertSupabaseConfigured, supabase } from '@/lib/supabase';
import {
  clearCachedSessionProfile,
  readCachedSessionProfile,
  writeCachedSessionProfile,
} from '@/lib/session-profile-cache';
import { restoreSessionProfile, signOutFromDevice } from '../auth';

jest.mock('@/lib/supabase', () => ({
  assertSupabaseConfigured: jest.fn(),
  supabase: {
    auth: {
      getSession: jest.fn(),
      getUser: jest.fn(),
      signOut: jest.fn(),
    },
    from: jest.fn(),
  },
}));

jest.mock('@/lib/session-profile-cache', () => ({
  clearCachedSessionProfile: jest.fn(),
  readCachedSessionProfile: jest.fn(),
  writeCachedSessionProfile: jest.fn(),
}));

type ProfileQuery = {
  select: jest.Mock;
  eq: jest.Mock;
  single: jest.Mock;
};

const mockedAssertSupabaseConfigured = jest.mocked(assertSupabaseConfigured);
const mockedClearCachedSessionProfile = jest.mocked(clearCachedSessionProfile);
const mockedReadCachedSessionProfile = jest.mocked(readCachedSessionProfile);
const mockedWriteCachedSessionProfile = jest.mocked(writeCachedSessionProfile);
const mockedSupabase = supabase as unknown as {
  auth: {
    getSession: jest.Mock;
    getUser: jest.Mock;
    signOut: jest.Mock;
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
    mockedClearCachedSessionProfile.mockResolvedValue();
    mockedReadCachedSessionProfile.mockResolvedValue(null);
    mockedWriteCachedSessionProfile.mockResolvedValue();
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
    expect(mockedClearCachedSessionProfile).toHaveBeenCalledTimes(1);
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
    expect(mockedWriteCachedSessionProfile).toHaveBeenCalledWith({
      id: 'profile-requester',
      authUserId: 'auth-requester',
      displayName: 'Ama Mensah',
      role: 'requester',
      phoneVerified: true,
    });
  });

  it('keeps a valid online session usable when the routing cache cannot be written', async () => {
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
    mockedWriteCachedSessionProfile.mockRejectedValue(new Error('secure storage unavailable'));

    await expect(restoreSessionProfile()).resolves.toMatchObject({
      authUserId: 'auth-requester',
      role: 'requester',
    });
  });

  it('uses the last verified profile when an offline refresh stalls session restoration', async () => {
    mockedSupabase.auth.getSession.mockReturnValue(new Promise(() => undefined));
    mockedReadCachedSessionProfile.mockResolvedValue({
      id: 'profile-requester',
      authUserId: 'auth-requester',
      displayName: 'Ama Mensah',
      role: 'requester',
      phoneVerified: true,
    });

    await expect(restoreSessionProfile(1)).resolves.toEqual({
      id: 'profile-requester',
      authUserId: 'auth-requester',
      displayName: 'Ama Mensah',
      role: 'requester',
      phoneVerified: true,
    });
  });

  it('uses a matching verified profile when remote user validation fails offline', async () => {
    mockedSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'auth-requester' } } },
      error: null,
    });
    mockedSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: new Error('Network request failed'),
    });
    mockedReadCachedSessionProfile.mockResolvedValue({
      id: 'profile-requester',
      authUserId: 'auth-requester',
      displayName: 'Ama Mensah',
      role: 'requester',
      phoneVerified: true,
    });

    await expect(restoreSessionProfile()).resolves.toMatchObject({ authUserId: 'auth-requester', role: 'requester' });
  });

  it('does not restore a cached profile belonging to another session', async () => {
    const networkError = new Error('Network request failed');
    mockedSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'auth-provider' } } },
      error: null,
    });
    mockedSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: networkError });
    mockedReadCachedSessionProfile.mockResolvedValue({
      id: 'profile-requester',
      authUserId: 'auth-requester',
      displayName: 'Ama Mensah',
      role: 'requester',
      phoneVerified: true,
    });

    await expect(restoreSessionProfile()).rejects.toBe(networkError);
  });

  it('propagates restoration errors without clearing the stored session', async () => {
    const storageError = new Error('secure storage unavailable');
    mockedSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: storageError,
    });

    await expect(restoreSessionProfile()).rejects.toBe(storageError);
  });

  it('signs out only the current device session', async () => {
    mockedSupabase.auth.signOut.mockResolvedValue({ error: null });

    await expect(signOutFromDevice()).resolves.toBeUndefined();

    expect(mockedAssertSupabaseConfigured).toHaveBeenCalledTimes(1);
    expect(mockedSupabase.auth.signOut).toHaveBeenCalledWith({ scope: 'local' });
    expect(mockedClearCachedSessionProfile).toHaveBeenCalledTimes(1);
  });

  it('reports sign-out failures so the app does not pretend the session was cleared', async () => {
    const signOutError = new Error('secure storage unavailable');
    mockedSupabase.auth.signOut.mockResolvedValue({ error: signOutError });

    await expect(signOutFromDevice()).rejects.toBe(signOutError);
    expect(mockedClearCachedSessionProfile).not.toHaveBeenCalled();
  });
});
