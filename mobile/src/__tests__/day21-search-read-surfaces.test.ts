import { readFileSync } from 'fs';
import { createSearchRepository } from '@/lib/search-repository';
const id = 'd5000000-0000-4000-8000-000000000001';
const paths = {
  provider: '/hire/provider/',
  post: '/community?postId=',
  group: '/groups/',
  event: '/events/',
  agency: '/agency-broadcasts?broadcastId=',
  marketplace: '/marketplace/listing/',
};
function buildRepository(failure?: string) {
  return createSearchRepository({
    rpc: async (name, args) => {
      if (name !== 'neighborhood_search_retrieve') return { data: { id }, error: null };
      const kind = args?.source_kind as keyof typeof paths;
      if (kind === 'post' && failure) return { data: null, error: { code: failure } };
      return {
        data: [
          {
            id,
            kind,
            title: 'Plumbing fixture',
            text: 'Plumbing help',
            authority: kind,
            href: paths[kind] + id,
            publishedAt: '2026-09-28T00:00:00Z',
            phone_number: '+233000000000',
            email: 'private@example.com',
            exact_address: 'PRIVATE',
            legal_name: 'PRIVATE',
          },
        ],
        error: null,
      };
    },
  });
}
it('discovers all authorized public source families with the canonical planner', async () => {
  const results = await buildRepository().search('plumber');
  expect(results.map((r) => r.kind).sort()).toEqual([
    'agency_broadcast',
    'event',
    'group',
    'marketplace_listing',
    'post',
    'provider',
  ]);
  expect(results.some((r) => String(r.kind) === 'request')).toBe(false);
});
it('retains healthy sources on transient failure and fails closed on authorization denial', async () => {
  const results = await buildRepository('57014').search('plumbing');
  expect(results).toHaveLength(5);
  expect(results.unavailableSources).toEqual(['Neighborhood Feed']);
  await expect(buildRepository('42501').search('plumbing')).rejects.toThrow();
});
it('source projection strips private fields and never searches private requests', async () => {
  const results = await buildRepository().search('plumber');
  expect(JSON.stringify(results)).not.toMatch(
    /phone_number|email|exact_address|legal_name|PRIVATE|private@example.com/,
  );
  const source = readFileSync('src/lib/search-repository.ts', 'utf8');
  expect(source).not.toMatch(/listProviderRequests|pickupArea|\.from\(/);
});
it('keeps Search model-free and read-only', () => {
  const source = readFileSync('src/lib/search-repository.ts', 'utf8');
  expect(source).not.toMatch(/\.insert\(|\.update\(|\.delete\(|functions.invoke|neighborhood_ai_meter/);
  expect(readFileSync('app/search.tsx', 'utf8')).toContain('searchRepository.search');
});
