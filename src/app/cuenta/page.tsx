"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  HiOutlineUser,
  HiOutlineLogout,
  HiOutlineShoppingBag,
  HiOutlineDocumentText,
  HiOutlinePrinter,
  HiOutlineTruck,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineX,
  HiOutlineLocationMarker,
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineArrowRight,
  HiOutlineRefresh,
} from "react-icons/hi";
import { FaWhatsapp } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useSettings } from "@/context/SettingsContext";
import { auth } from "@/lib/firebase";
import type { PublicOrder, KitchenStatus } from "@/lib/order-types";
import AuthModal from "@/components/AuthModal";

function formatMoney(amount: number, currency = "usd") {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount);
  } catch {
    return `$${amount.toFixed(2)}`;
  }
}

function getStatusBadge(status: KitchenStatus, locale: "es" | "en") {
  switch (status) {
    case "confirmed":
      return {
        label: locale === "es" ? "Confirmado" : "Confirmed",
        bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: <HiOutlineCheckCircle className="h-4 w-4 text-emerald-600" />,
      };
    case "preparing":
      return {
        label: locale === "es" ? "En Preparación" : "In the Kitchen",
        bg: "bg-amber-50 text-amber-700 border-amber-200",
        icon: <HiOutlineClock className="h-4 w-4 text-amber-600" />,
      };
    case "delivered":
      return {
        label: locale === "es" ? "Entregado" : "Delivered",
        bg: "bg-blue-50 text-blue-700 border-blue-200",
        icon: <HiOutlineTruck className="h-4 w-4 text-blue-600" />,
      };
    case "cancelled":
      return {
        label: locale === "es" ? "Cancelado" : "Cancelled",
        bg: "bg-rose-50 text-rose-700 border-rose-200",
        icon: <HiOutlineX className="h-4 w-4 text-rose-600" />,
      };
    case "failed":
      return {
        label: locale === "es" ? "Pago Fallido" : "Failed",
        bg: "bg-rose-50 text-rose-700 border-rose-200",
        icon: <HiOutlineX className="h-4 w-4 text-rose-600" />,
      };
    case "pending":
    default:
      return {
        label: locale === "es" ? "Pendiente" : "Pending",
        bg: "bg-yellow-50 text-yellow-700 border-yellow-200",
        icon: <HiOutlineClock className="h-4 w-4 text-yellow-600" />,
      };
  }
}

export default function CuentaPage() {
  const { user, logout, loading: authLoading } = useAuth();
  const { t, locale } = useLanguage();
  const { settings } = useSettings();

  const [orders, setOrders] = useState<PublicOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<PublicOrder | null>(null);

  const whatsappPhone = (settings.contact.whatsapp || "19549014340").replace(/[^0-9]/g, "");

  const loadOrders = async () => {
    if (!user) {
      setOrders([]);
      return;
    }
    setOrdersLoading(true);
    setOrdersError("");
    try {
      if (!auth?.currentUser) throw new Error("No authenticated user.");
      const token = await auth.currentUser.getIdToken();
      const res = await fetch("/api/orders/mine", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await res.json()) as { orders?: PublicOrder[]; error?: string };
      if (!res.ok) throw new Error(data.error || "Failed to load orders.");
      setOrders(Array.isArray(data.orders) ? data.orders : []);
    } catch (e) {
      setOrdersError(
        e instanceof Error
          ? e.message
          : locale === "es"
          ? "No se pudieron cargar los pedidos."
          : "Failed to load orders."
      );
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    void loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  const totalSpent = useMemo(() => {
    return orders
      .filter((o) => o.status !== "cancelled" && o.status !== "failed")
      .reduce((sum, o) => sum + (o.total || 0), 0);
  }, [orders]);

  // Loading state
  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-surface">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-outline-variant border-t-primary" />
        <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-tertiary">
          {locale === "es" ? "Cargando perfil..." : "Loading profile..."}
        </p>
      </div>
    );
  }

  // Unauthenticated customer state
  if (!user) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center px-6 py-20 bg-surface">
        <div className="mx-auto w-full max-w-md rounded-3xl border border-outline-variant/20 bg-surface-container-lowest p-8 text-center shadow-editorial-lg">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <HiOutlineUser className="h-8 w-8" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
            {locale === "es" ? "Portal de Clientes" : "Customer Portal"}
          </p>
          <h1 className="mt-1 font-heading text-2xl font-bold text-on-surface">
            {t("account.signInRequired")}
          </h1>
          <p className="mt-3 text-sm text-tertiary leading-relaxed">
            {locale === "es"
              ? "Inicia sesión para revisar tu historial de compras, hacer seguimiento a tus pedidos y descargar tus recibos oficiales."
              : t("account.signInDesc")}
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-on-primary shadow-md shadow-primary/20 transition-all hover:bg-primary/90 active:scale-[0.99]"
            >
              {t("account.loginOrRegister")}
            </button>
            <Link
              href="/productos"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-outline-variant/30 py-3 text-xs font-bold text-on-surface hover:bg-surface-container-low transition-colors"
            >
              {t("cart.browseTamales")}
            </Link>
          </div>
        </div>
        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      </section>
    );
  }

  return (
    <>
      {/* ── Header Perfil ── */}
      <section className="border-b border-outline-variant/15 bg-surface-container-lowest pb-10 pt-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary-container text-2xl font-bold text-on-secondary-container shadow-sm">
                {user.displayName?.[0] || user.email?.[0]?.toUpperCase() || "C"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                    {t("account.memberSince")}
                  </span>
                </div>
                <h1 className="font-heading text-3xl font-bold tracking-tight text-on-surface">
                  {t("account.hi")} {user.displayName || user.email?.split("@")[0]}
                </h1>
                <p className="text-xs text-tertiary mt-0.5">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Link
                href="/productos"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-on-primary shadow-sm hover:bg-primary/90 transition-all"
              >
                <HiOutlineShoppingBag className="h-4 w-4" />
                {locale === "es" ? "Pedir Tamales" : "Order Tamales"}
              </Link>
              <button
                type="button"
                onClick={() => void logout()}
                className="inline-flex items-center gap-1.5 rounded-xl border border-outline-variant/30 bg-surface px-3.5 py-2.5 text-xs font-bold text-tertiary transition-colors hover:bg-surface-container hover:text-on-surface"
              >
                <HiOutlineLogout className="h-4 w-4" />
                {t("nav.signOut")}
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-outline-variant/20 bg-surface p-5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-tertiary">
                {t("account.ordersCount")}
              </p>
              <p className="mt-2 font-heading text-3xl font-bold text-on-surface">
                {orders.length}
              </p>
              <p className="text-xs text-tertiary mt-1">
                {locale === "es" ? "Compras completadas en Panka" : "Completed purchases"}
              </p>
            </div>

            <div className="rounded-2xl border border-outline-variant/20 bg-surface p-5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-tertiary">
                {t("account.totalSpent")}
              </p>
              <p className="mt-2 font-heading text-3xl font-bold text-primary">
                {formatMoney(totalSpent, "usd")}
              </p>
              <p className="text-xs text-tertiary mt-1">
                {locale === "es" ? "Invertido en sabor artesanal" : "Invested in artisan flavor"}
              </p>
            </div>

            <div className="rounded-2xl border border-outline-variant/20 bg-surface p-5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-tertiary">
                {t("account.lastOrder")}
              </p>
              <div className="mt-2 flex items-center gap-2">
                {orders.length > 0 ? (
                  (() => {
                    const badge = getStatusBadge(orders[0].status, locale);
                    return (
                      <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold ${badge.bg}`}>
                        {badge.icon}
                        {badge.label}
                      </span>
                    );
                  })()
                ) : (
                  <span className="text-sm font-medium text-tertiary">
                    {locale === "es" ? "Sin pedidos aún" : "No orders yet"}
                  </span>
                )}
              </div>
              <p className="text-xs text-tertiary mt-2">
                {orders[0]?.createdAt
                  ? new Date(orders[0].createdAt).toLocaleDateString(locale, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : locale === "es"
                  ? "Listo para tu primera orden"
                  : "Ready for your first order"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Content: Orders & Receipts ── */}
      <section className="py-12 bg-surface">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-heading text-2xl font-bold text-on-surface">
                {t("account.myOrders")}
              </h2>
              <p className="text-xs text-tertiary mt-1">
                {locale === "es"
                  ? "Consulta el desglose de tus pedidos, estados de entrega y recibos digitales descargables."
                  : "View order breakdowns, kitchen statuses and digital receipts."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void loadOrders()}
              disabled={ordersLoading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-outline-variant/30 px-3 py-2 text-xs font-bold text-tertiary hover:bg-surface-container-low transition-colors"
              title="Actualizar lista"
            >
              <HiOutlineRefresh className={`h-4 w-4 ${ordersLoading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">{locale === "es" ? "Actualizar" : "Refresh"}</span>
            </button>
          </div>

          {ordersLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-44 w-full animate-pulse rounded-2xl bg-surface-container-low" />
              ))}
            </div>
          ) : ordersError ? (
            <div className="rounded-2xl border border-error/20 bg-error-container/30 p-6 text-center">
              <p className="text-sm font-bold text-error">{ordersError}</p>
              <button
                type="button"
                onClick={() => void loadOrders()}
                className="mt-4 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-on-primary"
              >
                {locale === "es" ? "Reintentar" : "Retry"}
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-3xl border border-outline-variant/20 bg-surface-container-lowest p-12 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-container text-tertiary">
                <HiOutlineShoppingBag className="h-7 w-7" />
              </div>
              <h3 className="font-heading text-xl font-bold text-on-surface">
                {t("account.noOrders")}
              </h3>
              <p className="mx-auto mt-2 max-w-md text-xs text-tertiary">
                {locale === "es"
                  ? "Nuestros tamales artesanales se preparan frescos en lotes pequeños cada semana. ¡Elige tus sabores favoritos y recíbelos en casa!"
                  : "Our handmade tamales are crafted fresh in small batches. Choose your favorite flavors today!"}
              </p>
              <Link
                href="/productos"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-xs font-bold text-on-primary shadow-sm hover:bg-primary/90 transition-all"
              >
                {t("cart.browseTamales")}
                <HiOutlineArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => {
                const badge = getStatusBadge(order.status, locale);
                const orderRefShort = order.id.slice(-8).toUpperCase();
                const formattedDate = order.createdAt
                  ? new Date(order.createdAt).toLocaleDateString(locale, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "—";

                return (
                  <div
                    key={order.id}
                    className="overflow-hidden rounded-3xl border border-outline-variant/20 bg-surface-container-lowest shadow-editorial-sm transition-all hover:shadow-editorial-md"
                  >
                    {/* Card Top Banner */}
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant/15 bg-surface-container-low/40 px-6 py-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-mono text-xs font-bold text-primary">
                          #{orderRefShort}
                        </span>
                        <span className="h-3 w-px bg-outline-variant/40 hidden sm:inline" />
                        <span className="text-xs text-tertiary">{formattedDate}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${badge.bg}`}
                        >
                          {badge.icon}
                          {badge.label}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedReceipt(order)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-surface px-3 py-1.5 text-xs font-bold text-primary border border-outline-variant/30 shadow-sm hover:bg-surface-container transition-all"
                        >
                          <HiOutlineDocumentText className="h-4 w-4" />
                          {t("account.viewReceipt")}
                        </button>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-3">
                      {/* Items list */}
                      <div className="md:col-span-2">
                        <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-tertiary">
                          {t("account.itemsCount")} ({order.items.reduce((s, i) => s + i.quantity, 0)})
                        </p>
                        <ul className="divide-y divide-outline-variant/10 rounded-2xl border border-outline-variant/15 bg-surface p-1">
                          {order.items.map((item, idx) => (
                            <li key={idx} className="flex items-center justify-between p-3 text-sm">
                              <div className="flex items-center gap-3">
                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-container text-xs font-bold text-primary">
                                  {item.quantity}×
                                </span>
                                <span className="font-medium text-on-surface">{item.name}</span>
                              </div>
                              <span className="font-bold text-on-surface">
                                {formatMoney(item.unitAmount * item.quantity, item.currency)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Delivery Details & Actions */}
                      <div className="flex flex-col justify-between rounded-2xl border border-outline-variant/15 bg-surface p-5">
                        <div>
                          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-tertiary">
                            {t("account.deliveryDetails")}
                          </p>
                          <p className="text-sm font-bold text-on-surface">
                            {order.customer.name || user.displayName || "Cliente"}
                          </p>
                          <div className="mt-2 space-y-1 text-xs text-tertiary">
                            {order.customer.address && (
                              <p className="flex items-start gap-1.5">
                                <HiOutlineLocationMarker className="h-3.5 w-3.5 shrink-0 mt-0.5 text-primary" />
                                <span>{order.customer.address}, {order.customer.city}</span>
                              </p>
                            )}
                            {order.customer.phone && (
                              <p className="flex items-center gap-1.5">
                                <HiOutlinePhone className="h-3.5 w-3.5 shrink-0 text-primary" />
                                <span>{order.customer.phone}</span>
                              </p>
                            )}
                            {order.customer.notes && (
                              <p className="mt-2 rounded-lg bg-surface-container-low p-2 text-[11px] italic text-tertiary">
                                &ldquo;{order.customer.notes}&rdquo;
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="mt-5 border-t border-outline-variant/15 pt-3">
                          <div className="flex items-baseline justify-between mb-3">
                            <span className="text-xs font-bold text-tertiary">{t("cart.total")}</span>
                            <span className="font-heading text-xl font-bold text-primary">
                              {formatMoney(order.total, order.currency)}
                            </span>
                          </div>

                          <div className="flex flex-col gap-2">
                            <a
                              href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
                                locale === "es"
                                  ? `Hola Panka! Quisiera consultar sobre mi pedido #${orderRefShort}`
                                  : `Hello Panka! I have a question about my order #${orderRefShort}`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-600/20 bg-emerald-50/70 py-2.5 text-xs font-bold text-emerald-800 transition-all hover:bg-emerald-100"
                            >
                              <FaWhatsapp className="h-4 w-4 text-emerald-600" />
                              {t("account.contactSupport")}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Modal de Recibo Digital ── */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-surface p-8 shadow-editorial-lg border border-outline-variant/20">
            {/* Header del recibo */}
            <div className="flex items-start justify-between border-b border-outline-variant/20 pb-5">
              <div className="flex items-center gap-3">
                <Image
                  src="/assets/ICON.png"
                  alt="Panka"
                  width={40}
                  height={40}
                  className="h-10 w-10 object-contain"
                />
                <div>
                  <h3 className="font-heading text-xl font-bold text-on-surface">
                    Panka Products
                  </h3>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                    {t("account.digitalReceipt")}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="rounded-xl p-2 text-tertiary hover:bg-surface-container hover:text-on-surface"
              >
                <HiOutlineX className="h-5 w-5" />
              </button>
            </div>

            {/* Datos del recibo */}
            <div className="mt-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 rounded-2xl bg-surface-container-low p-4">
                <div>
                  <p className="font-bold text-tertiary uppercase text-[10px]">
                    {locale === "es" ? "Nº de Transacción" : "Transaction ID"}
                  </p>
                  <p className="font-mono font-bold text-on-surface mt-0.5">
                    #{selectedReceipt.id.slice(-12).toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="font-bold text-tertiary uppercase text-[10px]">
                    {locale === "es" ? "Fecha de emisión" : "Issue Date"}
                  </p>
                  <p className="font-medium text-on-surface mt-0.5">
                    {selectedReceipt.createdAt
                      ? new Date(selectedReceipt.createdAt).toLocaleString(locale)
                      : "—"}
                  </p>
                </div>
              </div>

              {/* Destinatario */}
              <div className="rounded-2xl border border-outline-variant/15 p-4">
                <p className="font-bold text-tertiary uppercase text-[10px] mb-1.5">
                  {locale === "es" ? "Datos de Envío y Cliente" : "Shipping & Customer"}
                </p>
                <p className="font-bold text-sm text-on-surface">
                  {selectedReceipt.customer.name || user.displayName || "Cliente"}
                </p>
                <p className="text-tertiary">{selectedReceipt.customer.email || user.email}</p>
                {selectedReceipt.customer.address && (
                  <p className="text-tertiary mt-1">
                    {selectedReceipt.customer.address}, {selectedReceipt.customer.city}
                  </p>
                )}
                {selectedReceipt.customer.phone && (
                  <p className="text-tertiary">{selectedReceipt.customer.phone}</p>
                )}
              </div>

              {/* Detalle de items */}
              <div>
                <p className="font-bold text-tertiary uppercase text-[10px] mb-2">
                  {locale === "es" ? "Artículos Comprados" : "Purchased Items"}
                </p>
                <div className="divide-y divide-outline-variant/15 rounded-2xl border border-outline-variant/15 bg-surface-container-lowest">
                  {selectedReceipt.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between p-3">
                      <div>
                        <span className="font-bold text-primary mr-2">{item.quantity}×</span>
                        <span className="font-medium text-on-surface">{item.name}</span>
                        <span className="text-tertiary ml-2 text-[11px]">
                          ({formatMoney(item.unitAmount, item.currency)} c/u)
                        </span>
                      </div>
                      <span className="font-bold text-on-surface">
                        {formatMoney(item.unitAmount * item.quantity, item.currency)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totales */}
              <div className="rounded-2xl bg-surface-container-low p-4 space-y-2">
                <div className="flex justify-between text-tertiary">
                  <span>{t("cart.subtotal")}</span>
                  <span className="font-medium text-on-surface">
                    {formatMoney(selectedReceipt.total, selectedReceipt.currency)}
                  </span>
                </div>
                <div className="flex justify-between text-tertiary">
                  <span>{t("cart.shipping")}</span>
                  <span className="font-medium text-emerald-700">
                    {locale === "es" ? "Incluido / Miami" : "Included"}
                  </span>
                </div>
                <div className="flex justify-between border-t border-outline-variant/20 pt-2 text-sm font-bold text-on-surface">
                  <span>{t("cart.total")}</span>
                  <span className="text-base text-primary">
                    {formatMoney(selectedReceipt.total, selectedReceipt.currency)}
                  </span>
                </div>
              </div>

              <p className="text-center text-[11px] text-tertiary pt-2 italic">
                {locale === "es"
                  ? "Panka Products LLC • Miami, Florida • Gracias por tu preferencia."
                  : "Panka Products LLC • Miami, Florida • Thank you for your support."}
              </p>
            </div>

            {/* Botones de acción modal */}
            <div className="mt-6 flex items-center justify-end gap-3 border-t border-outline-variant/15 pt-4">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-on-primary shadow-sm hover:bg-primary/90"
              >
                <HiOutlinePrinter className="h-4 w-4" />
                {t("account.printReceipt")}
              </button>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="rounded-xl border border-outline-variant/30 px-4 py-2.5 text-xs font-bold text-on-surface hover:bg-surface-container-low"
              >
                {t("account.close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
