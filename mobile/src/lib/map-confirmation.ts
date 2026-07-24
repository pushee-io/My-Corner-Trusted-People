export type MapConfirmationRecord = {
  id: string;
  profileId: string;
  neighborhood: string;
  city: string;
  approximateAreaLabel: string;
  mapProvider: 'google_maps_masked_area';
  confirmationMode: 'masked_neighborhood_area';
  exactHomePinShown: false;
  exactResidentialCoordinatesStored: false;
  exactResidentialCoordinatesPublic: false;
  provesResidence: false;
  createdAt: string;
};

let currentMapConfirmation: MapConfirmationRecord | undefined;

export function createMapConfirmation(input: {
  profileId?: string;
  neighborhood: string;
  city: string;
  approximateAreaLabel: string;
}): { record?: MapConfirmationRecord; errors: string[] } {
  const errors: string[] = [];
  const neighborhood = input.neighborhood.trim();
  const city = input.city.trim();
  const approximateAreaLabel = input.approximateAreaLabel.trim();

  if (neighborhood.length < 2) {
    errors.push('Enter a neighborhood.');
  }

  if (city.length < 2) {
    errors.push('Enter a city.');
  }

  if (approximateAreaLabel.length < 3) {
    errors.push('Enter a broad area label.');
  }

  if (errors.length > 0) {
    return { errors };
  }

  currentMapConfirmation = {
    id: `map-${Date.now()}`,
    profileId: input.profileId ?? 'profile-akosua',
    neighborhood,
    city,
    approximateAreaLabel,
    mapProvider: 'google_maps_masked_area',
    confirmationMode: 'masked_neighborhood_area',
    exactHomePinShown: false,
    exactResidentialCoordinatesStored: false,
    exactResidentialCoordinatesPublic: false,
    provesResidence: false,
    createdAt: new Date().toISOString(),
  };

  return {
    record: currentMapConfirmation,
    errors: [],
  };
}

export function getMapConfirmation(): MapConfirmationRecord | undefined {
  return currentMapConfirmation;
}
