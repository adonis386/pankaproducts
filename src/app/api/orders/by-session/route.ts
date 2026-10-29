import { NextResponse } from "next/server";
import { getOrReconcileOrder } from "@/lib/stripe-orders";
import { checkRateLimit, sanitizePlainText } from "@/lib/security";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const rate = checkRateLimit(request, "orders");
  if (!rate.allowed && rate.response) return rate.response;

  try {
    const url = new URL(request.url);
    const rawSessionId = url.searchParams.get("session_id") || "";
    const sessionId = sanitizePlainText(rawSessionId, 128);
    if (!sessionId || !/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) {
      return NextResponse.json(
        { error: "Missing or invalid session_id." },
        { status: 400, headers: rate.headers }
      );
    }

    const order = await getOrReconcileOrder(sessionId);
    if (!order) {
      return NextResponse.json(
        { error: "Order not found." },
        { status: 404, headers: rate.headers }
      );
    }

    return NextResponse.json(order, { headers: rate.headers });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch order.";
    return NextResponse.json({ error: message }, { status: 500, headers: rate.headers });
  }
}
