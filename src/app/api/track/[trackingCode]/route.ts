import { NextRequest, NextResponse } from "next/server";
import {
  getTicketByTrackingCode,
  TicketQueryError,
} from "@/lib/ticket-queries";
import { headers } from "next/headers";

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 requests per minute per IP
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Export for testing (only in non-production environments)
export const __testing__ =
  process.env.NODE_ENV !== "production"
    ? {
        clearRateLimit: () => rateLimitMap.clear(),
        getRateLimitMap: () => rateLimitMap,
      }
    : undefined;

/**
 * Rate limiting middleware
 */
function checkRateLimit(ip: string): { allowed: boolean; resetTime?: number } {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;

  // Clean up old entries
  for (const [key, value] of rateLimitMap.entries()) {
    if (value.resetTime < windowStart) {
      rateLimitMap.delete(key);
    }
  }

  const current = rateLimitMap.get(ip);

  if (!current) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true };
  }

  if (current.resetTime < now) {
    // Reset the window
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true };
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, resetTime: current.resetTime };
  }

  current.count++;
  return { allowed: true };
}

/**
 * Get client IP address from request
 */
async function getClientIP(request: NextRequest): Promise<string> {
  const headersList = await headers();

  // Check various headers for the real IP
  const xForwardedFor = headersList.get("x-forwarded-for");
  const xRealIP = headersList.get("x-real-ip");
  const cfConnectingIP = headersList.get("cf-connecting-ip");

  if (typeof xForwardedFor === 'string') {
    // x-forwarded-for can contain multiple IPs, take the first one
    return xForwardedFor.split(",")[0].trim();
  }

  if (typeof xRealIP === 'string') {
    return xRealIP;
  }

  if (typeof cfConnectingIP === 'string') {
    return cfConnectingIP;
  }

  // Fallback to client connection IP
  return request.headers.get("x-client-ip") || "unknown";
}

/**
 * Sanitize sensitive user data for public API response
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sanitizeTicketData(ticketData: Record<string, any>) {
  return {
    ...ticketData,
    user: {
      ...ticketData.user,
      // Mask email for privacy (show first char and domain)
      email: ticketData.user.email.replace(/(.{1}).*@/, "$1***@"),
      // Mask phone if present
      phone: ticketData.user.phone
        ? ticketData.user.phone.replace(/(.{3}).*(.{4})$/, "$1***$2")
        : null,
    },
    purchase: {
      ...ticketData.purchase,
      // Don't expose invoice file URL for security
      invoiceFileUrl: ticketData.purchase.invoiceFileUrl ? "[PROTECTED]" : null,
    },
  };
}

/**
 * GET /api/track/[trackingCode]
 * Retrieves ticket information by tracking code
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ trackingCode: string }> }
) {
  try {
    // Await params to resolve the promise
    const { trackingCode } = await params;

    // Get client IP for rate limiting
    const clientIP = await getClientIP(request);

    // Check rate limit
    const rateLimitResult = checkRateLimit(clientIP);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded. Please try again later.",
          code: "RATE_LIMIT_EXCEEDED",
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(
              (rateLimitResult.resetTime! - Date.now()) / 1000
            ).toString(),
            "X-RateLimit-Limit": RATE_LIMIT_MAX_REQUESTS.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": Math.ceil(
              rateLimitResult.resetTime! / 1000
            ).toString(),
          },
        }
      );
    }

    // Input validation
    if (!trackingCode) {
      return NextResponse.json(
        {
          success: false,
          error: "Tracking code is required",
          code: "MISSING_TRACKING_CODE",
        },
        { status: 400 }
      );
    }

    // Fetch ticket data
    const ticketData = await getTicketByTrackingCode(trackingCode);

    // Sanitize sensitive data
    const sanitizedData = sanitizeTicketData(ticketData);

    // Add rate limit headers to successful responses
    const currentLimit = rateLimitMap.get(clientIP);
    const remaining = Math.max(
      0,
      RATE_LIMIT_MAX_REQUESTS - (currentLimit?.count || 0)
    );

    return NextResponse.json(
      {
        success: true,
        data: sanitizedData,
      },
      {
        status: 200,
        headers: {
          "X-RateLimit-Limit": RATE_LIMIT_MAX_REQUESTS.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": Math.ceil(
            (currentLimit?.resetTime || Date.now()) / 1000
          ).toString(),
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    console.error("API Error in /api/track/[trackingCode]:", error);

    if (error instanceof TicketQueryError) {
      // Handle known ticket query errors
      const statusCode =
        error.code === "NOT_FOUND"
          ? 404
          : error.code === "INVALID_FORMAT" || error.code === "INVALID_INPUT"
          ? 400
          : 500;

      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: error.code,
        },
        { status: statusCode }
      );
    }

    // Handle unexpected errors
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}

/**
 * Handle unsupported HTTP methods
 */
export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: "Method not allowed",
      code: "METHOD_NOT_ALLOWED",
    },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    {
      success: false,
      error: "Method not allowed",
      code: "METHOD_NOT_ALLOWED",
    },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    {
      success: false,
      error: "Method not allowed",
      code: "METHOD_NOT_ALLOWED",
    },
    { status: 405 }
  );
}