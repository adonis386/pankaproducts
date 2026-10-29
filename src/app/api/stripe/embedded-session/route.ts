import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import { getCatalogAvailability } from "@/lib/catalog-sync";
import { calculateShipping } from "@/lib/us-shipping";
import {
  checkRateLimit,
  verifySameOrigin,
  sanitizePlainText,
  sanitizeEmail,
  sanitizePhone,
} from "@/lib/security";

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
  const cleanId = sanitizePlainText(productId, 64);
  if (!cleanId || !/^[A-Za-z0-9_-]+$/.test(cleanId)) {
    throw new Error("Invalid product identifier.");
  }

  const replica = await getCatalogAvailability(cleanId).catch(() => null);
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

  const product = await stripe.products.retrieve(cleanId);
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
  const originError = verifySameOrigin(request);
  if (originError) return originError;

  const rate = checkRateLimit(request, "checkout");
  if (!rate.allowed && rate.response) return rate.response;

  try {
    if (!isStripeConfigured || !stripe) {
      return NextResponse.json(
        { error: "Stripe is not configured. Add STRIPE_SECRET_KEY." },
        { status: 500, headers: rate.headers }
      );
    }

    const body = (await request.json()) as CheckoutPayload;
    const { items, customer, firebaseUid } = body || {};

    if (!Array.isArray(items) || items.length === 0 || items.length > 30) {
      return NextResponse.json(
        { error: "Invalid cart items." },
        { status: 400, headers: rate.headers }
      );
    }

    if (!customer || typeof customer !== "object") {
      return NextResponse.json(
        { error: "Missing customer details." },
        { status: 400, headers: rate.headers }
      );
    }

    // Sanitize all user-supplied fields against XSS & injection
    const safeCustomer = {
      name: sanitizePlainText(customer.name, 120),
      email: sanitizeEmail(customer.email),
      phone: sanitizePhone(customer.phone),
      address: sanitizePlainText(customer.address, 220),
      city: sanitizePlainText(customer.city, 100),
      state: sanitizePlainText(customer.state || "FL", 10).toUpperCase(),
      county: sanitizePlainText(customer.county || "", 80),
      zip: sanitizePlainText(customer.zip || "", 16).replace(/[^0-9-]/g, ""),
      notes: sanitizePlainText(customer.notes || "", 400),
    };
    const safeUid = sanitizePlainText(firebaseUid || "", 128);

    if (!safeCustomer.name || !safeCustomer.email || !safeCustomer.address) {
      return NextResponse.json(
        { error: "Please provide valid name, email, and delivery address." },
        { status: 400, headers: rate.headers }
      );
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
      state: safeCustomer.state || "FL",
      county: safeCustomer.county,
      zip: safeCustomer.zip,
      city: safeCustomer.city,
    });

    if (!isFreeDelivery && shippingFee > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Shipping Rate (Envío Fuera de Miami-Dade / Broward)",
            description: `${safeCustomer.city || ""}, ${safeCustomer.state || "US"} (${countyResolved})`,
          },
          unit_amount: Math.round(shippingFee * 100),
        },
        quantity: 1,
      });
    }

    const fullCityAddress = [
      safeCustomer.city,
      safeCustomer.state,
      safeCustomer.zip,
      safeCustomer.state === "FL" ? `(${countyResolved})` : "",
    ]
      .filter(Boolean)
      .join(" ");

    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      mode: "payment",
      line_items: lineItems,
      customer_email: safeCustomer.email || undefined,
      return_url: `${new URL(request.url).origin}/pedido-exitoso?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        customer_name: safeCustomer.name,
        customer_email: safeCustomer.email,
        customer_phone: safeCustomer.phone,
        customer_address: safeCustomer.address,
        customer_city: fullCityAddress || safeCustomer.city,
        customer_state: safeCustomer.state || "FL",
        customer_county: countyResolved,
        customer_zip: safeCustomer.zip || "",
        shipping_fee: String(shippingFee),
        customer_notes: safeCustomer.notes || "",
        firebase_uid: safeUid,
        source: "panka-web",
      },
    });

    return NextResponse.json(
      { clientSecret: session.client_secret, sessionId: session.id },
      { headers: rate.headers }
    );
  } catch (error) {
    let message = error instanceof Error ? error.message : "Failed to create checkout session.";
    if (message.toLowerCase().includes("at least $0.50")) {
      message =
        "Aviso de Stripe: El monto mínimo permitido por Stripe para cobros con tarjeta en EE. UU. es $0.50 USD.";
    }
    return NextResponse.json({ error: message }, { status: 500, headers: rate.headers });
  }
}
