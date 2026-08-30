import { NextResponse } from "next/server";
import { requireAdminFromRequest } from "@/lib/admin-auth";
import { listOrders, updateOrderStatus, type KitchenStatus } from "@/lib/stripe-orders";

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
  try {
    await requireAdminFromRequest(request);
    const orders = await listOrders(100);
    return NextResponse.json({ orders });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdminFromRequest(request);
    const body = (await request.json()) as { id?: string; status?: string };
    if (!body.id || !body.status) {
      return NextResponse.json({ error: "Missing id/status." }, { status: 400 });
    }
    if (!KITCHEN_STATUSES.includes(body.status as KitchenStatus)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }
    const order = await updateOrderStatus(body.id, body.status as KitchenStatus);
    return NextResponse.json({ order });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
