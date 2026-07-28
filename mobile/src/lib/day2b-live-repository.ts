import {
  completeResidenceVerificationFromPostcard,
  createDay2BLocalPost,
  day2bNeighborhoodId,
  getDay2BFeedUnlockStatus,
  listDay2BNeighborhoodPosts,
} from '@/lib/day2b-verification';
import type { FeedUnlockResult, NeighborhoodFeedPost, NeighborhoodMembership } from '@/types/contracts';

export type Day2BLiveRepositoryMode = 'seeded' | 'supabase';

export type Day2BLiveFailureCode =
  | 'none'
  | 'supabase_not_configured'
  | 'client_missing'
  | 'supabase_read_failed'
  | 'live_writes_disabled';

export type Day2BLiveDiagnostics = {
  configuredMode: Day2BLiveRepositoryMode;
  activeMode: Day2BLiveRepositoryMode;
  clientAvailable: boolean;
  hasSupabaseUrl: boolean;
  hasSupabaseAnonKey: boolean;
  failureCode: Day2BLiveFailureCode;
};

export type Day2BSafeMembershipSummary = {
  profileId: string;
  neighborhoodId: string;
  status: NeighborhoodMembership['status'];
  isPrimary: boolean;
  verifiedAt?: string;
};

export type Day2BSafeLocalPostInput = {
  neighborhoodId: string;
  profileId: string;
  body: string;
};

export type Day2BCreatePostResult =
  | { accepted: true; post: NeighborhoodFeedPost }
  | { accepted: false; reason: 'empty_body' | 'feed_locked' | 'live_writes_disabled' };

export type Day2BLiveClient = {
  getPrimaryMembership: () => Promise<Day2BSafeMembershipSummary | undefined>;
  listNeighborhoodPosts: (neighborhoodId: string) => Promise<NeighborhoodFeedPost[]>;
};

export type Day2BLiveRepositoryOptions = {
  mode?: Day2BLiveRepositoryMode;
  client?: Day2BLiveClient;
  hasSupabaseUrl?: boolean;
  hasSupabaseAnonKey?: boolean;
};

export type Day2BLiveRepository = {
  mode: Day2BLiveRepositoryMode;
  completeResidenceVerificationFromPostcard: () => Promise<NeighborhoodMembership>;
  getFeedUnlockStatus: () => Promise<FeedUnlockResult>;
  listNeighborhoodPosts: () => Promise<NeighborhoodFeedPost[]>;
  createLocalPost: (body: string) => Promise<Day2BCreatePostResult>;
  getDiagnostics: () => Day2BLiveDiagnostics;
};

const lockedLiveFeedStatus: FeedUnlockResult = {
  status: 'locked',
  neighborhoodId: day2bNeighborhoodId,
  canRead: false,
  canWrite: false,
  canPost: false,
  reason: 'no_membership',
  title: 'Verify your neighborhood',
  message: 'Connect Supabase and sign in before using the live verified neighborhood feed.',
};

export function createDay2BLiveRepository(options: Day2BLiveRepositoryOptions = {}): Day2BLiveRepository {
  const configuredMode = options.mode ?? getConfiguredDay2BRepositoryMode();
  const hasSupabaseUrl = options.hasSupabaseUrl ?? Boolean(process.env.EXPO_PUBLIC_SUPABASE_URL);
  const hasSupabaseAnonKey = options.hasSupabaseAnonKey ?? Boolean(process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);
  const clientAvailable = Boolean(options.client);
  let failureCode: Day2BLiveFailureCode = 'none';

  function getDiagnostics(): Day2BLiveDiagnostics {
    return {
      configuredMode,
      activeMode: configuredMode,
      clientAvailable,
      hasSupabaseUrl,
      hasSupabaseAnonKey,
      failureCode,
    };
  }

  if (configuredMode === 'seeded') {
    return createSeededRepository(getDiagnostics);
  }

  if (!hasSupabaseUrl || !hasSupabaseAnonKey) {
    failureCode = 'supabase_not_configured';
    return createFailClosedSupabaseRepository(getDiagnostics);
  }

  if (!options.client) {
    failureCode = 'client_missing';
    return createFailClosedSupabaseRepository(getDiagnostics);
  }

  return createSupabaseReadOnlyRepository(options.client, getDiagnostics, (code) => {
    failureCode = code;
  });
}

export const day2bLiveRepository = createDay2BLiveRepository();

function createSeededRepository(getDiagnostics: () => Day2BLiveDiagnostics): Day2BLiveRepository {
  return {
    mode: 'seeded',

    async completeResidenceVerificationFromPostcard() {
      return completeResidenceVerificationFromPostcard();
    },

    async getFeedUnlockStatus() {
      return getDay2BFeedUnlockStatus();
    },

    async listNeighborhoodPosts() {
      return listDay2BNeighborhoodPosts();
    },

    async createLocalPost(body) {
      if (!body.trim()) {
        return { accepted: false, reason: 'empty_body' };
      }

      const post = createDay2BLocalPost(body);

      if (!post) {
        return { accepted: false, reason: 'feed_locked' };
      }

      return { accepted: true, post };
    },

    getDiagnostics,
  };
}

function createFailClosedSupabaseRepository(getDiagnostics: () => Day2BLiveDiagnostics): Day2BLiveRepository {
  return {
    mode: 'supabase',

    async completeResidenceVerificationFromPostcard() {
      return completeResidenceVerificationFromPostcard();
    },

    async getFeedUnlockStatus() {
      return lockedLiveFeedStatus;
    },

    async listNeighborhoodPosts() {
      return [];
    },

    async createLocalPost() {
      return { accepted: false, reason: 'live_writes_disabled' };
    },

    getDiagnostics,
  };
}

function createSupabaseReadOnlyRepository(
  client: Day2BLiveClient,
  getDiagnostics: () => Day2BLiveDiagnostics,
  setFailureCode: (code: Day2BLiveFailureCode) => void,
): Day2BLiveRepository {
  return {
    mode: 'supabase',

    async completeResidenceVerificationFromPostcard() {
      return completeResidenceVerificationFromPostcard();
    },

    async getFeedUnlockStatus() {
      try {
        const membership = await client.getPrimaryMembership();

        if (!membership || membership.status !== 'verified') {
          return lockedLiveFeedStatus;
        }

        return {
          status: 'unlocked',
          neighborhoodId: membership.neighborhoodId,
          canRead: true,
          canWrite: false,
          canPost: false,
          reason: 'verified_member',
          title: 'Neighborhood feed unlocked',
          message: 'Live Supabase reads are enabled. Posting remains disabled for this recovery slice.',
        };
      } catch {
        setFailureCode('supabase_read_failed');
        return lockedLiveFeedStatus;
      }
    },

    async listNeighborhoodPosts() {
      try {
        const membership = await client.getPrimaryMembership();

        if (!membership || membership.status !== 'verified') {
          return [];
        }

        return client.listNeighborhoodPosts(membership.neighborhoodId);
      } catch {
        setFailureCode('supabase_read_failed');
        return [];
      }
    },

    async createLocalPost() {
      setFailureCode('live_writes_disabled');
      return { accepted: false, reason: 'live_writes_disabled' };
    },

    getDiagnostics,
  };
}

function getConfiguredDay2BRepositoryMode(): Day2BLiveRepositoryMode {
  return process.env.EXPO_PUBLIC_DAY2B_REPOSITORY === 'supabase' ? 'supabase' : 'seeded';
}
