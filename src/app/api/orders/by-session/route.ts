import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

function asNumber(v: unknown): number | null {
  if (typeof v !== "number") return null;
  if (!Number.isFinite(v)) return null;
  return v;
}

function asString(v: unknown): string {
  return typeof v === "string" ? v : "";
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get("session_id") || "";
    if (!sessionId) {
      return NextResponse.json({ error: "Missing session_id." }, { status: 400 });
    }

    const db = adminDb();
    const snap = await db.collection("orders").doc(sessionId).get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const data = snap.data() as Record<string, unknown>;
    const customer = (data.customer as Record<string, unknown>) || {};
    const itemsRaw = Array.isArray(data.items) ? (data.items as unknown[]) : [];

    const items = itemsRaw
      .map((i) => (typeof i === "object" && i ? (i as Record<string, unknown>) : null))
      .filter(Boolean)
      .map((i) => ({
        name: asString(i!.name),
        quantity: asNumber(i!.quantity) ?? 1,
        unitAmount: asNumber(i!.unitAmount) ?? 0,
        currency: asString(i!.currency) || asString(data.currency) || "usd",
      }));

    return NextResponse.json({
      id: snap.id,
      status: asString(data.status) || "confirmed",
      currency: asString(data.currency) || "usd",
      total: asNumber(data.total) ?? 0,
      customer: {
        name: asString(customer.name),
        email: asString(customer.email),
        phone: asString(customer.phone),
        address: asString(customer.address),
        city: asString(customer.city),
        notes: asString(customer.notes),
      },
      items,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch order.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

