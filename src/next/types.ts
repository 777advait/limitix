export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed from a single IP address within the time frame.
   */
  maxRequests: number;

  /**
   * Time frame in milliseconds during which the rate limit is applied.
   * For example, setting this to 60000 means the rate limit is applied every 60 seconds.
   */
  timeFrame: number;
}

export interface requestCounter {
  [key: string]: number;
}

export interface RateLimitResult {
  isAllowed: boolean;
  ip?: string;
  remainingRequests: number;
  message: string;
}
