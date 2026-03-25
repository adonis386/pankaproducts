import { NextResponse } from "next/server";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import { requireAdminFromRequest } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    await requireAdminFromRequest(request);

    if (!isStripeConfigured || !stripe) {
      return NextResponse.json({ error: "Stripe not configured." }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploaded = await stripe.files.create({
      purpose: "dispute_evidence",
      file: {
        data: buffer,
        name: file.name || "upload",
        type: file.type || "application/octet-stream",
      },
    });

    const link = await stripe.fileLinks.create({ file: uploaded.id });
    return NextResponse.json({ url: link.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to upload image.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

