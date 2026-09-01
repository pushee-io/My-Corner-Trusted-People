import { readFileSync } from 'node:fs';

describe('preview authentication security', () => {
  it('keeps test-account credentials out of application source', () => {
    const auth = readFileSync('src/lib/auth.ts', 'utf8');
    const signIn = readFileSync('app/sign-in.tsx', 'utf8');

    expect(auth).not.toContain('EXPO_PUBLIC_SUPABASE_TEST_');
    expect(signIn).not.toContain('signInWithConfiguredTestAccount');
    expect(signIn).toContain('secureTextEntry');
    expect(signIn).toContain('accessibilityLabel="Password"');
  });

  it('routes providers directly to their incoming request queue', () => {
    const signIn = readFileSync('app/sign-in.tsx', 'utf8');

    expect(signIn).toContain("profile.role === 'provider' ? '/provider/requests' : '/neighborhood'");
  });

  it('serializes mobile auth access and refreshes tokens with app state', () => {
    const supabase = readFileSync('src/lib/supabase.ts', 'utf8');

    expect(supabase).toContain('lock: processLock');
    expect(supabase).toContain("state === 'active'");
    expect(supabase).toContain('supabase.auth.startAutoRefresh()');
    expect(supabase).toContain('supabase.auth.stopAutoRefresh()');
    expect(supabase).toContain("Platform.OS === 'web' ? webSessionStorage : secureSessionStorage");
    expect(supabase).toContain('storage: authSessionStorage');
  });

  it('uses tab-scoped browser storage without calling SecureStore on web', () => {
    const supabase = readFileSync('src/lib/supabase.ts', 'utf8');

    expect(supabase).toContain("typeof window === 'undefined'");
    expect(supabase).toContain('window.sessionStorage');
    expect(supabase).toContain('getBrowserSessionStorage()?.getItem(key)');
    expect(supabase).toContain('getBrowserSessionStorage()?.setItem(key, value)');
    expect(supabase).toContain('getBrowserSessionStorage()?.removeItem(key)');
  });

  it('keeps Supabase publishable keys out of the JWT bearer header', () => {
    const verifier = readFileSync('scripts/verify-preview-supabase-env.mjs', 'utf8');

    expect(verifier).toContain('const probeHeaders = { apikey: clientKey }');
    expect(verifier).toContain('if (legacyPayload)');
    expect(verifier).toContain('probeHeaders.authorization = `Bearer ${clientKey}`');
    expect(verifier).toContain('headers: probeHeaders');
  });

  it('pins EAS and binds internal builds to the preview environment', () => {
    const eas = JSON.parse(readFileSync('eas.json', 'utf8'));

    expect(eas.cli.version).toBe('22.6.0');
    expect(eas.build.preview.distribution).toBe('internal');
    expect(eas.build.preview.environment).toBe('preview');
    expect(eas.build.preview.autoIncrement).toBe(true);
    expect(eas.build.preview.android.buildType).toBe('apk');
  });
});
