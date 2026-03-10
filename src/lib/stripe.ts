import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  console.warn("STRIPE_SECRET_KEY is not configured.");
}

export const isStripeConfigured = Boolean(secretKey);

export const stripe = secretKey
  ? new Stripe(secretKey, {
      apiVersion: "2026-02-25.clover",
    })
  : null;
