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
  const email = (decoded.email || "").trim().toLowerCase();
  const hasAdminClaim = Boolean((decoded as Record<string, unknown>).admin);

  if (!email || !hasAdminClaim) {
    throw new Error("Acceso denegado: se requieren permisos de administrador.");
  }

  // Double validation: Whitelist in ADMIN_EMAILS environment variable
  const allowedRaw = process.env.ADMIN_EMAILS || "";
  const allowed = allowedRaw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  // If allowlist is defined, the email MUST be present
  if (allowed.length > 0 && !allowed.includes(email)) {
    throw new Error("Acceso denegado: el correo no figura en la lista de administradores autorizados.");
  }

  return { uid: decoded.uid, email };
}
