export type ManualBiometricStatus =
  | 'not_started'
  | 'ready_for_consent'
  | 'submitted_for_human_review'
  | 'passed'
  | 'failed'
  | 'cancelled';

export type ManualBiometricReview = {
  id: string;
  profileId: string;
  provider: 'manual_biometric_test_review';
  status: ManualBiometricStatus;
  consentCaptured: boolean;
  usesGhanaCard: false;
  collectsGhanaCardImages: false;
  aiFinalDecision: false;
  rawBiometricMediaRetained: false;
  reviewMode: 'human_review_only';
  evidenceNote: string;
  createdAt: string;
};

let currentReview: ManualBiometricReview | undefined;

export function createManualBiometricReview(input: {
  profileId?: string;
  consentCaptured: boolean;
  evidenceNote: string;
}): { review?: ManualBiometricReview; errors: string[] } {
  const errors: string[] = [];

  if (!input.consentCaptured) {
    errors.push('Explicit consent is required before manual biometric review.');
  }

  if (input.evidenceNote.trim().length < 8) {
    errors.push('Add a short evidence note for human review.');
  }

  if (errors.length > 0) {
    return { errors };
  }

  currentReview = {
    id: `bio-${Date.now()}`,
    profileId: input.profileId ?? 'profile-akosua',
    provider: 'manual_biometric_test_review',
    status: 'submitted_for_human_review',
    consentCaptured: true,
    usesGhanaCard: false,
    collectsGhanaCardImages: false,
    aiFinalDecision: false,
    rawBiometricMediaRetained: false,
    reviewMode: 'human_review_only',
    evidenceNote: input.evidenceNote.trim(),
    createdAt: new Date().toISOString(),
  };

  return {
    review: currentReview,
    errors: [],
  };
}

export function updateManualBiometricHumanDecision(
  status: Extract<ManualBiometricStatus, 'passed' | 'failed' | 'cancelled'>,
): ManualBiometricReview | undefined {
  if (!currentReview) return undefined;

  currentReview = {
    ...currentReview,
    status,
  };

  return currentReview;
}

export function getManualBiometricReview(): ManualBiometricReview | undefined {
  return currentReview;
}
