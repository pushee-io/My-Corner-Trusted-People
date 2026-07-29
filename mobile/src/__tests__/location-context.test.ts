import { readFileSync } from 'fs';
import {
  createActiveLocationContext,
  defaultActiveLocationContext,
  getActiveDay3NeighborhoodContext,
  getActiveLocationContext,
  getActiveLocationLabel,
  getActiveNeighborhood,
} from '@/lib/location-context';

const privateFieldPattern =
  /phone_number|phone|email|ghana.*post|ghana_post|gps|exact.*address|exact_address|address_line|street_address|coordinates?|latitude|longitude|legal.*name|legal_name|challenge.*hash|challenge_hash|hash/i;

const envKeys = [
  'EXPO_PUBLIC_MY_CORNER_ACTIVE_NEIGHBORHOOD_ID',
  'EXPO_PUBLIC_MY_CORNER_ACTIVE_AREA_LABEL',
  'EXPO_PUBLIC_MY_CORNER_ACTIVE_CLUSTER_ID',
  'EXPO_PUBLIC_MY_CORNER_ACTIVE_REGION_ID',
  'EXPO_PUBLIC_MY_CORNER_ACTIVE_REGION_NAME',
];

describe('active location context', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    envKeys.forEach((key) => {
      delete process.env[key];
    });
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('defaults to the seeded East Legon pilot neighborhood and area', () => {
    expect(defaultActiveLocationContext).toMatchObject({
      neighborhoodId: 'east-legon',
      neighborhoodName: 'East Legon',
      city: 'Accra',
      country: 'Ghana',
      countryCode: 'GH',
      clusterId: 'accra-east',
      regionId: 'greater-accra',
      regionName: 'Greater Accra',
      areaLabel: 'East Legon · Accra',
      source: 'seeded',
      isVerifiedNeighborhoodMember: true,
      isExactLocationKnown: false,
    });
    expect(getActiveLocationLabel(defaultActiveLocationContext)).toBe('East Legon · Accra pilot');
  });

  it('allows explicit active neighborhood and area overrides for preview reads', () => {
    const context = createActiveLocationContext({
      neighborhoodId: 'osu',
      areaLabel: 'Osu central area',
      clusterId: 'accra-central',
      source: 'environment',
      isVerifiedNeighborhoodMember: false,
    });

    expect(context).toMatchObject({
      neighborhoodId: 'osu',
      neighborhoodName: 'Osu',
      areaLabel: 'Osu central area',
      clusterId: 'accra-central',
      source: 'environment',
      isVerifiedNeighborhoodMember: false,
    });
  });

  it('reads explicit environment configuration without enabling live services', () => {
    process.env.EXPO_PUBLIC_MY_CORNER_ACTIVE_NEIGHBORHOOD_ID = 'labone';
    process.env.EXPO_PUBLIC_MY_CORNER_ACTIVE_AREA_LABEL = 'Labone general area';
    process.env.EXPO_PUBLIC_MY_CORNER_ACTIVE_CLUSTER_ID = 'accra-central';

    expect(getActiveLocationContext()).toMatchObject({
      neighborhoodId: 'labone',
      neighborhoodName: 'Labone',
      areaLabel: 'Labone general area',
      clusterId: 'accra-central',
      source: 'environment',
    });
  });

  it('fails closed to the seeded neighborhood when an unknown neighborhood is configured', () => {
    const context = createActiveLocationContext({ neighborhoodId: 'unknown-private-place' });

    expect(context.neighborhoodId).toBe('east-legon');
    expect(context.neighborhoodName).toBe('East Legon');
  });

  it('maps active location into the Day 3 neighborhood viewer context', () => {
    const context = createActiveLocationContext({ neighborhoodId: 'madina', clusterId: 'accra-east' });

    expect(getActiveDay3NeighborhoodContext('profile-test', context)).toEqual({
      profileId: 'profile-test',
      neighborhoodId: 'madina',
      clusterId: 'accra-east',
      regionId: 'greater-accra',
      isVerifiedNeighborhoodMember: true,
    });
  });

  it('returns a safe active neighborhood object for read repositories', () => {
    expect(getActiveNeighborhood(createActiveLocationContext({ neighborhoodId: 'osu' }))).toEqual({
      id: 'osu',
      name: 'Osu',
      city: 'Accra',
      country: 'Ghana',
    });
  });

  it('does not expose private address, identity, contact, or coordinate fields', () => {
    const serialized = JSON.stringify(createActiveLocationContext({ neighborhoodId: 'east-legon' }));

    expect(serialized).not.toMatch(privateFieldPattern);
    expect(serialized).not.toContain('+233');
    expect(serialized).not.toContain('@');
    expect(serialized).not.toContain('GhanaPost');
  });

  it('keeps location context read-only and independent of device location APIs', () => {
    const source = readFileSync('src/lib/location-context.ts', 'utf8');

    expect(source).not.toContain('supabase');
    expect(source).not.toContain('.insert(');
    expect(source).not.toContain('.update(');
    expect(source).not.toContain('.delete(');
    expect(source).not.toContain('getCurrentPosition');
    expect(source).not.toContain('watchPosition');
    expect(source).not.toContain('requestForegroundPermissions');
  });
});
