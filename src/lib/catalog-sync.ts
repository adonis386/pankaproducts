import "server-only";

import { FieldValue } from "firebase-admin/firestore";
import type Stripe from "stripe";
import { adminDb } from "@/lib/firebase-admin";
import type { Product } from "@/lib/types";

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
  const ref = db.collection("products").doc(productId);
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

export async function archiveCatalogProduct(productId: string) {
  const db = adminDb();
  await db.collection("products").doc(productId).set(
    {
      active: false,
      isAvailable: false,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
}

export async function getCatalogProduct(productId: string) {
  const db = adminDb();
  const snap = await db.collection("products").doc(productId).get();
  if (!snap.exists) return null;
  return { id: snap.id, ...(snap.data() as CatalogProductDoc) };
}

export async function listPublicCatalogProducts(): Promise<Product[]> {
  const db = adminDb();
  const snap = await db
    .collection("products")
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
