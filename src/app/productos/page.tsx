"use client";

import { useState } from "react";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";
import { useCatalog } from "@/context/CatalogContext";

export default function ProductosPage() {
  const { t } = useLanguage();
  const { products, loading, error } = useCatalog();
  const [activeCategory, setActiveCategory] = useState<Product["category"] | "todos">("todos");

  const categories = [
    { value: "todos" as const, label: t("productos.all") },
    { value: "salados" as const, label: t("productos.savory") },
    { value: "dulces" as const, label: t("productos.sweet") },
    { value: "especiales" as const, label: t("productos.specials") },
  ];

  const filtered =
    activeCategory === "todos"
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <>
      <section className="border-b border-grey-10 bg-white pb-10 pt-14">
        <div className="mx-auto max-w-7xl px-6">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-grey-30">
            {t("productos.tag")}
          </p>
          <h1 className="mb-6 font-heading text-4xl font-bold text-panka-brown-500 small:text-5xl">
            {t("productos.title")}
          </h1>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${
                  activeCategory === cat.value
                    ? "bg-panka-brown-500 text-white"
                    : "bg-grey-5 text-grey-50 hover:bg-grey-10 hover:text-grey-70"
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
          {loading && (
            <div className="py-20 text-center">
              <div className="mx-auto mb-3 h-6 w-6 animate-ring rounded-circle border-2 border-grey-20 border-t-panka-brown-500" />
              <p className="text-base text-grey-40">Loading catalog...</p>
            </div>
          )}
          {!!error && !loading && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 gap-5 xsmall:grid-cols-2 small:grid-cols-3 medium:grid-cols-4">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {!loading && filtered.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-base text-grey-40">{t("productos.noResults")}</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
