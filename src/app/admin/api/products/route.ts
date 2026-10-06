import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import { requireAdminFromRequest } from "@/lib/admin-auth";
import {
  deleteCatalogProduct,
  getCatalogProduct,
  isDeletedStripeProduct,
  listCatalogProductIds,
  purgeStripeProduct,
  resolveStripePrice,
  slugify,
  syncStripeProductToCatalog,
} from "@/lib/catalog-sync";

export const runtime = "nodejs";

function getBaseUrl(request: Request) {
  const url = new URL(request.url);
  return url.origin;
}

async function syncProductReplica(
  product: Stripe.Product,
  price: Stripe.Price | null,
  overrides?: { isAvailable?: boolean; active?: boolean }
) {
  await syncStripeProductToCatalog(product, price, overrides);
}

export async function GET(request: Request) {
  try {
    await requireAdminFromRequest(request);

    if (!isStripeConfigured || !stripe) {
      return NextResponse.json({ products: [] });
    }

    const list = await stripe.products.list({
      limit: 100,
      expand: ["data.default_price"],
    });

    const products = await Promise.all(
      list.data
        // Products Stripe would not let us delete are tombstoned, not listed.
        .filter((p) => !isDeletedStripeProduct(p))
        .map(async (p) => {
          const defaultPrice = await resolveStripePrice(p);
          const unitAmount = defaultPrice?.unit_amount ?? null;
          const replica = await getCatalogProduct(p.id).catch(() => null);
          const isAvailable =
            replica?.isAvailable ??
            (p.metadata?.isAvailable == null
              ? p.active
              : p.metadata.isAvailable === "true" || p.metadata.isAvailable === "1");

          // Keep Firestore replica warm for public catalog reads.
          await syncProductReplica(p, defaultPrice, {
            isAvailable: Boolean(isAvailable),
            active: p.active,
          }).catch(() => undefined);

          return {
            id: p.id,
            name: p.name,
            active: p.active,
            isAvailable: Boolean(isAvailable),
            description: p.description || "",
            image: p.metadata?.image || p.images?.[0] || "",
            popular: p.metadata?.popular === "true" || p.metadata?.popular === "1",
            seedKey: p.metadata?.seedKey || "",
            sort: Number(p.metadata?.sort || "9999"),
            category: p.metadata?.category || "salados",
            price: unitAmount != null ? unitAmount / 100 : null,
            currency: defaultPrice?.currency || "usd",
            defaultPriceId: defaultPrice?.id || null,
          };
        })
    );

    // Without a Stripe webhook endpoint there is nothing to tell us a product
    // was removed from the Dashboard, so opening this page doubles as the full
    // reconcile. Only safe while the whole catalog fits in one page.
    if (!list.has_more) {
      const live = new Set(list.data.map((p) => p.id));
      const replicated = await listCatalogProductIds().catch(() => []);
      await Promise.all(
        replicated
          .filter((id) => !live.has(id))
          .map((id) => deleteCatalogProduct(id).catch(() => undefined))
      );
    }

    return NextResponse.json({ products });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminFromRequest(request);

    if (!isStripeConfigured || !stripe) {
      return NextResponse.json({ error: "Stripe not configured." }, { status: 500 });
    }

    const body = (await request.json()) as {
      name: string;
      description?: string;
      price: number;
      image?: string;
      active?: boolean;
      isAvailable?: boolean;
      popular?: boolean;
      sort?: number;
      category?: string;
    };

    if (!body.name || typeof body.price !== "number") {
      return NextResponse.json({ error: "Missing name/price." }, { status: 400 });
    }

    const seedKey = slugify(body.name);
    const image =
      body.image && body.image.trim()
        ? body.image.trim()
        : `${getBaseUrl(request)}/tamales/pollo/pollo(3).webp`;
    const isAvailable = body.isAvailable ?? body.active ?? true;

    const metadata: Record<string, string> = {
      seedKey,
      category: body.category || "salados",
      popular: body.popular ? "true" : "false",
      stock: "99",
      sort: String(body.sort ?? 9999),
      image,
      ingredients: "",
      isAvailable: isAvailable ? "true" : "false",
    };

    const product = await stripe.products.create({
      name: body.name,
      description: body.description || "",
      active: body.active ?? true,
      images: image.startsWith("http") ? [image] : [],
      metadata,
    });

    const unitAmount = Math.round(body.price * 100);
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: unitAmount,
      currency: "usd",
      active: true,
      metadata: { seedKey },
    });

    const updated = await stripe.products.update(product.id, {
      default_price: price.id,
    });

    await syncProductReplica(updated, price, {
      isAvailable: Boolean(isAvailable),
      active: updated.active,
    });

    return NextResponse.json({ id: product.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdminFromRequest(request);

    if (!isStripeConfigured || !stripe) {
      return NextResponse.json({ error: "Stripe not configured." }, { status: 500 });
    }

    const body = (await request.json()) as {
      id: string;
      name?: string;
      description?: string;
      image?: string;
      active?: boolean;
      isAvailable?: boolean;
      popular?: boolean;
      sort?: number;
      category?: string;
      price?: number;
    };

    if (!body.id) return NextResponse.json({ error: "Missing id." }, { status: 400 });

    const existing = await stripe.products.retrieve(body.id, {
      expand: ["default_price"],
    });
    const currentMeta = existing.metadata || {};
    const previousDefaultPriceId =
      typeof existing.default_price === "string"
        ? existing.default_price
        : existing.default_price?.id || null;

    const nextIsAvailable =
      body.isAvailable == null
        ? currentMeta.isAvailable == null
          ? existing.active
          : currentMeta.isAvailable === "true" || currentMeta.isAvailable === "1"
        : body.isAvailable;

    const metadata: Record<string, string> = {
      ...currentMeta,
      category: body.category ?? currentMeta.category ?? "salados",
      popular:
        body.popular == null
          ? currentMeta.popular ?? "false"
          : body.popular
            ? "true"
            : "false",
      sort: body.sort == null ? currentMeta.sort ?? "9999" : String(body.sort),
      image: body.image ?? currentMeta.image ?? "",
      isAvailable: nextIsAvailable ? "true" : "false",
    };

    const updated = await stripe.products.update(body.id, {
      name: body.name,
      description: body.description,
      active: body.active,
      images:
        body.image && body.image.startsWith("http")
          ? [body.image]
          : undefined,
      metadata,
    });

    let activePrice: Stripe.Price | null =
      typeof updated.default_price === "string"
        ? null
        : (updated.default_price as Stripe.Price | null);

    if (typeof body.price === "number") {
      const unitAmount = Math.round(body.price * 100);
      const seedKey = metadata.seedKey || slugify(updated.name);
      const newPrice = await stripe.prices.create({
        product: updated.id,
        unit_amount: unitAmount,
        currency: "usd",
        active: true,
        metadata: { seedKey },
      });

      await stripe.products.update(updated.id, { default_price: newPrice.id });

      // Prices are immutable: retire the previous default so checkout cannot reuse it.
      if (previousDefaultPriceId && previousDefaultPriceId !== newPrice.id) {
        await stripe.prices.update(previousDefaultPriceId, { active: false });
      }

      activePrice = newPrice;
    } else if (!activePrice && previousDefaultPriceId) {
      activePrice = await stripe.prices.retrieve(previousDefaultPriceId);
    }

    const refreshed = await stripe.products.retrieve(updated.id, {
      expand: ["default_price"],
    });
    const finalPrice =
      activePrice ||
      (typeof refreshed.default_price !== "string"
        ? refreshed.default_price ?? null
        : null);

    await syncProductReplica(refreshed, finalPrice, {
      isAvailable: Boolean(nextIsAvailable),
      active: refreshed.active,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdminFromRequest(request);

    if (!isStripeConfigured || !stripe) {
      return NextResponse.json({ error: "Stripe not configured." }, { status: 500 });
    }

    const body = (await request.json()) as { id: string };
    if (!body?.id) return NextResponse.json({ error: "Missing id." }, { status: 400 });

    const { hardDeleted } = await purgeStripeProduct(body.id);

    return NextResponse.json({ ok: true, hardDeleted });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
