import type {
  SupabaseCommunityReadClient,
  SupabaseCommunityReadError,
  SupabaseCommunityReadResult,
  SupabaseCommunityReadTableName,
} from '@/lib/community-actions-supabase-read-adapter';

type SupabaseLikeSelectResult = {
  data: unknown[] | null;
  error: SupabaseCommunityReadError | null;
};

type SupabaseLikeQuery = {
  select: (columns?: string) => PromiseLike<SupabaseLikeSelectResult>;
};

type SupabaseLikeClient = {
  from: (table: string) => SupabaseLikeQuery;
};

let cachedSupabaseCommunityReadClient: SupabaseCommunityReadClient | undefined;

export function createSupabaseCommunityReadClient(client: SupabaseLikeClient): SupabaseCommunityReadClient {
  return {
    from(table: SupabaseCommunityReadTableName) {
      return {
        async select(columns?: string): Promise<SupabaseCommunityReadResult> {
          const result = await client.from(table).select(columns);

          return {
            data: result.data ?? [],
            error: result.error,
          };
        },
      };
    },
  };
}

export function getSupabaseCommunityReadClient(): SupabaseCommunityReadClient {
  if (!cachedSupabaseCommunityReadClient) {
    const { supabase } = require('@/lib/supabase') as {
      supabase: SupabaseLikeClient;
    };

    cachedSupabaseCommunityReadClient = createSupabaseCommunityReadClient(supabase);
  }

  return cachedSupabaseCommunityReadClient;
}

export function resetSupabaseCommunityReadClientForTests() {
  cachedSupabaseCommunityReadClient = undefined;
}
