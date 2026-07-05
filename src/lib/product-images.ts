import { Product } from "@/lib/types";

const PRODUCT_GALLERIES: Record<string, string[]> = {
  pollo: [
    "/tamales/pollo/pollo(3).webp",
    "/tamales/pollo/pollo(2).webp",
    "/tamales/pollo/pollo(1).webp",
  ],
  "salchicha wachana": [
    "/tamales/salchicha_huachana/Salchicha_Huachana(1).webp",
    "/tamales/salchicha_huachana/Salchicha_Huachana(2).webp",
  ],
  "jamoncillos del pais": [
    "/tamales/jamon_del_pais/jamon_del_pais(2).webp",
    "/tamales/jamon_del_pais/jamon_del_pais(1).webp",
  ],
  "tamal de cerdo": [
    "/tamales/tamal_cerdo/Tamal_de_cerdo(2).webp",
    "/tamales/tamal_cerdo/Tamal_de_cerdo(3).webp",
    "/tamales/tamal_cerdo/Tamal_de_cerdo(1).webp",
  ],
  vegano: [
    "/tamales/vegano/vegano(2).webp",
    "/tamales/vegano/vegano(1).webp",
  ],
  humita: [
    "/tamales/humita/humita (2).webp",
    "/tamales/humita/humita (1).webp",
  ],
  "tamalito verde": [
    "/tamales/tamalito_verde/tamalito_verde (2).webp",
    "/tamales/tamalito_verde/tamalito_verde (1).webp",
  ],
};

export function getProductImages(product: Product): string[] {
  if (product.images?.length) return product.images;

  const byName = PRODUCT_GALLERIES[product.name.toLowerCase().trim()];
  if (byName?.length) return byName;

  return [product.image];
}
