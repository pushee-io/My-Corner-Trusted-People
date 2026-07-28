import { createSupabaseCommunityReadClient } from '@/lib/community-actions-supabase-live-client';
import type { SupabaseCommunityReadTableName } from '@/lib/community-actions-supabase-read-adapter';

type Call = {
  table: string;
  columns?: string;
};

function createFakeSupabaseClient(dataByTable: Record<string, unknown[]>) {
  const calls: Call[] = [];

  const client = {
    from(table: string) {
      return {
        async select(columns?: string) {
          calls.push({ table, columns });

          return {
            data: dataByTable[table] ?? [],
            error: null,
          };
        },
      };
    },
  };

  return { client, calls };
}

function createFailingSupabaseClient(message: string) {
  const client = {
    from(table: string) {
      return {
        async select(columns?: string) {
          void table;
          void columns;

          return {
            data: null,
            error: { message },
          };
        },
      };
    },
  };

  return client;
}

describe('Day 11A Supabase live read client wrapper', () => {
  it('adapts a Supabase-like client to the community read client interface', async () => {
    const { client, calls } = createFakeSupabaseClient({
      social_groups: [
        {
          id: 'group-east-legon-repairs',
          name: 'East Legon repair tips',
        },
      ],
    });
    const readClient = createSupabaseCommunityReadClient(client);

    const result = await readClient.from('social_groups').select('id,name');

    expect(result).toEqual({
      data: [
        {
          id: 'group-east-legon-repairs',
          name: 'East Legon repair tips',
        },
      ],
      error: null,
    });
    expect(calls).toEqual([
      {
        table: 'social_groups',
        columns: 'id,name',
      },
    ]);
  });

  it('normalizes null Supabase data to an empty array', async () => {
    const client = {
      from(table: string) {
        return {
          async select(columns?: string) {
            void table;
            void columns;

            return {
              data: null,
              error: null,
            };
          },
        };
      },
    };
    const readClient = createSupabaseCommunityReadClient(client);

    await expect(readClient.from('agency_broadcasts').select('*')).resolves.toEqual({
      data: [],
      error: null,
    });
  });

  it('passes Supabase read errors through for the read adapter to handle', async () => {
    const readClient = createSupabaseCommunityReadClient(createFailingSupabaseClient('database unavailable'));

    await expect(readClient.from('community_reports').select('*')).resolves.toEqual({
      data: [],
      error: { message: 'database unavailable' },
    });
  });

  it('only accepts known community read table names at the type boundary', () => {
    const table: SupabaseCommunityReadTableName = 'social_group_posts';

    expect(table).toBe('social_group_posts');
  });
});
