import { createClient } from '@supabase/supabase-js';
import { parseStructuredRequest, safeStructurerErrorReason, structurerPayload, validateRequestText } from '../_shared/structure-request.ts';

const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, apikey, x-client-info, content-type' };
const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers });
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers });
  if (req.method !== 'POST') return reply({ error: 'Method not allowed' }, 405);
  const authorization = req.headers.get('Authorization') ?? '';
  if (!authorization.startsWith('Bearer ')) return reply({ error: 'Sign in to use AI structuring.' }, 401);
  const client = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authorization } }, auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: user, error: authError } = await client.auth.getUser(authorization.slice(7));
  if (authError || !user.user) return reply({ error: 'Sign in to use AI structuring.' }, 401);
  const { data: flag, error: flagError } = await client.from('feature_flags').select('enabled').eq('key', 'ai_service_request_structurer').single();
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  const model = Deno.env.get('OPENAI_REQUEST_STRUCTURER_MODEL');
  if (flagError || !flag?.enabled || !apiKey || !model) return reply({ error: 'AI structuring is unavailable. You can complete your request manually.' }, 503);
  try {
    const raw = await req.text();
    if (raw.length > 14000) return reply({ error: 'Request is too long.' }, 413);
    const body = JSON.parse(raw);
    if (body.checkAvailability === true) return reply({ available: true });
    let text: string;
    try { text = validateRequestText(body.text); } catch { return reply({ error: 'Enter between 5 and 3000 characters.' }, 400); }
    const { data: allowed, error: limitError } = await client.rpc('consume_request_structuring_allowance');
    if (limitError || allowed !== true) return reply({ error: 'AI limit reached or unavailable. Please complete your request manually.' }, 429);
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(structurerPayload(text, model)), signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) {
      const reason = safeStructurerErrorReason(await response.json().catch(() => null));
      return reply({ error: 'AI structuring is unavailable. Your draft is unchanged.', reason, providerStatus: response.status }, 503);
    }
    return reply({ enabled: true, result: parseStructuredRequest(await response.json()) });
  } catch { return reply({ error: 'Could not structure this request. You can continue manually.' }, 503); }
});
