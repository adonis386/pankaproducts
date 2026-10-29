"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  HiOutlineCheckCircle,
  HiOutlinePrinter,
  HiOutlineBell,
  HiOutlineUser,
} from "react-icons/hi";
import { FaWhatsapp } from "react-icons/fa";
import { useLanguage } from "@/context/LanguageContext";
import { useSettings } from "@/context/SettingsContext";

type SuccessOrder = {
  id: string;
  status: string;
  currency: string;
  total: number;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    notes?: string;
  };
  items: { name: string; quantity: number; unitAmount: number; currency: string }[];
};

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount);
  } catch {
    return `$${amount.toFixed(2)}`;
  }
}

export default function PedidoExitosoClient() {
  const { t, locale } = useLanguage();
  const { settings } = useSettings();
  const sp = useSearchParams();
  const sessionId = sp.get("session_id") || "";

  const [order, setOrder] = useState<SuccessOrder | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [notifPerm, setNotifPerm] = useState<NotificationPermission | "unsupported">("default");
  const notifiedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setNotifPerm("unsupported");
      return;
    }
    setNotifPerm(Notification.permission);
  }, []);

  const endpoint = useMemo(() => {
    if (!sessionId) return "";
    return `/api/orders/by-session?session_id=${encodeURIComponent(sessionId)}`;
  }, [sessionId]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!endpoint) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError("");
      const maxAttempts = 5;
      try {
        for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
          const res = await fetch(endpoint, { cache: "no-store" });
          const data = (await res.json()) as SuccessOrder & { error?: string };
          if (res.ok && data.id) {
            if (!cancelled) setOrder(data);
            return;
          }
          if (attempt < maxAttempts - 1) {
            await new Promise((resolve) => window.setTimeout(resolve, 1200));
          } else {
            throw new Error(data.error || "Order not found.");
          }
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load order.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [endpoint]);

  // Fire browser notification when order loads if permission is granted
  useEffect(() => {
    if (!order || notifiedRef.current) return;
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      notifiedRef.current = true;
      try {
        new Notification(
          locale === "es"
            ? "🫔 ¡Pedido Confirmado en Panka Products!"
            : "🫔 Order Confirmed at Panka Products!",
          {
            body:
              locale === "es"
                ? `Recibimos tu orden #${order.id.slice(-8).toUpperCase()} por ${formatMoney(order.total, order.currency)}.`
                : `We received your order #${order.id.slice(-8).toUpperCase()} for ${formatMoney(order.total, order.currency)}.`,
            icon: "/assets/ICON.png",
          }
        );
      } catch {
        // Ignore browser notification errors on mobile webviews
      }
    }
  }, [order, locale]);

  const handleEnableBrowserNotif = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    const perm = await Notification.requestPermission();
    setNotifPerm(perm);
    if (perm === "granted" && order) {
      notifiedRef.current = true;
      try {
        new Notification(
          locale === "es"
            ? "🔔 Notificaciones Activadas — Panka Products"
            : "🔔 Notifications Enabled — Panka Products",
          {
            body:
              locale === "es"
                ? `Tu pedido #${order.id.slice(-8).toUpperCase()} está confirmado en cocina.`
                : `Your order #${order.id.slice(-8).toUpperCase()} is confirmed in our kitchen.`,
            icon: "/assets/ICON.png",
          }
        );
      } catch {
        // ignore
      }
    }
  };

  const whatsappUrl = useMemo(() => {
    if (!order) return "";
    const phone = (settings.contact.whatsapp || "19549014340").replace(/[^0-9]/g, "");
    const shortId = order.id.slice(-8).toUpperCase();
    const itemsList = order.items
      .map(
        (it) =>
          `• ${it.quantity}x ${it.name} (${formatMoney(
            it.unitAmount * it.quantity,
            it.currency
          )})`
      )
      .join("\n");

    const text =
      `✅ *PAID WEB ORDER — PANKA PRODUCTS*\n\n` +
      `🧾 *Order:* #${shortId}\n` +
      `👤 *Customer:* ${order.customer.name}\n` +
      `📞 *Phone:* ${order.customer.phone || "—"}\n` +
      `📍 *Delivery Address:* ${order.customer.address}${
        order.customer.city ? `, ${order.customer.city}` : ""
      }\n` +
      (order.customer.notes ? `📝 *Notes:* ${order.customer.notes}\n` : "") +
      `\n🫔 *ITEMS:*\n${itemsList}\n\n` +
      `💳 *TOTAL PAID (STRIPE): ${formatMoney(order.total, order.currency)}*`;

    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  }, [order, settings.contact.whatsapp]);

  return (
    <section className="bg-surface pb-20 pt-14">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-8 flex flex-col items-start justify-between gap-6 small:flex-row small:items-center">
          <div className="flex items-start gap-4">
            <HiOutlineCheckCircle className="mt-1 h-10 w-10 shrink-0 text-emerald-600" aria-hidden />
            <div>
              <h1 className="font-heading text-4xl font-bold tracking-tight text-on-surface">
                {t("success.title")}
              </h1>
              <p className="mt-2 text-tertiary">{t("success.subtitle")}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-xl bg-surface-container-high px-4 py-2.5 text-xs font-bold text-on-surface transition-colors hover:bg-surface-variant"
            >
              <HiOutlinePrinter className="h-4 w-4" aria-hidden />
              {t("success.print")}
            </button>
            <Link
              href="/cuenta"
              className="inline-flex items-center gap-2 rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-2.5 text-xs font-bold text-on-surface transition-colors hover:bg-surface-container"
            >
              <HiOutlineUser className="h-4 w-4" aria-hidden />
              {locale === "es" ? "Ver en Mi Cuenta" : "My Account"}
            </Link>
            <Link
              href="/productos"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-on-primary transition-all hover:bg-primary-container"
            >
              {t("success.backToMenu")}
            </Link>
          </div>
        </div>

        {!sessionId && (
          <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-6 text-tertiary">
            {t("success.missingSession")}
          </div>
        )}

        {sessionId && loading && (
          <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-6 text-tertiary">
            {t("success.loading")}
          </div>
        )}

        {sessionId && !loading && error && (
          <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-6">
            <p className="text-tertiary">{t("success.notFound")}</p>
            <p className="mt-2 text-xs text-on-surface-variant">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 rounded-xl bg-surface-container-high px-5 py-3 text-sm font-bold text-on-surface hover:bg-surface-variant"
            >
              Refresh
            </button>
          </div>
        )}

        {order && (
          <div className="space-y-6">
            {/* WhatsApp + Browser Notification Action Banner */}
            <div className="rounded-[2rem] border border-emerald-500/30 bg-emerald-50/70 p-6 shadow-sm">
              <div className="flex flex-col gap-4 small:flex-row small:items-center small:justify-between">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600/15 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                    <FaWhatsapp className="h-3.5 w-3.5 text-emerald-600" />
                    {locale === "es" ? "Atención Directa por WhatsApp" : "Direct WhatsApp Dispatch"}
                  </span>
                  <h2 className="mt-2 font-heading text-2xl font-bold text-emerald-950">
                    {locale === "es"
                      ? "¿Deseas agilizar tu entrega por WhatsApp?"
                      : "Want to speed up your delivery via WhatsApp?"}
                  </h2>
                  <p className="mt-1 text-xs text-emerald-800/90">
                    {locale === "es"
                      ? "Envía tu comprobante pagado directo al WhatsApp de nuestra cocina con un solo clic."
                      : "Send your paid order receipt directly to our kitchen's WhatsApp with one click."}
                  </p>
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700 active:scale-[0.98]"
                  >
                    <FaWhatsapp className="h-5 w-5" />
                    {locale === "es"
                      ? "Enviar Orden Pagada por WhatsApp"
                      : "Send Paid Order via WhatsApp"}
                  </a>

                  {notifPerm === "default" && (
                    <button
                      type="button"
                      onClick={() => void handleEnableBrowserNotif()}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-600/30 bg-white/80 px-4 py-2 text-xs font-bold text-emerald-900 transition-colors hover:bg-white"
                    >
                      <HiOutlineBell className="h-4 w-4 text-emerald-700" />
                      {locale === "es"
                        ? "Activar notificaciones del navegador"
                        : "Enable browser notifications"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-outline-variant/20 bg-surface-container-lowest p-8 shadow-sm">
              <div className="flex flex-col gap-3 small:flex-row small:items-center small:justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-tertiary">
                    {t("success.orderId")}
                  </p>
                  <p className="mt-1 font-mono text-sm text-on-surface-variant">{order.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-tertiary">
                    {t("success.total")}
                  </p>
                  <p className="mt-1 font-heading text-3xl font-bold text-primary">
                    {formatMoney(order.total, order.currency)}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 small:grid-cols-2">
              <div className="rounded-[2rem] border border-outline-variant/20 bg-surface-container-lowest p-8 shadow-sm">
                <h2 className="mb-4 font-heading text-2xl font-bold text-on-surface">
                  {t("success.deliveryTo")}
                </h2>
                <div className="space-y-2 text-sm text-tertiary">
                  <p className="font-semibold text-on-surface">{order.customer.name}</p>
                  <p>{order.customer.email}</p>
                  {order.customer.phone ? <p>{order.customer.phone}</p> : null}
                  <p>
                    {order.customer.address}
                    {order.customer.city ? `, ${order.customer.city}` : ""}
                  </p>
                  {order.customer.notes ? (
                    <p className="pt-2 text-on-surface-variant">{order.customer.notes}</p>
                  ) : null}
                </div>
              </div>

              <div className="rounded-[2rem] border border-outline-variant/20 bg-surface-container-lowest p-8 shadow-sm">
                <h2 className="mb-4 font-heading text-2xl font-bold text-on-surface">
                  {t("success.items")}
                </h2>
                <ul className="space-y-3">
                  {order.items.map((it, idx) => (
                    <li key={`${it.name}-${idx}`} className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-on-surface">{it.name}</p>
                        <p className="text-xs text-tertiary">x{it.quantity}</p>
                      </div>
                      <p className="shrink-0 text-sm font-bold text-on-surface">
                        {formatMoney(it.unitAmount * it.quantity, it.currency)}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
