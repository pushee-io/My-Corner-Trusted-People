export type LocationConsistencyStatus = 'not_started' | 'consistent' | 'inconsistent' | 'needs_human_review';

export type ForegroundLocationConsistencyCheck = {
  id: string;
  profileId: string;
  confirmedNeighborhood: string;
  confirmedCity: string;
  observedAreaLabel: string;
  status: LocationConsistencyStatus;
  checkMode: 'foreground_user_triggered';
  backgroundTrackingUsed: false;
  exactCoordinatesStored: false;
  exactCoordinatesPublic: false;
  provesResidence: false;
  aiFinalDecision: false;
  humanReviewRequired: boolean;
  createdAt: string;
};

let currentCheck: ForegroundLocationConsistencyCheck | undefined;

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function runForegroundLocationConsistencyCheck(input: {
  profileId?: string;
  confirmedNeighborhood: string;
  confirmedCity: string;
  observedAreaLabel: string;
}): { check?: ForegroundLocationConsistencyCheck; errors: string[] } {
  const errors: string[] = [];
  const confirmedNeighborhood = input.confirmedNeighborhood.trim();
  const confirmedCity = input.confirmedCity.trim();
  const observedAreaLabel = input.observedAreaLabel.trim();

  if (confirmedNeighborhood.length < 2) {
    errors.push('Confirmed neighborhood is required.');
  }

  if (confirmedCity.length < 2) {
    errors.push('Confirmed city is required.');
  }

  if (observedAreaLabel.length < 3) {
    errors.push('Observed broad area label is required.');
  }

  if (errors.length > 0) {
    return { errors };
  }

  const consistent =
    normalize(observedAreaLabel).includes(normalize(confirmedNeighborhood)) ||
    normalize(observedAreaLabel).includes(normalize(confirmedCity));

  currentCheck = {
    id: `loc-check-${Date.now()}`,
    profileId: input.profileId ?? 'profile-akosua',
    confirmedNeighborhood,
    confirmedCity,
    observedAreaLabel,
    status: consistent ? 'consistent' : 'needs_human_review',
    checkMode: 'foreground_user_triggered',
    backgroundTrackingUsed: false,
    exactCoordinatesStored: false,
    exactCoordinatesPublic: false,
    provesResidence: false,
    aiFinalDecision: false,
    humanReviewRequired: !consistent,
    createdAt: new Date().toISOString(),
  };

  return {
    check: currentCheck,
    errors: [],
  };
}

export function getForegroundLocationConsistencyCheck(): ForegroundLocationConsistencyCheck | undefined {
  return currentCheck;
}
