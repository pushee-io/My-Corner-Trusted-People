import { authSessionStorage } from '@/lib/supabase';
import type { UserRole } from '@/types/contracts';

export type CachedSessionProfile = {
  id: string;
  authUserId: string;
  displayName: string;
  role: UserRole;
  phoneVerified: boolean;
};

// SecureStore keys allow only alphanumeric characters, dots, hyphens and underscores.
// The previous colon-delimited key could never be persisted on native devices.
const cacheKey = 'my-corner.last-verified-profile.v1';
const roles: UserRole[] = ['requester', 'provider', 'moderator', 'admin'];
let pendingMutation: Promise<void> = Promise.resolve();

function mutateCache(operation: () => Promise<void>): Promise<void> {
  const result = pendingMutation.then(operation);
  // Keep the queue usable after a storage failure; the caller still receives it.
  pendingMutation = result.catch(() => undefined);
  return result;
}

export async function readCachedSessionProfile(): Promise<CachedSessionProfile | null> {
  try {
    const value = await authSessionStorage.getItem(cacheKey);
    if (!value) return null;

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
    // An unreadable or malformed routing cache must not restore an identity.
    // Leave storage intact so a transient read failure can recover on retry.
    return null;
  }
}

export async function writeCachedSessionProfile(
  profile: CachedSessionProfile,
  isCurrent: () => boolean = () => true,
): Promise<void> {
  await mutateCache(async () => {
    if (isCurrent()) await authSessionStorage.setItem(cacheKey, JSON.stringify(profile));
  });
}

export async function clearCachedSessionProfile(): Promise<void> {
  // A write already inside SecureStore must finish before removal can complete.
  await mutateCache(() => authSessionStorage.removeItem(cacheKey));
}
