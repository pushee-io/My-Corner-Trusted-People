import {
  createManualBiometricReview,
  getManualBiometricReview,
  updateManualBiometricHumanDecision,
} from '@/lib/manual-biometric';

describe('manual biometric identity assurance test mode', () => {
  it('requires explicit consent', () => {
    const result = createManualBiometricReview({
      consentCaptured: false,
      evidenceNote: 'Live selfie test note',
    });

    expect(result.review).toBeUndefined();
    expect(result.errors).toContain('Explicit consent is required before manual biometric review.');
  });

  it('creates a human-review-only biometric review without Ghana Card or AI final decision', () => {
    const result = createManualBiometricReview({
      consentCaptured: true,
      evidenceNote: 'Live selfie test note',
    });

    expect(result.errors).toEqual([]);
    expect(result.review?.provider).toBe('manual_biometric_test_review');
    expect(result.review?.status).toBe('submitted_for_human_review');
    expect(result.review?.usesGhanaCard).toBe(false);
    expect(result.review?.collectsGhanaCardImages).toBe(false);
    expect(result.review?.aiFinalDecision).toBe(false);
    expect(result.review?.rawBiometricMediaRetained).toBe(false);
    expect(result.review?.reviewMode).toBe('human_review_only');
  });

  it('allows a human reviewer test decision', () => {
    createManualBiometricReview({
      consentCaptured: true,
      evidenceNote: 'Live selfie test note',
    });

    expect(updateManualBiometricHumanDecision('passed')?.status).toBe('passed');
    expect(getManualBiometricReview()?.status).toBe('passed');
  });
});
