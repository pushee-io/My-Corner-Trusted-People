export type LegalNameRecord = {
  id: string;
  profileId: string;
  givenNames: string;
  familyName: string;
  fullLegalName: string;
  visibility: 'private_admin_review_only';
  source: 'user_entered_test_record';
  aiVerified: false;
  createdAt: string;
};

let currentLegalNameRecord: LegalNameRecord | undefined;

function cleanNamePart(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

export function validateLegalName(input: { givenNames: string; familyName: string }): {
  valid: boolean;
  errors: string[];
} {
  const givenNames = cleanNamePart(input.givenNames);
  const familyName = cleanNamePart(input.familyName);
  const errors: string[] = [];

  if (givenNames.length < 2) {
    errors.push('Enter legal given name or names.');
  }

  if (familyName.length < 2) {
    errors.push('Enter legal family name.');
  }

  if (givenNames.length > 80 || familyName.length > 80) {
    errors.push('Legal name fields must be 80 characters or fewer.');
  }

  if (/[0-9@#$%^*_=+<>]/.test(`${givenNames}${familyName}`)) {
    errors.push('Legal name cannot include numbers or symbols.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function saveLegalName(input: { profileId?: string; givenNames: string; familyName: string }): {
  record?: LegalNameRecord;
  errors: string[];
} {
  const validation = validateLegalName(input);

  if (!validation.valid) {
    return { errors: validation.errors };
  }

  const givenNames = cleanNamePart(input.givenNames);
  const familyName = cleanNamePart(input.familyName);

  currentLegalNameRecord = {
    id: `legal-name-${Date.now()}`,
    profileId: input.profileId ?? 'profile-akosua',
    givenNames,
    familyName,
    fullLegalName: `${givenNames} ${familyName}`,
    visibility: 'private_admin_review_only',
    source: 'user_entered_test_record',
    aiVerified: false,
    createdAt: new Date().toISOString(),
  };

  return {
    record: currentLegalNameRecord,
    errors: [],
  };
}

export function getLegalNameRecord(): LegalNameRecord | undefined {
  return currentLegalNameRecord;
}
