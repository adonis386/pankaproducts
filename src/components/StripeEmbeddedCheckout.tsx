"use client";

import { useMemo } from "react";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { CartItem, CustomerInfo } from "@/lib/types";

interface StripeEmbeddedCheckoutProps {
  items: CartItem[];
  customer: CustomerInfo;
  onComplete: () => void;
  onError?: (message: string) => void;
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

export default function StripeEmbeddedCheckout({
  items,
  customer,
  onComplete,
  onError,
}: StripeEmbeddedCheckoutProps) {
  const fetchClientSecret = useMemo(
    () => async () => {
      const response = await fetch("/api/stripe/embedded-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, customer }),
      });

      const data = (await response.json()) as { clientSecret?: string; error?: string };
      if (!response.ok || !data.clientSecret) {
        const message = data.error || "Unable to initialize Stripe checkout.";
        onError?.(message);
        throw new Error(message);
      }

      return data.clientSecret;
    },
    [items, customer, onError]
  );

  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Missing `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in your environment.
      </div>
    );
  }

  return (
    <EmbeddedCheckoutProvider
      stripe={stripePromise}
      options={{
        fetchClientSecret,
        onComplete,
      }}
    >
      <EmbeddedCheckout />
    </EmbeddedCheckoutProvider>
  );
}
