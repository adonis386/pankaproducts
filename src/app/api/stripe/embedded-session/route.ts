import { NextResponse } from "next/server";
import { stripe, isStripeConfigured } from "@/lib/stripe";

interface CheckoutItemPayload {
  product: {
    id: string;
    name: string;
    stripePriceId?: string;
  };
  quantity: number;
}

interface CheckoutPayload {
  items: CheckoutItemPayload[];
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    notes?: string;
  };
}

export async function POST(request: Request) {
  try {
    if (!isStripeConfigured || !stripe) {
      return NextResponse.json(
        { error: "Stripe is not configured. Add STRIPE_SECRET_KEY." },
        { status: 500 }
      );
    }

    const body = (await request.json()) as CheckoutPayload;
    const { items, customer } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
    }

    const lineItems = items.map((item) => {
      if (!item.product.stripePriceId) {
        throw new Error(
          `Missing Stripe price ID for product "${item.product.name}" (${item.product.id}).`
        );
      }

      return {
        price: item.product.stripePriceId,
        quantity: item.quantity,
      };
    });

    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      mode: "payment",
      line_items: lineItems,
      customer_email: customer.email || undefined,
      return_url: `${new URL(request.url).origin}/checkout?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        customer_name: customer.name,
        customer_phone: customer.phone,
        customer_address: customer.address,
        customer_city: customer.city,
        customer_notes: customer.notes || "",
      },
    });

    return NextResponse.json({ clientSecret: session.client_secret });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create checkout session.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
