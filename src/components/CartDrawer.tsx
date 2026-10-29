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
  HiOutlineLocationMarker,
} from "react-icons/hi";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { useCatalog } from "@/context/CatalogContext";
import { useSettings } from "@/context/SettingsContext";
import { FaWhatsapp } from "react-icons/fa";
import { getProductImageAlt } from "@/lib/product-alt";
import { US_STATES, type FloridaCountyOption } from "@/lib/us-shipping";

export default function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    addItem,
    totalPrice,
    totalItems,
    shippingLocation,
    setShippingLocation,
    shippingFee,
    isFreeShipping,
    grandTotal,
  } = useCart();
  const { t, locale } = useLanguage();
  const { settings } = useSettings();
  const { products } = useCatalog();
  const [promoCode, setPromoCode] = useState("");
  const [promoMessage, setPromoMessage] = useState("");

  if (!isOpen) return null;

  const cartIds = new Set(items.map((i) => i.product.id));
  const suggestions = products.filter((p) => !cartIds.has(p.id)).slice(0, 3);

  const handleApplyPromo = () => {
    setPromoMessage(promoCode.trim() ? t("cart.promoNotAvailable") : "");
  };

  const selectedStateObj =
    US_STATES.find((s) => s.code === shippingLocation.state) || US_STATES[0];
  const isFlorida = shippingLocation.state === "FL";

  const zoneTextEs = isFlorida
    ? shippingLocation.county === "Miami-Dade County"
      ? "Miami-Dade County, FL (Delivery Gratis)"
      : shippingLocation.county === "Broward County"
      ? "Broward County, FL (Delivery Gratis)"
      : "Otro Condado en Florida ($25.00)"
    : `${selectedStateObj.name} (${selectedStateObj.code}) — Shipping $25.00`;

  const zoneTextEn = isFlorida
    ? shippingLocation.county === "Miami-Dade County"
      ? "Miami-Dade County, FL (Free Delivery)"
      : shippingLocation.county === "Broward County"
      ? "Broward County, FL (Free Delivery)"
      : "Other Florida County ($25.00)"
    : `${selectedStateObj.name} (${selectedStateObj.code}) — Shipping $25.00`;

  const whatsappMessage =
    `Hello Panka! I would like to place the following order:\n\n` +
    `📦 *ITEMS:*\n` +
    items
      .map(
        (i) =>
          `• ${i.quantity}x ${i.product.name} — $${(
            i.product.price * i.quantity
          ).toFixed(2)}`
      )
      .join("\n") +
    `\n\n📍 *SHIPPING LOCATION:*\n` +
    `• State: ${selectedStateObj.name} (${selectedStateObj.code})\n` +
    (isFlorida ? `• County: ${shippingLocation.county}\n` : "") +
    (shippingLocation.city ? `• City: ${shippingLocation.city}\n` : "") +
    (shippingLocation.zip ? `• ZIP Code: ${shippingLocation.zip}\n` : "") +
    `\n💳 *ORDER SUMMARY:*\n` +
    `• Subtotal: $${totalPrice.toFixed(2)}\n` +
    `• Shipping: ${
      isFreeShipping
        ? "FREE ($0.00 — Miami-Dade / Broward)"
        : `$${shippingFee.toFixed(2)}`
    }\n` +
    `• *TOTAL: $${grandTotal.toFixed(2)}*`;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-on-surface/20 backdrop-blur-sm"
        onClick={closeCart}
        aria-hidden
      />
      <aside className="fixed inset-y-0 right-0 z-50 flex h-svh max-h-svh w-full max-w-lg flex-col overflow-hidden bg-surface text-on-surface shadow-editorial-lg animate-fade-in-right">
        <div className="flex shrink-0 items-center justify-between border-b border-outline-variant/15 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <h2 className="font-heading text-xl font-bold tracking-tight text-on-surface">
              {t("cart.title")}
            </h2>
            {totalItems > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/10 px-2 text-xs font-bold text-primary">
                {totalItems}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="rounded-xl p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
            aria-label={t("cart.close")}
          >
            <HiOutlineX className="h-5 w-5" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 text-5xl">🫔</div>
                <p className="mb-1 font-heading text-xl font-semibold text-on-surface">
                  {t("cart.empty")}
                </p>
                <p className="mb-8 max-w-xs text-sm leading-relaxed text-tertiary">
                  {t("cart.emptyDesc")}
                </p>
                <button
                  type="button"
                  onClick={closeCart}
                  className="rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-on-primary shadow-lg shadow-primary/10 transition-all hover:bg-primary-container active:scale-[0.98]"
                >
                  {t("cart.browseTamales")}
                </button>
              </div>
            ) : (
              <div className="space-y-5 pb-2">
                <ul className="flex flex-col gap-3">
                  {items.map((item) => (
                    <li
                      key={item.product.id}
                      className="group flex items-center gap-3.5 rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-3 shadow-xs transition-all hover:border-outline-variant/30 hover:shadow-sm sm:gap-4 sm:p-3.5"
                    >
                      {/* Fixed uniform square thumbnail */}
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-surface-container-low sm:h-[5.25rem] sm:w-[5.25rem]">
                        <Image
                          src={item.product.image}
                          alt={getProductImageAlt(item.product, locale)}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="84px"
                        />
                      </div>

                      {/* Product details */}
                      <div className="flex min-w-0 flex-1 flex-col justify-between self-stretch py-0.5">
                        {/* Top: Name & Remove */}
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="line-clamp-1 font-heading text-base font-bold leading-tight text-on-surface sm:text-lg">
                            {item.product.name}
                          </h3>
                          <button
                            type="button"
                            onClick={() => removeItem(item.product.id)}
                            className="shrink-0 rounded-lg p-1 text-tertiary transition-colors hover:bg-error/10 hover:text-error"
                            aria-label={t("cart.removeItem")}
                            title={t("cart.removeItem")}
                          >
                            <HiOutlineTrash className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Middle: Unit price & Free Delivery badge */}
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-tertiary">
                          <span>
                            ${item.product.price.toFixed(2)} {t("cart.each")}
                          </span>
                          {item.product.freeDelivery && (
                            <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                              {locale === "es" ? "Miami-Dade / Broward Gratis" : "Free in Miami-Dade / Broward"}
                            </span>
                          )}
                        </div>

                        {/* Bottom: Quantity selector & Line total */}
                        <div className="mt-2.5 flex items-center justify-between gap-2">
                          <div className="flex items-center rounded-xl bg-surface-container p-0.5">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-lowest hover:text-primary active:scale-95"
                              aria-label={t("cart.decreaseQty")}
                            >
                              <HiMinus className="h-3.5 w-3.5" />
                            </button>
                            <span className="min-w-[1.75rem] px-2 text-center text-xs font-bold text-on-surface">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-lowest hover:text-primary active:scale-95"
                              aria-label={t("cart.increaseQty")}
                            >
                              <HiPlus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <span className="font-heading text-base font-bold text-on-surface sm:text-lg">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Shipping State & County Selector inside Cart */}
                <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-low/40 p-4">
                  <div className="mb-2.5 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-on-surface">
                      <HiOutlineLocationMarker className="h-4 w-4 text-primary" />
                      {locale === "es" ? "Calcular Envío (EE. UU.)" : "Calculate US Shipping"}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        isFreeShipping
                          ? "bg-emerald-500/15 text-emerald-700"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {isFreeShipping
                        ? locale === "es"
                          ? "Delivery Gratis ($0.00)"
                          : "Free Delivery ($0.00)"
                        : "$25.00 Shipping"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-tertiary">
                        {locale === "es" ? "Estado (US State)" : "US State"}
                      </label>
                      <select
                        value={shippingLocation.state}
                        onChange={(e) => {
                          const nextState = e.target.value;
                          setShippingLocation({
                            state: nextState,
                            county:
                              nextState === "FL"
                                ? shippingLocation.county || "Miami-Dade County"
                                : "Other County",
                          });
                        }}
                        className="w-full rounded-xl border border-outline-variant/25 bg-surface-container-lowest px-3 py-2 text-xs font-semibold text-on-surface outline-none focus:border-primary"
                      >
                        {US_STATES.map((st) => (
                          <option key={st.code} value={st.code}>
                            {st.code} — {st.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {isFlorida ? (
                      <div>
                        <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-tertiary">
                          {locale === "es" ? "Condado en Florida" : "Florida County"}
                        </label>
                        <select
                          value={shippingLocation.county}
                          onChange={(e) =>
                            setShippingLocation({
                              county: e.target.value as FloridaCountyOption,
                            })
                          }
                          className="w-full rounded-xl border border-outline-variant/25 bg-surface-container-lowest px-3 py-2 text-xs font-semibold text-on-surface outline-none focus:border-primary"
                        >
                          <option value="Miami-Dade County">
                            Miami-Dade County (Gratis $0)
                          </option>
                          <option value="Broward County">
                            Broward County (Gratis $0)
                          </option>
                          <option value="Other County">
                            {locale === "es"
                              ? "Otro Condado FL ($25.00)"
                              : "Other FL County ($25.00)"}
                          </option>
                        </select>
                      </div>
                    ) : (
                      <div className="flex flex-col justify-end">
                        <div className="rounded-xl border border-outline-variant/15 bg-surface-container-lowest px-3 py-2 text-[11px] font-medium text-tertiary">
                          {locale === "es"
                            ? "Tarifa nacional fuera de Miami-Dade/Broward: $25.00"
                            : "Standard rate outside Miami-Dade/Broward: $25.00"}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {suggestions.length > 0 && (
                  <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-low/30 p-4">
                    <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-tertiary">
                      {t("cart.goesGreatWith")}
                    </p>
                    <div className="flex flex-col gap-2.5">
                      {suggestions.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center gap-3 rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-2.5 shadow-2xs transition-all hover:border-outline-variant/30"
                        >
                          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-surface-container-low">
                            <Image
                              src={p.image}
                              alt={getProductImageAlt(p, locale)}
                              fill
                              className="object-cover"
                              sizes="44px"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-bold text-on-surface">{p.name}</p>
                            <p className="text-xs text-tertiary">${p.price.toFixed(2)}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => addItem(p)}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-container text-on-surface-variant transition-all hover:bg-primary hover:text-on-primary active:scale-95"
                            aria-label={t("cart.addToCart")}
                          >
                            <HiPlus className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-low/30 p-4">
                  <label
                    htmlFor="cart-promo"
                    className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-tertiary"
                  >
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
                      className="min-w-0 flex-1 rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-3.5 py-2 text-xs text-on-surface placeholder:text-tertiary/60 outline-none ring-1 ring-transparent transition-all focus:border-primary focus:ring-primary/20"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      className="shrink-0 rounded-xl bg-surface-container px-3.5 py-2 text-xs font-bold text-primary transition-all hover:bg-primary hover:text-on-primary"
                    >
                      {t("cart.apply")}
                    </button>
                  </div>
                  {promoMessage ? <p className="mt-2 text-xs text-tertiary">{promoMessage}</p> : null}
                </div>

                <button
                  type="button"
                  onClick={closeCart}
                  className="w-full py-2 text-center text-xs font-semibold text-tertiary transition-colors hover:text-on-surface"
                >
                  {t("cart.continueShopping")}
                </button>
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="shrink-0 border-t border-outline-variant/15 bg-surface-container-lowest px-5 py-3.5 shadow-[0_-8px_24px_rgba(0,0,0,0.05)] sm:px-6">
              <div className="mb-2.5 space-y-1 text-xs">
                <div className="flex justify-between text-tertiary">
                  <span>{t("cart.subtotal")}</span>
                  <span className="font-semibold text-on-surface">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-tertiary">
                  <span>
                    {t("cart.shipping")} ({locale === "es" ? zoneTextEs : zoneTextEn})
                  </span>
                  <span
                    className={`font-bold ${
                      isFreeShipping ? "text-emerald-700" : "text-on-surface"
                    }`}
                  >
                    {isFreeShipping
                      ? locale === "es"
                        ? "GRATIS ($0.00)"
                        : "FREE ($0.00)"
                      : `$${shippingFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex items-baseline justify-between border-t border-outline-variant/15 pt-2">
                  <span className="text-sm font-bold text-on-surface">{t("cart.total")}</span>
                  <span className="font-heading text-2xl font-bold text-primary">
                    ${grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold tracking-wide text-on-primary shadow-md shadow-primary/20 transition-all hover:bg-primary-container active:scale-[0.98]"
                >
                  {t("cart.proceedCheckout")}
                  <HiOutlineArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <a
                  href={`https://wa.me/${(settings.contact.whatsapp || "19549014340").replace(
                    /[^0-9]/g,
                    ""
                  )}?text=${encodeURIComponent(whatsappMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-600/30 bg-emerald-50/80 py-2.5 text-xs font-bold text-emerald-800 transition-all hover:bg-emerald-100 active:scale-[0.98]"
                >
                  <FaWhatsapp className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                  {locale === "es"
                    ? `Transferir Pedido a WhatsApp ($${grandTotal.toFixed(2)})`
                    : `Send Order to WhatsApp ($${grandTotal.toFixed(2)})`}
                </a>
              </div>

              <div className="mt-2.5 flex items-center justify-center gap-4 text-[10px] text-tertiary">
                <span className="inline-flex items-center gap-1 font-medium">
                  <HiOutlineGlobeAlt className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                  {t("cart.sustainability")}
                </span>
                <span className="h-2 w-px bg-outline-variant/40" aria-hidden />
                <span className="inline-flex items-center gap-1 font-medium">
                  <HiOutlineTruck className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                  {t("cart.smallBatches")}
                </span>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
