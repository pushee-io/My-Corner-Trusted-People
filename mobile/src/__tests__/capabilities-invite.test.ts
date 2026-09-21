import { capabilitiesFor } from '@/lib/capabilities';
import { getMyCornerInviteUrl, myCornerInvitation } from '@/lib/invite';
jest.mock('@/lib/auth', () => ({ getCurrentProfile: jest.fn() }));
jest.mock('@/lib/supabase', () => ({ supabase: {} }));
it.each([
  ['requester', false, true, { provider: false, community: true, moderator: false }],
  ['provider', true, false, { provider: true, community: false, moderator: false }],
  ['provider', true, true, { provider: true, community: true, moderator: false }],
  ['moderator', false, false, { provider: false, community: false, moderator: true }],
  ['moderator', true, true, { provider: true, community: true, moderator: true }],
] as const)('preserves independent capabilities for %s/%s/%s', (role, provider, resident, expected) => {
  expect(capabilitiesFor(role, provider, resident)).toEqual(expected);
});
afterEach(() => {
  delete process.env.EXPO_PUBLIC_MY_CORNER_INVITE_URL;
});
it('shares useful text without inventing a store link', () => {
  delete process.env.EXPO_PUBLIC_MY_CORNER_INVITE_URL;
  expect(getMyCornerInviteUrl()).toBeUndefined();
  expect(myCornerInvitation().message).toContain('App download link coming soon.');
});
it('uses the configured HTTPS invite URL', () => {
  process.env.EXPO_PUBLIC_MY_CORNER_INVITE_URL = 'https://example.com/invite';
  expect(myCornerInvitation().message).toContain('https://example.com/invite');
});
it('rejects unsafe invite URL schemes', () => {
  process.env.EXPO_PUBLIC_MY_CORNER_INVITE_URL = 'javascript:alert(1)';
  expect(getMyCornerInviteUrl()).toBeUndefined();
});
