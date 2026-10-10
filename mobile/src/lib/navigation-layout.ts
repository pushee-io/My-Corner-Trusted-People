// Presentation policy only. No role checks, data fetching or navigation redirects.
const focusedForms = new Set([
  '/hire/request/new',
  '/hire/request/review',
  '/groups/new',
  '/events/new',
  '/reviews/write',
  '/provider/request/respond',
  '/profile/public-name',
  '/profile/phone-verification',
  '/profile/legal-name',
  '/profile/address',
  '/profile/map-confirmation',
  '/profile/location-consistency',
  '/profile/postcard-challenge',
  '/profile/manual-biometric',
]);

export function isFocusedForm(pathname: string) {
  return focusedForms.has(pathname) || /^\/events\/[^/]+\/edit$/.test(pathname);
}
