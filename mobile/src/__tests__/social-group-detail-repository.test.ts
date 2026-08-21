import { readFileSync } from 'fs';
import { resetDay3CommunityRepositoryForTests } from '@/lib/day3-community-repository';
import {
  createSocialGroupDetailRepository,
  resetSocialGroupDetailRepositoryForTests,
} from '@/lib/social-group-detail-repository';

jest.mock('@/lib/auth', () => ({
  getCurrentProfile: jest.fn(),
}));

jest.mock('@/lib/supabase', () => ({
  assertSupabaseConfigured: jest.fn(),
  supabase: { from: jest.fn() },
}));

describe('social group detail repository', () => {
  beforeEach(() => {
    resetDay3CommunityRepositoryForTests();
    resetSocialGroupDetailRepositoryForTests();
  });

  it('keeps posting, comments, likes, and reports inside one seeded group destination', async () => {
    const repository = createSocialGroupDetailRepository('seeded');
    const initial = await repository.listPosts('group-east-legon-repairs');

    expect(initial).toHaveLength(1);
    expect(initial[0]).toMatchObject({
      id: 'group-post-repair-tip',
      authorName: 'Akosua Mensah',
      likeCount: 1,
      likedByMe: false,
      isReported: false,
    });
    expect(initial[0].comments).toHaveLength(1);

    const created = await repository.createPost('group-east-legon-repairs', '  New group update.  ');
    expect(created).toMatchObject({ body: 'New group update.', likeCount: 0, likedByMe: false });

    const comment = await repository.createComment(created.id, '  Helpful update.  ');
    expect(comment.body).toBe('Helpful update.');

    expect(await repository.toggleLike(created)).toEqual({ likeCount: 1, likedByMe: true });
    expect(await repository.reportPost(created.id, 'Spam or scam')).toBe('reported');
    expect(await repository.reportPost(created.id, 'Spam or scam')).toBe('already_reported');
  });

  it('keeps live engagement behind Supabase RLS and a new forward-only migration', () => {
    const repositorySource = readFileSync('src/lib/social-group-detail-repository.ts', 'utf8');
    const detailSource = readFileSync('app/groups/[groupId].tsx', 'utf8');
    const directorySource = readFileSync('app/groups/index.tsx', 'utf8');
    const migration = readFileSync('../supabase/migrations/20260820214000_social_group_engagement.sql', 'utf8');

    expect(directorySource).toContain("pathname: '/groups/[groupId]'");
    expect(directorySource).not.toContain('Post to this group');
    expect(detailSource).toContain('Post to this group');
    expect(detailSource).toContain("post.likedByMe ? 'Liked' : 'Like'");
    expect(detailSource).toContain('Comment (');
    expect(detailSource).toContain('Share');
    expect(detailSource).toContain('Report');

    expect(repositorySource).toContain(".from('social_group_post_comments')");
    expect(repositorySource).toContain(".from('social_group_post_reactions')");
    expect(repositorySource).toContain(".from('reports')");
    expect(repositorySource).toContain("supabase.rpc('report_social_group_post'");
    expect(repositorySource).not.toContain('SUPABASE_SERVICE_ROLE');

    expect(migration).toContain('public.is_accepted_social_group_member(post.group_id)');
    expect(migration).toContain('rls_social_group_post_comments_member_insert');
    expect(migration).toContain('rls_social_group_post_reactions_own_delete');
    expect(migration).toContain('queue_social_group_report_for_review');
    expect(migration).toContain('public.report_social_group_post');
    expect(migration).toContain('public.can_view_social_group(target_group_id)');
    expect(migration).toContain("set search_path = ''");
  });
});
