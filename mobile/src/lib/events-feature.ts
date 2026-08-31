type Environment = Record<string, string | undefined>;

const enabledValue = 'enabled';

function environment(): Environment {
  return {
    NODE_ENV: process.env.NODE_ENV,
    EXPO_PUBLIC_FEATURE_EVENTS: process.env.EXPO_PUBLIC_FEATURE_EVENTS,
    EXPO_PUBLIC_EVENTS_REPOSITORY: process.env.EXPO_PUBLIC_EVENTS_REPOSITORY,
    EXPO_PUBLIC_EVENTS_ALLOW_SEEDED_DEVELOPMENT: process.env.EXPO_PUBLIC_EVENTS_ALLOW_SEEDED_DEVELOPMENT,
  };
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
