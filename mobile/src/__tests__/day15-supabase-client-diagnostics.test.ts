import { readFileSync } from 'fs';
import { createSupabaseCommunityReadClientDiagnostics } from '@/lib/community-actions-supabase-live-client';

describe('Day 15 Supabase client diagnostics', () => {
  it('reports none when the Supabase client and public config flags are available', () => {
    const diagnostics = createSupabaseCommunityReadClientDiagnostics({
      hasSupabaseUrl: true,
      hasSupabaseAnonKey: true,
      supabase: {
        from() {
          return {
            async select() {
              return {
                data: [],
                error: null,
              };
            },
          };
        },
      },
    });

    expect(diagnostics).toEqual({
      clientAvailable: true,
      hasSupabaseUrl: true,
      hasSupabaseAnonKey: true,
      failureCode: 'none',
    });
  });

  it('reports module_load_failed when the Supabase module cannot be imported', () => {
    const diagnostics = createSupabaseCommunityReadClientDiagnostics({
      hasSupabaseUrl: true,
      hasSupabaseAnonKey: true,
      moduleLoadFailed: true,
    });

    expect(diagnostics).toEqual({
      clientAvailable: false,
      hasSupabaseUrl: true,
      hasSupabaseAnonKey: true,
      failureCode: 'module_load_failed',
    });
  });

  it('reports client_missing when the module loads without a Supabase client', () => {
    const diagnostics = createSupabaseCommunityReadClientDiagnostics({
      hasSupabaseUrl: true,
      hasSupabaseAnonKey: false,
    });

    expect(diagnostics).toEqual({
      clientAvailable: false,
      hasSupabaseUrl: true,
      hasSupabaseAnonKey: false,
      failureCode: 'client_missing',
    });
  });

  it('shows only safe booleans and failure codes in Settings diagnostics', () => {
    const settingsSource = readFileSync('app/settings.tsx', 'utf8');

    expect(settingsSource).toContain('getSupabaseCommunityReadClientDiagnostics');
    expect(settingsSource).toContain('Supabase client available:');
    expect(settingsSource).toContain('Has Supabase URL:');
    expect(settingsSource).toContain('Has Supabase anon key:');
    expect(settingsSource).toContain('Supabase client failure:');
    expect(settingsSource).toContain('String(supabaseDiagnostics.clientAvailable)');
    expect(settingsSource).toContain('String(supabaseDiagnostics.hasSupabaseUrl)');
    expect(settingsSource).toContain('String(supabaseDiagnostics.hasSupabaseAnonKey)');
    expect(settingsSource).not.toContain('EXPO_PUBLIC_SUPABASE_URL');
    expect(settingsSource).not.toContain('EXPO_PUBLIC_SUPABASE_ANON_KEY');
  });

  it('keeps raw Supabase env values out of the live read client diagnostics', () => {
    const liveClientSource = readFileSync('src/lib/community-actions-supabase-live-client.ts', 'utf8');

    expect(liveClientSource).toContain("'none'");
    expect(liveClientSource).toContain("'module_load_failed'");
    expect(liveClientSource).toContain("'client_missing'");
    expect(liveClientSource).not.toContain('EXPO_PUBLIC_SUPABASE_URL');
    expect(liveClientSource).not.toContain('EXPO_PUBLIC_SUPABASE_ANON_KEY');
  });
});
