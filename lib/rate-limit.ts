type RateLimitRecord = {
  count: number;
  resetTime: number;
};

// Global map to store IP hits.
const rateLimitMap = new Map<string, RateLimitRecord>();

// CONFIGURATION
const WINDOW_SIZE = 60 * 1000; // 1 minute (in milliseconds)
const MAX_REQUESTS = 5;        // Max 5 messages per minute
const CLEANUP_INTERVAL = 60 * 1000; // Run cleanup at most once per minute

let lastCleanup = Date.now();

function cleanupExpired() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [ip, record] of rateLimitMap) {
    if (now > record.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}

export function checkRateLimit(ip: string) {
  cleanupExpired();

  const now = Date.now();
  const record = rateLimitMap.get(ip);

  // 1. New visitor? Track them.
  if (!record) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_SIZE });
    return { success: true };
  }

  // 2. Has the window expired? Reset them.
  if (now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_SIZE });
    return { success: true };
  }

  // 3. Have they exceeded the limit? Block them.
  if (record.count >= MAX_REQUESTS) {
    return {
      success: false,
      resetAt: record.resetTime
    };
  }

  // 4. Increment count
  record.count += 1;
  return { success: true };
}
