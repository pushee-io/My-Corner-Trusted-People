import { getDay2BLiveRepository, type Day2BRepository } from '@/lib/day2b-live-repository';
import type { JobRequest, Provider } from '@/types/contracts';

export type Day2BReadRepository = Pick<
  Day2BRepository,
  'mode' | 'listProvidersByCategory' | 'getProvider' | 'listProviderRequests'
>;

export type Day2BCachedRead<T> = {
  items: T;
  fromCache: boolean;
};

const previewProviderIdEnvKey = 'EXPO_PUBLIC_MY_CORNER_DAY2B_PROVIDER_PREVIEW_ID';
const fallbackPreviewProviderId = 'prov-01';
const providerListCache = new Map<string, Provider[]>();
const maxProviderCacheEntries = 12;

export function getDay2BReadRepository(): Day2BReadRepository {
  const repository = getDay2BLiveRepository();

  return {
    mode: repository.mode,
    listProvidersByCategory: repository.listProvidersByCategory,
    getProvider: repository.getProvider,
    listProviderRequests: repository.listProviderRequests,
  };
}

export async function listDay2BProvidersByCategory(categoryId: string): Promise<Provider[]> {
  return (await loadDay2BProvidersByCategory(categoryId)).items;
}

export async function loadDay2BProvidersByCategory(categoryId: string): Promise<Day2BCachedRead<Provider[]>> {
  try {
    const providers = await getDay2BReadRepository().listProvidersByCategory(categoryId);
    if (!providerListCache.has(categoryId) && providerListCache.size >= maxProviderCacheEntries) {
      const oldestKey = providerListCache.keys().next().value;
      if (oldestKey) providerListCache.delete(oldestKey);
    }
    providerListCache.set(categoryId, providers);
    return { items: providers, fromCache: false };
  } catch (caught) {
    const cached = providerListCache.get(categoryId);
    if (cached) return { items: cached, fromCache: true };
    throw caught;
  }
}

export async function getDay2BProvider(providerId: string): Promise<Provider | undefined> {
  return getDay2BReadRepository().getProvider(providerId);
}

export async function listDay2BProviderRequests(providerId = getDay2BPreviewProviderId()): Promise<JobRequest[]> {
  return getDay2BReadRepository().listProviderRequests(providerId);
}

export function getDay2BPreviewProviderId(): string {
  return envValue(previewProviderIdEnvKey) ?? fallbackPreviewProviderId;
}

export function clearDay2BProviderCache() {
  providerListCache.clear();
}

function envValue(key: string): string | undefined {
  const maybeProcess = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;
  const value = maybeProcess?.env?.[key];

  return value && value.trim().length > 0 ? value : undefined;
}
