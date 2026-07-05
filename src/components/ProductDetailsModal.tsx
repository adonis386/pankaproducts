"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { HiOutlineX } from "react-icons/hi";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { getProductImages } from "@/lib/product-images";
import { Product } from "@/lib/types";
import ProductImageCarousel from "@/components/ProductImageCarousel";

interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductDetailsModal({ product, isOpen, onClose }: ProductDetailsModalProps) {
  const { addItem } = useCart();
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted || !isOpen || !product) return null;

  const images = getProductImages(product);

  return createPortal(
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] bg-black/30 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none"
        aria-modal="true"
        role="dialog"
      >
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          className="pointer-events-auto relative flex max-h-[90dvh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-grey-10 bg-white shadow-panka-lg"
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-20 rounded-xl bg-white/90 p-2 text-grey-50 shadow-sm transition-colors hover:bg-grey-5 hover:text-grey-70"
            aria-label="Close"
          >
            <HiOutlineX className="h-5 w-5" />
          </button>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <div className="grid grid-cols-1 gap-4 p-5 small:grid-cols-2 small:gap-6 small:p-6">
              <ProductImageCarousel
                images={images}
                alt={product.name}
                fit="contain"
                className="aspect-[4/3] w-full shrink-0 bg-surface-container small:aspect-square"
              />

              <div className="flex flex-col justify-center">
                {product.isPopular && (
                  <div className="mb-2 inline-flex w-fit items-center rounded-lg bg-panka-green-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-panka-green-600">
                    {t("product.popular")}
                  </div>
                )}

                <h2 className="mb-1 font-heading text-2xl font-bold text-panka-brown-500 small:text-3xl">
                  {product.name}
                </h2>
                <p className="mb-3 text-lg font-bold text-panka-brown-500 small:text-xl">
                  ${product.price.toFixed(2)}
                </p>
                <p className="mb-3 text-sm leading-relaxed text-grey-50 small:mb-4 small:text-base">
                  {product.description}
                </p>

                {product.ingredients.length > 0 ? (
                  <div>
                    <p className="mb-2 font-semibold text-grey-70">{t("product.ingredients")}</p>
                    <ul className="flex flex-wrap gap-2">
                      {product.ingredients.map((ing) => (
                        <li
                          key={ing}
                          className="rounded-xl bg-grey-5 px-3 py-1 text-xs font-medium text-grey-70"
                        >
                          {ing}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm text-grey-40">{t("product.noIngredients")}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-2 border-t border-grey-10 bg-white p-4 small:flex-row small:gap-3 small:p-5">
            <button
              onClick={() => addItem(product)}
              className="w-full rounded-xl bg-panka-brown-500 py-3.5 text-base font-bold text-white transition-all hover:bg-panka-brown-600 hover:shadow-panka-md"
            >
              {t("product.addToCart")}
            </button>
            <button
              onClick={onClose}
              className="w-full rounded-xl border border-grey-10 bg-white py-3.5 text-base font-semibold text-grey-70 transition-all hover:bg-grey-5"
            >
              {t("cart.continueShopping")}
            </button>
          </div>
        </motion.div>
      </div>
    </>,
    document.body
  );
}
