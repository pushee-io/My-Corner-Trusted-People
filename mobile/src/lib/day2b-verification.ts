import { createNeighborhoodFeedPost, getFeedUnlockStatus, listUnlockedNeighborhoodPosts } from '@/lib/feed-unlock';
import { saveNeighborhoodMembershipRecord } from '@/lib/neighborhood-membership-record';
import { testRequester } from '@/lib/session';
import type { AuditEvent, NeighborhoodFeedPost, NeighborhoodMembership } from '@/types/contracts';

type Day2BPostResult = NeighborhoodFeedPost | undefined;

export const day2bNeighborhoodId = 'east-legon';
export const day2bNeighborhoodName = 'East Legon';
export const day2bAuthorDisplayName = 'Akosua M.';

const now = '2026-07-24T12:00:00.000Z';

export function completeResidenceVerificationFromPostcard(): NeighborhoodMembership {
  const membership: NeighborhoodMembership = {
    userId: testRequester.id,
    neighborhoodId: day2bNeighborhoodId,
    status: 'verified',
    assignedBy: 'server',
    verifiedAt: now,
    evidenceSummary: [
      'phone verified in test provider',
      'private legal name saved',
      'test identity assurance completed without Ghana Card image',
      'Ghana-compatible address saved privately',
      'map location confirmed as general residential point',
      'foreground location check or postcard fallback completed',
      'test postcard challenge code confirmed',
    ],
  };

  const auditEvent: AuditEvent = {
    id: `audit-${testRequester.id}-${day2bNeighborhoodId}`,
    actor: 'system',
    action: 'neighborhood_membership.verified',
    subjectId: testRequester.id,
    createdAt: now,
    metadata: {
      assignedBy: 'server',
      neighborhoodId: day2bNeighborhoodId,
      verificationMethod: 'test_postcard',
      exactAddressExposed: false,
      ghanaPostGpsExposed: false,
      rawCoordinatesExposed: false,
    },
  };

  return saveNeighborhoodMembershipRecord({ membership, auditEvent, now });
}

export function getDay2BFeedUnlockStatus() {
  return getFeedUnlockStatus(testRequester.id, day2bNeighborhoodId);
}

export function listDay2BNeighborhoodPosts(): NeighborhoodFeedPost[] {
  return listUnlockedNeighborhoodPosts(testRequester.id, day2bNeighborhoodId);
}

export function createDay2BLocalPost(body: string): Day2BPostResult {
  return createNeighborhoodFeedPost({
    userId: testRequester.id,
    neighborhoodId: day2bNeighborhoodId,
    authorDisplayName: day2bAuthorDisplayName,
    body,
  });
}
