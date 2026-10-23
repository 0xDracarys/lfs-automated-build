/**
 * Minimal in-memory sliding-window rate limiter for API routes.
 * Best for single-instance deployments; swap for Redis-compatible limiters
 * when the app scales horizontally (noted in the security checklist).
 * Returns true when the call is allowed.
 */

const hits = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const h = hits.get(key);

  if (!h || now > h.resetAt) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (h.count >= max) return false;

  h.count = h.count + 1;
  return true;
}

/** Stable caller key: prefer uid, fall back to client IP offset. */
export function callerKey(request: NextRequest, uid?: string): string {
  if (uid) return `u:${uid}`;
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';
  return `ip:${ip}`;
}
