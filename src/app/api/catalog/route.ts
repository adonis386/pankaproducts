import { NextResponse } from "next/server";
import { getPublicCatalog } from "@/lib/catalog-server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { products, source } = await getPublicCatalog();
    return NextResponse.json({ products, source });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch catalog.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
