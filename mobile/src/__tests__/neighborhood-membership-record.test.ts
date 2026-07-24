import {
  canAccessPrivateNeighborhoodFeed,
  getNeighborhoodMembershipRecord,
  membershipStore,
  resetNeighborhoodMembershipStore,
  saveNeighborhoodMembershipRecord,
} from '@/lib/neighborhood-membership-record';
import type { AuditEvent, NeighborhoodMembership } from '@/types/contracts';

const now = '2026-07-24T10:00:00.000Z';

function membership(overrides: Partial<NeighborhoodMembership> = {}): NeighborhoodMembership {
  return {
    userId: 'user-001',
    neighborhoodId: 'east-legon',
    status: 'verified',
    assignedBy: 'server',
    verifiedAt: now,
    evidenceSummary: ['phone passed', 'postcard_challenge passed for east-legon'],
    ...overrides,
  };
}

function auditEvent(action = 'neighborhood_membership.verified'): AuditEvent {
  return {
    id: `audit-${action}`,
    actor: 'system',
    action,
    subjectId: 'user-001',
    createdAt: now,
    metadata: {
      assignedBy: 'server',
      neighborhoodId: 'east-legon',
    },
  };
}

describe('neighborhood membership record', () => {
  beforeEach(() => {
    resetNeighborhoodMembershipStore();
  });

  it('creates a server-assigned membership record with timestamps and audit event', () => {
    const record = saveNeighborhoodMembershipRecord({
      membership: membership(),
      auditEvent: auditEvent(),
      now,
    });

    expect(record).toMatchObject({
      id: 'membership-user-001-east-legon',
      userId: 'user-001',
      neighborhoodId: 'east-legon',
      status: 'verified',
      assignedBy: 'server',
      createdAt: now,
      updatedAt: now,
    });
    expect(membershipStore.auditEvents).toHaveLength(1);
  });

  it('updates an existing membership instead of creating a duplicate', () => {
    saveNeighborhoodMembershipRecord({
      membership: membership(),
      auditEvent: auditEvent(),
      now,
    });
    const updated = saveNeighborhoodMembershipRecord({
      membership: membership({ status: 'pending_reverification', verifiedAt: undefined }),
      auditEvent: auditEvent('neighborhood_membership.reverification_required'),
      now: '2026-07-24T11:00:00.000Z',
    });

    expect(membershipStore.memberships).toHaveLength(1);
    expect(updated.status).toBe('pending_reverification');
    expect(updated.createdAt).toBe(now);
    expect(updated.updatedAt).toBe('2026-07-24T11:00:00.000Z');
    expect(membershipStore.auditEvents).toHaveLength(2);
  });

  it('allows private feed access only for verified members of the same neighborhood', () => {
    saveNeighborhoodMembershipRecord({
      membership: membership(),
      auditEvent: auditEvent(),
      now,
    });

    expect(canAccessPrivateNeighborhoodFeed('user-001', 'east-legon')).toEqual({
      canReadPrivateFeed: true,
      reason: 'verified_member',
    });
    expect(canAccessPrivateNeighborhoodFeed('user-001', 'osu')).toEqual({
      canReadPrivateFeed: false,
      reason: 'wrong_neighborhood',
    });
    expect(canAccessPrivateNeighborhoodFeed('user-002', 'east-legon')).toEqual({
      canReadPrivateFeed: false,
      reason: 'no_membership',
    });
  });

  it('blocks private feed access for unverified or re-verification states', () => {
    saveNeighborhoodMembershipRecord({
      membership: membership({ status: 'pending_reverification', verifiedAt: undefined }),
      auditEvent: auditEvent('neighborhood_membership.reverification_required'),
      now,
    });

    expect(getNeighborhoodMembershipRecord('user-001', 'east-legon')?.status).toBe('pending_reverification');
    expect(canAccessPrivateNeighborhoodFeed('user-001', 'east-legon')).toEqual({
      canReadPrivateFeed: false,
      reason: 'not_verified',
    });
  });
});
