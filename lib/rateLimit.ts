interface RateLimitOptions {
  interval: number; // time window in milliseconds
  uniqueTokenPerInterval: number; // max requests per interval
}

interface RateLimitReturn {
  success: boolean;
  remaining: number;
  resetTime: number;
}

export default function rateLimit({ interval, uniqueTokenPerInterval }: RateLimitOptions) {
  const tokenMap = new Map<string, { count: number; resetTime: number }>();

  return {
    async check(token: string, limit: number): Promise<RateLimitReturn> {
      const now = Date.now();
      const tokenData = tokenMap.get(token);
      if (!tokenData) {
        tokenMap.set(token, {
          count: 1,
          resetTime: now + interval,
        });
        return { success: true, remaining: limit - 1, resetTime: now + interval };
      }

      // If the reset time has passed, reset the count
      if (now > tokenData.resetTime) {
        tokenData.count = 0;
        tokenData.resetTime = now + interval;
      }

      tokenData.count++;

      if (tokenData.count > limit) {
        return {
          success: false,
          remaining: 0,
          resetTime: tokenData.resetTime,
        };
      }

      return {
        success: true,
        remaining: limit - tokenData.count,
        resetTime: tokenData.resetTime,
      };
    },
  };
}