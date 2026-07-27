import {
  applyModerationAction,
  createNeighborhoodFeedComment,
  createNeighborhoodFeedPost,
  getCurrentNeighborhood,
  listModerationQueue,
  listNeighborhoodFeedPosts,
  reportNeighborhoodFeedComment,
  reportNeighborhoodFeedPost,
  subscribeToNeighborhoodFeedPosts,
  toggleNeighborhoodFeedLike,
} from '@/lib/community-repository';
import { getCurrentProfile } from '@/lib/auth';
import { assertSupabaseConfigured, supabase } from '@/lib/supabase';
import type { CurrentProfile } from '@/lib/auth';
import type { NeighborhoodFeedPost } from '@/types/contracts';

jest.mock('@/lib/auth', () => ({
  getCurrentProfile: jest.fn(),
}));

jest.mock('@/lib/supabase', () => ({
  assertSupabaseConfigured: jest.fn(),
  supabase: {
    channel: jest.fn(),
    from: jest.fn(),
    removeChannel: jest.fn(),
    rpc: jest.fn(),
  },
}));

type QueryResult = {
  data: unknown;
  error: unknown;
};

type QueryMock = PromiseLike<QueryResult> & {
  delete: jest.Mock;
  eq: jest.Mock;
  in: jest.Mock;
  insert: jest.Mock;
  limit: jest.Mock;
  neq: jest.Mock;
  or: jest.Mock;
  order: jest.Mock;
  select: jest.Mock;
  single: jest.Mock;
};

type SupabaseMock = {
  channel: jest.Mock;
  from: jest.Mock;
  removeChannel: jest.Mock;
  rpc: jest.Mock;
};

type RealtimePayload = {
  new: Record<string, unknown>;
};

type RealtimeConfig = {
  event: string;
  table: string;
};

type RealtimeChannelMock = {
  on: jest.Mock;
  subscribe: jest.Mock;
};

const mockedGetCurrentProfile = getCurrentProfile as jest.MockedFunction<typeof getCurrentProfile>;
const mockedAssertSupabaseConfigured = assertSupabaseConfigured as jest.MockedFunction<typeof assertSupabaseConfigured>;
const mockedSupabase = supabase as unknown as SupabaseMock;

const currentProfile: CurrentProfile = {
  id: 'profile-requester',
  authUserId: 'auth-requester',
  displayName: 'Ama Mensah',
  role: 'requester',
  phoneVerified: true,
};

function createQuery(result: QueryResult = { data: [], error: null }): QueryMock {
  const query = {} as QueryMock;

  query.delete = jest.fn(() => query);
  query.eq = jest.fn(() => query);
  query.in = jest.fn(() => query);
  query.insert = jest.fn(() => query);
  query.limit = jest.fn(() => query);
  query.neq = jest.fn(() => query);
  query.or = jest.fn(() => query);
  query.order = jest.fn(() => query);
  query.select = jest.fn(() => query);
  query.single = jest.fn(() => query);

  query.then = (onfulfilled, onrejected) => {
    return Promise.resolve(result).then(onfulfilled, onrejected);
  };

  return query;
}

function useTableQueries(queriesByTable: Record<string, QueryMock[]>) {
  mockedSupabase.from.mockImplementation((table: string) => {
    const query = queriesByTable[table]?.shift();

    if (!query) {
      throw new Error(`Unexpected table query: ${table}`);
    }

    return query;
  });
}

describe('community repository visibility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetCurrentProfile.mockResolvedValue(currentProfile);
  });

  it('loads only the signed-in user primary neighborhood', async () => {
    const membershipQuery = createQuery({
      data: [
        {
          neighborhood_id: 'east-legon',
          neighborhoods: { id: 'east-legon', name: 'East Legon' },
        },
      ],
      error: null,
    });

    useTableQueries({
      neighborhood_memberships: [membershipQuery],
    });

    await expect(getCurrentNeighborhood()).resolves.toEqual({
      id: 'east-legon',
      name: 'East Legon',
    });

    expect(mockedAssertSupabaseConfigured).toHaveBeenCalledTimes(1);
    expect(membershipQuery.eq).toHaveBeenCalledWith('profile_id', 'profile-requester');
    expect(membershipQuery.eq).toHaveBeenCalledWith('is_primary', true);
    expect(membershipQuery.limit).toHaveBeenCalledWith(1);
  });

  it('requires a primary neighborhood before showing local feed content', async () => {
    const membershipQuery = createQuery({ data: [], error: null });

    useTableQueries({
      neighborhood_memberships: [membershipQuery],
    });

    await expect(getCurrentNeighborhood()).rejects.toThrow(
      'No primary neighborhood membership found for this signed-in user.',
    );
  });

  it('lists neighborhood feed posts without blocked posts or blocked replies', async () => {
    const postsQuery = createQuery({
      data: [
        {
          id: 'post-1',
          neighborhood_id: 'east-legon',
          author_id: 'neighbor-1',
          body: 'Streetlight is out near the junction.',
          moderation_status: 'clean',
          created_at: '2026-07-24T10:00:00.000Z',
        },
      ],
      error: null,
    });

    const commentsQuery = createQuery({
      data: [
        {
          id: 'comment-1',
          post_id: 'post-1',
          author_id: 'neighbor-2',
          body: 'I reported it this morning.',
          moderation_status: 'clean',
          created_at: '2026-07-24T10:05:00.000Z',
        },
      ],
      error: null,
    });

    const reactionsQuery = createQuery({
      data: [
        { id: 'reaction-1', post_id: 'post-1', profile_id: 'profile-requester' },
        { id: 'reaction-2', post_id: 'post-1', profile_id: 'neighbor-3' },
      ],
      error: null,
    });

    const profilesQuery = createQuery({
      data: [
        { id: 'neighbor-1', display_name: 'Kojo' },
        { id: 'neighbor-2', display_name: 'Efua' },
      ],
      error: null,
    });

    const reportsQuery = createQuery({
      data: [
        {
          neighborhood_feed_post_id: null,
          neighborhood_feed_comment_id: 'comment-1',
        },
      ],
      error: null,
    });

    useTableQueries({
      neighborhood_feed_posts: [postsQuery],
      neighborhood_feed_comments: [commentsQuery],
      neighborhood_feed_reactions: [reactionsQuery],
      profiles: [profilesQuery],
      reports: [reportsQuery],
    });

    await expect(listNeighborhoodFeedPosts('east-legon')).resolves.toEqual([
      {
        id: 'post-1',
        neighborhoodId: 'east-legon',
        authorId: 'neighbor-1',
        authorName: 'Kojo',
        body: 'Streetlight is out near the junction.',
        moderationStatus: 'clean',
        createdAt: '2026-07-24T10:00:00.000Z',
        comments: [
          {
            id: 'comment-1',
            postId: 'post-1',
            authorId: 'neighbor-2',
            authorName: 'Efua',
            body: 'I reported it this morning.',
            moderationStatus: 'clean',
            createdAt: '2026-07-24T10:05:00.000Z',
            isReported: true,
          },
        ],
        likeCount: 2,
        likedByMe: true,
        isReported: false,
      },
    ]);

    expect(postsQuery.eq).toHaveBeenCalledWith('neighborhood_id', 'east-legon');
    expect(postsQuery.neq).toHaveBeenCalledWith('moderation_status', 'blocked');
    expect(commentsQuery.neq).toHaveBeenCalledWith('moderation_status', 'blocked');
    expect(reportsQuery.eq).toHaveBeenCalledWith('reporter_id', 'profile-requester');
    expect(reportsQuery.or).toHaveBeenCalledWith(
      'neighborhood_feed_post_id.in.(post-1),neighborhood_feed_comment_id.in.(comment-1)',
    );
  });

  it('creates neighborhood posts with pending moderation in the selected neighborhood', async () => {
    const postQuery = createQuery({
      data: {
        id: 'post-new',
        neighborhood_id: 'east-legon',
        author_id: 'profile-requester',
        body: 'Streetlight question',
        moderation_status: 'not_run',
        created_at: '2026-07-24T11:00:00.000Z',
      },
      error: null,
    });

    useTableQueries({
      neighborhood_feed_posts: [postQuery],
    });

    await expect(createNeighborhoodFeedPost('east-legon', '  Streetlight question  ')).resolves.toMatchObject({
      id: 'post-new',
      neighborhoodId: 'east-legon',
      authorId: 'profile-requester',
      authorName: 'Ama Mensah',
      body: 'Streetlight question',
      moderationStatus: 'not_run',
    });

    expect(postQuery.insert).toHaveBeenCalledWith({
      neighborhood_id: 'east-legon',
      author_id: 'profile-requester',
      body: 'Streetlight question',
      moderation_status: 'not_run',
    });
  });

  it('creates neighborhood comments with pending moderation', async () => {
    const commentQuery = createQuery({
      data: {
        id: 'comment-new',
        post_id: 'post-1',
        author_id: 'profile-requester',
        body: 'Please share the ECG reference if you get one.',
        moderation_status: 'not_run',
        created_at: '2026-07-24T11:05:00.000Z',
      },
      error: null,
    });

    useTableQueries({
      neighborhood_feed_comments: [commentQuery],
    });

    await expect(
      createNeighborhoodFeedComment('post-1', '  Please share the ECG reference if you get one.  '),
    ).resolves.toMatchObject({
      id: 'comment-new',
      postId: 'post-1',
      authorId: 'profile-requester',
      authorName: 'Ama Mensah',
      body: 'Please share the ECG reference if you get one.',
      moderationStatus: 'not_run',
      isReported: false,
    });

    expect(commentQuery.insert).toHaveBeenCalledWith({
      post_id: 'post-1',
      author_id: 'profile-requester',
      body: 'Please share the ECG reference if you get one.',
      moderation_status: 'not_run',
    });
  });

  it('records reports for posts and comments without changing feed visibility locally', async () => {
    const postReportQuery = createQuery({ data: null, error: null });
    const commentReportQuery = createQuery({ data: null, error: null });

    useTableQueries({
      reports: [postReportQuery, commentReportQuery],
    });

    await reportNeighborhoodFeedPost('post-1', 'Unsafe request');
    await reportNeighborhoodFeedComment('comment-1');

    expect(postReportQuery.insert).toHaveBeenCalledWith({
      reporter_id: 'profile-requester',
      neighborhood_feed_post_id: 'post-1',
      reason: 'Unsafe request',
      details: 'Reported from the neighborhood feed.',
      status: 'open',
    });

    expect(commentReportQuery.insert).toHaveBeenCalledWith({
      reporter_id: 'profile-requester',
      neighborhood_feed_comment_id: 'comment-1',
      reason: 'Community reply report',
      details: 'Reported from a neighborhood feed reply.',
      status: 'open',
    });
  });

  it('toggles likes using the current profile and the post id', async () => {
    const deleteQuery = createQuery({ data: null, error: null });
    const insertQuery = createQuery({ data: null, error: null });

    const likedPost = {
      id: 'post-1',
      likeCount: 3,
      likedByMe: true,
    } as NeighborhoodFeedPost;

    const unlikedPost = {
      id: 'post-2',
      likeCount: 0,
      likedByMe: false,
    } as NeighborhoodFeedPost;

    useTableQueries({
      neighborhood_feed_reactions: [deleteQuery, insertQuery],
    });

    await expect(toggleNeighborhoodFeedLike(likedPost)).resolves.toEqual({
      likeCount: 2,
      likedByMe: false,
    });

    await expect(toggleNeighborhoodFeedLike(unlikedPost)).resolves.toEqual({
      likeCount: 1,
      likedByMe: true,
    });

    expect(deleteQuery.delete).toHaveBeenCalledTimes(1);
    expect(deleteQuery.eq).toHaveBeenCalledWith('post_id', 'post-1');
    expect(deleteQuery.eq).toHaveBeenCalledWith('profile_id', 'profile-requester');
    expect(deleteQuery.eq).toHaveBeenCalledWith('reaction_type', 'like');

    expect(insertQuery.insert).toHaveBeenCalledWith({
      post_id: 'post-2',
      profile_id: 'profile-requester',
      reaction_type: 'like',
    });
  });

  it('lists moderation cases and applies human moderation decisions', async () => {
    const queueQuery = createQuery({
      data: [
        {
          id: 'case-1',
          source_table: 'neighborhood_feed_posts',
          source_id: 'post-1',
          reason: 'Possible unsafe content',
          status: 'open',
          created_at: '2026-07-24T12:00:00.000Z',
          resolution_action: null,
          resolved_at: null,
        },
      ],
      error: null,
    });

    mockedSupabase.rpc.mockResolvedValue({
      data: {
        id: 'case-1',
        source_table: 'neighborhood_feed_posts',
        source_id: 'post-1',
        reason: 'Possible unsafe content',
        status: 'resolved',
        created_at: '2026-07-24T12:00:00.000Z',
        resolution_action: 'hide_content',
        resolved_at: '2026-07-24T12:15:00.000Z',
      },
      error: null,
    });

    useTableQueries({
      moderation_cases: [queueQuery],
    });

    await expect(listModerationQueue()).resolves.toEqual([
      {
        id: 'case-1',
        sourceTable: 'neighborhood_feed_posts',
        sourceId: 'post-1',
        reason: 'Possible unsafe content',
        status: 'open',
        createdAt: '2026-07-24T12:00:00.000Z',
        resolutionAction: undefined,
        resolvedAt: undefined,
      },
    ]);

    await expect(applyModerationAction('case-1', 'hide_content')).resolves.toMatchObject({
      id: 'case-1',
      status: 'resolved',
      resolutionAction: 'hide_content',
    });

    expect(mockedSupabase.rpc).toHaveBeenCalledWith('resolve_moderation_case', {
      case_id: 'case-1',
      action: 'hide_content',
    });
  });

  it('subscribes to visible realtime feed inserts and hidden-content updates', () => {
    const handlers: Record<string, (payload: RealtimePayload) => void> = {};

    const channel: RealtimeChannelMock = {
      on: jest.fn(
        (_event: string, config: RealtimeConfig, callback: (payload: RealtimePayload) => void): RealtimeChannelMock => {
          handlers[`${config.table}:${config.event}`] = callback;
          return channel;
        },
      ),
      subscribe: jest.fn((callback: (status: string, error?: Error) => void): RealtimeChannelMock => {
        callback('SUBSCRIBED');
        return channel;
      }),
    };

    mockedSupabase.channel.mockReturnValue(channel);

    const onPost = jest.fn();
    const onComment = jest.fn();
    const onPostHidden = jest.fn();
    const onCommentHidden = jest.fn();
    const onError = jest.fn();
    const onStatus = jest.fn();

    const unsubscribe = subscribeToNeighborhoodFeedPosts(
      'east-legon',
      onPost,
      onComment,
      onPostHidden,
      onCommentHidden,
      onError,
      onStatus,
    );

    handlers['neighborhood_feed_posts:INSERT']({
      new: {
        id: 'post-1',
        neighborhood_id: 'east-legon',
        author_id: 'neighbor-1',
        body: 'Water pressure is low today.',
        moderation_status: 'clean',
        created_at: '2026-07-24T13:00:00.000Z',
      },
    });

    handlers['neighborhood_feed_posts:INSERT']({
      new: {
        id: 'post-blocked',
        neighborhood_id: 'east-legon',
        author_id: 'neighbor-2',
        body: 'Blocked content',
        moderation_status: 'blocked',
        created_at: '2026-07-24T13:01:00.000Z',
      },
    });

    handlers['neighborhood_feed_comments:INSERT']({
      new: {
        id: 'comment-1',
        post_id: 'post-1',
        author_id: 'neighbor-3',
        body: 'Same here.',
        moderation_status: 'clean',
        created_at: '2026-07-24T13:02:00.000Z',
      },
    });

    handlers['neighborhood_feed_posts:UPDATE']({
      new: { id: 'post-1', moderation_status: 'blocked' },
    });

    handlers['neighborhood_feed_comments:UPDATE']({
      new: { id: 'comment-1', moderation_status: 'blocked' },
    });

    expect(mockedSupabase.channel).toHaveBeenCalledWith('neighborhood-feed:east-legon');
    expect(onStatus).toHaveBeenCalledWith('live');

    expect(onPost).toHaveBeenCalledTimes(1);
    expect(onPost).toHaveBeenCalledWith(expect.objectContaining({ id: 'post-1' }));

    expect(onComment).toHaveBeenCalledTimes(1);
    expect(onComment).toHaveBeenCalledWith(expect.objectContaining({ id: 'comment-1' }));

    expect(onPostHidden).toHaveBeenCalledWith('post-1');
    expect(onCommentHidden).toHaveBeenCalledWith('comment-1');
    expect(onError).not.toHaveBeenCalled();

    unsubscribe();

    expect(mockedSupabase.removeChannel).toHaveBeenCalledWith(channel);
  });
});
