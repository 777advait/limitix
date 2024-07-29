import type { NextRequest } from "next/server";
import type { RateLimitConfig, RateLimitResult, requestCounter } from "./types";

let requestCounter: requestCounter = {};
let resetTimer: number;

function resetCounters(configTime: number) {
  requestCounter = {};
  clearTimeout(resetTimer);
  resetTimer = setTimeout(() => {
    resetCounters(configTime);
  }, configTime);
}

export default async function nextRateLimiter(
  req: NextRequest,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  if (!resetTimer) {
    resetCounters(config.timeFrame);
  }

  let ip: string | undefined;

  try {
    ip = (
      req.headers.get("x-forwarded-for") || req.headers.get("remote-addr")
    )?.split(",")[0];

    if (!ip) {
      throw new Error("No IP address found");
    }

    ip = ip.trim();

    requestCounter[ip] = requestCounter[ip] || 0;

    if (requestCounter[ip] >= config.maxRequests) {
      return {
        isAllowed: false,
        message: `Rate limit exceeded for IP ${ip}`,
        ip,
        remainingRequests: 0,
      };
    } else {
      ++requestCounter[ip];
      return {
        isAllowed: true,
        ip,
        message: `Request count for IP ${ip} = ${requestCounter[ip]}`,
        remainingRequests: config.maxRequests - requestCounter[ip],
      };
    }
  } catch (err) {
    if (err instanceof Error) {
      return {
        isAllowed: false,
        message: err.message,
        remainingRequests: config.timeFrame,
      };
    }

    return {
      isAllowed: false,
      message: "An unexpected error occurred",
      remainingRequests: config.timeFrame,
    };
  }
}
