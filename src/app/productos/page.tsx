import type { Metadata } from "next";
import { getPublicCatalog } from "@/lib/catalog-server";
import { Product } from "@/lib/types";
import ProductosClient from "./productos-client";

const SITE_URL = "https://www.pankaproducts.com";

// Rebuilt on a timer rather than on every hit: the client refetches the
// catalog on mount, so a few minutes of staleness is only ever seen by
// crawlers, and never turns into a wrong price at checkout.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Tamales artesanales | Panka",
  description:
    "Tamales hechos a mano con masa nixtamalizada fresca: pollo, cerdo, vegano, humitas y combos. Entrega en Miami.",
  alternates: { canonical: `${SITE_URL}/productos` },
  openGraph: {
    title: "Tamales artesanales | Panka",
    description:
      "Tamales hechos a mano con masa nixtamalizada fresca: pollo, cerdo, vegano, humitas y combos. Entrega en Miami.",
    url: `${SITE_URL}/productos`,
    type: "website",
  },
};

function buildStructuredData(products: Product[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Tamales artesanales Panka",
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: product.name,
        description: product.description || product.name,
        image: product.image.startsWith("http")
          ? product.image
          : `${SITE_URL}${product.image}`,
        offers: {
          "@type": "Offer",
          price: product.price.toFixed(2),
          priceCurrency: "USD",
          availability:
            product.isAvailable === false
              ? "https://schema.org/OutOfStock"
              : "https://schema.org/InStock",
          url: `${SITE_URL}/productos`,
        },
      },
    })),
  };
}

export default async function ProductosPage() {
  // A catalog outage must not take the page down: the client still fetches on
  // mount, so an empty server render degrades to the old behaviour.
  const { products } = await getPublicCatalog().catch(() => ({
    products: [] as Product[],
  }));

  return (
    <>
      {products.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildStructuredData(products)),
          }}
        />
      )}
      <ProductosClient initialProducts={products} />
    </>
  );
}
