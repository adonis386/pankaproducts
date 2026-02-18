"use client";

import { useState } from "react";
import ProductCard from "@/components/ProductCard";
import { products } from "@/lib/products";
import { Product } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";

export default function ProductosPage() {
  const { t } = useLanguage();
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
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-grey-30">
            {t("productos.tag")}
          </p>
          <h1 className="mb-6 font-heading text-3xl font-bold text-panka-brown-500 small:text-4xl">
            {t("productos.title")}
          </h1>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`rounded-xl px-5 py-2.5 text-[13px] font-medium transition-all ${
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
          <div className="grid grid-cols-1 gap-5 xsmall:grid-cols-2 small:grid-cols-3 medium:grid-cols-4">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-sm text-grey-40">{t("productos.noResults")}</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
