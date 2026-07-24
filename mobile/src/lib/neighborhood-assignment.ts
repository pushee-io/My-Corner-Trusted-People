import type { AuditEvent, Neighborhood, NeighborhoodMembership, ResidenceVerificationSignal } from '@/types/contracts';

type AssignmentInput = {
  userId: string;
  signals: ResidenceVerificationSignal[];
  neighborhoods: Neighborhood[];
  now?: string;
};

type AssignmentResult = {
  membership: NeighborhoodMembership;
  auditEvent: AuditEvent;
};

export const accraNeighborhoods: Neighborhood[] = [
  { id: 'east-legon', name: 'East Legon', city: 'Accra', country: 'Ghana' },
  { id: 'osu', name: 'Osu', city: 'Accra', country: 'Ghana' },
  { id: 'labone', name: 'Labone', city: 'Accra', country: 'Ghana' },
  { id: 'madina', name: 'Madina', city: 'Accra', country: 'Ghana' },
];

export function assignNeighborhoodMembership(input: AssignmentInput): AssignmentResult {
  const now = input.now ?? new Date().toISOString();
  const phoneSignal = input.signals.find((signal) => signal.type === 'phone' && signal.passed);
  const addressSignal = input.signals.find(
    (signal) => signal.type === 'standardized_address' && signal.passed && signal.neighborhoodId,
  );
  const postcardSignal = input.signals.find(
    (signal) => signal.type === 'postcard_challenge' && signal.passed && signal.neighborhoodId,
  );

  const candidateNeighborhoodId = getConsensusNeighborhoodId(input.signals);
  const addressAndPostcardAgree = Boolean(
    addressSignal?.neighborhoodId &&
      postcardSignal?.neighborhoodId &&
      addressSignal.neighborhoodId === postcardSignal.neighborhoodId,
  );
  const neighborhoodExists = input.neighborhoods.some((neighborhood) => neighborhood.id === candidateNeighborhoodId);
  const isVerified = Boolean(
    phoneSignal &&
      addressSignal &&
      postcardSignal &&
      addressAndPostcardAgree &&
      candidateNeighborhoodId &&
      neighborhoodExists,
  );
  const neighborhoodId =
    candidateNeighborhoodId ?? addressSignal?.neighborhoodId ?? postcardSignal?.neighborhoodId ?? 'unassigned';

  const membership: NeighborhoodMembership = {
    userId: input.userId,
    neighborhoodId,
    status: isVerified ? 'verified' : 'unverified',
    assignedBy: 'server',
    verifiedAt: isVerified ? now : undefined,
    evidenceSummary: buildEvidenceSummary(input.signals),
  };

  return {
    membership,
    auditEvent: {
      id: `audit-${input.userId}-${now}`,
      actor: 'system',
      action: isVerified ? 'neighborhood_membership.verified' : 'neighborhood_membership.rejected',
      subjectId: input.userId,
      createdAt: now,
      metadata: {
        assignedBy: 'server',
        neighborhoodId,
        hasPhoneSignal: Boolean(phoneSignal),
        hasAddressSignal: Boolean(addressSignal),
        hasPostcardSignal: Boolean(postcardSignal),
        addressAndPostcardAgree,
        signalCount: input.signals.length,
      },
    },
  };
}

export function markMembershipForReverification(
  membership: NeighborhoodMembership,
  now = new Date().toISOString(),
): AssignmentResult {
  const nextMembership: NeighborhoodMembership = {
    ...membership,
    status: 'pending_reverification',
    verifiedAt: undefined,
    requiresReverificationAt: now,
  };

  return {
    membership: nextMembership,
    auditEvent: {
      id: `audit-${membership.userId}-address-change-${now}`,
      actor: 'system',
      action: 'neighborhood_membership.reverification_required',
      subjectId: membership.userId,
      createdAt: now,
      metadata: {
        assignedBy: 'server',
        neighborhoodId: membership.neighborhoodId,
        reason: 'address_changed',
      },
    },
  };
}

function getConsensusNeighborhoodId(signals: ResidenceVerificationSignal[]): string | undefined {
  const passedNeighborhoodSignals = signals.filter((signal) => signal.passed && signal.neighborhoodId);
  const counts = passedNeighborhoodSignals.reduce<Record<string, number>>((acc, signal) => {
    const neighborhoodId = signal.neighborhoodId;
    if (!neighborhoodId) return acc;
    acc[neighborhoodId] = (acc[neighborhoodId] ?? 0) + 1;
    return acc;
  }, {});

  const [winner] = Object.entries(counts).sort(([, a], [, b]) => b - a)[0] ?? [];
  return winner;
}

function buildEvidenceSummary(signals: ResidenceVerificationSignal[]): string[] {
  return signals.map((signal) => {
    const outcome = signal.passed ? 'passed' : 'failed';
    const neighborhood = signal.neighborhoodId ? ` for ${signal.neighborhoodId}` : '';
    return `${signal.type} ${outcome}${neighborhood}`;
  });
}
