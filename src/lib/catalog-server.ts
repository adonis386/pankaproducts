import "server-only";

import { isStripeConfigured, stripe } from "@/lib/stripe";
import { Product } from "@/lib/types";
import {
  catalogDocToProduct,
  listPublicCatalogProducts,
  resolveStripePrice,
  syncStripeProductToCatalog,
} from "@/lib/catalog-sync";

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

/**
 * Single source of truth for the storefront catalog, shared by `/api/catalog`
 * and by the pages that render products on the server.
 */
export async function getPublicCatalog(): Promise<{
  products: Product[];
  source: "firestore" | "stripe-backfill" | "empty";
}> {
  const fromFirestore = await listPublicCatalogProducts();
  if (fromFirestore.length > 0) {
    return { products: fromFirestore, source: "firestore" };
  }

  // First deploy / empty replica: seed from Stripe once, then serve.
  const seeded = await backfillFromStripe();
  return {
    products: seeded,
    source: seeded.length > 0 ? "stripe-backfill" : "empty",
  };
}
