import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  console.warn("STRIPE_SECRET_KEY is not configured.");
}

export const isStripeConfigured = Boolean(secretKey);

export const isStripeLiveMode = Boolean(secretKey?.startsWith("sk_live_"));

// Test and live mode share one Firestore project. Live data lives in its own
// collections so a local test-mode session can never overwrite or prune the
// live catalog, and live orders never mix with test orders.
export const CATALOG_COLLECTION = isStripeLiveMode ? "products_live" : "products";
export const ORDERS_COLLECTION = isStripeLiveMode ? "orders_live" : "orders";

export const stripe = secretKey
  ? new Stripe(secretKey, {
      apiVersion: "2026-02-25.clover",
    })
  : null;
