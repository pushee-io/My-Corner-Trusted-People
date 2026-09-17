import { authSessionStorage } from '@/lib/supabase';
import type { UserRole } from '@/types/contracts';

export type CachedSessionProfile = {
  id: string;
  authUserId: string;
  displayName: string;
  role: UserRole;
  phoneVerified: boolean;
};

const cacheKey = 'my-corner:last-verified-profile:v1';
const roles: UserRole[] = ['requester', 'provider', 'moderator', 'admin'];

export async function readCachedSessionProfile(): Promise<CachedSessionProfile | null> {
  const value = await authSessionStorage.getItem(cacheKey);
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as Partial<CachedSessionProfile>;
    if (
      typeof parsed.id !== 'string' ||
      typeof parsed.authUserId !== 'string' ||
      typeof parsed.displayName !== 'string' ||
      !roles.includes(parsed.role as UserRole) ||
      typeof parsed.phoneVerified !== 'boolean'
    ) {
      return null;
    }

    return parsed as CachedSessionProfile;
  } catch {
    return null;
  }
}

export async function writeCachedSessionProfile(profile: CachedSessionProfile): Promise<void> {
  await authSessionStorage.setItem(cacheKey, JSON.stringify(profile));
}

export async function clearCachedSessionProfile(): Promise<void> {
  await authSessionStorage.removeItem(cacheKey);
}
