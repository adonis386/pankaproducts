import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export const runtime = "nodejs";

type StoredOrderItem = {
  priceId: string;
  productId: string | null;
  name: string;
  quantity: number;
  unitAmount: number;
  currency: string;
};

type StoredOrder = {
  stripeSessionId: string;
  paymentIntentId: string | null;
  status: "confirmed" | "pending" | "failed";
  currency: string;
  total: number;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    notes?: string;
  };
  items: StoredOrderItem[];
  createdAt: FieldValue;
  updatedAt: FieldValue;
};

async function upsertOrderFromSession(session: Stripe.Checkout.Session) {
  if (!stripe) throw new Error("Stripe not configured.");

  const db = adminDb();
  const orderRef = db.collection("orders").doc(session.id);
  const snap = await orderRef.get();

  // Idempotency: if already created, don't duplicate.
  if (snap.exists) return;

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

  const total = (session.amount_total ?? 0) / 100;
  const currency = session.currency || "usd";

  const customer = {
    name: String(session.metadata?.customer_name || ""),
    email: String(session.customer_details?.email || session.customer_email || ""),
    phone: String(session.metadata?.customer_phone || ""),
    address: String(session.metadata?.customer_address || ""),
    city: String(session.metadata?.customer_city || ""),
    notes: String(session.metadata?.customer_notes || ""),
  };

  const doc: StoredOrder = {
    stripeSessionId: session.id,
    paymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : null,
    status: "confirmed",
    currency,
    total,
    customer,
    items,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  await orderRef.set(doc, { merge: true });
}

export async function POST(request: Request) {
  try {
    if (!isStripeConfigured || !stripe) {
      return NextResponse.json(
        { error: "Stripe is not configured. Add STRIPE_SECRET_KEY." },
        { status: 500 }
      );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return NextResponse.json(
        { error: "STRIPE_WEBHOOK_SECRET is missing." },
        { status: 500 }
      );
    }

    const signature = (await headers()).get("stripe-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing stripe-signature header." }, { status: 400 });
    }

    const body = await request.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await upsertOrderFromSession(session);
        break;
      }
      case "checkout.session.async_payment_succeeded":
      case "payment_intent.succeeded":
      case "payment_intent.payment_failed":
        console.log("Stripe event:", event.type);
        break;
      default:
        console.log("Unhandled Stripe event:", event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to process Stripe webhook event.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
