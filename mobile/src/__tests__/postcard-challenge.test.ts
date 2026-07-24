import {
  confirmPostcardChallengeCode,
  createPostcardChallenge,
  getPostcardChallenge,
} from '@/lib/postcard-challenge';

describe('test postcard challenge', () => {
  it('requires a broad mailing area label', () => {
    const result = createPostcardChallenge({
      neighborhood: 'East Legon',
      city: 'Accra',
      mailingAreaLabel: '',
    });

    expect(result.challenge).toBeUndefined();
    expect(result.errors).toContain('Enter a broad mailing area label.');
  });

  it('creates a fictional postcard challenge without exact address exposure', () => {
    const result = createPostcardChallenge({
      neighborhood: 'East Legon',
      city: 'Accra',
      mailingAreaLabel: 'East Legon general mailing area',
    });

    expect(result.errors).toEqual([]);
    expect(result.challenge?.provider).toBe('test_postcard_provider');
    expect(result.challenge?.status).toBe('challenge_created');
    expect(result.challenge?.challengeCode).toBe('MC-2468');
    expect(result.challenge?.exactAddressPublic).toBe(false);
    expect(result.challenge?.exactCoordinatesStored).toBe(false);
    expect(result.challenge?.exactCoordinatesPublic).toBe(false);
    expect(result.challenge?.usesGhanaCard).toBe(false);
    expect(result.challenge?.aiFinalDecision).toBe(false);
    expect(result.challenge?.provesResidenceAutomatically).toBe(false);
    expect(result.challenge?.humanReviewRequired).toBe(true);
  });

  it('confirms the fictional test code but still requires human review', () => {
    createPostcardChallenge({
      neighborhood: 'East Legon',
      city: 'Accra',
      mailingAreaLabel: 'East Legon general mailing area',
    });

    expect(confirmPostcardChallengeCode('MC-2468')?.status).toBe('code_confirmed');
    expect(getPostcardChallenge()?.humanReviewRequired).toBe(true);
  });

  it('fails the wrong fictional test code', () => {
    createPostcardChallenge({
      neighborhood: 'East Legon',
      city: 'Accra',
      mailingAreaLabel: 'East Legon general mailing area',
    });

    expect(confirmPostcardChallengeCode('MC-0000')?.status).toBe('failed');
  });
});
