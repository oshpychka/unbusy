const dayMs = 86_400_000;

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number, digits = 0) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatPercent(value: number) {
  return `${formatNumber(value * 100, value < 0.1 ? 1 : 0)}%`;
}

export function formatDateTime(time: number) {
  return new Date(time).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDate(time: number) {
  return new Date(time).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatRelative(time: number, now = Date.now()) {
  const diff = now - time;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < dayMs) return `${Math.floor(diff / 3_600_000)}h ago`;
  if (diff < 7 * dayMs) return `${Math.floor(diff / dayMs)}d ago`;
  return formatDate(time);
}

export function formatDuration(ms: number) {
  if (ms < 1000) return `${Math.round(ms)} ms`;
  if (ms < 60_000) return `${formatNumber(ms / 1000, 1)} s`;
  const days = Math.floor(ms / dayMs);
  const hours = Math.floor((ms % dayMs) / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  if (days > 0) return hours ? `${days}d ${hours}h` : `${days}d`;
  if (hours > 0) return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
  return `${minutes}m`;
}

export function formatHours(hours: number) {
  return `${formatNumber(hours, hours < 10 ? 1 : 0)} h`;
}
