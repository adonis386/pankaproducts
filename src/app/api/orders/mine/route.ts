import { NextResponse } from "next/server";
import { requireUserFromRequest } from "@/lib/admin-auth";
import { listOrdersForCustomer } from "@/lib/stripe-orders";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const user = await requireUserFromRequest(request);
    const orders = await listOrdersForCustomer({ email: user.email, uid: user.uid });
    return NextResponse.json({ orders });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch orders.";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
