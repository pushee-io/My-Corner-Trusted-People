// Shared server-only transport for Structure with AI and Ask My Corner.
export function requestResponses(apiKey: string, payload: unknown, fetcher: typeof fetch = fetch) {
  return fetcher('https://api.openai.com/v1/responses', {
    method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload), signal: AbortSignal.timeout(20000),
  });
}
export async function callResponses(apiKey: string, payload: unknown, fetcher: typeof fetch = fetch) {
  const response = await requestResponses(apiKey,payload,fetcher);
  if (!response.ok) throw new Error(`provider_${response.status}`);
  return response.json();
}
export function outputJson(response: { status?: string; output?: { content?: { type?: string; text?: string }[] }[] }): unknown {
  if (response.status !== 'completed') throw new Error('Incomplete response');
  const text = response.output?.flatMap(x => x.content ?? []).find(x => x.type === 'output_text')?.text;
  return JSON.parse(text ?? 'null');
}
