import { NextResponse } from "next/server";
import { requireAdminFromRequest } from "@/lib/admin-auth";
import { getSiteSettings, updateSiteSettings, type SiteSettings } from "@/lib/site-settings";
import { checkRateLimit, verifySameOrigin, sanitizeDeep } from "@/lib/security";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const rate = checkRateLimit(request, "admin");
  if (!rate.allowed && rate.response) return rate.response;

  try {
    await requireAdminFromRequest(request);
    const settings = await getSiteSettings();
    return NextResponse.json({ settings }, { headers: rate.headers });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Not authorized.";
    return NextResponse.json({ error: message }, { status: 401, headers: rate.headers });
  }
}

export async function PATCH(request: Request) {
  const originError = verifySameOrigin(request);
  if (originError) return originError;

  const rate = checkRateLimit(request, "admin");
  if (!rate.allowed && rate.response) return rate.response;

  try {
    await requireAdminFromRequest(request);
    const body = (await request.json()) as Partial<SiteSettings>;
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid payload." },
        { status: 400, headers: rate.headers }
      );
    }

    const sanitizedBody = sanitizeDeep(body, 2500);
    const updated = await updateSiteSettings(sanitizedBody);
    return NextResponse.json({ ok: true, settings: updated }, { headers: rate.headers });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update settings.";
    return NextResponse.json({ error: message }, { status: 400, headers: rate.headers });
  }
}
