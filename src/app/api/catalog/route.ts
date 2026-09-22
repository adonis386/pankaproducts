import { NextResponse } from "next/server";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import { Product } from "@/lib/types";
import {
  listPublicCatalogProducts,
  mapStripeProductToCatalogDoc,
  upsertCatalogProduct,
} from "@/lib/catalog-sync";

export const runtime = "nodejs";

async function backfillFromStripe(): Promise<Product[]> {
  if (!isStripeConfigured || !stripe) return [];

  const stripeClient = stripe;
  const stripeProducts = await stripeClient.products.list({
    active: true,
    limit: 100,
    expand: ["data.default_price"],
  });

  const mapped = await Promise.all(
    stripeProducts.data.map(async (item) => {
      let selectedPrice = item.default_price;

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
      if (!metadata.seedKey) return null;

      const doc = mapStripeProductToCatalogDoc(item, selectedPrice);
      if (!doc.isAvailable) return null;

      await upsertCatalogProduct(item.id, doc).catch(() => undefined);

      return {
        id: item.id,
        stripePriceId: selectedPrice.id,
        name: item.name,
        description: item.description || "",
        price: selectedPrice.unit_amount / 100,
        image: doc.image,
        category: doc.category,
        ingredients: doc.ingredients,
        isPopular: doc.isPopular,
        stock: doc.stock,
        isAvailable: true,
        sort: doc.sort,
      } as Product & { sort: number };
    })
  );

  return mapped
    .filter((p): p is Product & { sort: number } => Boolean(p))
    .sort((a, b) => a.sort - b.sort)
    .map(({ sort: _sort, ...product }) => product);
}

export async function GET() {
  try {
    const fromFirestore = await listPublicCatalogProducts();
    if (fromFirestore.length > 0) {
      return NextResponse.json({ products: fromFirestore, source: "firestore" });
    }

    // First deploy / empty replica: seed from Stripe once, then serve.
    const seeded = await backfillFromStripe();
    return NextResponse.json({
      products: seeded,
      source: seeded.length > 0 ? "stripe-backfill" : "empty",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch catalog.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
