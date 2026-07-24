import type { AuditEvent, NeighborhoodMembership } from '@/types/contracts';

type MembershipStore = {
  memberships: NeighborhoodMembership[];
  auditEvents: AuditEvent[];
};

type SaveMembershipInput = {
  membership: NeighborhoodMembership;
  auditEvent: AuditEvent;
  now?: string;
};

type MembershipAccess = {
  canReadPrivateFeed: boolean;
  reason: 'verified_member' | 'no_membership' | 'wrong_neighborhood' | 'not_verified';
};

export const membershipStore: MembershipStore = {
  memberships: [],
  auditEvents: [],
};

export function saveNeighborhoodMembershipRecord(input: SaveMembershipInput): NeighborhoodMembership {
  const now = input.now ?? new Date().toISOString();
  const existingIndex = membershipStore.memberships.findIndex(
    (item) => item.userId === input.membership.userId && item.neighborhoodId === input.membership.neighborhoodId,
  );
  const existing = existingIndex >= 0 ? membershipStore.memberships[existingIndex] : undefined;
  const record: NeighborhoodMembership = {
    ...input.membership,
    id: existing?.id ?? `membership-${input.membership.userId}-${input.membership.neighborhoodId}`,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  if (existingIndex >= 0) {
    membershipStore.memberships[existingIndex] = record;
  } else {
    membershipStore.memberships.push(record);
  }

  membershipStore.auditEvents.push(input.auditEvent);
  return record;
}

export function getNeighborhoodMembershipRecord(
  userId: string,
  neighborhoodId: string,
): NeighborhoodMembership | undefined {
  return membershipStore.memberships.find(
    (item) => item.userId === userId && item.neighborhoodId === neighborhoodId,
  );
}

export function listUserNeighborhoodMemberships(userId: string): NeighborhoodMembership[] {
  return membershipStore.memberships.filter((item) => item.userId === userId);
}

export function canAccessPrivateNeighborhoodFeed(userId: string, neighborhoodId: string): MembershipAccess {
  const membership = getNeighborhoodMembershipRecord(userId, neighborhoodId);
  if (!membership) {
    const hasOtherMembership = membershipStore.memberships.some((item) => item.userId === userId);
    return {
      canReadPrivateFeed: false,
      reason: hasOtherMembership ? 'wrong_neighborhood' : 'no_membership',
    };
  }

  if (membership.status !== 'verified') {
    return {
      canReadPrivateFeed: false,
      reason: 'not_verified',
    };
  }

  return {
    canReadPrivateFeed: true,
    reason: 'verified_member',
  };
}

export function resetNeighborhoodMembershipStore() {
  membershipStore.memberships.length = 0;
  membershipStore.auditEvents.length = 0;
}
