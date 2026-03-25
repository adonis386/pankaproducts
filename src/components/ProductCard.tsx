"use client";

import Image from "next/image";
import { HiPlus } from "react-icons/hi";
import { Product } from "@/lib/types";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";

interface ProductCardProps {
  product: Product;
  compact?: boolean;
  onSelect?: (product: Product) => void;
}

export default function ProductCard({ product, compact, onSelect }: ProductCardProps) {
  const { addItem } = useCart();
  const { t } = useLanguage();

  return (
    <article
      onClick={() => onSelect?.(product)}
      onKeyDown={(e) => {
        if (!onSelect) return;
        if (e.key === "Enter" || e.key === " ") onSelect(product);
      }}
      tabIndex={onSelect ? 0 : -1}
      role={onSelect ? "button" : undefined}
      className={`group flex flex-col overflow-hidden rounded-2xl bg-white transition-all duration-300 hover:shadow-panka-md ${
        compact ? "min-w-[220px] max-w-[220px]" : ""
      } ${onSelect ? "cursor-pointer" : ""}`}
    >
      <div className={`relative overflow-hidden ${compact ? "h-44" : "h-56"}`}>
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.isPopular && (
          <span className="absolute left-3 top-3 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-panka-brown-500 backdrop-blur-sm">
            {t("product.popular")}
          </span>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            addItem(product);
          }}
          className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/90 text-panka-brown-500 shadow-panka-sm backdrop-blur-sm transition-all hover:bg-panka-green-500 hover:text-white hover:shadow-panka-md hover:scale-110 active:scale-95"
          aria-label={t("product.addToCart")}
        >
          <HiPlus className="h-4 w-4" />
        </button>
      </div>

      <div className={`flex flex-1 flex-col ${compact ? "p-3.5" : "p-4"}`}>
        <h3 className={`mb-1 font-medium text-grey-80 leading-snug ${compact ? "text-sm" : "text-base"}`}>
          {product.name}
        </h3>
        {!compact && (
          <p className="mb-3 text-sm text-grey-40 leading-relaxed line-clamp-2">
            {product.description}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between">
          <span className={`font-bold text-panka-brown-500 ${compact ? "text-base" : "text-lg"}`}>
            ${product.price.toFixed(2)}
          </span>
          {!compact && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                addItem(product);
              }}
              className="rounded-xl bg-grey-5 px-4 py-2.5 text-sm font-semibold text-grey-70 transition-all hover:bg-panka-green-500 hover:text-white"
            >
              {t("product.addToCart")}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
