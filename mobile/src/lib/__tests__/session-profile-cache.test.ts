import { authSessionStorage } from '@/lib/supabase';
import {
  clearCachedSessionProfile,
  readCachedSessionProfile,
  writeCachedSessionProfile,
} from '../session-profile-cache';

jest.mock('@/lib/supabase', () => ({
  authSessionStorage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

const mockedStorage = authSessionStorage as jest.Mocked<typeof authSessionStorage>;

const requesterProfile = {
  id: 'profile-requester',
  authUserId: 'auth-requester',
  displayName: 'Ama Mensah',
  role: 'requester' as const,
  phoneVerified: true,
};

describe('verified session profile cache', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('round-trips the last verified routing profile', async () => {
    mockedStorage.getItem.mockResolvedValue(JSON.stringify(requesterProfile));

    await expect(readCachedSessionProfile()).resolves.toEqual(requesterProfile);
    await writeCachedSessionProfile(requesterProfile);

    expect(mockedStorage.setItem).toHaveBeenCalledWith(
      'my-corner.last-verified-profile.v1',
      JSON.stringify(requesterProfile),
    );
  });

  it.each([
    ['invalid JSON', '{'],
    ['an unknown role', JSON.stringify({ ...requesterProfile, role: 'owner' })],
    ['a missing auth user ID', JSON.stringify({ ...requesterProfile, authUserId: undefined })],
  ])('rejects %s', async (_label, storedValue) => {
    mockedStorage.getItem.mockResolvedValue(storedValue);

    await expect(readCachedSessionProfile()).resolves.toBeNull();
  });

  it('removes the routing profile on local sign-out', async () => {
    await clearCachedSessionProfile();

    expect(mockedStorage.removeItem).toHaveBeenCalledWith('my-corner.last-verified-profile.v1');
  });
});
