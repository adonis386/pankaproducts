import type { Product } from "@/lib/types";
import type { Locale } from "@/lib/translations";

/**
 * WCAG 1.1.1 / food-site practice: describe the dish, not “image of…”.
 * Prefer short, concrete alt for screen readers (≈ under 125–150 chars).
 */
export function getProductImageAlt(product: Product, locale: Locale = "es"): string {
  const name = (product.name || "").trim() || (locale === "es" ? "Tamal" : "Tamale");
  const ingredients = (product.ingredients || [])
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);

  if (locale === "es") {
    if (ingredients.length > 0) {
      return `${name}: tamal artesanal con ${ingredients.join(", ")}`;
    }
    const byCategory: Record<Product["category"], string> = {
      salados: `${name}: tamal salado artesanal`,
      dulces: `${name}: tamal dulce artesanal`,
      especiales: `${name}: tamal especial artesanal`,
    };
    return byCategory[product.category] || `${name}: tamal artesanal peruano`;
  }

  if (ingredients.length > 0) {
    return `${name}: handmade tamale with ${ingredients.join(", ")}`;
  }
  const byCategory: Record<Product["category"], string> = {
    salados: `${name}: handmade savory tamale`,
    dulces: `${name}: handmade sweet tamale`,
    especiales: `${name}: handmade specialty tamale`,
  };
  return byCategory[product.category] || `${name}: handmade Peruvian tamale`;
}
