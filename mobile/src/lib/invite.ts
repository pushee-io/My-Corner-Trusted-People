export function getMyCornerInviteUrl(): string | undefined {
  const value = process.env.EXPO_PUBLIC_MY_CORNER_INVITE_URL?.trim();
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}
export function myCornerInvitation() {
  const message =
    'Join me on My Corner — the neighborhood operating system for Africa. Connect with your community, discover local services, events, groups, businesses and more.';
  const url = getMyCornerInviteUrl();
  return {
    title: 'Join My Corner',
    message: url ? `${message}\n${url}` : `${message}\nApp download link coming soon.`,
  };
}
