"use client";

import Image from "next/image";
import Link from "next/link";
import { HiOutlineX, HiPlus, HiMinus, HiOutlineTrash } from "react-icons/hi";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { useCatalog } from "@/context/CatalogContext";

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, addItem, totalPrice, totalItems } = useCart();
  const { t } = useLanguage();
  const { products } = useCatalog();

  if (!isOpen) return null;

  const cartIds = new Set(items.map((i) => i.product.id));
  const suggestions = products.filter((p) => !cartIds.has(p.id)).slice(0, 3);

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-[2px]" onClick={closeCart} />
      <aside className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[420px] flex-col bg-white shadow-panka-lg animate-fade-in-right">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="text-lg font-bold text-grey-80">
            {t("cart.title")}
            {totalItems > 0 && (
              <span className="ml-2 rounded-lg bg-grey-5 px-2 py-0.5 text-xs font-medium text-grey-40">{totalItems}</span>
            )}
          </h2>
          <button onClick={closeCart} className="rounded-xl p-2 text-grey-40 transition-colors hover:bg-grey-5 hover:text-grey-70">
            <HiOutlineX className="h-4 w-4" />
          </button>
        </div>

        <div className="h-px bg-grey-10" />

        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
              <div className="mb-3 text-5xl">🫔</div>
              <p className="mb-1 text-base font-semibold text-grey-70">{t("cart.empty")}</p>
              <p className="mb-6 text-sm text-grey-40">{t("cart.emptyDesc")}</p>
              <button onClick={closeCart} className="rounded-xl bg-panka-brown-500 px-7 py-3 text-sm font-bold text-white transition-all hover:bg-panka-brown-600">
                {t("cart.browseTamales")}
              </button>
            </div>
          ) : (
            <div className="px-6 py-4">
              <ul className="flex flex-col gap-3">
                {items.map((item) => (
                  <li key={item.product.id} className="flex gap-3 rounded-xl bg-grey-5 p-3">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                      <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex items-start justify-between">
                        <h3 className="text-sm font-medium text-grey-80 leading-snug pr-2">{item.product.name}</h3>
                        <button onClick={() => removeItem(item.product.id)} className="shrink-0 rounded-lg p-1 text-grey-30 transition-colors hover:bg-white hover:text-red-500">
                          <HiOutlineTrash className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="flex h-6 w-6 items-center justify-center rounded-lg border border-grey-20 text-grey-40 transition-colors hover:bg-white">
                            <HiMinus className="h-2.5 w-2.5" />
                          </button>
                          <span className="w-5 text-center text-xs font-semibold text-grey-70">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="flex h-6 w-6 items-center justify-center rounded-lg border border-grey-20 text-grey-40 transition-colors hover:bg-white">
                            <HiPlus className="h-2.5 w-2.5" />
                          </button>
                        </div>
                        <span className="text-sm font-bold text-panka-brown-500">${(item.product.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {suggestions.length > 0 && (
                <div className="mt-6">
                  <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-grey-30">{t("cart.goesGreatWith")}</p>
                  <div className="flex flex-col gap-2">
                    {suggestions.map((p) => (
                      <div key={p.id} className="flex items-center gap-3 rounded-xl border border-grey-10 p-2.5">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                          <Image src={p.image} alt={p.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium text-grey-70">{p.name}</p>
                          <p className="text-sm text-grey-40">${p.price.toFixed(2)}</p>
                        </div>
                        <button onClick={() => addItem(p)} className="shrink-0 rounded-lg bg-grey-5 p-1.5 text-grey-40 transition-all hover:bg-panka-green-500 hover:text-white">
                          <HiPlus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-grey-10 px-6 py-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-grey-40">{t("cart.subtotal")}</span>
              <span className="text-lg font-bold text-grey-80">${totalPrice.toFixed(2)}</span>
            </div>
            <Link href="/checkout" onClick={closeCart} className="block w-full rounded-xl bg-panka-brown-500 py-4 text-center text-base font-bold text-white transition-all hover:bg-panka-brown-600 hover:shadow-panka-md">
              {t("cart.checkout")}
            </Link>
            <button onClick={closeCart} className="mt-2 block w-full py-2.5 text-center text-sm font-medium text-grey-40 transition-colors hover:text-grey-60">
              {t("cart.continueShopping")}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
