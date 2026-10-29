import { NextResponse } from "next/server";
import { requireAdminFromRequest } from "@/lib/admin-auth";
import { listOrders, updateOrderStatus, type KitchenStatus } from "@/lib/stripe-orders";
import { checkRateLimit, verifySameOrigin, sanitizePlainText } from "@/lib/security";

export const runtime = "nodejs";

const KITCHEN_STATUSES: KitchenStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "delivered",
  "cancelled",
  "failed",
];

export async function GET(request: Request) {
  const rate = checkRateLimit(request, "admin");
  if (!rate.allowed && rate.response) return rate.response;

  try {
    await requireAdminFromRequest(request);
    const orders = await listOrders(100);
    return NextResponse.json({ orders }, { headers: rate.headers });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
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
    const body = (await request.json()) as { id?: string; status?: string };
    const cleanId = sanitizePlainText(body?.id, 128);
    const cleanStatus = sanitizePlainText(body?.status, 32) as KitchenStatus;

    if (!cleanId || !cleanStatus) {
      return NextResponse.json(
        { error: "Missing id/status." },
        { status: 400, headers: rate.headers }
      );
    }
    if (!KITCHEN_STATUSES.includes(cleanStatus)) {
      return NextResponse.json(
        { error: "Invalid status." },
        { status: 400, headers: rate.headers }
      );
    }
    const order = await updateOrderStatus(cleanId, cleanStatus);
    return NextResponse.json({ order }, { headers: rate.headers });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: 400, headers: rate.headers });
  }
}
