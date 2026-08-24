import { readFileSync } from 'fs';
import {
  createSupabaseCommunityActionsReadRepository,
  getSupabaseCommunityReadFailureDiagnostics,
  resetSupabaseCommunityReadFailureDiagnostics,
  type SupabaseCommunityReadClient,
  type SupabaseCommunityReadTableName,
} from '@/lib/community-actions-supabase-read-adapter';
import type { Day3NeighborhoodContext } from '@/types/day3';

const viewer: Day3NeighborhoodContext = {
  profileId: 'profile-akosua',
  neighborhoodId: 'east-legon',
  clusterId: 'accra-east',
  regionId: 'greater-accra',
  isVerifiedNeighborhoodMember: true,
};

function createFailingClient(tableName: SupabaseCommunityReadTableName, message: string): SupabaseCommunityReadClient {
  return {
    from(table) {
      return {
        async select() {
          if (table === tableName) {
            return {
              data: null,
              error: { message },
            };
          }

          return {
            data: [],
            error: null,
          };
        },
      };
    },
  };
}

describe('Day 16 Supabase read error diagnostics', () => {
  afterEach(() => {
    resetSupabaseCommunityReadFailureDiagnostics();
  });

  it('starts with no recorded Supabase read failure', () => {
    expect(getSupabaseCommunityReadFailureDiagnostics()).toEqual({
      tableName: 'none',
      failureCode: 'none',
      sanitizedMessage: 'none',
    });
  });

  it('records the failed Supabase table, stable code, and sanitized message', async () => {
    const repository = createSupabaseCommunityActionsReadRepository(
      createFailingClient(
        'social_groups',
        'permission denied for table social_groups at https://project.supabase.co with token eyJsecret.token.value',
      ),
    );

    await expect(repository.listSocialGroupScreenSections(viewer)).rejects.toThrow(
      'Could not read social_groups: permission denied for table social_groups at [redacted-url] with token [redacted-token]',
    );

    expect(getSupabaseCommunityReadFailureDiagnostics()).toEqual({
      tableName: 'social_groups',
      failureCode: 'supabase_read_error',
      sanitizedMessage: 'permission denied for table social_groups at [redacted-url] with token [redacted-token]',
    });
  });

  it('records agency broadcast read failures independently', async () => {
    const repository = createSupabaseCommunityActionsReadRepository(
      createFailingClient('agency_broadcasts', 'relation agency_broadcasts does not exist'),
    );

    await expect(repository.listAgencyBroadcasts(viewer)).rejects.toThrow(
      'Could not read agency_broadcasts: relation agency_broadcasts does not exist',
    );

    expect(getSupabaseCommunityReadFailureDiagnostics()).toEqual({
      tableName: 'agency_broadcasts',
      failureCode: 'supabase_read_error',
      sanitizedMessage: 'relation agency_broadcasts does not exist',
    });
  });

  it('keeps user-facing screen errors generic while developer diagnostics are available in Settings', () => {
    const screenPaths = ['app/groups/index.tsx', 'app/agency-broadcasts.tsx', 'app/community/moderation.tsx'];
    const settingsSource = readFileSync('app/settings.tsx', 'utf8');

    expect(settingsSource).toContain('getSupabaseCommunityReadFailureDiagnostics');
    expect(settingsSource).toContain('Last read table:');
    expect(settingsSource).toContain('Last read failure:');
    expect(settingsSource).toContain('Last read message:');

    for (const path of screenPaths) {
      const source = readFileSync(path, 'utf8');

      expect(source).toContain('Try again later.');
      expect(source).not.toContain('getSupabaseCommunityReadFailureDiagnostics');
      expect(source).not.toContain('sanitizedMessage');
      expect(source).not.toContain('caught.message');
    }
  });

  it('does not expose secrets or raw env values through diagnostics code', () => {
    const adapterSource = readFileSync('src/lib/community-actions-supabase-read-adapter.ts', 'utf8');
    const settingsSource = readFileSync('app/settings.tsx', 'utf8');

    expect(adapterSource).toContain('[redacted-url]');
    expect(adapterSource).toContain('[redacted-token]');
    expect(adapterSource).not.toContain('EXPO_PUBLIC_SUPABASE_URL');
    expect(adapterSource).not.toContain('EXPO_PUBLIC_SUPABASE_ANON_KEY');
    expect(settingsSource).not.toContain('EXPO_PUBLIC_SUPABASE_URL');
    expect(settingsSource).not.toContain('EXPO_PUBLIC_SUPABASE_ANON_KEY');
  });
});
