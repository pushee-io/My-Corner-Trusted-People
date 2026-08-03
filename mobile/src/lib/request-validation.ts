import type { JobRequestDraftInput } from '@/types/contracts';

export type ValidationResult = {
  valid: boolean;
  errors: Partial<Record<keyof JobRequestDraftInput | 'consent', string>>;
};

export function validateRequestDraft(
  input: JobRequestDraftInput,
  consentAccepted: boolean,
  now = new Date(),
): ValidationResult {
  const errors: ValidationResult['errors'] = {};

  if (!input.categoryId) errors.categoryId = 'Choose a service category.';
  if (input.title.trim().length < 4) errors.title = 'Add a short job title.';
  if (input.description.trim().length < 12) errors.description = 'Describe the job in at least 12 characters.';
  if (!input.neighborhood) errors.neighborhood = 'Confirm the general service area.';
  if (!input.preferredDate) {
    errors.preferredDate = 'Choose a preferred date.';
  } else if (!isValidDateInput(input.preferredDate)) {
    errors.preferredDate = 'Use a valid date in YYYY-MM-DD format.';
  } else if (input.preferredDate < localDateString(now)) {
    errors.preferredDate = 'Choose today or a future date.';
  }
  if (!input.preferredTime) errors.preferredTime = 'Choose a preferred time.';
  if (!input.contactPreference) errors.contactPreference = 'Choose how the provider should respond.';
  if (!consentAccepted) errors.consent = 'Review and accept the safety notice.';

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

function isValidDateInput(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function localDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
