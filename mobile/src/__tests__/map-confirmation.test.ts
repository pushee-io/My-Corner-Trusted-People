import { createMapConfirmation, getMapConfirmation } from '@/lib/map-confirmation';

describe('map confirmation privacy', () => {
  it('requires a broad area label', () => {
    const result = createMapConfirmation({
      neighborhood: 'East Legon',
      city: 'Accra',
      approximateAreaLabel: '',
    });

    expect(result.record).toBeUndefined();
    expect(result.errors).toContain('Enter a broad area label.');
  });

  it('confirms only a masked neighborhood area', () => {
    const result = createMapConfirmation({
      neighborhood: 'East Legon',
      city: 'Accra',
      approximateAreaLabel: 'East Legon general area',
    });

    expect(result.errors).toEqual([]);
    expect(result.record?.mapProvider).toBe('google_maps_masked_area');
    expect(result.record?.confirmationMode).toBe('masked_neighborhood_area');
    expect(result.record?.exactHomePinShown).toBe(false);
    expect(result.record?.exactResidentialCoordinatesStored).toBe(false);
    expect(result.record?.exactResidentialCoordinatesPublic).toBe(false);
    expect(result.record?.provesResidence).toBe(false);
    expect(getMapConfirmation()?.approximateAreaLabel).toBe('East Legon general area');
  });
});
