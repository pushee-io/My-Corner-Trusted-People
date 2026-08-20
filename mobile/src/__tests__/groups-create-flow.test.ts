import {
  createSocialGroup,
  defaultDay3NeighborhoodContext,
  getSocialGroupScreenSections,
  resetDay3CommunityRepositoryForTests,
} from '@/lib/day3-community-repository';

describe('group creation', () => {
  beforeEach(() => resetDay3CommunityRepositoryForTests());

  it('creates a visible group and makes the creator an accepted owner', () => {
    const result = createSocialGroup(
      {
        name: 'East Legon runners',
        description: 'Weekly community runs for verified neighbors.',
        visibility: 'verified_neighborhood_members',
      },
      defaultDay3NeighborhoodContext,
    );

    expect(result).toMatchObject({ accepted: true, group: { memberCount: 1 } });

    const section = getSocialGroupScreenSections(defaultDay3NeighborhoodContext).find(
      (item) => item.group.id === result.group?.id,
    );
    expect(section).toMatchObject({ membershipStatus: 'accepted' });
  });

  it('rejects creation for an unverified viewer', () => {
    expect(
      createSocialGroup(
        {
          name: 'East Legon runners',
          description: 'Weekly community runs.',
          visibility: 'verified_neighborhood_members',
        },
        { ...defaultDay3NeighborhoodContext, isVerifiedNeighborhoodMember: false },
      ),
    ).toEqual({ accepted: false, reason: 'not_verified' });
  });

  it('keeps a joinable group visible to the seeded requester', () => {
    const section = getSocialGroupScreenSections(defaultDay3NeighborhoodContext).find(
      (item) => item.group.id === 'group-east-legon-schools',
    );
    expect(section?.membershipStatus).toBe('none');
  });
});
