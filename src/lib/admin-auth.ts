import "server-only";

import { adminAuth } from "@/lib/firebase-admin";

async function verifyBearer(request: Request) {
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : "";

  if (!token) {
    throw new Error("Missing auth token.");
  }

  return adminAuth().verifyIdToken(token);
}

export async function requireUserFromRequest(request: Request) {
  const decoded = await verifyBearer(request);
  return { uid: decoded.uid, email: decoded.email || "" };
}

export async function requireAdminFromRequest(request: Request) {
  const decoded = await verifyBearer(request);
  const email = decoded.email || "";
  const hasAdminClaim = Boolean((decoded as Record<string, unknown>).admin);

  const allowedRaw = process.env.ADMIN_EMAILS || "";
  const allowed = allowedRaw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const passesEmailAllowList = allowed.length === 0 || allowed.includes(email.toLowerCase());

  if (!email || !passesEmailAllowList || !hasAdminClaim) {
    throw new Error("Not authorized.");
  }

  return { uid: decoded.uid, email };
}
