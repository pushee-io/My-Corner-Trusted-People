import {
  accraNeighborhoods,
  assignNeighborhoodMembership,
  markMembershipForReverification,
} from '@/lib/neighborhood-assignment';
import type { ResidenceVerificationSignal } from '@/types/contracts';

const checkedAt = '2026-07-24T08:00:00.000Z';

function signal(
  type: ResidenceVerificationSignal['type'],
  neighborhoodId: string | undefined,
  passed = true,
): ResidenceVerificationSignal {
  return {
    type,
    neighborhoodId,
    passed,
    checkedAt,
  };
}

describe('server-side neighborhood assignment', () => {
  it('assigns verified membership when server evidence agrees and postcard challenge passed', () => {
    const result = assignNeighborhoodMembership({
      userId: 'user-001',
      neighborhoods: accraNeighborhoods,
      now: checkedAt,
      signals: [
        signal('phone', undefined),
        signal('standardized_address', 'east-legon'),
        signal('map_confirmation', 'east-legon'),
        signal('location_consistency', 'east-legon'),
        signal('postcard_challenge', 'east-legon'),
      ],
    });

    expect(result.membership).toMatchObject({
      userId: 'user-001',
      neighborhoodId: 'east-legon',
      status: 'verified',
      assignedBy: 'server',
      verifiedAt: checkedAt,
    });
    expect(result.auditEvent.action).toBe('neighborhood_membership.verified');
    expect(result.auditEvent.metadata.hasPostcardSignal).toBe(true);
  });

  it('does not verify membership without a valid postcard challenge', () => {
    const result = assignNeighborhoodMembership({
      userId: 'user-002',
      neighborhoods: accraNeighborhoods,
      now: checkedAt,
      signals: [
        signal('phone', undefined),
        signal('standardized_address', 'east-legon'),
        signal('map_confirmation', 'east-legon'),
      ],
    });

    expect(result.membership.status).toBe('unverified');
    expect(result.membership.verifiedAt).toBeUndefined();
    expect(result.auditEvent.action).toBe('neighborhood_membership.rejected');
  });

  it('does not verify membership for a neighborhood outside the server allowlist', () => {
    const result = assignNeighborhoodMembership({
      userId: 'user-003',
      neighborhoods: accraNeighborhoods,
      now: checkedAt,
      signals: [
        signal('phone', undefined),
        signal('standardized_address', 'unknown-area'),
        signal('postcard_challenge', 'unknown-area'),
      ],
    });

    expect(result.membership.status).toBe('unverified');
    expect(result.auditEvent.metadata.neighborhoodId).toBe('unknown-area');
  });

  it('does not verify membership when address and postcard evidence disagree', () => {
    const result = assignNeighborhoodMembership({
      userId: 'user-004',
      neighborhoods: accraNeighborhoods,
      now: checkedAt,
      signals: [
        signal('phone', undefined),
        signal('standardized_address', 'east-legon'),
        signal('map_confirmation', 'east-legon'),
        signal('postcard_challenge', 'osu'),
      ],
    });

    expect(result.membership.status).toBe('unverified');
    expect(result.auditEvent.metadata.addressAndPostcardAgree).toBe(false);
  });

  it('requires reverification after an address change', () => {
    const verified = assignNeighborhoodMembership({
      userId: 'user-005',
      neighborhoods: accraNeighborhoods,
      now: checkedAt,
      signals: [
        signal('phone', undefined),
        signal('standardized_address', 'east-legon'),
        signal('postcard_challenge', 'east-legon'),
      ],
    });

    const result = markMembershipForReverification(verified.membership, '2026-07-24T09:00:00.000Z');

    expect(result.membership.status).toBe('pending_reverification');
    expect(result.membership.verifiedAt).toBeUndefined();
    expect(result.auditEvent.action).toBe('neighborhood_membership.reverification_required');
  });
});
