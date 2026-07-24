export type PostcardChallengeStatus =
  | 'not_started'
  | 'challenge_created'
  | 'code_confirmed'
  | 'failed'
  | 'needs_human_review';

export type PostcardChallenge = {
  id: string;
  profileId: string;
  neighborhood: string;
  city: string;
  mailingAreaLabel: string;
  status: PostcardChallengeStatus;
  provider: 'test_postcard_provider';
  challengeCode: string;
  exactAddressPublic: false;
  exactCoordinatesStored: false;
  exactCoordinatesPublic: false;
  usesGhanaCard: false;
  aiFinalDecision: false;
  provesResidenceAutomatically: false;
  humanReviewRequired: boolean;
  createdAt: string;
};

let currentChallenge: PostcardChallenge | undefined;

export function createPostcardChallenge(input: {
  profileId?: string;
  neighborhood: string;
  city: string;
  mailingAreaLabel: string;
}): { challenge?: PostcardChallenge; errors: string[] } {
  const errors: string[] = [];
  const neighborhood = input.neighborhood.trim();
  const city = input.city.trim();
  const mailingAreaLabel = input.mailingAreaLabel.trim();

  if (neighborhood.length < 2) {
    errors.push('Enter a neighborhood.');
  }

  if (city.length < 2) {
    errors.push('Enter a city.');
  }

  if (mailingAreaLabel.length < 3) {
    errors.push('Enter a broad mailing area label.');
  }

  if (errors.length > 0) {
    return { errors };
  }

  currentChallenge = {
    id: `postcard-${Date.now()}`,
    profileId: input.profileId ?? 'profile-akosua',
    neighborhood,
    city,
    mailingAreaLabel,
    status: 'challenge_created',
    provider: 'test_postcard_provider',
    challengeCode: 'MC-2468',
    exactAddressPublic: false,
    exactCoordinatesStored: false,
    exactCoordinatesPublic: false,
    usesGhanaCard: false,
    aiFinalDecision: false,
    provesResidenceAutomatically: false,
    humanReviewRequired: true,
    createdAt: new Date().toISOString(),
  };

  return {
    challenge: currentChallenge,
    errors: [],
  };
}

export function confirmPostcardChallengeCode(code: string): PostcardChallenge | undefined {
  if (!currentChallenge) return undefined;

  currentChallenge = {
    ...currentChallenge,
    status: code.trim().toUpperCase() === currentChallenge.challengeCode
      ? 'code_confirmed'
      : 'failed',
    humanReviewRequired: true,
  };

  return currentChallenge;
}

export function getPostcardChallenge(): PostcardChallenge | undefined {
  return currentChallenge;
}
