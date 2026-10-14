import { NextResponse } from "next/server";
import { requireAdminFromRequest } from "@/lib/admin-auth";
import { getSiteSettings, updateSiteSettings, type SiteSettings } from "@/lib/site-settings";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requireAdminFromRequest(request);
    const settings = await getSiteSettings();
    return NextResponse.json({ settings });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Not authorized.";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdminFromRequest(request);
    const body = (await request.json()) as Partial<SiteSettings>;
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
    }

    const updated = await updateSiteSettings(body);
    return NextResponse.json({ ok: true, settings: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update settings.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
