import { HttpError } from "@/lib/http";

interface Window {
  count: number;
  resetAt: number;
}

const windows = new Map<string, Window>();

/**
 * Fixed-window limiter held in memory. Fine for a single Railway instance; with several
 * replicas each keeps its own count (account lockout in the database still applies).
 */
export function rateLimit(bucket: string, key: string, limit: number, windowMs: number): void {
  const now = Date.now();
  const id = `${bucket}:${key}`;
  const current = windows.get(id);

  if (!current || current.resetAt <= now) {
    windows.set(id, { count: 1, resetAt: now + windowMs });
    if (windows.size > 10_000) prune(now);
    return;
  }

  current.count += 1;
  if (current.count > limit) throw new HttpError(429, "Too many requests. Try again later.");
}

function prune(now: number) {
  for (const [id, w] of windows) if (w.resetAt <= now) windows.delete(id);
}
