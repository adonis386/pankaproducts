"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  HiOutlineArrowRight,
  HiOutlineGlobeAlt,
  HiOutlineTruck,
  HiOutlineX,
  HiPlus,
  HiMinus,
  HiOutlineTrash,
} from "react-icons/hi";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { useCatalog } from "@/context/CatalogContext";

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, addItem, totalPrice, totalItems } = useCart();
  const { t } = useLanguage();
  const { products } = useCatalog();
  const [promoCode, setPromoCode] = useState("");
  const [promoMessage, setPromoMessage] = useState("");

  if (!isOpen) return null;

  const cartIds = new Set(items.map((i) => i.product.id));
  const suggestions = products.filter((p) => !cartIds.has(p.id)).slice(0, 3);

  const handleApplyPromo = () => {
    setPromoMessage(promoCode.trim() ? t("cart.promoNotAvailable") : "");
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-on-surface/20 backdrop-blur-sm"
        onClick={closeCart}
        aria-hidden
      />
      <aside className="fixed inset-y-0 right-0 z-50 flex h-svh max-h-svh w-full max-w-lg flex-col overflow-hidden bg-surface text-on-surface shadow-editorial-lg animate-fade-in-right">
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-outline-variant/20 px-6 pb-4 pt-5 md:px-8 md:pb-5 md:pt-6">
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-widest text-tertiary">
              {t("cart.title")}
              {totalItems > 0 ? (
                <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/10 px-1.5 text-[10px] font-bold text-primary">
                  {totalItems}
                </span>
              ) : null}
            </p>
            <h2 className="font-heading text-3xl font-bold tracking-tight text-on-surface md:text-4xl">
              {t("cart.selectionTitle")}
            </h2>
            <p className="mt-1 text-sm font-medium uppercase tracking-widest text-tertiary">
              {t("cart.selectionSubtitle")}
            </p>
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="shrink-0 rounded-xl p-2 text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
            aria-label={t("cart.close")}
          >
            <HiOutlineX className="h-5 w-5" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-4 md:px-8 md:py-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 text-5xl">🫔</div>
              <p className="mb-1 font-heading text-xl font-semibold text-on-surface">{t("cart.empty")}</p>
              <p className="mb-8 max-w-xs text-sm leading-relaxed text-tertiary">{t("cart.emptyDesc")}</p>
              <button
                type="button"
                onClick={closeCart}
                className="rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-on-primary shadow-lg shadow-primary/10 transition-all hover:bg-primary-container active:scale-[0.98]"
              >
                {t("cart.browseTamales")}
              </button>
            </div>
          ) : (
            <div className="space-y-8 pb-2">
              <ul className="flex flex-col gap-8">
                {items.map((item) => (
                  <li
                    key={item.product.id}
                    className="group flex flex-col gap-4 border-b border-outline-variant/15 pb-8 last:border-0 last:pb-0 sm:flex-row sm:items-start sm:gap-5"
                  >
                    <div className="relative mx-auto aspect-square w-full max-w-[10.5rem] shrink-0 overflow-hidden rounded-xl bg-surface-container-low sm:mx-0 sm:w-32 sm:max-w-none md:w-36">
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, 176px"
                      />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col py-0 sm:py-1">
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <h3 className="font-heading text-xl font-semibold leading-snug text-on-surface md:text-2xl">
                          {item.product.name}
                        </h3>
                        <button
                          type="button"
                          onClick={() => removeItem(item.product.id)}
                          className="shrink-0 text-on-surface-variant transition-colors hover:text-error"
                          aria-label={t("cart.removeItem")}
                        >
                          <HiOutlineTrash className="h-5 w-5" />
                        </button>
                      </div>
                      <p className="mb-4 line-clamp-3 max-w-md text-sm leading-relaxed text-tertiary">
                        {item.product.description}
                      </p>
                      <div className="mt-auto flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center rounded-full bg-surface-container px-3 py-2">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-primary"
                            aria-label={t("cart.decreaseQty")}
                          >
                            <HiMinus className="h-4 w-4" />
                          </button>
                          <span className="min-w-[2.5rem] px-3 text-center text-sm font-semibold text-on-surface">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-primary"
                            aria-label={t("cart.increaseQty")}
                          >
                            <HiPlus className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="text-right">
                          <span className="mb-1 block text-xs text-tertiary">
                            ${item.product.price.toFixed(2)} {t("cart.each")}
                          </span>
                          <span className="text-xl font-medium text-on-surface">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {suggestions.length > 0 && (
                <div>
                  <p className="mb-4 text-xs font-bold uppercase tracking-widest text-tertiary">
                    {t("cart.goesGreatWith")}
                  </p>
                  <div className="flex flex-col gap-3">
                    {suggestions.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center gap-3 rounded-2xl border border-outline-variant/20 bg-surface-container-low/50 p-3"
                      >
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-surface-container-low">
                          <Image src={p.image} alt={p.name} fill className="object-cover" sizes="48px" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-on-surface">{p.name}</p>
                          <p className="text-sm text-tertiary">${p.price.toFixed(2)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => addItem(p)}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-container text-on-surface-variant transition-all hover:bg-primary hover:text-on-primary"
                          aria-label={t("cart.addToCart")}
                        >
                          <HiPlus className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-outline-variant/15 pt-6">
                <label htmlFor="cart-promo" className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-tertiary">
                  {t("cart.promoLabel")}
                </label>
                <div className="flex gap-2">
                  <input
                    id="cart-promo"
                    type="text"
                    value={promoCode}
                    onChange={(e) => {
                      setPromoCode(e.target.value);
                      setPromoMessage("");
                    }}
                    placeholder={t("cart.promoPlaceholder")}
                    className="min-w-0 flex-1 rounded-lg border-none bg-surface-container-low px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/60 outline-none ring-1 ring-transparent transition-shadow focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="shrink-0 px-2 text-sm font-semibold text-primary underline-offset-4 hover:underline"
                  >
                    {t("cart.apply")}
                  </button>
                </div>
                {promoMessage ? <p className="mt-2 text-xs text-tertiary">{promoMessage}</p> : null}
              </div>

              <button
                type="button"
                onClick={closeCart}
                className="mt-6 w-full py-2 text-center text-sm font-medium text-tertiary transition-colors hover:text-on-surface"
              >
                {t("cart.continueShopping")}
              </button>
            </div>
          )}
          </div>

        {items.length > 0 && (
          <div className="shrink-0 border-t border-outline-variant/20 bg-surface-container-low/80 px-6 py-4 backdrop-blur-sm md:px-8">
            <div className="rounded-2xl bg-surface-container px-5 py-4 md:rounded-[1.75rem] md:px-6 md:py-5">
              <h3 className="border-b border-outline-variant/20 pb-3 font-heading text-xl font-bold text-on-surface">
                {t("cart.summary")}
              </h3>
              <div className="mt-4 space-y-2.5 text-sm">
                <div className="flex justify-between text-on-surface-variant">
                  <span>{t("cart.subtotal")}</span>
                  <span className="font-medium text-on-surface">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between gap-3 text-on-surface-variant">
                  <span>{t("cart.shipping")}</span>
                  <span className="max-w-[10rem] text-right text-xs italic text-tertiary">{t("cart.shippingNote")}</span>
                </div>
                <div className="flex justify-between border-t border-outline-variant/15 pt-3">
                  <span className="text-base font-semibold text-on-surface">{t("cart.total")}</span>
                  <span className="font-heading text-xl text-primary md:text-2xl">${totalPrice.toFixed(2)}</span>
                </div>
              </div>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold tracking-wide text-on-primary shadow-lg shadow-primary/10 transition-all duration-300 hover:bg-primary-container active:scale-[0.98] md:mt-5 md:py-4"
              >
                {t("cart.proceedCheckout")}
                <HiOutlineArrowRight className="h-5 w-5" aria-hidden />
              </Link>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-tertiary">
                <span className="inline-flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-wider">
                  <HiOutlineGlobeAlt className="h-4 w-4 shrink-0" aria-hidden />
                  {t("cart.sustainability")}
                </span>
                <span className="hidden h-3 w-px bg-outline-variant/40 sm:inline" aria-hidden />
                <span className="inline-flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-wider">
                  <HiOutlineTruck className="h-4 w-4 shrink-0" aria-hidden />
                  {t("cart.smallBatches")}
                </span>
              </div>
            </div>
          </div>
        )}
        </div>
      </aside>
    </>
  );
}
