import {
  createLiveLocalPost,
  createLivePostcardChallenge,
  day2bFallbackNeighborhoodName,
  day2bTestPostcardCode,
  getLiveFeedUnlockStatus,
  listLiveNeighborhoodPosts,
  saveLiveGhanaAddress,
  saveLiveLegalName,
  verifyLivePostcardCode,
} from '@/lib/day2b-live-repository';

export const day2bNeighborhoodName = day2bFallbackNeighborhoodName;
export const day2bAuthorDisplayName = 'Verified neighbor';
export const day2bTestCode = day2bTestPostcardCode;

export async function getDay2BFeedUnlockStatus() {
  return getLiveFeedUnlockStatus();
}

export async function listDay2BNeighborhoodPosts() {
  return listLiveNeighborhoodPosts();
}

export async function createDay2BLocalPost(body: string) {
  return createLiveLocalPost(body);
}

export async function completeDay2BLegalName(input: { givenNames: string; familyName: string }) {
  return saveLiveLegalName(input);
}

export async function saveDay2BGhanaAddress(input: {
  neighborhood: string;
  city: string;
  areaLabel: string;
  ghanaPostGps?: string;
  provider: string;
}) {
  return saveLiveGhanaAddress(input);
}

export async function createDay2BPostcardChallenge() {
  return createLivePostcardChallenge();
}

export async function completeResidenceVerificationFromPostcard(input: { challengeId: string; code: string }) {
  return verifyLivePostcardCode(input.challengeId, input.code);
}
