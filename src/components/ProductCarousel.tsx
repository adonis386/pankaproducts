"use client";

import { useRef } from "react";
import Link from "next/link";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import { Product } from "@/lib/types";
import ProductCard from "./ProductCard";
import { useLanguage } from "@/context/LanguageContext";

interface ProductCarouselProps {
  title: string;
  products: Product[];
  href?: string;
}

export default function ProductCarousel({ title, products, href }: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -260 : 260,
      behavior: "smooth",
    });
  };

  return (
    <section className="py-14">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="font-heading text-2xl font-bold text-panka-brown-500">{title}</h2>
          <div className="flex items-center gap-2">
            {href && (
              <Link
                href={href}
                className="mr-2 text-[13px] font-medium text-grey-40 transition-colors hover:text-panka-brown-500"
              >
                {t("carousel.viewAll")}
              </Link>
            )}
            <button
              onClick={() => scroll("left")}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-grey-10 text-grey-40 transition-all hover:border-grey-20 hover:text-grey-70"
            >
              <HiChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-grey-10 text-grey-40 transition-all hover:border-grey-20 hover:text-grey-70"
            >
              <HiChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div ref={scrollRef} className="scrollbar-hide -mx-2 flex gap-4 overflow-x-auto px-2 pb-4">
          {products.map((product) => (
            <div key={product.id} className="shrink-0">
              <ProductCard product={product} compact />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
