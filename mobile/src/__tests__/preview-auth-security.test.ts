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
    expect(supabase).toContain('storage: secureSessionStorage');
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
