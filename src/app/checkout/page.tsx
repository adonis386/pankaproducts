"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useSettings } from "@/context/SettingsContext";
import { CustomerInfo } from "@/lib/types";
import { HiArrowLeft, HiOutlineCheckCircle, HiOutlineTruck } from "react-icons/hi";
import { FaWhatsapp } from "react-icons/fa";
import StripeEmbeddedCheckout from "@/components/StripeEmbeddedCheckout";
import { getProductImageAlt } from "@/lib/product-alt";
import {
  US_STATES,
  lookupUsZipCode,
  detectCountyByCity,
  detectCountyByZip,
  type FloridaCountyOption,
} from "@/lib/us-shipping";

export default function CheckoutPage() {
  const {
    items,
    totalPrice,
    clearCart,
    shippingLocation,
    setShippingLocation,
    shippingFee,
    isFreeShipping,
    grandTotal,
  } = useCart();
  const { user } = useAuth();
  const { t, locale } = useLanguage();
  const { settings } = useSettings();
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [checkoutError, setCheckoutError] = useState("");
  const [zipLoading, setZipLoading] = useState(false);
  const [zipAutoMessage, setZipAutoMessage] = useState("");

  const [form, setForm] = useState<CustomerInfo>({
    name: user?.displayName || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: shippingLocation.city || "",
    state: shippingLocation.state || "FL",
    county: shippingLocation.county || "Miami-Dade County",
    zip: shippingLocation.zip || "",
    notes: "",
  });

  // Sync user name/email when auth loads
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || user.displayName || "",
        email: prev.email || user.email || "",
      }));
    }
  }, [user]);

  // Keep local form state aligned with CartContext shippingLocation
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      state: shippingLocation.state,
      county: shippingLocation.county,
      zip: prev.zip || shippingLocation.zip,
      city: prev.city || shippingLocation.city,
    }));
  }, [shippingLocation.state, shippingLocation.county, shippingLocation.zip, shippingLocation.city]);

  const showStripeCheckout = Boolean(clientSecret && sessionId);
  const currentStep = showStripeCheckout ? 1 : 0;
  const steps = [
    t("checkout.stepDelivery"),
    t("checkout.stepPayment"),
    t("checkout.stepConfirmation"),
  ];

  const resetStripeSessionIfOpen = () => {
    if (clientSecret || sessionId) {
      setClientSecret("");
      setSessionId("");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    resetStripeSessionIfOpen();
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "city") {
      const detected =
        shippingLocation.state === "FL" ? detectCountyByCity(value) : null;
      if (detected) {
        setShippingLocation({ city: value, county: detected });
      } else {
        setShippingLocation({ city: value });
      }
    }
  };

  const handleStateChange = (nextState: string) => {
    resetStripeSessionIfOpen();
    const nextCounty: FloridaCountyOption =
      nextState === "FL" ? "Miami-Dade County" : "Other County";
    setForm((prev) => ({ ...prev, state: nextState, county: nextCounty }));
    setShippingLocation({ state: nextState, county: nextCounty });
    setZipAutoMessage("");
  };

  const handleCountyChange = (nextCounty: FloridaCountyOption) => {
    resetStripeSessionIfOpen();
    setForm((prev) => ({ ...prev, county: nextCounty }));
    setShippingLocation({ county: nextCounty });
  };

  const handleZipChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 5);
    resetStripeSessionIfOpen();
    setForm((prev) => ({ ...prev, zip: raw }));
    setShippingLocation({ zip: raw });
    setZipAutoMessage("");

    if (raw.length === 5) {
      // Immediate local check for Miami-Dade / Broward ZIPs
      const localCounty = detectCountyByZip(raw);
      if (localCounty) {
        setForm((prev) => ({ ...prev, state: "FL", county: localCounty }));
        setShippingLocation({ state: "FL", county: localCounty, zip: raw });
      }

      setZipLoading(true);
      const info = await lookupUsZipCode(raw);
      setZipLoading(false);

      if (info) {
        const resolvedCounty: FloridaCountyOption =
          info.stateCode === "FL"
            ? info.county || localCounty || "Other County"
            : "Other County";

        setForm((prev) => ({
          ...prev,
          city: info.city || prev.city,
          state: info.stateCode || prev.state,
          county: resolvedCounty,
          zip: raw,
        }));
        setShippingLocation({
          city: info.city,
          state: info.stateCode,
          county: resolvedCounty,
          zip: raw,
        });
        setZipAutoMessage(
          `${info.city}, ${info.stateCode}${
            info.stateCode === "FL" ? ` • ${resolvedCounty}` : ""
          }`
        );
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError("");
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/stripe/embedded-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
          customer: {
            ...form,
            state: shippingLocation.state,
            county: shippingLocation.county,
            zip: form.zip || shippingLocation.zip,
            city: form.city || shippingLocation.city,
          },
          firebaseUid: user?.uid || "",
        }),
      });
      const data = (await response.json()) as {
        clientSecret?: string;
        sessionId?: string;
        error?: string;
      };
      if (!response.ok || !data.clientSecret || !data.sessionId) {
        throw new Error(data.error || "Unable to initialize Stripe checkout.");
      }
      setClientSecret(data.clientSecret);
      setSessionId(data.sessionId);
    } catch (err) {
      setCheckoutError(
        err instanceof Error ? err.message : "Unable to initialize Stripe checkout."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center py-20">
        <div className="mx-auto max-w-sm px-6 text-center">
          <div className="mb-3 text-5xl">🫔</div>
          <h1 className="mb-2 font-heading text-2xl font-bold text-panka-brown-500">
            {t("checkout.emptyCart")}
          </h1>
          <p className="mb-6 text-base text-grey-40">{t("checkout.emptyCartDesc")}</p>
          <Link
            href="/productos"
            className="inline-block rounded-xl bg-panka-brown-500 px-8 py-3.5 text-base font-bold text-white"
          >
            {t("cart.browseTamales")}
          </Link>
        </div>
      </section>
    );
  }

  const selectedStateObj =
    US_STATES.find((s) => s.code === shippingLocation.state) || US_STATES[0];
  const isFlorida = shippingLocation.state === "FL";

  const whatsappCheckoutMessage =
    locale === "es"
      ? `¡Hola Panka! Quisiera confirmar el siguiente pedido:\n\n` +
        `👤 *DATOS DEL CLIENTE:*\n` +
        `• Nombre: ${form.name || "—"}\n` +
        `• Teléfono: ${form.phone || "—"}\n` +
        `• Email: ${form.email || "—"}\n` +
        `• Dirección: ${form.address || "—"}\n` +
        `• Ciudad: ${form.city || "—"}\n` +
        `• Estado: ${selectedStateObj.name} (${selectedStateObj.code})\n` +
        (isFlorida ? `• Condado: ${shippingLocation.county}\n` : "") +
        `• ZIP Code: ${form.zip || "—"}\n` +
        (form.notes ? `• Notas: ${form.notes}\n` : "") +
        `\n📦 *PRODUCTOS:*\n` +
        items
          .map(
            (i) =>
              `• ${i.quantity}x ${i.product.name} — $${(
                i.product.price * i.quantity
              ).toFixed(2)}`
          )
          .join("\n") +
        `\n\n💳 *RESUMEN DE PAGO:*\n` +
        `• Subtotal: $${totalPrice.toFixed(2)}\n` +
        `• Envío (Shipping Rate): ${
          isFreeShipping
            ? "GRATIS ($0.00 — Miami-Dade / Broward)"
            : `$${shippingFee.toFixed(2)}`
        }\n` +
        `• *TOTAL FINAL: $${grandTotal.toFixed(2)}*`
      : `Hello Panka! I would like to confirm the following order:\n\n` +
        `👤 *CUSTOMER DETAILS:*\n` +
        `• Name: ${form.name || "—"}\n` +
        `• Phone: ${form.phone || "—"}\n` +
        `• Email: ${form.email || "—"}\n` +
        `• Address: ${form.address || "—"}\n` +
        `• City: ${form.city || "—"}\n` +
        `• State: ${selectedStateObj.name} (${selectedStateObj.code})\n` +
        (isFlorida ? `• County: ${shippingLocation.county}\n` : "") +
        `• ZIP Code: ${form.zip || "—"}\n` +
        (form.notes ? `• Notes: ${form.notes}\n` : "") +
        `\n📦 *ITEMS:*\n` +
        items
          .map(
            (i) =>
              `• ${i.quantity}x ${i.product.name} — $${(
                i.product.price * i.quantity
              ).toFixed(2)}`
          )
          .join("\n") +
        `\n\n💳 *PAYMENT SUMMARY:*\n` +
        `• Subtotal: $${totalPrice.toFixed(2)}\n` +
        `• Shipping Rate: ${
          isFreeShipping
            ? "FREE ($0.00 — Miami-Dade / Broward)"
            : `$${shippingFee.toFixed(2)}`
        }\n` +
        `• *GRAND TOTAL: $${grandTotal.toFixed(2)}*`;

  const inputClass =
    "w-full rounded-xl border-0 bg-surface-container-highest px-4 py-3.5 text-base text-on-surface outline-none transition-all placeholder:text-tertiary/60 focus:ring-2 focus:ring-primary/15";

  return (
    <>
      <section className="bg-surface pb-8 pt-14">
        <div className="mx-auto max-w-7xl px-6">
          <Link
            href="/productos"
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-secondary/70 transition-colors hover:text-secondary"
          >
            <HiArrowLeft className="h-4 w-4" />
            {t("checkout.continueShopping")}
          </Link>
          <h1 className="font-heading text-5xl font-bold text-on-surface">
            {t("checkout.title")}
          </h1>
          <div className="mt-6">
            <ol className="flex flex-wrap items-center gap-4">
              {steps.map((label, idx) => (
                <li key={label} className="flex items-center gap-2">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-bold ${
                      idx <= currentStep
                        ? "border-primary/15 bg-secondary-container/25 text-primary"
                        : "border-outline-variant/20 bg-surface-container-lowest text-tertiary"
                    }`}
                  >
                    {idx < currentStep ? "✓" : idx + 1}
                  </span>
                  <span
                    className={`text-sm font-semibold ${
                      idx <= currentStep ? "text-on-surface" : "text-tertiary"
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
              <div className="rounded-3xl bg-surface-container-low p-6 shadow-[var(--shadow-editorial)] small:p-8">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="font-heading text-3xl font-bold text-on-surface">
                    {t("checkout.deliveryDetails")}
                  </h2>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold ${
                      isFreeShipping
                        ? "bg-emerald-500/15 text-emerald-700"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    <HiOutlineTruck className="h-4 w-4" />
                    {isFreeShipping
                      ? locale === "es"
                        ? "Delivery Gratis (Miami-Dade / Broward)"
                        : "Free Delivery (Miami-Dade / Broward)"
                      : locale === "es"
                      ? "Shipping Rate: $25.00"
                      : "Shipping Rate: $25.00"}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 xsmall:grid-cols-2">
                  <div className="xsmall:col-span-2">
                    <label className="mb-1.5 block text-sm font-semibold uppercase tracking-widest text-secondary/80">
                      {t("checkout.fullName")}
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className={inputClass}
                      placeholder={t("checkout.namePlaceholder")}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold uppercase tracking-widest text-secondary/80">
                      {t("checkout.email")}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className={inputClass}
                      placeholder="email@example.com"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold uppercase tracking-widest text-secondary/80">
                      {t("checkout.phone")}
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      required
                      className={inputClass}
                      placeholder="(305) 123-4567"
                    />
                  </div>

                  <div className="xsmall:col-span-2">
                    <label className="mb-1.5 block text-sm font-semibold uppercase tracking-widest text-secondary/80">
                      {t("checkout.address")}
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      required
                      className={inputClass}
                      placeholder={t("checkout.addressPlaceholder")}
                    />
                  </div>

                  {/* ZIP Code with automatic US API lookup */}
                  <div>
                    <label className="mb-1.5 flex items-center justify-between text-sm font-semibold uppercase tracking-widest text-secondary/80">
                      <span>ZIP Code</span>
                      {zipLoading && (
                        <span className="text-[10px] font-normal lowercase text-primary">
                          {locale === "es" ? "buscando..." : "looking up..."}
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      name="zip"
                      value={form.zip || ""}
                      onChange={handleZipChange}
                      required
                      maxLength={5}
                      className={inputClass}
                      placeholder="33101"
                    />
                    {zipAutoMessage && (
                      <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-emerald-700">
                        <HiOutlineCheckCircle className="h-3.5 w-3.5 shrink-0" />
                        {zipAutoMessage}
                      </p>
                    )}
                  </div>

                  {/* US State Selector (all 50 States + DC) */}
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold uppercase tracking-widest text-secondary/80">
                      {locale === "es" ? "Estado (EE. UU.)" : "US State"}
                    </label>
                    <select
                      name="state"
                      value={shippingLocation.state}
                      onChange={(e) => handleStateChange(e.target.value)}
                      className={inputClass}
                    >
                      {US_STATES.map((st) => (
                        <option key={st.code} value={st.code}>
                          {st.code} — {st.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* County Selector (shown when State is Florida) */}
                  {isFlorida && (
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold uppercase tracking-widest text-secondary/80">
                        {locale === "es" ? "Condado (Florida)" : "County (Florida)"}
                      </label>
                      <select
                        name="county"
                        value={shippingLocation.county}
                        onChange={(e) =>
                          handleCountyChange(e.target.value as FloridaCountyOption)
                        }
                        className={inputClass}
                      >
                        <option value="Miami-Dade County">
                          Miami-Dade County — {locale === "es" ? "Envío Gratis ($0.00)" : "Free ($0.00)"}
                        </option>
                        <option value="Broward County">
                          Broward County — {locale === "es" ? "Envío Gratis ($0.00)" : "Free ($0.00)"}
                        </option>
                        <option value="Other County">
                          {locale === "es"
                            ? "Otro Condado en Florida ($25.00)"
                            : "Other Florida County ($25.00)"}
                        </option>
                      </select>
                    </div>
                  )}

                  {/* City */}
                  <div className={isFlorida ? "" : "xsmall:col-span-2"}>
                    <label className="mb-1.5 block text-sm font-semibold uppercase tracking-widest text-secondary/80">
                      {t("checkout.city")}
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      required
                      className={inputClass}
                      placeholder={t("checkout.cityPlaceholder")}
                    />
                  </div>

                  <div className="xsmall:col-span-2">
                    <label className="mb-1.5 block text-sm font-semibold uppercase tracking-widest text-secondary/80">
                      {t("checkout.notes")}
                    </label>
                    <textarea
                      name="notes"
                      value={form.notes}
                      onChange={handleChange}
                      rows={3}
                      className={`${inputClass} resize-none`}
                      placeholder={t("checkout.notesPlaceholder")}
                    />
                  </div>
                </div>

                {!showStripeCheckout && (
                  <div className="mt-6 flex flex-col gap-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full rounded-xl bg-gradient-to-br from-primary to-primary-container py-4 text-base font-bold text-on-primary shadow-[var(--shadow-editorial)] transition-all hover:brightness-[1.02] disabled:opacity-50"
                    >
                      {isSubmitting
                        ? t("checkout.processing")
                        : `${t("checkout.confirmOrder")} — $${grandTotal.toFixed(2)}`}
                    </button>

                    <a
                      href={`https://wa.me/${(
                        settings.contact.whatsapp || "19549014340"
                      ).replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                        whatsappCheckoutMessage
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-600/30 bg-emerald-50/90 py-3.5 text-sm font-bold text-emerald-800 transition-all hover:bg-emerald-100 active:scale-[0.99]"
                    >
                      <FaWhatsapp className="h-5 w-5 text-emerald-600" />
                      {locale === "es"
                        ? `Transferir Pedido a WhatsApp ($${grandTotal.toFixed(2)})`
                        : `Send Complete Order via WhatsApp ($${grandTotal.toFixed(2)})`}
                    </a>
                  </div>
                )}

                {checkoutError && (
                  <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {checkoutError}
                  </p>
                )}

                {showStripeCheckout && (
                  <div className="mt-6">
                    <StripeEmbeddedCheckout
                      clientSecret={clientSecret}
                      onComplete={() => {
                        clearCart();
                        router.push(
                          `/pedido-exitoso?session_id=${encodeURIComponent(sessionId)}`
                        );
                      }}
                    />
                  </div>
                )}
              </div>
            </form>

            <div className="small:col-span-2">
              <div className="sticky top-24 rounded-3xl bg-surface-container-low p-6 shadow-[var(--shadow-editorial)]">
                <h2 className="mb-5 font-heading text-2xl font-bold text-on-surface">
                  {t("checkout.orderSummary")}
                </h2>
                <ul className="mb-5 flex flex-col gap-3">
                  {items.map((item) => (
                    <li key={item.product.id} className="flex gap-3">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                        <Image
                          src={item.product.image}
                          alt={getProductImageAlt(item.product, locale)}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-1 items-center justify-between">
                        <div>
                          <p className="text-sm font-medium leading-tight text-on-surface">
                            {item.product.name}
                          </p>
                          <p className="text-xs text-tertiary">x{item.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold text-on-surface">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="border-t border-outline-variant/10 pt-4">
                  <div className="mb-2 flex justify-between text-sm text-tertiary">
                    <span>{t("checkout.subtotal")}</span>
                    <span className="font-medium text-on-surface">
                      ${totalPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="mb-2 flex items-center justify-between text-sm text-tertiary">
                    <div>
                      <span>{t("checkout.shipping")}</span>
                      <p className="text-[11px] text-tertiary/80">
                        {isFlorida
                          ? shippingLocation.county
                          : `${selectedStateObj.name} (${selectedStateObj.code})`}
                      </p>
                    </div>
                    <span
                      className={`font-bold ${
                        isFreeShipping ? "text-emerald-700" : "text-on-surface"
                      }`}
                    >
                      {isFreeShipping ? t("checkout.free") : `$${shippingFee.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="mt-3 flex justify-between border-t border-outline-variant/10 pt-3">
                    <span className="text-base font-bold text-on-surface">
                      {t("checkout.total")}
                    </span>
                    <span className="font-heading text-xl font-bold text-primary">
                      ${grandTotal.toFixed(2)}
                    </span>
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
