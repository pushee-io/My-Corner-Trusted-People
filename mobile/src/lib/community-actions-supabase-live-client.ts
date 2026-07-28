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

type SupabaseModuleShape = {
  supabase?: SupabaseLikeClient;
  supabaseConfigDiagnostics?: {
    hasSupabaseUrl?: boolean;
    hasSupabaseAnonKey?: boolean;
  };
};

export type SupabaseCommunityReadClientFailureCode = 'none' | 'module_load_failed' | 'client_missing';

export type SupabaseCommunityReadClientDiagnostics = {
  clientAvailable: boolean;
  hasSupabaseUrl: boolean;
  hasSupabaseAnonKey: boolean;
  failureCode: SupabaseCommunityReadClientFailureCode;
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

export function createSupabaseCommunityReadClientDiagnostics(input: {
  hasSupabaseAnonKey?: boolean;
  hasSupabaseUrl?: boolean;
  moduleLoadFailed?: boolean;
  supabase?: SupabaseLikeClient;
}): SupabaseCommunityReadClientDiagnostics {
  const hasSupabaseUrl = Boolean(input.hasSupabaseUrl);
  const hasSupabaseAnonKey = Boolean(input.hasSupabaseAnonKey);

  if (input.moduleLoadFailed) {
    return {
      clientAvailable: false,
      hasSupabaseUrl,
      hasSupabaseAnonKey,
      failureCode: 'module_load_failed',
    };
  }

  if (!input.supabase) {
    return {
      clientAvailable: false,
      hasSupabaseUrl,
      hasSupabaseAnonKey,
      failureCode: 'client_missing',
    };
  }

  return {
    clientAvailable: true,
    hasSupabaseUrl,
    hasSupabaseAnonKey,
    failureCode: 'none',
  };
}

export function getSupabaseCommunityReadClient(): SupabaseCommunityReadClient {
  if (!cachedSupabaseCommunityReadClient) {
    const supabaseModule = loadSupabaseModule();

    if (!supabaseModule.supabase) {
      throw new Error('Supabase read client is unavailable.');
    }

    cachedSupabaseCommunityReadClient = createSupabaseCommunityReadClient(supabaseModule.supabase);
  }

  return cachedSupabaseCommunityReadClient;
}

export function getSupabaseCommunityReadClientDiagnostics(): SupabaseCommunityReadClientDiagnostics {
  const supabaseModule = loadSupabaseModuleSafely();

  return createSupabaseCommunityReadClientDiagnostics({
    hasSupabaseUrl: supabaseModule.module?.supabaseConfigDiagnostics?.hasSupabaseUrl,
    hasSupabaseAnonKey: supabaseModule.module?.supabaseConfigDiagnostics?.hasSupabaseAnonKey,
    moduleLoadFailed: supabaseModule.moduleLoadFailed,
    supabase: supabaseModule.module?.supabase,
  });
}

export function resetSupabaseCommunityReadClientForTests() {
  cachedSupabaseCommunityReadClient = undefined;
}

function loadSupabaseModule(): SupabaseModuleShape {
  return require('@/lib/supabase') as SupabaseModuleShape;
}

function loadSupabaseModuleSafely(): { module?: SupabaseModuleShape; moduleLoadFailed: boolean } {
  try {
    return {
      module: loadSupabaseModule(),
      moduleLoadFailed: false,
    };
  } catch {
    return {
      moduleLoadFailed: true,
    };
  }
}
