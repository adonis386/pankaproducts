import { NextResponse } from "next/server";
import { getOrReconcileOrder } from "@/lib/stripe-orders";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get("session_id") || "";
    if (!sessionId) {
      return NextResponse.json({ error: "Missing session_id." }, { status: 400 });
    }

    const order = await getOrReconcileOrder(sessionId);
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch order.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
