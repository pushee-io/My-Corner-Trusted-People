import { getLegalNameRecord, saveLegalName, validateLegalName } from '@/lib/legal-name';

describe('private legal name capture', () => {
  it('validates legal name fields', () => {
    expect(validateLegalName({ givenNames: 'Akosua', familyName: 'Mensah' }).valid).toBe(true);
    expect(validateLegalName({ givenNames: 'A', familyName: 'Mensah' }).valid).toBe(false);
    expect(validateLegalName({ givenNames: 'Akosua', familyName: 'M3nsah' }).valid).toBe(false);
  });

  it('saves legal name as a private non-AI record', () => {
    const result = saveLegalName({
      profileId: 'profile-akosua',
      givenNames: 'Akosua',
      familyName: 'Mensah',
    });

    expect(result.errors).toEqual([]);
    expect(result.record?.fullLegalName).toBe('Akosua Mensah');
    expect(result.record?.visibility).toBe('private_admin_review_only');
    expect(result.record?.aiVerified).toBe(false);
    expect(getLegalNameRecord()?.fullLegalName).toBe('Akosua Mensah');
  });
});
