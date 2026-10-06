import { NextResponse } from "next/server";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import { requireAdminFromRequest } from "@/lib/admin-auth";
import { resolveStripePrice, syncStripeProductToCatalog } from "@/lib/catalog-sync";

export const runtime = "nodejs";

/**
 * Rewrites metadata.sort for the whole list in one request. The admin UI sends
 * the ids in the order it wants them shown, so positions are always a clean
 * 1..N sequence and the ties on the default 9999 disappear.
 */
export async function POST(request: Request) {
  try {
    await requireAdminFromRequest(request);

    if (!isStripeConfigured || !stripe) {
      return NextResponse.json({ error: "Stripe not configured." }, { status: 500 });
    }
    const stripeClient = stripe;

    const body = (await request.json()) as { ids?: unknown };
    const ids = Array.isArray(body.ids) ? body.ids.filter((id): id is string => typeof id === "string") : [];
    if (ids.length === 0) {
      return NextResponse.json({ error: "Missing ids." }, { status: 400 });
    }
    if (new Set(ids).size !== ids.length) {
      return NextResponse.json({ error: "Duplicate ids." }, { status: 400 });
    }

    const updated = await Promise.all(
      ids.map(async (id, index) => {
        const position = String(index + 1);
        const existing = await stripeClient.products.retrieve(id);
        if ((existing.metadata?.sort ?? "") === position) return null;

        const product = await stripeClient.products.update(id, {
          metadata: { ...(existing.metadata || {}), sort: position },
        });
        const price = await resolveStripePrice(product);
        await syncStripeProductToCatalog(product, price).catch(() => undefined);
        return id;
      })
    );

    return NextResponse.json({ ok: true, changed: updated.filter(Boolean).length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
