import { NextResponse } from "next/server";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import { requireAdminFromRequest } from "@/lib/admin-auth";

export const runtime = "nodejs";

function slugify(input: string) {
  return input
    .normalize("NFD")
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function getBaseUrl(request: Request) {
  const url = new URL(request.url);
  return url.origin;
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

    const products = list.data.map((p) => {
      const defaultPrice = typeof p.default_price === "string" ? null : p.default_price;
      const unitAmount = defaultPrice?.unit_amount ?? null;
      return {
        id: p.id,
        name: p.name,
        active: p.active,
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
    });

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
        : `${getBaseUrl(request)}/tamales/pollo.webp`;

    const metadata: Record<string, string> = {
      seedKey,
      category: body.category || "salados",
      popular: body.popular ? "true" : "false",
      stock: "99",
      sort: String(body.sort ?? 9999),
      image,
      ingredients: "",
    };

    const product = await stripe.products.create({
      name: body.name,
      description: body.description || "",
      active: body.active ?? true,
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

    await stripe.products.update(product.id, { default_price: price.id });

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
      popular?: boolean;
      sort?: number;
      category?: string;
      price?: number;
    };

    if (!body.id) return NextResponse.json({ error: "Missing id." }, { status: 400 });

    const existing = await stripe.products.retrieve(body.id);
    const currentMeta = existing.metadata || {};

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
    };

    const updated = await stripe.products.update(body.id, {
      name: body.name,
      description: body.description,
      active: body.active,
      metadata,
    });

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
    }

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
    const stripeClient = stripe;

    const body = (await request.json()) as { id: string };
    if (!body?.id) return NextResponse.json({ error: "Missing id." }, { status: 400 });

    // "Delete" safely by archiving: set product inactive and deactivate all active prices.
    await stripeClient.products.update(body.id, { active: false });

    const prices = await stripeClient.prices.list({ product: body.id, active: true, limit: 100 });
    await Promise.all(prices.data.map((p) => stripeClient.prices.update(p.id, { active: false })));

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

