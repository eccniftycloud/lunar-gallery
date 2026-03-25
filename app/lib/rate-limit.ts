/**
 * In-memory rate limiter for server actions.
 * No external dependencies required (no Redis).
 *
 * Usage:
 *   const limiter = new RateLimiter({ maxRequests: 10, windowMs: 60_000 });
 *   limiter.check("user-id"); // throws if rate exceeded
 */

interface RateLimiterOptions {
    /** Maximum number of requests allowed within the window. */
    maxRequests: number;
    /** Time window in milliseconds. */
    windowMs: number;
}

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

export class RateLimiter {
    private store = new Map<string, RateLimitEntry>();
    private readonly maxRequests: number;
    private readonly windowMs: number;

    constructor(opts: RateLimiterOptions) {
        this.maxRequests = opts.maxRequests;
        this.windowMs = opts.windowMs;

        // Cleanup expired entries every 60 seconds to prevent memory leaks
        setInterval(() => {
            const now = Date.now();
            for (const [key, entry] of this.store) {
                if (now > entry.resetAt) {
                    this.store.delete(key);
                }
            }
        }, 60_000);
    }

    /**
     * Check if a request is allowed for the given key.
     * Throws an error if the rate limit has been exceeded.
     */
    check(key: string): void {
        const now = Date.now();
        const entry = this.store.get(key);

        if (!entry || now > entry.resetAt) {
            // First request or window expired — start fresh
            this.store.set(key, { count: 1, resetAt: now + this.windowMs });
            return;
        }

        if (entry.count >= this.maxRequests) {
            const retryAfterMs = entry.resetAt - now;
            const retryAfterSec = Math.ceil(retryAfterMs / 1000);
            throw new Error(`Rate limit exceeded. Try again in ${retryAfterSec} seconds.`);
        }

        entry.count++;
    }
}

// --- Pre-configured limiters for Lunar Gallery ---

/** Upload limiter: 10 uploads per 5 minutes */
export const uploadLimiter = new RateLimiter({
    maxRequests: 10,
    windowMs: 5 * 60 * 1000,
});

/** Login limiter: 5 attempts per minute (brute-force protection) */
export const loginLimiter = new RateLimiter({
    maxRequests: 5,
    windowMs: 60 * 1000,
});
