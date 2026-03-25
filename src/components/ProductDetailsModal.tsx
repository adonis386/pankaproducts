"use client";

import Image from "next/image";
import { HiOutlineX } from "react-icons/hi";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { Product } from "@/lib/types";

interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductDetailsModal({ product, isOpen, onClose }: ProductDetailsModalProps) {
  const { addItem } = useCart();
  const { t } = useLanguage();

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />

      <div className="relative w-[92vw] max-w-lg rounded-2xl border border-grey-10 bg-white shadow-panka-lg p-6 animate-fade-in-top">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-2 text-grey-50 transition-colors hover:bg-grey-5 hover:text-grey-70"
          aria-label="Close"
        >
          <HiOutlineX className="h-5 w-5" />
        </button>

        <div className="grid grid-cols-1 gap-5 small:grid-cols-2">
          <div className="relative h-44 overflow-hidden rounded-2xl bg-grey-5 small:h-52">
            <Image src={product.image} alt={product.name} fill className="object-cover" />
          </div>

          <div className="flex flex-col">
            {product.isPopular && (
              <div className="mb-2 inline-flex w-fit items-center rounded-lg bg-panka-green-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-panka-green-600">
                {t("product.popular")}
              </div>
            )}

            <h2 className="mb-2 font-heading text-2xl font-bold text-panka-brown-500">{product.name}</h2>
            <p className="mb-3 text-base font-bold text-panka-brown-500">${product.price.toFixed(2)}</p>
            <p className="mb-4 text-sm leading-relaxed text-grey-50">{product.description}</p>

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

        <div className="mt-6 flex flex-col gap-3 small:flex-row">
          <button
            onClick={() => addItem(product)}
            className="w-full rounded-xl bg-panka-brown-500 py-4 text-base font-bold text-white transition-all hover:bg-panka-brown-600 hover:shadow-panka-md"
          >
            {t("product.addToCart")}
          </button>
          <button
            onClick={onClose}
            className="w-full rounded-xl border border-grey-10 bg-white py-4 text-base font-semibold text-grey-70 transition-all hover:bg-grey-5"
          >
            {t("cart.continueShopping")}
          </button>
        </div>
      </div>
    </div>
  );
}

