const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30,
};

export function rateLimit(
  identifier: string,
  config: RateLimitConfig = DEFAULT_CONFIG,
): { success: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now - record.lastReset > config.windowMs) {
    rateLimitMap.set(identifier, { count: 1, lastReset: now });
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetIn: config.windowMs,
    };
  }

  if (record.count >= config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetIn: config.windowMs - (now - record.lastReset),
    };
  }

  record.count++;
  return {
    success: true,
    remaining: config.maxRequests - record.count,
    resetIn: config.windowMs - (now - record.lastReset),
  };
}

// Clean up old entries periodically
const cleanup = setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now - value.lastReset > 5 * 60 * 1000) {
      rateLimitMap.delete(key);
    }
  }
}, 60 * 1000);
cleanup.unref?.();
