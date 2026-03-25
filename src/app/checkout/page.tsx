"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { CustomerInfo } from "@/lib/types";
import { HiOutlineCheckCircle, HiArrowLeft } from "react-icons/hi";
import StripeEmbeddedCheckout from "@/components/StripeEmbeddedCheckout";

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [showStripeCheckout, setShowStripeCheckout] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [form, setForm] = useState<CustomerInfo>({
    name: user?.displayName || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    notes: "",
  });

  const currentStep = orderPlaced ? 2 : showStripeCheckout ? 1 : 0;
  const steps = [t("checkout.stepDelivery"), t("checkout.stepPayment"), t("checkout.stepConfirmation")];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError("");
    setIsSubmitting(true);
    setShowStripeCheckout(true);
    setIsSubmitting(false);
  };

  if (orderPlaced) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center py-20">
        <div className="mx-auto max-w-sm px-6 text-center animate-scale-in">
          <HiOutlineCheckCircle className="mx-auto mb-5 h-16 w-16 text-panka-green-500" />
          <div className="mb-6">
            <ol className="flex items-center justify-center gap-4">
              {steps.map((label, idx) => (
                <li key={label} className="flex items-center gap-2">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-bold ${
                      idx <= currentStep
                        ? "border-panka-green-200 bg-panka-green-50 text-panka-green-600"
                        : "border-grey-10 bg-white text-grey-40"
                    }`}
                  >
                    {idx < currentStep ? "✓" : idx + 1}
                  </span>
                </li>
              ))}
            </ol>
          </div>
          <h1 className="mb-2 font-heading text-3xl font-bold text-panka-brown-500">
            {t("checkout.orderConfirmed")}
          </h1>
          <p className="mb-8 text-base text-grey-50">
            {t("checkout.thankYou")} {form.name}. {t("checkout.confirmationEmail")}{" "}
            <strong className="text-grey-70">{form.email}</strong>.
          </p>
          <Link href="/" className="inline-block rounded-xl bg-panka-brown-500 px-8 py-3.5 text-base font-bold text-white transition-all hover:bg-panka-brown-600">
            {t("checkout.backHome")}
          </Link>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center py-20">
        <div className="mx-auto max-w-sm px-6 text-center">
          <div className="mb-3 text-5xl">🫔</div>
          <h1 className="mb-2 font-heading text-2xl font-bold text-panka-brown-500">{t("checkout.emptyCart")}</h1>
          <p className="mb-6 text-base text-grey-40">{t("checkout.emptyCartDesc")}</p>
          <Link href="/productos" className="inline-block rounded-xl bg-panka-brown-500 px-8 py-3.5 text-base font-bold text-white">
            {t("cart.browseTamales")}
          </Link>
        </div>
      </section>
    );
  }

  const inputClass =
    "w-full rounded-xl border border-grey-20 bg-grey-5 px-4 py-3.5 text-base text-grey-80 outline-none transition-all placeholder:text-grey-30 focus:border-panka-green-400 focus:ring-2 focus:ring-panka-green-50";

  return (
    <>
      <section className="border-b border-grey-10 bg-white pb-6 pt-10">
        <div className="mx-auto max-w-7xl px-6">
          <Link href="/productos" className="mb-3 inline-flex items-center gap-1.5 text-sm text-grey-40 transition-colors hover:text-grey-60">
            <HiArrowLeft className="h-4 w-4" />
            {t("checkout.continueShopping")}
          </Link>
          <h1 className="font-heading text-3xl font-bold text-panka-brown-500">{t("checkout.title")}</h1>
          <div className="mt-6">
            <ol className="flex flex-wrap items-center gap-4">
              {steps.map((label, idx) => (
                <li key={label} className="flex items-center gap-2">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-bold ${
                      idx <= currentStep
                        ? "border-panka-green-200 bg-panka-green-50 text-panka-green-600"
                        : "border-grey-10 bg-white text-grey-40"
                    }`}
                  >
                    {idx < currentStep ? "✓" : idx + 1}
                  </span>
                  <span
                    className={`text-sm font-semibold ${
                      idx <= currentStep ? "text-grey-80" : "text-grey-40"
                    }`}
                  >
                    {label}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-8 small:grid-cols-5">
            <form onSubmit={handleSubmit} className="small:col-span-3">
              <div className="rounded-2xl border border-grey-10 bg-white p-6 small:p-8">
                <h2 className="mb-6 text-lg font-bold text-grey-80">{t("checkout.deliveryDetails")}</h2>
                <div className="grid grid-cols-1 gap-4 xsmall:grid-cols-2">
                  <div className="xsmall:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-grey-50">{t("checkout.fullName")}</label>
                    <input type="text" name="name" value={form.name} onChange={handleChange} required className={inputClass} placeholder={t("checkout.namePlaceholder")} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-grey-50">{t("checkout.email")}</label>
                    <input type="email" name="email" value={form.email} onChange={handleChange} required className={inputClass} placeholder="email@example.com" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-grey-50">{t("checkout.phone")}</label>
                    <input type="tel" name="phone" value={form.phone} onChange={handleChange} required className={inputClass} placeholder="(305) 123-4567" />
                  </div>
                  <div className="xsmall:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-grey-50">{t("checkout.address")}</label>
                    <input type="text" name="address" value={form.address} onChange={handleChange} required className={inputClass} placeholder={t("checkout.addressPlaceholder")} />
                  </div>
                  <div className="xsmall:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-grey-50">{t("checkout.city")}</label>
                    <input type="text" name="city" value={form.city} onChange={handleChange} required className={inputClass} placeholder={t("checkout.cityPlaceholder")} />
                  </div>
                  <div className="xsmall:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-grey-50">{t("checkout.notes")}</label>
                    <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} className={`${inputClass} resize-none`} placeholder={t("checkout.notesPlaceholder")} />
                  </div>
                </div>
                {!showStripeCheckout && (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-6 w-full rounded-xl bg-panka-brown-500 py-4 text-base font-bold text-white transition-all hover:bg-panka-brown-600 hover:shadow-panka-md disabled:opacity-50"
                  >
                    {isSubmitting ? t("checkout.processing") : `${t("checkout.confirmOrder")} — $${totalPrice.toFixed(2)}`}
                  </button>
                )}
                {checkoutError && (
                  <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {checkoutError}
                  </p>
                )}
                {showStripeCheckout && (
                  <div className="mt-6">
                    <StripeEmbeddedCheckout
                      items={items}
                      customer={form}
                      onComplete={() => {
                        clearCart();
                        setOrderPlaced(true);
                      }}
                      onError={(message) => setCheckoutError(message)}
                    />
                  </div>
                )}
              </div>
            </form>

            <div className="small:col-span-2">
              <div className="sticky top-24 rounded-2xl border border-grey-10 bg-white p-6">
                <h2 className="mb-5 text-lg font-bold text-grey-80">{t("checkout.orderSummary")}</h2>
                <ul className="mb-5 flex flex-col gap-3">
                  {items.map((item) => (
                    <li key={item.product.id} className="flex gap-3">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                        <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
                      </div>
                      <div className="flex flex-1 items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-grey-70 leading-tight">{item.product.name}</p>
                          <p className="text-xs text-grey-30">x{item.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold text-grey-70">${(item.product.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-grey-10 pt-4">
                  <div className="mb-1.5 flex justify-between text-sm text-grey-40">
                    <span>{t("checkout.subtotal")}</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="mb-1.5 flex justify-between text-sm text-grey-40">
                    <span>{t("checkout.shipping")}</span>
                    <span className="text-panka-green-600">{t("checkout.free")}</span>
                  </div>
                  <div className="mt-3 flex justify-between border-t border-grey-10 pt-3">
                    <span className="text-base font-bold text-grey-80">{t("checkout.total")}</span>
                    <span className="text-base font-bold text-grey-80">${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
