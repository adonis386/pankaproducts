import { NextResponse } from "next/server";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import { Product } from "@/lib/types";

const FALLBACK_IMAGE = "/hero_1.jpg";

function parseCategory(raw?: string): Product["category"] {
  const value = (raw || "").toLowerCase().trim();
  if (value === "salados" || value === "savory") return "salados";
  if (value === "dulces" || value === "sweet") return "dulces";
  return "especiales";
}

function parseIngredients(raw?: string): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function GET() {
  try {
    if (!isStripeConfigured || !stripe) {
      return NextResponse.json({ products: [] });
    }
    const stripeClient = stripe;

    const stripeProducts = await stripeClient.products.list({
      active: true,
      limit: 100,
      expand: ["data.default_price"],
    });

    const mapped = await Promise.all(
      stripeProducts.data.map(async (item) => {
        let selectedPrice = item.default_price;

        // Fallback for products created without default_price in Stripe Dashboard.
        if (!selectedPrice || typeof selectedPrice === "string") {
          const prices = await stripeClient.prices.list({
            product: item.id,
            active: true,
            limit: 1,
          });
          selectedPrice = prices.data[0] || null;
        }

        if (!selectedPrice || typeof selectedPrice === "string") return null;
        if (!selectedPrice.unit_amount) return null;

        const metadata = item.metadata || {};
        const stock = Number(metadata.stock || "99");
        const sort = Number(metadata.sort || "9999");

        return {
          id: item.id,
          stripePriceId: selectedPrice.id,
          name: item.name,
          description: item.description || "",
          price: selectedPrice.unit_amount / 100,
          image: item.images?.[0] || metadata.image || FALLBACK_IMAGE,
          category: parseCategory(metadata.category),
          ingredients: parseIngredients(metadata.ingredients),
          isPopular: metadata.popular === "true" || metadata.popular === "1",
          stock: Number.isFinite(stock) ? stock : 99,
          sort: Number.isFinite(sort) ? sort : 9999,
        } as Product & { sort: number };
      })
    );

    const products: Product[] = mapped
      .filter((p): p is Product & { sort: number } => Boolean(p))
      .sort((a, b) => a.sort - b.sort)
      .map(({ sort: _sort, ...product }) => product);

    return NextResponse.json({ products });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch catalog from Stripe.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
