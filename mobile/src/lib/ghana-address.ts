export type AddressProvider =
  | 'google_places_new'
  | 'google_place_details'
  | 'google_geocoding'
  | 'google_maps'
  | 'ghana_post_gps'
  | 'loqate_optional_normalization';

export type GhanaAddressRecord = {
  id: string;
  profileId: string;
  neighborhood: string;
  city: string;
  country: 'Ghana';
  areaLabel: string;
  ghanaPostGps?: string;
  provider: AddressProvider;
  visibility: 'private_profile_record';
  publicLabel: string;
  exactAddressPublic: false;
  exactCoordinatesPublic: false;
  provesResidence: false;
  createdAt: string;
};

const GHANA_POST_GPS_PATTERN = /^[A-Z]{2}-\d{3,4}-\d{3,4}$/;

let currentAddress: GhanaAddressRecord | undefined;

export const addressProviderOptions: Array<{
  provider: AddressProvider;
  label: string;
  purpose: string;
  provesResidence: false;
}> = [
  {
    provider: 'google_places_new',
    label: 'Google Places API New',
    purpose: 'Find public places and landmarks through a backend service.',
    provesResidence: false,
  },
  {
    provider: 'google_place_details',
    label: 'Google Place Details',
    purpose: 'Resolve selected public place details through a backend service.',
    provesResidence: false,
  },
  {
    provider: 'google_geocoding',
    label: 'Google Geocoding',
    purpose: 'Support broad area labels through a backend service.',
    provesResidence: false,
  },
  {
    provider: 'google_maps',
    label: 'Google Maps',
    purpose: 'Display masked neighborhood maps without exact home pins.',
    provesResidence: false,
  },
  {
    provider: 'ghana_post_gps',
    label: 'GhanaPost GPS',
    purpose: 'Optional private address reference entered by the user.',
    provesResidence: false,
  },
  {
    provider: 'loqate_optional_normalization',
    label: 'Loqate optional normalization',
    purpose: 'Optional address normalization only. Not proof of residence.',
    provesResidence: false,
  },
];

export function validateGhanaPostGps(value: string): boolean {
  const trimmed = value.trim().toUpperCase();

  if (!trimmed) return true;

  return GHANA_POST_GPS_PATTERN.test(trimmed);
}

export function saveGhanaAddress(input: {
  profileId?: string;
  neighborhood: string;
  city: string;
  areaLabel: string;
  ghanaPostGps?: string;
  provider: AddressProvider;
}): { record?: GhanaAddressRecord; errors: string[] } {
  const errors: string[] = [];
  const neighborhood = input.neighborhood.trim();
  const city = input.city.trim();
  const areaLabel = input.areaLabel.trim();
  const ghanaPostGps = input.ghanaPostGps?.trim().toUpperCase();

  if (neighborhood.length < 2) {
    errors.push('Enter a neighborhood.');
  }

  if (city.length < 2) {
    errors.push('Enter a city.');
  }

  if (areaLabel.length < 3) {
    errors.push('Enter a broad public area label.');
  }

  if (ghanaPostGps && !validateGhanaPostGps(ghanaPostGps)) {
    errors.push('Enter GhanaPost GPS in a format like GA-123-4567.');
  }

  if (errors.length > 0) {
    return { errors };
  }

  currentAddress = {
    id: `address-${Date.now()}`,
    profileId: input.profileId ?? 'profile-akosua',
    neighborhood,
    city,
    country: 'Ghana',
    areaLabel,
    ghanaPostGps,
    provider: input.provider,
    visibility: 'private_profile_record',
    publicLabel: `${neighborhood}, ${city}`,
    exactAddressPublic: false,
    exactCoordinatesPublic: false,
    provesResidence: false,
    createdAt: new Date().toISOString(),
  };

  return {
    record: currentAddress,
    errors: [],
  };
}

export function getGhanaAddressRecord(): GhanaAddressRecord | undefined {
  return currentAddress;
}
