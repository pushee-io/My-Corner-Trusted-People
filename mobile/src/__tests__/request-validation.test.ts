import { validateRequestDraft } from '@/lib/request-validation';

const validDraft = {
  requesterName: 'Akosua Mensah',
  providerId: 'prov-01',
  categoryId: 'plumbing',
  neighborhood: 'East Legon',
  areaLabel: 'East Legon, general area only',
  title: 'Kitchen leak',
  description: 'The kitchen sink is leaking under the cabinet.',
  originalUserText: 'Kitchen sink leak',
  urgency: 'soon' as const,
  preferredDate: '2099-07-18',
  preferredTime: 'Afternoon',
  contactPreference: 'app_update' as const,
  photoCount: 0,
};

describe('request validation', () => {
  it('accepts a complete draft with consent', () => {
    expect(validateRequestDraft(validDraft, true).valid).toBe(true);
  });

  it('requires consent and useful job detail', () => {
    const result = validateRequestDraft({ ...validDraft, title: '', description: 'short' }, false);
    expect(result.valid).toBe(false);
    expect(result.errors.consent).toBeTruthy();
    expect(result.errors.title).toBeTruthy();
  });

  it('rejects invalid and past preferred dates', () => {
    const now = new Date(2026, 7, 3, 12);

    expect(validateRequestDraft({ ...validDraft, preferredDate: '2026-02-30' }, true, now).errors.preferredDate).toBe(
      'Use a valid date in YYYY-MM-DD format.',
    );
    expect(validateRequestDraft({ ...validDraft, preferredDate: '2026-08-02' }, true, now).errors.preferredDate).toBe(
      'Choose today or a future date.',
    );
    expect(validateRequestDraft({ ...validDraft, preferredDate: '2026-08-03' }, true, now).valid).toBe(true);
  });
});
