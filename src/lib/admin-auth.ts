import "server-only";

import { adminAuth } from "@/lib/firebase-admin";

export async function requireAdminFromRequest(request: Request) {
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : "";

  if (!token) {
    throw new Error("Missing auth token.");
  }

  const decoded = await adminAuth().verifyIdToken(token);
  const email = decoded.email || "";

  // Strong check: custom claim set via Firebase Admin SDK.
  const hasAdminClaim = Boolean((decoded as Record<string, unknown>).admin);

  const allowedRaw = process.env.ADMIN_EMAILS || "";
  const allowed = allowedRaw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  // Backward compatible: if ADMIN_EMAILS is set, enforce it too.
  const passesEmailAllowList = allowed.length === 0 || allowed.includes(email.toLowerCase());

  if (!email || !passesEmailAllowList || !hasAdminClaim) {
    throw new Error("Not authorized.");
  }

  return { uid: decoded.uid, email };
}

