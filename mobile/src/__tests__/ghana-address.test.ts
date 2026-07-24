import {
  addressProviderOptions,
  getGhanaAddressRecord,
  saveGhanaAddress,
  validateGhanaPostGps,
} from '@/lib/ghana-address';

describe('Ghana address provider abstraction', () => {
  it('validates optional GhanaPost GPS format', () => {
    expect(validateGhanaPostGps('')).toBe(true);
    expect(validateGhanaPostGps('GA-123-4567')).toBe(true);
    expect(validateGhanaPostGps('bad-address')).toBe(false);
  });

  it('does not include Google Address Validation API', () => {
    expect(addressProviderOptions.some((option) => option.provider.includes('address_validation'))).toBe(false);
  });

  it('treats every provider as not proof of residence', () => {
    expect(addressProviderOptions.every((option) => option.provesResidence === false)).toBe(true);
  });

  it('saves a private Ghana address without public exact address or coordinates', () => {
    const result = saveGhanaAddress({
      neighborhood: 'East Legon',
      city: 'Accra',
      areaLabel: 'East Legon general area',
      ghanaPostGps: 'GA-123-4567',
      provider: 'ghana_post_gps',
    });

    expect(result.errors).toEqual([]);
    expect(result.record?.publicLabel).toBe('East Legon, Accra');
    expect(result.record?.visibility).toBe('private_profile_record');
    expect(result.record?.exactAddressPublic).toBe(false);
    expect(result.record?.exactCoordinatesPublic).toBe(false);
    expect(result.record?.provesResidence).toBe(false);
    expect(getGhanaAddressRecord()?.provider).toBe('ghana_post_gps');
  });
});
