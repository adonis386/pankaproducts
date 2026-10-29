import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import { getCatalogAvailability } from "@/lib/catalog-sync";
import { calculateShipping } from "@/lib/us-shipping";

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
    state?: string;
    county?: string;
    zip?: string;
    notes?: string;
  };
  firebaseUid?: string;
}

async function getPriceIdForProduct(productId: string) {
  if (!stripe) throw new Error("Stripe not configured.");

  const replica = await getCatalogAvailability(productId).catch(() => null);
  if (replica) {
    if (!replica.active || !replica.isAvailable) {
      throw new Error("Product is unavailable.");
    }
    if (!replica.seedKey) {
      throw new Error("Product is not eligible for checkout.");
    }
    if (replica.stripePriceId) {
      return replica.stripePriceId;
    }
  }

  const product = await stripe.products.retrieve(productId);
  if (typeof product === "string" || !product) throw new Error("Invalid product.");

  if (!product.active) throw new Error("Product is inactive.");
  if (!product.metadata?.seedKey) throw new Error("Product is not eligible for checkout.");
  if (product.metadata?.isAvailable === "false" || product.metadata?.isAvailable === "0") {
    throw new Error("Product is unavailable.");
  }

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
    const { items, customer, firebaseUid } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
    }

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = await Promise.all(
      items.map(async (item) => {
        if (!item?.productId) throw new Error("Missing productId.");
        const priceId = await getPriceIdForProduct(item.productId);
        return {
          price: priceId,
          quantity: clampQuantity(item.quantity),
        };
      })
    );

    const { shippingFee, isFreeDelivery, countyResolved } = calculateShipping({
      state: customer.state || "FL",
      county: customer.county,
      zip: customer.zip,
      city: customer.city,
    });

    if (!isFreeDelivery && shippingFee > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Shipping Rate (Envío Fuera de Miami-Dade / Broward)",
            description: `${customer.city || ""}, ${customer.state || "US"} (${countyResolved})`,
          },
          unit_amount: Math.round(shippingFee * 100),
        },
        quantity: 1,
      });
    }

    const fullCityAddress = [
      customer.city,
      customer.state,
      customer.zip,
      customer.state === "FL" ? `(${countyResolved})` : "",
    ]
      .filter(Boolean)
      .join(" ");

    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      mode: "payment",
      line_items: lineItems,
      customer_email: customer.email || undefined,
      return_url: `${new URL(request.url).origin}/pedido-exitoso?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone,
        customer_address: customer.address,
        customer_city: fullCityAddress || customer.city,
        customer_state: customer.state || "FL",
        customer_county: countyResolved,
        customer_zip: customer.zip || "",
        shipping_fee: String(shippingFee),
        customer_notes: customer.notes || "",
        firebase_uid: firebaseUid || "",
        source: "panka-web",
      },
    });

    return NextResponse.json({ clientSecret: session.client_secret, sessionId: session.id });
  } catch (error) {
    let message = error instanceof Error ? error.message : "Failed to create checkout session.";
    if (message.toLowerCase().includes("at least $0.50")) {
      message =
        "Aviso de Stripe: El monto mínimo permitido por Stripe para cobros con tarjeta en EE. UU. es $0.50 USD. Para probar con envío gratis ($0.00), sube la cantidad a 50 unidades ($0.50) o transfiere el pedido de $0.01 directamente por WhatsApp.";
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
