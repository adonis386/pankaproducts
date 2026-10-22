import { NextResponse } from "next/server";
import { requireAdminFromRequest } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const admin = await requireAdminFromRequest(request);
    return NextResponse.json({ ok: true, admin });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Not authorized.";
    return NextResponse.json({ ok: false, error: message }, { status: 403 });
  }
}
