import { accraNeighborhoods } from '@/lib/neighborhood-assignment';
import type { Neighborhood } from '@/types/contracts';
import type { Day3NeighborhoodContext } from '@/types/day3';

export type ActiveLocationSource = 'seeded' | 'environment';

export type ActiveLocationContext = {
  neighborhoodId: string;
  neighborhoodName: string;
  city: string;
  country: string;
  countryCode: 'GH';
  regionId: string;
  regionName: string;
  clusterId: string;
  areaLabel: string;
  source: ActiveLocationSource;
  isVerifiedNeighborhoodMember: boolean;
  isExactLocationKnown: false;
};

export type ActiveLocationContextOptions = {
  neighborhoodId?: string;
  areaLabel?: string;
  clusterId?: string;
  regionId?: string;
  regionName?: string;
  isVerifiedNeighborhoodMember?: boolean;
  neighborhoods?: Neighborhood[];
  source?: ActiveLocationSource;
};

const activeNeighborhoodIdEnvKey = 'EXPO_PUBLIC_MY_CORNER_ACTIVE_NEIGHBORHOOD_ID';
const activeAreaLabelEnvKey = 'EXPO_PUBLIC_MY_CORNER_ACTIVE_AREA_LABEL';
const activeClusterIdEnvKey = 'EXPO_PUBLIC_MY_CORNER_ACTIVE_CLUSTER_ID';
const activeRegionIdEnvKey = 'EXPO_PUBLIC_MY_CORNER_ACTIVE_REGION_ID';
const activeRegionNameEnvKey = 'EXPO_PUBLIC_MY_CORNER_ACTIVE_REGION_NAME';

const fallbackNeighborhoodId = 'east-legon';
const fallbackClusterId = 'accra-east';
const fallbackRegionId = 'greater-accra';
const fallbackRegionName = 'Greater Accra';

export const defaultActiveLocationContext = createActiveLocationContext({
  neighborhoodId: fallbackNeighborhoodId,
  clusterId: fallbackClusterId,
  regionId: fallbackRegionId,
  regionName: fallbackRegionName,
  source: 'seeded',
});

export function getActiveLocationContext(options: ActiveLocationContextOptions = {}): ActiveLocationContext {
  return createActiveLocationContext({
    neighborhoodId: options.neighborhoodId ?? envValue(activeNeighborhoodIdEnvKey) ?? fallbackNeighborhoodId,
    areaLabel: options.areaLabel ?? envValue(activeAreaLabelEnvKey),
    clusterId: options.clusterId ?? envValue(activeClusterIdEnvKey) ?? fallbackClusterId,
    regionId: options.regionId ?? envValue(activeRegionIdEnvKey) ?? fallbackRegionId,
    regionName: options.regionName ?? envValue(activeRegionNameEnvKey) ?? fallbackRegionName,
    isVerifiedNeighborhoodMember: options.isVerifiedNeighborhoodMember,
    neighborhoods: options.neighborhoods,
    source: options.source ?? (envValue(activeNeighborhoodIdEnvKey) ? 'environment' : 'seeded'),
  });
}

export function createActiveLocationContext(options: ActiveLocationContextOptions = {}): ActiveLocationContext {
  const neighborhoods = options.neighborhoods ?? accraNeighborhoods;
  const requestedNeighborhoodId = options.neighborhoodId ?? fallbackNeighborhoodId;
  const neighborhood = findNeighborhood(neighborhoods, requestedNeighborhoodId) ?? findNeighborhood(neighborhoods, fallbackNeighborhoodId);
  const neighborhoodId = neighborhood?.id ?? fallbackNeighborhoodId;
  const neighborhoodName = neighborhood?.name ?? 'East Legon';
  const city = neighborhood?.city ?? 'Accra';
  const country = neighborhood?.country ?? 'Ghana';
  const clusterId = normalizeOptional(options.clusterId) ?? fallbackClusterId;
  const regionId = normalizeOptional(options.regionId) ?? fallbackRegionId;
  const regionName = normalizeOptional(options.regionName) ?? fallbackRegionName;
  const areaLabel = normalizeOptional(options.areaLabel) ?? `${neighborhoodName} · ${city}`;

  return {
    neighborhoodId,
    neighborhoodName,
    city,
    country,
    countryCode: 'GH',
    regionId,
    regionName,
    clusterId,
    areaLabel,
    source: options.source ?? 'seeded',
    isVerifiedNeighborhoodMember: options.isVerifiedNeighborhoodMember ?? true,
    isExactLocationKnown: false,
  };
}

export function getActiveLocationLabel(context = getActiveLocationContext()): string {
  return `${context.areaLabel} pilot`;
}

export function getActiveNeighborhood(context = getActiveLocationContext()): Neighborhood {
  return {
    id: context.neighborhoodId,
    name: context.neighborhoodName,
    city: context.city,
    country: context.country,
  };
}

export function getActiveDay3NeighborhoodContext(
  profileId = 'profile-akosua',
  context = getActiveLocationContext(),
): Day3NeighborhoodContext {
  return {
    profileId,
    neighborhoodId: context.neighborhoodId,
    clusterId: context.clusterId,
    regionId: context.regionId,
    isVerifiedNeighborhoodMember: context.isVerifiedNeighborhoodMember,
  };
}

function findNeighborhood(neighborhoods: Neighborhood[], neighborhoodId: string): Neighborhood | undefined {
  return neighborhoods.find((neighborhood) => neighborhood.id === neighborhoodId);
}

function normalizeOptional(value: string | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

function envValue(key: string): string | undefined {
  const maybeProcess = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;
  return normalizeOptional(maybeProcess?.env?.[key]);
}
