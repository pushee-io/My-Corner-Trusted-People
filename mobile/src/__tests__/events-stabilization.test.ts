import { readFileSync } from 'fs';
import { isEventsClientEnabled, isSeededEventsDevelopmentMode } from '@/lib/events-feature';

const eventRoutes = [
  'app/events/index.tsx',
  'app/events/new.tsx',
  'app/events/[eventId].tsx',
  'app/events/[eventId]/edit.tsx',
];

describe('Events stabilization gates', () => {
  it('fails closed unless the client Events flag is explicitly enabled', () => {
    expect(isEventsClientEnabled({})).toBe(false);
    expect(isEventsClientEnabled({ EXPO_PUBLIC_FEATURE_EVENTS: 'disabled' })).toBe(false);
    expect(isEventsClientEnabled({ EXPO_PUBLIC_FEATURE_EVENTS: 'enabled' })).toBe(true);
  });

  it('permits seeded Events only as an explicit non-production development mode', () => {
    expect(isSeededEventsDevelopmentMode({ NODE_ENV: 'production', EXPO_PUBLIC_EVENTS_REPOSITORY: 'seeded' })).toBe(
      false,
    );
    expect(isSeededEventsDevelopmentMode({ NODE_ENV: 'development', EXPO_PUBLIC_EVENTS_REPOSITORY: 'seeded' })).toBe(
      false,
    );
    expect(
      isSeededEventsDevelopmentMode({
        NODE_ENV: 'development',
        EXPO_PUBLIC_EVENTS_REPOSITORY: 'seeded',
        EXPO_PUBLIC_EVENTS_ALLOW_SEEDED_DEVELOPMENT: 'true',
      }),
    ).toBe(true);
    expect(isSeededEventsDevelopmentMode({ NODE_ENV: 'development', EXPO_PUBLIC_EVENTS_REPOSITORY: 'supabase' })).toBe(
      false,
    );
  });

  it('gates every Events route and prevents direct seeded repository imports', () => {
    for (const route of eventRoutes) {
      const source = readFileSync(route, 'utf8');
      expect(source).toContain('EventsFeatureGate');
      expect(source).not.toContain('@/lib/events-repository');
    }
  });

  it('retains Events access through My Activity while requiring client and runtime gates', () => {
    const home = readFileSync('app/home.tsx', 'utf8');
    const activity = readFileSync('app/activity.tsx', 'utf8');
    const gate = readFileSync('src/components/events/EventsFeatureGate.tsx', 'utf8');
    expect(home).toContain('href="/activity"');
    expect(activity).toContain('isEventsClientEnabled()');
    expect(activity).toContain("router.push('/events')");
    expect(gate).toContain('if (!isEventsClientEnabled())');
    expect(gate).toContain('eventsRuntimeRepository');
    expect(gate).toContain('.isEnabled()');
    expect(gate).toContain("setState(enabled ? 'allowed' : 'disabled')");
    expect(gate).toContain("setState('error')");
    expect(gate).toContain("if (state === 'allowed') return");
  });

  it('runs both Events SQL smoke suites from database CI', () => {
    const source = readFileSync('../scripts/db-smoke-test.sh', 'utf8');
    expect(source).toContain('supabase/tests/events_rls_smoke.sql');
    expect(source).toContain('supabase/tests/events_stabilization_rls.sql');
    expect(source).toContain('supabase/tests/events_feature_flag_smoke.sql');
  });

  it('provisions the server switch without automatically activating Events', () => {
    const source = readFileSync('../supabase/migrations/20260821180000_provision_events_feature_flag.sql', 'utf8');
    expect(source).toContain("'events'");
    expect(source).toContain('false');
    expect(source).not.toMatch(/set\s+enabled\s*=\s*true/i);
  });

  it('keeps disabled-state copy user-safe and offers a retry', () => {
    const source = readFileSync('src/components/events/EventsFeatureGate.tsx', 'utf8');
    expect(source).toContain('Try again');
    expect(source).not.toContain('verification and safety checks');
  });

  it('loads and posts RLS-authorized comments from the event detail route', () => {
    const repository = readFileSync('src/lib/events-supabase-repository.ts', 'utf8');
    const detail = readFileSync('app/events/[eventId].tsx', 'utf8');
    expect(repository).toContain("from('event_comments')");
    expect(detail).toContain('eventsRuntimeRepository.addComment');
    expect(detail).toContain('event.comments.map');
  });
});
