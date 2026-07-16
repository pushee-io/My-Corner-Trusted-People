import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

type StructuredRequest = {
  title: string;
  description: string;
  urgency: 'flexible' | 'soon' | 'urgent';
  missingInfo: string[];
  safetyWarning?: string;
};

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const enabled = Deno.env.get('FEATURE_AI_SERVICE_REQUEST_STRUCTURER') === 'true';
  const { text = '' } = await req.json();
  const cleanText = String(text).trim();

  if (!enabled) {
    const fallback: StructuredRequest = {
      title: cleanText.slice(0, 48) || 'Service request',
      description: cleanText,
      urgency: 'flexible',
      missingInfo: ['Preferred date', 'Preferred time'],
    };
    return Response.json({ enabled: false, result: fallback });
  }

  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) {
    return Response.json({ error: 'OpenAI API key is not configured' }, { status: 503 });
  }

  return Response.json({
    enabled: true,
    notExecutedInPrototype: true,
    message: 'Wire this function to the OpenAI Responses API after project secrets are configured.',
  });
});
