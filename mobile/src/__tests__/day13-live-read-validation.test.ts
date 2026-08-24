import { readFileSync } from 'fs';
import {
  createCommunityActionsReadRepository,
  getCommunityActionsReadDiagnostics,
  seededCommunityActionsRepository,
} from '@/lib/community-actions-repository';
import type {
  SupabaseCommunityReadClient,
  SupabaseCommunityReadTableName,
} from '@/lib/community-actions-supabase-read-adapter';

type MockRows = Partial<Record<SupabaseCommunityReadTableName, unknown[]>>;

function createMockSupabaseReadClient(rows: MockRows = {}): SupabaseCommunityReadClient {
  return {
    from(table) {
      return {
        async select() {
          return {
            data: rows[table] ?? [],
            error: null,
          };
        },
      };
    },
  };
}

describe('Day 13 live read validation', () => {
  afterEach(() => {
    seededCommunityActionsRepository.resetForTests();
    delete process.env.EXPO_PUBLIC_COMMUNITY_ACTIONS_REPOSITORY;
  });

  it('keeps seeded reads as the default Expo Go mode', async () => {
    const repository = createCommunityActionsReadRepository();
    const diagnostics = getCommunityActionsReadDiagnostics(repository);

    expect(repository.mode).toBe('seeded');
    expect(diagnostics).toEqual({
      configuredMode: 'seeded',
      activeMode: 'seeded',
      fallbackReason: 'not_configured',
      isLiveSupabaseReadEnabled: false,
      label: 'Community reads: seeded',
    });

    await expect(repository.listSocialGroupScreenSections()).resolves.toHaveLength(3);
  });

  it('uses Supabase reads when Supabase mode receives a read client', async () => {
    process.env.EXPO_PUBLIC_COMMUNITY_ACTIONS_REPOSITORY = 'supabase';

    const repository = createCommunityActionsReadRepository({
      supabaseReadClient: createMockSupabaseReadClient(),
    });
    const diagnostics = getCommunityActionsReadDiagnostics(repository);

    expect(repository.mode).toBe('supabase');
    expect(diagnostics).toEqual({
      configuredMode: 'supabase',
      activeMode: 'supabase',
      fallbackReason: 'none',
      isLiveSupabaseReadEnabled: true,
      label: 'Community reads: supabase',
    });

    await expect(repository.listSocialGroupScreenSections()).resolves.toEqual([]);
  });

  it('falls back safely to seeded reads when Supabase mode cannot create a live client', async () => {
    process.env.EXPO_PUBLIC_COMMUNITY_ACTIONS_REPOSITORY = 'supabase';

    const repository = createCommunityActionsReadRepository();
    const diagnostics = getCommunityActionsReadDiagnostics(repository);

    expect(repository.mode).toBe('seeded');
    expect(diagnostics).toEqual({
      configuredMode: 'supabase',
      activeMode: 'seeded',
      fallbackReason: 'live_client_unavailable',
      isLiveSupabaseReadEnabled: false,
      label: 'Community reads: seeded',
    });

    await expect(repository.listAgencyBroadcasts()).resolves.toHaveLength(2);
  });

  it('surfaces the active read mode in Settings without private data', () => {
    const settingsSource = readFileSync('app/settings.tsx', 'utf8');

    expect(settingsSource).toContain('getCommunityActionsReadDiagnostics');
    expect(settingsSource).toContain('Developer diagnostics');
    expect(settingsSource).toContain('Community reads:');
    expect(settingsSource).toContain('Fallback reason:');
    expect(settingsSource).toContain('Live Supabase reads:');
    expect(settingsSource.toLowerCase()).not.toContain('phone');
    expect(settingsSource.toLowerCase()).not.toContain('email');
    expect(settingsSource.toLowerCase()).not.toContain('gps');
    expect(settingsSource.toLowerCase()).not.toContain('exact');
  });
});
