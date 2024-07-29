# Limitix

**Limitix** is a powerful and flexible in-memory rate limiting library designed for single-server Next.js applications.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)

## Features

- **Flexible Rate Limiting:** Control API request rates with ease.
- **Customizable Rate Limiting:** Define custom rate limits for specific routes or endpoints.
- **In-Memory Storage:** Fast and efficient in-memory storage for rate limits.

#### Limitations

- Limitix is designed for single-server Next.js applications. It does not support distributed/scaled-out environments.
- If the server restarts, the counters will reset. This is not suitable for applications requiring persistent rate limiting over longer periods.

## Installation

```bash
npm install limitix
```

## Usage

### In api route handlers

```typescript
import { nextRateLimiter } from "limitix/next";
import { NextApiRequest, NextApiResponse } from "next";

export async function GET(req: NextApiRequest, res: NextApiResponse) {
  const { isAllowed, remainingRequests, ip, message } = await nextRateLimiter(
    req,
    { maxRequests: 10, interval: 5 * 60 * 1000 }
  ); // 10 requests per 5 minutes

  if (!isAllowed) {
    return NextResponse.json(
      { isAllowed, message, remainingRequests, ip },
      { status: 429 }
    );
  }

  return NextResponse.json(
    { isAllowed, message, remainingRequests, ip },
    { status: 200 }
  );
}
```

### In middleware

> This is how im using it in my side-project [indielettr](https://indielettr.com)

<br />

```typescript
import { auth } from "@/server/auth";
import { nextRateLimiter } from "limitix/next";

type rateLimitConfig = {
  [key: string]: {
    requestLimit: number;
    time: number;
  };
};

const rateLimitConfig: rateLimitConfig = {
  "/api/smtp-server": { requestLimit: 100, time: 15 * 60 * 1000 }, // 100 requests per 15 minutes
  "/api/tracking": { requestLimit: 60, time: 1 * 60 * 1000 }, // 60 requests per minute
};

export default auth(async (req) => {
  const { pathname } = req.nextUrl;
  const config = rateLimitConfig[pathname];
  const { isAllowed } = await nextRateLimiter(req, config);

  if (config && !isAllowed) {
    return new Response(JSON.stringify({ error: "Too many requests" }), {
      status: 429,
      headers: { "Content-Type": "application/json" },
    });
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)", "/api/(.+)"],
};
```

## Configuration

The `nextRateLimiter` function requires a configuration object to manage the rate limiting. This configuration object is of type `RateLimitConfig` and should be passed as an argument to the function.

```typescript
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
```
