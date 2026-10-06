import "server-only";

import { FieldValue } from "firebase-admin/firestore";
import type Stripe from "stripe";
import { adminDb } from "@/lib/firebase-admin";
import { CATALOG_COLLECTION, stripe } from "@/lib/stripe";
import type { Product } from "@/lib/types";

// Marks a product the admin removed but that Stripe refuses to hard-delete.
export const DELETED_METADATA_KEY = "deletedAt";

export type CatalogProductDoc = {
  name: string;
  description: string;
  image: string;
  category: Product["category"];
  ingredients: string[];
  isPopular: boolean;
  stock: number;
  sort: number;
  active: boolean;
  isAvailable: boolean;
  seedKey: string;
  stripeProductId: string;
  stripePriceId: string;
  price: number;
  currency: string;
};

export function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function isDeletedStripeProduct(product: Stripe.Product) {
  return Boolean(product.metadata?.[DELETED_METADATA_KEY]);
}

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

function parseBool(raw: string | undefined, fallback: boolean) {
  if (raw == null || raw === "") return fallback;
  return raw === "true" || raw === "1";
}

export function mapStripeProductToCatalogDoc(
  product: Stripe.Product,
  price: Stripe.Price | null,
  overrides?: Partial<Pick<CatalogProductDoc, "isAvailable" | "active">>
): CatalogProductDoc {
  const metadata = product.metadata || {};
  const unitAmount = price?.unit_amount ?? 0;
  const stock = Number(metadata.stock || "99");
  const sort = Number(metadata.sort || "9999");

  return {
    name: product.name,
    description: product.description || "",
    image: product.images?.[0] || metadata.image || "/hero_1.jpg",
    category: parseCategory(metadata.category),
    ingredients: parseIngredients(metadata.ingredients),
    isPopular: parseBool(metadata.popular, false),
    stock: Number.isFinite(stock) ? stock : 99,
    sort: Number.isFinite(sort) ? sort : 9999,
    active: overrides?.active ?? Boolean(product.active),
    isAvailable:
      overrides?.isAvailable ??
      parseBool(metadata.isAvailable, Boolean(product.active)),
    seedKey: metadata.seedKey || "",
    stripeProductId: product.id,
    stripePriceId: price?.id || "",
    price: unitAmount / 100,
    currency: price?.currency || "usd",
  };
}

export function catalogDocToProduct(id: string, data: CatalogProductDoc): Product {
  return {
    id,
    stripePriceId: data.stripePriceId || undefined,
    name: data.name,
    description: data.description || "",
    price: typeof data.price === "number" ? data.price : 0,
    image: data.image || "/hero_1.jpg",
    category: data.category || "especiales",
    ingredients: Array.isArray(data.ingredients) ? data.ingredients : [],
    isPopular: Boolean(data.isPopular),
    stock: typeof data.stock === "number" ? data.stock : 99,
    isAvailable: data.isAvailable !== false,
  };
}

export async function upsertCatalogProduct(
  productId: string,
  data: CatalogProductDoc,
  opts?: { createIfMissing?: boolean }
) {
  const db = adminDb();
  const ref = db.collection(CATALOG_COLLECTION).doc(productId);
  const snap = await ref.get();
  const payload = {
    ...data,
    updatedAt: FieldValue.serverTimestamp(),
    ...(snap.exists ? {} : { createdAt: FieldValue.serverTimestamp() }),
  };

  if (!snap.exists && opts?.createIfMissing === false) {
    return;
  }

  await ref.set(payload, { merge: true });
}

export async function deleteCatalogProduct(productId: string) {
  const db = adminDb();
  await db.collection(CATALOG_COLLECTION).doc(productId).delete();
}

export async function resolveStripePrice(
  product: Stripe.Product
): Promise<Stripe.Price | null> {
  if (!stripe) return null;

  const defaultPrice = product.default_price;
  if (defaultPrice && typeof defaultPrice !== "string") return defaultPrice;
  if (typeof defaultPrice === "string") {
    const price = await stripe.prices.retrieve(defaultPrice).catch(() => null);
    if (price) return price;
  }

  const prices = await stripe.prices.list({
    product: product.id,
    active: true,
    limit: 1,
  });
  return prices.data[0] || null;
}

/**
 * Single mapping path from Stripe into the Firestore replica. The admin panel,
 * the public backfill and the Stripe webhooks all go through here so a change
 * made on either side lands in the same shape.
 */
export async function syncStripeProductToCatalog(
  product: Stripe.Product,
  price: Stripe.Price | null,
  overrides?: Partial<Pick<CatalogProductDoc, "isAvailable" | "active">>
): Promise<CatalogProductDoc | null> {
  if (isDeletedStripeProduct(product)) {
    await deleteCatalogProduct(product.id);
    return null;
  }

  // Products created straight from the Stripe Dashboard carry no seedKey, which
  // is how the storefront recognises its own catalog. Stamp it once so those
  // products become visible without having to touch the admin panel.
  let resolved = product;
  if (!resolved.metadata?.seedKey && stripe) {
    resolved = await stripe.products.update(resolved.id, {
      metadata: {
        ...(resolved.metadata || {}),
        seedKey: slugify(resolved.name) || resolved.id,
      },
    });
  }

  const doc = mapStripeProductToCatalogDoc(resolved, price, overrides);
  await upsertCatalogProduct(resolved.id, doc);
  return doc;
}

export async function syncProductFromStripe(productId: string) {
  if (!stripe) return null;

  let product: Stripe.Product;
  try {
    product = await stripe.products.retrieve(productId, {
      expand: ["default_price"],
    });
  } catch {
    // Gone from Stripe entirely: drop the replica so it stops being served.
    await deleteCatalogProduct(productId);
    return null;
  }

  const price = await resolveStripePrice(product);
  return syncStripeProductToCatalog(product, price);
}

/**
 * Stripe only deletes a product that has no prices attached, so a true delete
 * is impossible once something has been sold. We attempt it anyway and fall
 * back to archive + a deletedAt marker, which hides the product everywhere in
 * the app while Stripe keeps the records its past transactions need.
 * https://docs.stripe.com/api/products/delete
 */
export async function purgeStripeProduct(
  productId: string
): Promise<{ hardDeleted: boolean }> {
  if (!stripe) throw new Error("Stripe not configured.");
  const stripeClient = stripe;

  const existing = await stripeClient.products.retrieve(productId);

  // The product has to be archived before its prices: Stripe refuses to archive
  // a price while it is still that product's default_price. This single call is
  // also what stops the money — a price whose product is inactive cannot be used
  // in a Checkout Session, so it must not be swallowed if it fails.
  await stripeClient.products.update(productId, {
    active: false,
    metadata: {
      ...(existing.metadata || {}),
      isAvailable: "false",
      [DELETED_METADATA_KEY]: new Date().toISOString(),
    },
  });

  const prices = await stripeClient.prices.list({
    product: productId,
    active: true,
    limit: 100,
  });
  await Promise.all(
    prices.data.map((p) =>
      stripeClient.prices.update(p.id, { active: false }).catch(() => undefined)
    )
  );

  // Only a product that never had a price can really leave Stripe.
  let hardDeleted = false;
  try {
    await stripeClient.products.del(productId);
    hardDeleted = true;
  } catch {
    hardDeleted = false;
  }

  await deleteCatalogProduct(productId);
  return { hardDeleted };
}

export async function listCatalogProductIds(): Promise<string[]> {
  const db = adminDb();
  const snap = await db.collection(CATALOG_COLLECTION).select().get();
  return snap.docs.map((doc) => doc.id);
}

export async function getCatalogProduct(productId: string) {
  const db = adminDb();
  const snap = await db.collection(CATALOG_COLLECTION).doc(productId).get();
  if (!snap.exists) return null;
  return { id: snap.id, ...(snap.data() as CatalogProductDoc) };
}

export async function listPublicCatalogProducts(): Promise<Product[]> {
  const db = adminDb();
  const snap = await db
    .collection(CATALOG_COLLECTION)
    .where("active", "==", true)
    .get();

  const products = snap.docs
    .map((doc) => {
      const data = doc.data() as CatalogProductDoc;
      if (!data.seedKey) return null;
      if (data.isAvailable === false) return null;
      return {
        product: catalogDocToProduct(doc.id, data),
        sort: typeof data.sort === "number" ? data.sort : 9999,
      };
    })
    .filter((row): row is { product: Product; sort: number } => Boolean(row))
    .sort((a, b) => a.sort - b.sort)
    .map((row) => row.product);

  return products;
}

export async function getCatalogAvailability(productId: string) {
  const doc = await getCatalogProduct(productId);
  if (!doc) return null;
  return {
    active: doc.active !== false,
    isAvailable: doc.isAvailable !== false,
    stripePriceId: doc.stripePriceId || "",
    seedKey: doc.seedKey || "",
  };
}
