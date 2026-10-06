import { NextResponse } from "next/server";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import { Product } from "@/lib/types";
import {
  catalogDocToProduct,
  listPublicCatalogProducts,
  resolveStripePrice,
  syncStripeProductToCatalog,
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
      const selectedPrice = await resolveStripePrice(item);
      if (!selectedPrice?.unit_amount) return null;

      const doc = await syncStripeProductToCatalog(item, selectedPrice).catch(
        () => null
      );
      if (!doc || !doc.active || !doc.isAvailable) return null;

      return { product: catalogDocToProduct(item.id, doc), sort: doc.sort };
    })
  );

  return mapped
    .filter((row): row is { product: Product; sort: number } => Boolean(row))
    .sort((a, b) => a.sort - b.sort)
    .map((row) => row.product);
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
