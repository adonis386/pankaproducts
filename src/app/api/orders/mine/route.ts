import { NextResponse } from "next/server";
import { requireUserFromRequest } from "@/lib/admin-auth";
import { listOrdersForCustomer } from "@/lib/stripe-orders";
import { checkRateLimit } from "@/lib/security";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const rate = checkRateLimit(request, "orders");
  if (!rate.allowed && rate.response) return rate.response;

  try {
    const user = await requireUserFromRequest(request);
    const orders = await listOrdersForCustomer({ email: user.email, uid: user.uid });
    return NextResponse.json({ orders }, { headers: rate.headers });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch orders.";
    return NextResponse.json({ error: message }, { status: 401, headers: rate.headers });
  }
}
