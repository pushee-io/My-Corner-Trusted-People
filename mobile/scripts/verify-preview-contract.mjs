import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();

function fail(message) {
  console.error(`Preview contract verification failed: ${message}`);
  process.exitCode = 1;
}

async function requireFile(relativePath) {
  try {
    await access(path.join(root, relativePath));
  } catch {
    fail(`missing ${relativePath}`);
  }
}

async function requireText(relativePath, expected) {
  const content = await readFile(path.join(root, relativePath), 'utf8');
  if (!content.includes(expected)) {
    fail(`${relativePath} does not contain ${JSON.stringify(expected)}`);
  }
}

await Promise.all(
  [
    'app/events/index.tsx',
    'app/events/new.tsx',
    'app/events/[eventId].tsx',
    'src/lib/events-feature.ts',
    'src/lib/events-runtime-repository.ts',
    'src/lib/events-supabase-repository.ts',
    'scripts/verify-preview-supabase-env.mjs',
  ].map(requireFile),
);

const eas = JSON.parse(await readFile(path.join(root, 'eas.json'), 'utf8'));
const preview = eas.build?.preview;
const expected = {
  easCliVersion: '22.6.0',
  distribution: 'internal',
  environment: 'preview',
  androidBuildType: 'apk',
};

if (eas.cli?.version !== expected.easCliVersion) {
  fail(`EAS CLI must be pinned to ${expected.easCliVersion}`);
}
if (preview?.distribution !== expected.distribution) {
  fail('preview distribution must be internal');
}
if (preview?.environment !== expected.environment) {
  fail('preview environment must be preview');
}
if (preview?.android?.buildType !== expected.androidBuildType) {
  fail('preview Android build type must be apk');
}

await Promise.all([
  requireText('app/home.tsx', "'/events'"),
  requireText('src/lib/events-feature.ts', 'EXPO_PUBLIC_FEATURE_EVENTS === enabledValue'),
  requireText('src/lib/events-supabase-repository.ts', "supabase.rpc('is_events_feature_enabled')"),
  requireText('src/lib/events-runtime-repository.ts', 'Events is not available yet.'),
  requireText('scripts/verify-preview-supabase-env.mjs', 'process.env.EXPO_PUBLIC_FEATURE_EVENTS'),
  requireText('scripts/verify-preview-supabase-env.mjs', 'process.env.EXPO_PUBLIC_EVENTS_REPOSITORY'),
]);

if (!process.exitCode) {
  console.log(
    'Preview contract verified: Events routes, navigation, repository, RPC, and named preview environment verification is present.',
  );
}
