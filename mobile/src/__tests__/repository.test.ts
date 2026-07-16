import { createJobRequest, getRequest, listProvidersByCategory, updateRequestStatus } from '@/lib/repository';

describe('Module 1 repository', () => {
  it('lists fictional providers for requested categories', () => {
    expect(listProvidersByCategory('plumbing').length).toBeGreaterThanOrEqual(3);
    expect(listProvidersByCategory('cleaning').length).toBeGreaterThanOrEqual(3);
  });

  it('creates a request and lets provider accept it', () => {
    const request = createJobRequest({
      requesterName: 'Akosua Mensah',
      providerId: 'prov-01',
      categoryId: 'plumbing',
      neighborhood: 'East Legon',
      areaLabel: 'East Legon, general area only',
      title: 'Test sink repair',
      description: 'The sink is leaking under the cabinet.',
      originalUserText: 'Sink leaking under cabinet',
      urgency: 'soon',
      preferredDate: '2026-07-18',
      preferredTime: 'Afternoon',
      contactPreference: 'app_update',
      photoCount: 0,
    });

    expect(getRequest(request.id)?.status).toBe('Submitted');
    updateRequestStatus(request.id, 'Accepted', 'I can come this afternoon.');
    expect(getRequest(request.id)?.status).toBe('Accepted');
  });
});
