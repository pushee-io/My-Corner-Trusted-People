export function feedTimeLabel(value: string, now = Date.now()) {
  const time = Date.parse(value);
  if (!Number.isFinite(time)) return '';
  const minutes = Math.max(0, Math.floor((now - time) / 60000));
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
  const days = Math.floor(minutes / 1440);
  if (days < 7) return `${days}d ago`;
  return new Date(time).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' });
}
