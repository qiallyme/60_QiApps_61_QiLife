/**
 * Format a date string or ISO timestamp as a short human-readable date.
 * e.g. "May 29, 2026"
 */
export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

/**
 * Format a date string as relative time from now.
 * e.g. "3 hours ago", "just now", "2 days ago"
 */
export function formatRelative(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const abs = Math.abs(diff);
    const future = diff < 0;

    if (abs < 60_000) return "just now";
    if (abs < 3_600_000) {
      const m = Math.round(abs / 60_000);
      return future ? `in ${m}m` : `${m}m ago`;
    }
    if (abs < 86_400_000) {
      const h = Math.round(abs / 3_600_000);
      return future ? `in ${h}h` : `${h}h ago`;
    }
    if (abs < 7 * 86_400_000) {
      const d = Math.round(abs / 86_400_000);
      return future ? `in ${d}d` : `${d}d ago`;
    }
    return formatDate(iso);
  } catch {
    return iso;
  }
}

/**
 * Format amount in cents to a dollar string.
 * e.g. 4000 -> "$40.00"
 */
export function formatCents(cents: number, currency = "USD"): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency}`;
  }
}
