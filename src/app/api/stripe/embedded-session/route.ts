import { NextResponse } from "next/server";
import { stripe, isStripeConfigured } from "@/lib/stripe";

interface CheckoutItemPayloadV2 {
  productId: string;
  quantity: number;
}

interface CheckoutPayload {
  items: CheckoutItemPayloadV2[];
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    notes?: string;
  };
}

async function getPriceIdForProduct(productId: string) {
  if (!stripe) throw new Error("Stripe not configured.");

  const product = await stripe.products.retrieve(productId);
  if (typeof product === "string" || !product) throw new Error("Invalid product.");

  if (!product.active) throw new Error("Product is inactive.");
  if (!product.metadata?.seedKey) throw new Error("Product is not eligible for checkout.");

  // Prefer default price; fall back to first active price.
  if (product.default_price && typeof product.default_price === "string") {
    return product.default_price;
  }
  if (product.default_price && typeof product.default_price !== "string") {
    return product.default_price.id;
  }

  const prices = await stripe.prices.list({ product: product.id, active: true, limit: 1 });
  const price = prices.data[0];
  if (!price) throw new Error("Missing active price for product.");
  return price.id;
}

function clampQuantity(qty: number) {
  if (!Number.isFinite(qty)) return 1;
  const n = Math.floor(qty);
  return Math.min(50, Math.max(1, n));
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

    const lineItems = await Promise.all(
      items.map(async (item) => {
        if (!item?.productId) throw new Error("Missing productId.");
        const priceId = await getPriceIdForProduct(item.productId);
        return {
          price: priceId,
          quantity: clampQuantity(item.quantity),
        };
      })
    );

    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      mode: "payment",
      line_items: lineItems,
      customer_email: customer.email || undefined,
      return_url: `${new URL(request.url).origin}/pedido-exitoso?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        customer_name: customer.name,
        customer_phone: customer.phone,
        customer_address: customer.address,
        customer_city: customer.city,
        customer_notes: customer.notes || "",
        source: "panka-web",
      },
    });

    return NextResponse.json({ clientSecret: session.client_secret });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create checkout session.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
