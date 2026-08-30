import "server-only";

import Stripe from "stripe";
import { FieldValue, type DocumentData, type Timestamp } from "firebase-admin/firestore";
import { stripe } from "@/lib/stripe";
import { adminDb } from "@/lib/firebase-admin";
import type { KitchenStatus, PublicOrder } from "@/lib/order-types";

export type { KitchenStatus, PublicOrder } from "@/lib/order-types";

export type StoredOrderItem = {
  priceId: string;
  productId: string | null;
  name: string;
  quantity: number;
  unitAmount: number;
  currency: string;
};

function asKitchenStatus(raw: unknown): KitchenStatus {
  const value = typeof raw === "string" ? raw : "";
  if (
    value === "pending" ||
    value === "confirmed" ||
    value === "preparing" ||
    value === "delivered" ||
    value === "cancelled" ||
    value === "failed"
  ) {
    return value;
  }
  return "confirmed";
}

function timestampToIso(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const ts = value as Timestamp;
  if (typeof ts.toDate === "function") {
    try {
      return ts.toDate().toISOString();
    } catch {
      return null;
    }
  }
  return null;
}

export function serializeOrder(id: string, data: DocumentData): PublicOrder {
  const customer = (data.customer as Record<string, unknown>) || {};
  const itemsRaw = Array.isArray(data.items) ? data.items : [];

  return {
    id,
    status: asKitchenStatus(data.status),
    firebaseUid: typeof data.firebaseUid === "string" ? data.firebaseUid : "",
    currency: typeof data.currency === "string" ? data.currency : "usd",
    total: typeof data.total === "number" && Number.isFinite(data.total) ? data.total : 0,
    customer: {
      name: String(customer.name || ""),
      email: String(customer.email || ""),
      phone: String(customer.phone || ""),
      address: String(customer.address || ""),
      city: String(customer.city || ""),
      notes: customer.notes ? String(customer.notes) : undefined,
    },
    items: itemsRaw
      .map((item) => (item && typeof item === "object" ? (item as Record<string, unknown>) : null))
      .filter(Boolean)
      .map((item) => ({
        name: String(item!.name || "Item"),
        quantity: typeof item!.quantity === "number" ? item!.quantity : 1,
        unitAmount: typeof item!.unitAmount === "number" ? item!.unitAmount : 0,
        currency: String(item!.currency || data.currency || "usd"),
      })),
    createdAt: timestampToIso(data.createdAt),
  };
}

export function sessionLooksPaid(session: Stripe.Checkout.Session) {
  return session.payment_status === "paid" || session.status === "complete";
}

export async function upsertOrderFromSession(session: Stripe.Checkout.Session) {
  if (!stripe) throw new Error("Stripe not configured.");

  const db = adminDb();
  const orderRef = db.collection("orders").doc(session.id);
  const snap = await orderRef.get();
  if (snap.exists) return serializeOrder(snap.id, snap.data() || {});

  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    limit: 100,
    expand: ["data.price.product"],
  });

  const items: StoredOrderItem[] = lineItems.data
    .map((li) => {
      const price = li.price;
      const unitAmount = price?.unit_amount ?? null;
      const currency = price?.currency ?? session.currency ?? "usd";
      const product =
        price?.product && typeof price.product !== "string" ? price.product : null;
      const productName = product && "name" in product ? product.name : null;

      if (!price?.id || unitAmount == null) return null;

      return {
        priceId: price.id,
        productId: product?.id ?? (typeof price.product === "string" ? price.product : null),
        name: li.description || productName || "Item",
        quantity: li.quantity || 1,
        unitAmount: unitAmount / 100,
        currency,
      } satisfies StoredOrderItem;
    })
    .filter((x): x is StoredOrderItem => Boolean(x));

  const email = String(
    session.customer_details?.email || session.customer_email || session.metadata?.customer_email || ""
  ).toLowerCase();

  const customer = {
    name: String(session.metadata?.customer_name || session.customer_details?.name || ""),
    email,
    phone: String(session.metadata?.customer_phone || session.customer_details?.phone || ""),
    address: String(session.metadata?.customer_address || ""),
    city: String(session.metadata?.customer_city || ""),
    notes: String(session.metadata?.customer_notes || ""),
  };

  await orderRef.set(
    {
      stripeSessionId: session.id,
      paymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : null,
      status: "confirmed" satisfies KitchenStatus,
      currency: session.currency || "usd",
      total: (session.amount_total ?? 0) / 100,
      customer,
      customerEmail: email,
      firebaseUid: String(session.metadata?.firebase_uid || ""),
      items,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  const created = await orderRef.get();
  return serializeOrder(created.id, created.data() || {});
}

export async function getOrReconcileOrder(sessionId: string): Promise<PublicOrder | null> {
  if (!stripe) throw new Error("Stripe not configured.");

  const db = adminDb();
  const existing = await db.collection("orders").doc(sessionId).get();
  if (existing.exists) {
    return serializeOrder(existing.id, existing.data() || {});
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!sessionLooksPaid(session)) return null;
    return upsertOrderFromSession(session);
  } catch {
    return null;
  }
}

export async function listOrders(limit = 100): Promise<PublicOrder[]> {
  const db = adminDb();
  try {
    const snap = await db.collection("orders").orderBy("createdAt", "desc").limit(limit).get();
    return snap.docs.map((doc) => serializeOrder(doc.id, doc.data()));
  } catch {
    const snap = await db.collection("orders").limit(limit).get();
    return snap.docs.map((doc) => serializeOrder(doc.id, doc.data()));
  }
}

export async function listOrdersForCustomer(opts: { email?: string; uid?: string }): Promise<PublicOrder[]> {
  const email = (opts.email || "").trim().toLowerCase();
  const uid = (opts.uid || "").trim();
  const all = await listOrders(200);
  return all.filter((order) => {
    if (uid && order.firebaseUid && order.firebaseUid === uid) return true;
    const orderEmail = order.customer.email.trim().toLowerCase();
    return Boolean(email && orderEmail && orderEmail === email);
  });
}

export async function updateOrderStatus(id: string, status: KitchenStatus) {
  const db = adminDb();
  const ref = db.collection("orders").doc(id);
  const snap = await ref.get();
  if (!snap.exists) throw new Error("Order not found.");
  await ref.update({ status, updatedAt: FieldValue.serverTimestamp() });
  const next = await ref.get();
  return serializeOrder(next.id, next.data() || {});
}
