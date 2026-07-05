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

  const chips =
    !compact && Array.isArray(product.ingredients) ? product.ingredients.filter(Boolean).slice(0, 2) : [];

  return (
    <article
      onClick={() => onSelect?.(product)}
      onKeyDown={(e) => {
        if (!onSelect) return;
        if (e.key === "Enter" || e.key === " ") onSelect(product);
      }}
      tabIndex={onSelect ? 0 : -1}
      role={onSelect ? "button" : undefined}
      className={`group flex flex-col overflow-hidden rounded-[2rem] bg-surface-container-lowest shadow-[var(--shadow-editorial)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-editorial-lg)] ${
        compact ? "min-w-[220px] max-w-[220px]" : ""
      } ${onSelect ? "cursor-pointer" : ""}`}
    >
      <div className={`relative w-full shrink-0 overflow-hidden bg-white ${compact ? "h-44" : "aspect-[4/3]"}`}>
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes={compact ? "220px" : "(max-width: 640px) 100vw, 33vw"}
          className="object-contain transition-transform duration-500 group-hover:scale-[1.02]"
        />
        {product.isPopular && (
          <span className="absolute left-4 top-4 rounded-full bg-surface/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-secondary backdrop-blur-sm">
            {t("product.popular")}
          </span>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            addItem(product);
          }}
          className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-xl bg-surface/85 text-on-surface shadow-[var(--shadow-editorial)] backdrop-blur-sm transition-all hover:bg-primary hover:text-on-primary active:scale-95"
          aria-label={t("product.addToCart")}
        >
          <HiPlus className="h-4 w-4" />
        </button>
      </div>

      <div className={`flex flex-1 flex-col ${compact ? "px-4 pb-4 pt-3" : "px-6 pb-6 pt-5"}`}>
        <div className="mb-2 flex items-start justify-between gap-4">
          <h3 className={`font-heading leading-snug ${compact ? "text-lg" : "text-2xl"} font-bold text-on-surface`}>
            {product.name}
          </h3>
          <span className={`shrink-0 font-bold text-primary ${compact ? "text-base" : "text-lg"}`}>
            ${product.price.toFixed(2)}
          </span>
        </div>

        {!!chips.length && (
          <div className="mb-4 flex flex-wrap gap-2">
            {chips.map((chip) => (
              <span
                key={chip}
                className="rounded-full bg-secondary-fixed-dim px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-on-secondary-fixed-variant"
              >
                {chip}
              </span>
            ))}
          </div>
        )}

        {!compact && <p className="mb-5 text-sm leading-relaxed text-tertiary line-clamp-2">{product.description}</p>}

        {!compact && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              addItem(product);
            }}
            className="mt-auto w-full rounded-xl bg-surface-container py-3 font-semibold text-on-surface transition-colors hover:bg-primary hover:text-on-primary"
          >
            {t("product.addToCart")}
          </button>
        )}
      </div>
    </article>
  );
}
