/**
 * Format an ISO timestamp as a relative time string (e.g. "2 hours ago").
 * No dependency on date-fns to keep the bundle lean — only needs minute /
 * hour / day granularity for this UI.
 */
export function timeAgo(iso: string, now: number = Date.now()): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diffSec = Math.max(0, Math.floor((now - then) / 1000));

  if (diffSec < 45) return 'just now';
  if (diffSec < 90) return '1 minute ago';

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} minutes ago`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 2) return '1 hour ago';
  if (diffHr < 24) return `${diffHr} hours ago`;

  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 2) return 'yesterday';
  if (diffDay < 7) return `${diffDay} days ago`;

  // Fall back to short date for older items.
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}
