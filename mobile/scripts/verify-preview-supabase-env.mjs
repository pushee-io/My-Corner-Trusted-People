const expectedRef = 'opeojxwkwwnnncnsuaag';
const expectedUrl = `https://${expectedRef}.supabase.co`;

function fail(message) {
  console.error(`Preview Supabase verification failed: ${message}`);
  process.exit(1);
}

function decodeLegacyKey(key) {
  if (!key.startsWith('eyJ')) {
    return null;
  }

  try {
    const [, encodedPayload] = key.split('.');
    return JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
  } catch {
    fail('EXPO_PUBLIC_SUPABASE_ANON_KEY is not a valid legacy JWT.');
  }
}

const configuredUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.replace(/\/+$/, '');
const clientKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (configuredUrl !== expectedUrl) {
  fail(`EXPO_PUBLIC_SUPABASE_URL must be ${expectedUrl}; received ${configuredUrl ?? 'no value'}.`);
}
if (!clientKey) {
  fail('EXPO_PUBLIC_SUPABASE_ANON_KEY is missing from the EAS preview environment.');
}
if (clientKey.startsWith('sb_secret_')) {
  fail('EXPO_PUBLIC_SUPABASE_ANON_KEY must never contain a Supabase secret key.');
}

const legacyPayload = decodeLegacyKey(clientKey);
if (legacyPayload?.role && legacyPayload.role !== 'anon') {
  fail(`legacy client key role must be anon; received ${legacyPayload.role}.`);
}
if (legacyPayload?.ref && legacyPayload.ref !== expectedRef) {
  fail(`legacy client key belongs to Supabase project ${legacyPayload.ref}, not ${expectedRef}.`);
}

try {
  const response = await fetch(`${expectedUrl}/rest/v1/`, {
    headers: {
      apikey: clientKey,
      authorization: `Bearer ${clientKey}`,
    },
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    fail(`Supabase rejected the preview client key with HTTP ${response.status}.`);
  }
} catch (error) {
  fail(`Supabase probe failed: ${error instanceof Error ? error.message : String(error)}`);
}

console.log(`Preview Supabase environment verified for project ${expectedRef}.`);
