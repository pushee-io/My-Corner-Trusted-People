import { readFileSync } from 'fs';
import { resetDay3CommunityRepositoryForTests } from '@/lib/day3-community-repository';
import { createGroupMembershipRepository } from '@/lib/group-membership-repository';

jest.mock('@/lib/auth', () => ({
  getCurrentProfile: jest.fn(),
}));

jest.mock('@/lib/supabase', () => ({
  assertSupabaseConfigured: jest.fn(),
  supabase: { rpc: jest.fn() },
}));

describe('Groups membership workflow', () => {
  afterEach(() => {
    resetDay3CommunityRepositoryForTests();
  });

  it('moves a request through pending, rejection, retry, and acceptance', async () => {
    const repository = createGroupMembershipRepository('seeded');

    const firstRequest = await repository.requestMembership('group-east-legon-repairs');
    expect(firstRequest).toMatchObject({ status: 'pending', created: true });

    const pending = await repository.listPendingMemberships();
    const request = pending.find((item) => item.groupId === 'group-east-legon-repairs');
    expect(request).toMatchObject({
      groupName: 'East Legon repair tips',
      applicantName: 'New pilot resident',
      status: 'pending',
    });

    expect(await repository.decideMembership(request!.membershipId, 'rejected')).toMatchObject({
      accepted: true,
      status: 'rejected',
    });
    expect(await repository.listPendingMemberships()).not.toContainEqual(
      expect.objectContaining({ membershipId: request!.membershipId }),
    );

    expect(await repository.requestMembership('group-east-legon-repairs')).toMatchObject({
      status: 'pending',
      created: true,
    });
    expect(await repository.decideMembership(request!.membershipId, 'accepted')).toMatchObject({
      accepted: true,
      status: 'accepted',
    });
    expect(await repository.decideMembership(request!.membershipId, 'accepted')).toMatchObject({
      accepted: false,
      reason: 'not_pending',
    });

    expect(await repository.requestMembership('group-east-legon-repairs')).toMatchObject({
      status: 'accepted',
      created: false,
    });
  });

  it('keeps live membership actions behind authenticated RPCs and safe UI errors', () => {
    const repositorySource = readFileSync('src/lib/group-membership-repository.ts', 'utf8');
    const groupsSource = readFileSync('app/groups/index.tsx', 'utf8');
    const reviewSource = readFileSync('app/groups/membership-requests.tsx', 'utf8');
    const migration = readFileSync('../supabase/migrations/20260812042000_groups_membership_workflow.sql', 'utf8');
    const easConfig = JSON.parse(readFileSync('eas.json', 'utf8'));

    expect(repositorySource).toContain("supabase.rpc('request_social_group_membership'");
    expect(repositorySource).toContain("supabase.rpc('list_pending_social_group_memberships'");
    expect(repositorySource).toContain("supabase.rpc('decide_social_group_membership'");
    expect(repositorySource).not.toContain('caught.message');

    expect(easConfig.build.preview.env.EXPO_PUBLIC_COMMUNITY_ACTIONS_REPOSITORY).toBe('supabase');

    expect(groupsSource).toContain('Sending request...');
    expect(groupsSource).toContain('Request again');
    expect(groupsSource).toContain('getCurrentProfile');
    expect(groupsSource).toContain('profileId: (await getCurrentProfile()).id');
    expect(groupsSource).toContain('Your request is waiting for moderator review.');
    expect(groupsSource).toContain('Could not send your join request.');
    expect(reviewSource).toContain('Membership approved.');
    expect(reviewSource).toContain('Membership request declined.');
    expect(reviewSource).toContain('Could not save this membership decision.');

    expect(migration).toContain('public.current_profile_id()');
    expect(migration).toContain('public.can_view_social_group(target_group_id)');
    expect(migration).toContain('public.is_admin_or_moderator()');
    expect(migration).toContain('social_group_membership_events');
    expect(migration).toContain("membership_record.status <> 'pending'");
    expect(migration).toContain("set search_path = ''");
    expect(migration).toContain('revoke update on public.social_group_memberships from authenticated');
    expect(migration).toContain('rls_social_group_memberships_own_or_moderator_read');
  });
});
