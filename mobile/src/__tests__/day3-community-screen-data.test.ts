import { getAgencyBroadcastScreenItems, getSocialGroupScreenSections } from '@/lib/day3-community-repository';
import type { Day3NeighborhoodContext } from '@/types/day3';

const eastLegonViewer: Day3NeighborhoodContext = {
  profileId: 'profile-akosua',
  neighborhoodId: 'east-legon',
  clusterId: 'accra-east',
  regionId: 'greater-accra',
  isVerifiedNeighborhoodMember: true,
};

describe('Day 3 community screen data', () => {
  it('feeds the Groups screen only visible groups and visible group posts', () => {
    const sections = getSocialGroupScreenSections(eastLegonViewer);

    expect(sections.map((section) => section.group.id)).toEqual(['group-east-legon-repairs', 'group-accra-east-water']);
    expect(sections.flatMap((section) => section.posts).map((post) => post.id)).toEqual(['group-post-repair-tip']);
    expect(sections.flatMap((section) => section.posts).every((post) => post.moderationStatus !== 'blocked')).toBe(
      true,
    );
  });

  it('feeds the Agency broadcasts screen only approved visible broadcasts', () => {
    const broadcasts = getAgencyBroadcastScreenItems(eastLegonViewer);

    expect(broadcasts.map((broadcast) => broadcast.id)).toEqual([
      'broadcast-road-works-approved',
      'broadcast-water-cluster',
    ]);
    expect(broadcasts.every((broadcast) => broadcast.isAgencyApproved)).toBe(true);
    expect(broadcasts.every((broadcast) => broadcast.moderationStatus !== 'blocked')).toBe(true);
  });

  it('locks both screen data sources for unverified viewers', () => {
    const unverifiedViewer = {
      ...eastLegonViewer,
      isVerifiedNeighborhoodMember: false,
    };

    expect(getSocialGroupScreenSections(unverifiedViewer)).toEqual([]);
    expect(getAgencyBroadcastScreenItems(unverifiedViewer)).toEqual([]);
  });
});
