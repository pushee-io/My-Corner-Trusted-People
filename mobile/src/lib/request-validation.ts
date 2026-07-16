import type { JobRequestDraftInput } from '@/types/contracts';

export type ValidationResult = {
  valid: boolean;
  errors: Partial<Record<keyof JobRequestDraftInput | 'consent', string>>;
};

export function validateRequestDraft(input: JobRequestDraftInput, consentAccepted: boolean): ValidationResult {
  const errors: ValidationResult['errors'] = {};

  if (!input.categoryId) errors.categoryId = 'Choose a service category.';
  if (input.title.trim().length < 4) errors.title = 'Add a short job title.';
  if (input.description.trim().length < 12) errors.description = 'Describe the job in at least 12 characters.';
  if (!input.neighborhood) errors.neighborhood = 'Confirm the general service area.';
  if (!input.preferredDate) errors.preferredDate = 'Choose a preferred date.';
  if (!input.preferredTime) errors.preferredTime = 'Choose a preferred time.';
  if (!input.contactPreference) errors.contactPreference = 'Choose how the provider should respond.';
  if (!consentAccepted) errors.consent = 'Review and accept the safety notice.';

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
