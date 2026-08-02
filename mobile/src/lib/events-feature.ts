type Environment = Record<string, string | undefined>;

const enabledValue = 'enabled';

function environment(): Environment {
  const maybeProcess = (globalThis as { process?: { env?: Environment } }).process;
  return maybeProcess?.env ?? {};
}

export function isEventsClientEnabled(env: Environment = environment()): boolean {
  return env.EXPO_PUBLIC_FEATURE_EVENTS === enabledValue;
}

export function isSeededEventsDevelopmentMode(env: Environment = environment()): boolean {
  return (
    env.NODE_ENV === 'development' &&
    env.EXPO_PUBLIC_EVENTS_REPOSITORY === 'seeded' &&
    env.EXPO_PUBLIC_EVENTS_ALLOW_SEEDED_DEVELOPMENT === 'true'
  );
}
