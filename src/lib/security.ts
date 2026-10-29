import { NextResponse } from "next/server";

export type RateLimitBucket = "checkout" | "orders" | "admin" | "public";

interface BucketConfig {
  windowMs: number;
  maxRequests: number;
}

const BUCKET_CONFIGS: Record<RateLimitBucket, BucketConfig> = {
  checkout: { windowMs: 60_000, maxRequests: 12 },
  orders: { windowMs: 60_000, maxRequests: 35 },
  admin: { windowMs: 60_000, maxRequests: 80 },
  public: { windowMs: 60_000, maxRequests: 120 },
};

interface RateEntry {
  count: number;
  resetAt: number;
}

const MAX_STORE_ENTRIES = 5000;
const rateStores: Record<RateLimitBucket, Map<string, RateEntry>> = {
  checkout: new Map(),
  orders: new Map(),
  admin: new Map(),
  public: new Map(),
};

export function getClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first.slice(0, 64);
  }
  const realIp =
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-vercel-forwarded-for");
  if (realIp) return realIp.trim().slice(0, 64);
  return "unknown-ip";
}

function pruneStoreIfNeeded(store: Map<string, RateEntry>, now: number) {
  if (store.size < MAX_STORE_ENTRIES) return;
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  }
  if (store.size >= MAX_STORE_ENTRIES) {
    const oldestKey = store.keys().next().value;
    if (oldestKey) store.delete(oldestKey);
  }
}

export function checkRateLimit(
  request: Request,
  bucket: RateLimitBucket
): {
  allowed: boolean;
  headers: Record<string, string>;
  response?: NextResponse;
} {
  const config = BUCKET_CONFIGS[bucket];
  const store = rateStores[bucket];
  const now = Date.now();
  const ip = getClientIp(request);

  pruneStoreIfNeeded(store, now);

  let entry = store.get(ip);
  if (!entry || entry.resetAt <= now) {
    entry = { count: 1, resetAt: now + config.windowMs };
    store.set(ip, entry);
  } else {
    entry.count += 1;
  }

  const remaining = Math.max(0, config.maxRequests - entry.count);
  const retryAfterSec = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));

  const headers: Record<string, string> = {
    "X-RateLimit-Limit": String(config.maxRequests),
    "X-RateLimit-Remaining": String(remaining),
    "X-RateLimit-Reset": String(Math.ceil(entry.resetAt / 1000)),
  };

  if (entry.count > config.maxRequests) {
    headers["Retry-After"] = String(retryAfterSec);
    return {
      allowed: false,
      headers,
      response: NextResponse.json(
        {
          error:
            "Too many requests. Please wait a few seconds and try again. / Demasiadas solicitudes, intenta nuevamente en unos segundos.",
        },
        { status: 429, headers }
      ),
    };
  }

  return { allowed: true, headers };
}

export function verifySameOrigin(request: Request): NextResponse | null {
  const origin = request.headers.get("origin");
  if (!origin) return null; // Same-origin fetch or server-to-server without Origin header
  try {
    const originHost = new URL(origin).host.toLowerCase();
    const targetHost = (
      request.headers.get("x-forwarded-host") ||
      request.headers.get("host") ||
      new URL(request.url).host
    ).toLowerCase();

    if (originHost === targetHost) return null;
    if (
      originHost.endsWith(".pankaproducts.com") ||
      originHost === "pankaproducts.com" ||
      originHost === "www.pankaproducts.com" ||
      originHost.endsWith(".vercel.app") ||
      originHost.startsWith("localhost:")
    ) {
      return null;
    }

    return NextResponse.json(
      { error: "Cross-origin request forbidden." },
      { status: 403 }
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid Origin header." },
      { status: 403 }
    );
  }
}

/**
 * Strips all HTML tags, script payloads, event handlers, dangerous URI schemes,
 * and control characters to prevent Stored & Reflected XSS.
 */
export function sanitizePlainText(input: unknown, maxLength = 500): string {
  if (typeof input !== "string") return "";
  return input
    // Remove script/style/iframe blocks completely
    .replace(/<(script|style|iframe|object|embed|svg|math)[^>]*>[\s\S]*?<\/\1>/gi, "")
    // Remove all remaining HTML tags
    .replace(/<\/?[a-zA-Z][^>]*>/g, "")
    // Strip angle brackets that could start incomplete tags
    .replace(/[<>]/g, "")
    // Remove dangerous URI protocols
    .replace(/\b(javascript|vbscript|data)\s*:/gi, "")
    // Remove inline event handler patterns
    .replace(/\bon[a-z]+\s*=/gi, "")
    // Remove ASCII control characters except newline (\n) and tab (\t)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, maxLength);
}

/**
 * Allows only <strong class="text-primary">, <strong>, </strong>, <em>, </em>
 * while stripping all XSS vectors.
 */
export function sanitizeRichTextSafe(input: unknown, maxLength = 2000): string {
  if (typeof input !== "string") return "";
  // Temporarily tokenize allowed tags
  const tokenized = input
    .replace(/<strong\s+class="text-primary"\s*>/gi, "___SAFE_STRONG_PRIMARY___")
    .replace(/<strong>/gi, "___SAFE_STRONG_OPEN___")
    .replace(/<\/strong>/gi, "___SAFE_STRONG_CLOSE___")
    .replace(/<em>/gi, "___SAFE_EM_OPEN___")
    .replace(/<\/em>/gi, "___SAFE_EM_CLOSE___");

  const cleaned = sanitizePlainText(tokenized, maxLength + 200);

  return cleaned
    .replace(/___SAFE_STRONG_PRIMARY___/g, '<strong class="text-primary">')
    .replace(/___SAFE_STRONG_OPEN___/g, "<strong>")
    .replace(/___SAFE_STRONG_CLOSE___/g, "</strong>")
    .replace(/___SAFE_EM_OPEN___/g, "<em>")
    .replace(/___SAFE_EM_CLOSE___/g, "</em>")
    .slice(0, maxLength);
}

export function sanitizeEmail(input: unknown): string {
  const clean = sanitizePlainText(input, 160).toLowerCase();
  if (!clean) return "";
  // Basic safe email validation
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(clean)) return "";
  return clean;
}

export function sanitizePhone(input: unknown): string {
  if (typeof input !== "string") return "";
  return input.replace(/[^0-9+()\-\s.]/g, "").trim().slice(0, 32);
}

const FORBIDDEN_KEYS = new Set(["__proto__", "constructor", "prototype"]);

export function sanitizeDeep<T>(value: T, maxStringLen = 2000, depth = 0): T {
  if (depth > 8 || value === null || value === undefined) return value;

  if (typeof value === "string") {
    return sanitizePlainText(value, maxStringLen) as unknown as T;
  }

  if (Array.isArray(value)) {
    return value
      .slice(0, 100)
      .map((item) => sanitizeDeep(item, maxStringLen, depth + 1)) as unknown as T;
  }

  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (FORBIDDEN_KEYS.has(k)) continue;
      if (k === "p3" && v && typeof v === "object") {
        const p3Obj = v as Record<string, unknown>;
        out[k] = {
          en: sanitizeRichTextSafe(p3Obj.en, maxStringLen),
          es: sanitizeRichTextSafe(p3Obj.es, maxStringLen),
        };
      } else {
        out[k] = sanitizeDeep(v, maxStringLen, depth + 1);
      }
    }
    return out as T;
  }

  return value;
}
