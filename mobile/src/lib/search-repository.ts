import {
  searchNeighborhood,
  sourceRegistry,
  type SearchRpc,
} from '../../../supabase/functions/_shared/neighborhood-search';
import type { Source } from '../../../supabase/functions/_shared/neighborhood-assistant';
export type SearchResultKind = 'post' | 'event' | 'provider' | 'group' | 'agency_broadcast' | 'marketplace_listing';
export type SearchResult = {
  id: string;
  kind: SearchResultKind;
  title: string;
  subtitle: string;
  body: string;
  href: string;
  sourceLabel: string;
  mediaParent?: import('@/lib/media-contract').MediaParent;
  mediaParentId?: string;
  thumbnailUrl?: string;
};
export type SearchResults = SearchResult[] & { unavailableSources?: string[] };
export type SearchRepository = { search: (query: string) => Promise<SearchResults> };
function displaySource(source: Source): SearchResult {
  const reputation = source.reputation;
  const details = [source.authority];
  if (reputation)
    details.push(
      reputation.verifiedCount
        ? `${reputation.average.toFixed(1)} / 5 · ${reputation.verifiedCount} verified reviews`
        : 'No verified reviews yet',
    );
  if (reputation?.completedJobs !== undefined)
    details.push(`${reputation.completedJobs} confirmed completed My Corner jobs`);
  if (source.availability) details.push(`Provider-stated availability: ${source.availability}`);
  return {
    id: `${source.kind}-${source.id}`,
    kind:
      source.kind === 'agency'
        ? 'agency_broadcast'
        : source.kind === 'marketplace'
          ? 'marketplace_listing'
          : source.kind,
    title: source.title,
    subtitle: details.join(' · '),
    body: source.text,
    href: source.href,
    sourceLabel: sourceRegistry[source.kind].label,
  };
}
// One injectable adapter, with the same authorized planner/RPC path in every mode.
export function createSearchRepository({
  rpc,
  now = () => new Date(),
}: {
  rpc: SearchRpc;
  now?: () => Date;
}): SearchRepository {
  return {
    async search(query) {
      const result = await searchNeighborhood(query, rpc, now());
      return Object.assign(result.sources.map(displaySource), {
        unavailableSources: result.unavailable.map((kind) => sourceRegistry[kind].label),
      });
    },
  };
}
export const searchRepository: SearchRepository = {
  async search(query) {
    const { supabase } = await import('@/lib/supabase');
    const { mediaSessionRevision, assertMediaSession } = await import('@/lib/media-session');
    const revision = mediaSessionRevision();
    const results = await createSearchRepository({ rpc: async (name, args) => supabase.rpc(name, args) }).search(query);
    assertMediaSession(revision);
    return results;
  },
};
