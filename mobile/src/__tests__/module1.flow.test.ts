import { createJobRequest, getRequest, updateRequestStatus } from '@/lib/repository';

describe('Module 1 happy path', () => {
  it('requester submits and provider declines with a visible status update', () => {
    const request = createJobRequest({
      requesterName: 'Akosua Mensah',
      providerId: 'prov-01',
      categoryId: 'plumbing',
      neighborhood: 'East Legon',
      areaLabel: 'East Legon, general area only',
      title: 'Pipe noise',
      description: 'The bathroom pipe makes a loud sound when water runs.',
      originalUserText: 'Pipe noise when water runs',
      urgency: 'flexible',
      preferredDate: '2026-07-19',
      preferredTime: 'Morning',
      contactPreference: 'app_update',
      photoCount: 0,
    });

    updateRequestStatus(request.id, 'Declined', 'Sorry, I am fully booked.');
    const updated = getRequest(request.id);

    expect(updated?.status).toBe('Declined');
    expect(updated?.providerMessage).toContain('fully booked');
    expect(updated?.areaLabel).not.toContain('GPS');
  });
});
