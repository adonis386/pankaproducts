"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";
import { useCatalog } from "@/context/CatalogContext";
import ProductDetailsModal from "@/components/ProductDetailsModal";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";

export default function ProductosPage() {
  const { t } = useLanguage();
  const { products, loading, error } = useCatalog();
  const [activeCategory, setActiveCategory] = useState<Product["category"] | "todos">("todos");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const hasSalados = products.some((p) => p.category === "salados");
  const hasDulces = products.some((p) => p.category === "dulces");
  const hasEspeciales = products.some((p) => p.category === "especiales");

  const availableCategories: Array<{ value: Product["category"]; label: string }> = [];
  if (hasSalados) availableCategories.push({ value: "salados", label: t("productos.savory") });
  if (hasDulces) availableCategories.push({ value: "dulces", label: t("productos.sweet") });
  if (hasEspeciales) availableCategories.push({ value: "especiales", label: t("productos.specials") });

  const categories: Array<{ value: "todos" | Product["category"]; label: string }> = [
    { value: "todos", label: t("productos.all") },
    ...availableCategories,
  ];

  const filtered =
    activeCategory === "todos"
      ? products
      : products.filter((p) => p.category === activeCategory);

  useEffect(() => {
    if (loading) return;
    if (activeCategory === "todos") return;
    const stillExists = products.some((p) => p.category === activeCategory);
    if (!stillExists) setActiveCategory("todos");
  }, [activeCategory, loading, products]);

  return (
    <>
      <section className="bg-surface pb-10 pt-16">
        <div className="mx-auto max-w-7xl px-6">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-secondary">
            {t("productos.tag")}
          </p>
          <h1 className="mb-8 font-heading text-5xl font-bold text-on-surface small:text-6xl">
            {t("productos.title")}
          </h1>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`rounded-xl px-5 py-2.5 text-sm font-semibold uppercase tracking-widest transition-all ${
                  activeCategory === cat.value
                    ? "bg-primary text-on-primary shadow-[var(--shadow-editorial)]"
                    : "bg-surface-container-highest text-secondary/80 shadow-[var(--shadow-editorial)] hover:bg-surface-variant hover:text-secondary"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="mx-auto max-w-7xl px-6">
          {!!error && !loading && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 gap-5 xsmall:grid-cols-2 small:grid-cols-3 medium:grid-cols-4">
              {Array.from({ length: 8 }).map((_, idx) => (
                <ProductCardSkeleton key={idx} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 xsmall:grid-cols-2 small:grid-cols-3 medium:grid-cols-4">
              {filtered.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={(p) => setSelectedProduct(p)}
                />
              ))}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-base text-grey-40">{t("productos.noResults")}</p>
            </div>
          )}
        </div>
      </section>

      <ProductDetailsModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </>
  );
}
