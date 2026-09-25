import { supabase } from '@/lib/supabase';
import { assertMediaSession, mediaSessionRevision } from '@/lib/media-session';
export type AskContext = { id: string; name: string; city: string; timezone: string };
export type AskSource = {
  id: string;
  kind: 'event' | 'provider' | 'agency' | 'post' | 'group' | 'marketplace';
  title: string;
  text: string;
  href: string;
  authority: string;
  publishedAt: string;
  startsAt?: string;
  endsAt?: string;
  expiresAt?: string;
  organizer?: string;
  availability?: string;
  priceGhs?: number;
  reputation?: { average: number; count: number; verifiedCount: number; recommendationPercent: number | null } | null;
};
export type AskAnswer = {
  id: string;
  version: string;
  intent: string;
  neighborhood: string;
  generatedAt: string;
  notice: string;
  sources: AskSource[];
  excerpts: { index: number; quote: string }[];
};
export const askUnavailable = 'Ask My Corner AI is temporarily unavailable. You can still use Search.';
export async function loadAskContext(): Promise<AskContext | null> {
  const { data, error } = await supabase.rpc('neighborhood_ai_context');
  if (error || !data?.id || !data?.name) return null;
  return data as AskContext;
}
export function safeAskHref(source: AskSource): string {
  const prefixes = {
    event: '/events/',
    provider: '/hire/provider/',
    agency: '/agency-broadcasts?broadcastId=',
    post: '/community?postId=',
    group: '/groups/',
    marketplace: '/marketplace/listing/',
  };
  const prefix = prefixes[source.kind];
  if (!prefix || !source.href.startsWith(prefix) || !/^\/[a-zA-Z0-9/?=&-]+$/.test(source.href))
    throw new Error('Source unavailable');
  return source.href;
}
export async function askNeighborhood(question: string, history: string[], neighborhoodId: string): Promise<AskAnswer> {
  const session = mediaSessionRevision();
  const { data, error } = await supabase.functions.invoke('ask-my-corner', {
    body: { question, history: history.slice(-2), neighborhoodId },
  });
  assertMediaSession(session);
  if (error || !data?.enabled || !Array.isArray(data.answer?.sources) || typeof data.answer?.notice !== 'string')
    throw new Error(askUnavailable);
  const answer = data.answer as AskAnswer;
  if (answer.sources.length > 16 || !Array.isArray(answer.excerpts)) throw new Error(askUnavailable);
  answer.sources.forEach(safeAskHref);
  return answer;
}
export async function askFeedback(id: string, value: 'helpful' | 'not_helpful' | 'inaccurate') {
  const { error } = await supabase.rpc('neighborhood_ai_meter', { action: 'feedback', run_id: id, payload: { value } });
  if (error) throw new Error('Could not save feedback. Please try again.');
}
export async function askSourceClick(id: string, source: AskSource) {
  const { error } = await supabase.rpc('neighborhood_ai_meter', {
    action: 'click',
    run_id: id,
    payload: { ref: `${source.kind}:${source.id}` },
  });
  if (error) throw new Error('Source access changed. Ask again to refresh your results.');
}
export function reviewCountLabel(count: number) {
  return `${count} verified ${count === 1 ? 'review' : 'reviews'}`;
}
export function askPromptForPath(path: string): string {
  if (path.startsWith('/hire') || path.startsWith('/provider')) return 'Who can help me repair a fence nearby?';
  if (path.startsWith('/events')) return 'What’s happening this weekend?';
  if (path.startsWith('/groups')) return 'What did I miss in my groups this week?';
  if (path.startsWith('/marketplace')) return 'Find a used dining table nearby.';
  if (path.startsWith('/agency')) return 'Any important alerts today?';
  return 'What’s happening in my neighborhood this weekend?';
}
