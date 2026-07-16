import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const enabled = Deno.env.get('FEATURE_AI_CONTENT_MODERATION') === 'true';
  const { text = '' } = await req.json();
  const content = String(text);

  if (!enabled) {
    return Response.json({ enabled: false, status: 'not_run', flagged: false });
  }

  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) {
    return Response.json({ error: 'OpenAI API key is not configured' }, { status: 503 });
  }

  const deterministicReasons = [];
  if (/threat|weapon|kill|attack/i.test(content)) deterministicReasons.push('potential_violence');
  if (/scam|fraud|419/i.test(content)) deterministicReasons.push('fraud_signal');

  return Response.json({
    enabled: true,
    status: deterministicReasons.length ? 'flagged' : 'clean',
    flagged: deterministicReasons.length > 0,
    reasons: deterministicReasons,
    notExecutedInPrototype: true,
    message: 'Connect to the configured moderation model after secrets are set.',
  });
});
