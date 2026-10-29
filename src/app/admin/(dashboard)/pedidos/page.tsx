"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineCurrencyDollar,
  HiOutlineDocumentText,
  HiOutlineEye,
  HiOutlineFilter,
  HiOutlinePhone,
  HiOutlinePrinter,
  HiOutlineRefresh,
  HiOutlineSearch,
  HiOutlineShoppingBag,
  HiOutlineTruck,
  HiOutlineX,
} from "react-icons/hi";
import { FaWhatsapp } from "react-icons/fa";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import type { KitchenStatus, PublicOrder } from "@/lib/order-types";

function getCustomerWhatsAppUrl(order: PublicOrder): string | null {
  const rawPhone = (order.customer.phone || "").replace(/\D/g, "");
  if (!rawPhone) return null;
  const formattedPhone = rawPhone.length === 10 ? `1${rawPhone}` : rawPhone;
  const itemsSummary = order.items.map((i) => `• ${i.quantity}x ${i.name}`).join("\n");
  const statusMessages: Record<KitchenStatus, string> = {
    pending: "We have received your order and it is confirmed in our kitchen.",
    confirmed: "We have received your payment! Your order is now confirmed in our kitchen.",
    preparing: "Your Panka order is now being prepared with all our artisanal flavor 🫔🔥.",
    delivered: "Your Panka order has been delivered! Thank you for your purchase 🫔✨.",
    cancelled: "We are contacting you regarding your Panka order.",
    failed: "We are contacting you regarding your Panka order.",
  };

  const lines = [
    `Hello ${order.customer.name || "there"}! 👋 We are reaching out from *Panka Products* 🫔`,
    "",
    statusMessages[order.status] || "We are reaching out regarding your Panka order.",
    "",
    `🧾 *Order:* #${order.id.slice(0, 12).toUpperCase()}`,
    `🫔 *Items:*`,
    itemsSummary,
    `💵 *Total Paid:* $${order.total.toFixed(2)} ${order.currency.toUpperCase()}`,
    order.customer.address
      ? `📍 *Delivery Address:* ${order.customer.address}${order.customer.city ? `, ${order.customer.city}` : ""}`
      : "",
    "",
    "Feel free to reply here if you have any questions!",
  ].filter(Boolean);

  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(lines.join("\n"))}`;
}

async function getIdTokenOrThrow() {
  if (!auth?.currentUser) throw new Error("No authenticated user.");
  return await auth.currentUser.getIdToken();
}

const STATUSES: KitchenStatus[] = ["confirmed", "preparing", "delivered", "cancelled"];

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

function formatWhen(iso: string | null) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function getStatusBadge(status: KitchenStatus) {
  switch (status) {
    case "delivered":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Entregado
        </span>
      );
    case "preparing":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-800">
          <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
          En preparación
        </span>
      );
    case "confirmed":
    case "pending":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
          <span className="h-2 w-2 rounded-full bg-primary" />
          Confirmado (Cocina)
        </span>
      );
    case "cancelled":
    case "failed":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-red-700">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          Cancelado
        </span>
      );
    default:
      return <span>{status}</span>;
  }
}

export default function AdminPedidosPage() {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<PublicOrder[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "kitchen" | "delivered" | "cancelled">("all");

  // Selected Order for Modal
  const [selectedOrder, setSelectedOrder] = useState<PublicOrder | null>(null);

  // Print Ticket Order
  const [printOrder, setPrintOrder] = useState<PublicOrder | null>(null);

  const load = async () => {
    setBusy(true);
    setError("");
    try {
      const token = await getIdTokenOrThrow();
      const res = await fetch("/admin/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await res.json()) as { orders?: PublicOrder[]; error?: string };
      if (!res.ok) throw new Error(data.error || "Failed to load orders.");
      setOrders(Array.isArray(data.orders) ? data.orders : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load orders.");
      setOrders([]);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (user) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  useEffect(() => {
    const handleNewOrderEvent = () => {
      if (user) void load();
    };
    window.addEventListener("panka:new-order", handleNewOrderEvent);
    return () => window.removeEventListener("panka:new-order", handleNewOrderEvent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  const changeStatus = async (id: string, status: KitchenStatus) => {
    setBusy(true);
    setError("");
    try {
      const token = await getIdTokenOrThrow();
      const res = await fetch("/admin/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id, status }),
      });
      const data = (await res.json()) as { order?: PublicOrder; error?: string };
      if (!res.ok) throw new Error(data.error || "Failed to update order.");
      
      // Update local state smoothly
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status } : o))
      );
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder((prev) => (prev ? { ...prev, status } : null));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update order.");
    } finally {
      setBusy(false);
    }
  };

  const handlePrintTicket = (order: PublicOrder) => {
    setPrintOrder(order);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Filtered & Searched Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // Status filter
      if (activeFilter === "kitchen" && o.status !== "confirmed" && o.status !== "preparing" && o.status !== "pending") {
        return false;
      }
      if (activeFilter === "delivered" && o.status !== "delivered") {
        return false;
      }
      if (activeFilter === "cancelled" && o.status !== "cancelled" && o.status !== "failed") {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = (o.customer.name || "").toLowerCase().includes(q);
        const matchesEmail = (o.customer.email || "").toLowerCase().includes(q);
        const matchesPhone = (o.customer.phone || "").toLowerCase().includes(q);
        const matchesAddress = (o.customer.address || "").toLowerCase().includes(q);
        const matchesCity = (o.customer.city || "").toLowerCase().includes(q);
        const matchesId = o.id.toLowerCase().includes(q);
        const matchesItems = o.items.some((i) => i.name.toLowerCase().includes(q));

        if (!matchesName && !matchesEmail && !matchesPhone && !matchesAddress && !matchesCity && !matchesId && !matchesItems) {
          return false;
        }
      }

      return true;
    });
  }, [orders, activeFilter, searchQuery]);

  // Metrics
  const kitchenCount = orders.filter((o) => o.status === "confirmed" || o.status === "preparing").length;
  const deliveredCount = orders.filter((o) => o.status === "delivered").length;
  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled" && o.status !== "failed")
    .reduce((acc, o) => acc + o.total, 0);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-outline-variant border-t-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-lg rounded-[2rem] border border-outline-variant/20 bg-surface-container-lowest p-8 shadow-sm">
        <h1 className="mb-2 font-heading text-3xl font-bold text-on-surface">Admin</h1>
        <p className="text-on-surface-variant">Debes iniciar sesión para ver los pedidos.</p>
        <Link className="mt-4 inline-block font-semibold text-primary underline underline-offset-2" href="/admin">
          Ir a /admin
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* ─── PRINTABLE TICKET (Hidden on screen, visible only when printing) ─── */}
      {printOrder && (
        <div className="printable-ticket hidden print:block">
          <style jsx global>{`
            @media print {
              body * {
                visibility: hidden !important;
              }
              .printable-ticket, .printable-ticket * {
                visibility: visible !important;
              }
              .printable-ticket {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                max-width: 80mm !important;
                margin: 0 auto !important;
                padding: 12px !important;
                font-family: monospace !important;
                color: #000 !important;
                background: #fff !important;
              }
            }
          `}</style>
          <div className="text-center font-mono">
            <h2 className="text-lg font-bold">*** PANKA TAMALES ***</h2>
            <p className="text-xs">COMANDA DE COCINA / DESPACHO</p>
            <p className="mt-2 text-xs">================================</p>
          </div>
          <div className="my-3 font-mono text-xs space-y-1">
            <p><strong>ORDEN:</strong> {printOrder.id}</p>
            <p><strong>FECHA:</strong> {formatWhen(printOrder.createdAt)}</p>
            <p><strong>ESTADO:</strong> {printOrder.status.toUpperCase()}</p>
            <p className="mt-2 text-xs">--------------------------------</p>
            <p><strong>CLIENTE:</strong> {printOrder.customer.name || "Sin nombre"}</p>
            <p><strong>TELÉFONO:</strong> {printOrder.customer.phone || "—"}</p>
            <p><strong>EMAIL:</strong> {printOrder.customer.email || "—"}</p>
            <p><strong>DIRECCIÓN:</strong> {printOrder.customer.address} {printOrder.customer.city ? `, ${printOrder.customer.city}` : ""}</p>
            {printOrder.customer.notes && (
              <p className="mt-1 font-bold"><strong>NOTAS:</strong> {printOrder.customer.notes}</p>
            )}
            <p className="mt-2 text-xs">--------------------------------</p>
          </div>
          <div className="my-3 font-mono text-xs">
            <p className="font-bold mb-1">ITEMS A PREPARAR:</p>
            {printOrder.items.map((it, idx) => (
              <div key={idx} className="flex justify-between py-0.5">
                <span>{it.quantity}x {it.name}</span>
                <span>{formatMoney(it.quantity * it.unitAmount, it.currency)}</span>
              </div>
            ))}
            <p className="mt-2 text-xs">--------------------------------</p>
            <div className="flex justify-between font-bold text-sm mt-1">
              <span>TOTAL PAGADO:</span>
              <span>{formatMoney(printOrder.total, printOrder.currency)}</span>
            </div>
            <p className="mt-4 text-center text-[10px]">Panka Editorial E-commerce · Miami</p>
          </div>
        </div>
      )}

      {/* ─── PAGE HEADER & METRICS ─── */}
      <header className="mb-8 flex flex-col gap-4 small:flex-row small:items-center small:justify-between print:hidden">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-tertiary">Gestión de Cocina y Despacho</p>
          <h1 className="font-heading text-4xl font-bold tracking-tight text-on-surface">Pedidos y Entregas</h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Pedidos pagados en Stripe. Filtra por estado, busca clientes y despacha órdenes de cocina.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-xl bg-surface-container-high px-5 py-3 text-sm font-bold text-on-surface transition-colors hover:bg-surface-variant disabled:opacity-50"
        >
          <HiOutlineRefresh className={`h-4 w-4 ${busy ? "animate-spin" : ""}`} />
          Actualizar pedidos
        </button>
      </header>

      {/* Metrics Row */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4 print:hidden">
        <div className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm">
          <div className="flex items-center justify-between text-tertiary">
            <span className="text-xs font-bold uppercase tracking-wider">Total Pedidos</span>
            <HiOutlineShoppingBag className="h-5 w-5" />
          </div>
          <p className="mt-2 font-heading text-2xl font-bold text-on-surface">{orders.length}</p>
        </div>

        <div className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-xs font-bold uppercase tracking-wider">En Cocina</span>
            <HiOutlineClock className="h-5 w-5" />
          </div>
          <p className="mt-2 font-heading text-2xl font-bold text-amber-800">{kitchenCount}</p>
        </div>

        <div className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-xs font-bold uppercase tracking-wider">Entregados</span>
            <HiOutlineTruck className="h-5 w-5" />
          </div>
          <p className="mt-2 font-heading text-2xl font-bold text-emerald-800">{deliveredCount}</p>
        </div>

        <div className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm">
          <div className="flex items-center justify-between text-primary">
            <span className="text-xs font-bold uppercase tracking-wider">Ingresos Totales</span>
            <HiOutlineCurrencyDollar className="h-5 w-5" />
          </div>
          <p className="mt-2 font-heading text-2xl font-bold text-primary">${totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      {error ? (
        <p className="mb-6 rounded-2xl border border-error/20 bg-error-container/30 p-4 text-sm font-medium text-error print:hidden">
          {error}
        </p>
      ) : null}

      {/* ─── SEARCH & FILTER BAR ─── */}
      <div className="mb-6 flex flex-col gap-4 small:flex-row small:items-center small:justify-between print:hidden">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <HiOutlineSearch className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-tertiary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por cliente, teléfono, email, dirección o ID..."
            className="w-full rounded-2xl border border-outline-variant/30 bg-surface-container-lowest py-3 pl-11 pr-4 text-sm focus:border-primary focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-tertiary hover:bg-surface-container"
            >
              <HiOutlineX className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-1.5 rounded-2xl bg-surface-container p-1">
          <button
            onClick={() => setActiveFilter("all")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeFilter === "all"
                ? "bg-surface-container-lowest text-primary shadow-sm"
                : "text-on-surface/70 hover:text-on-surface"
            }`}
          >
            Todos ({orders.length})
          </button>
          <button
            onClick={() => setActiveFilter("kitchen")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeFilter === "kitchen"
                ? "bg-surface-container-lowest text-amber-800 shadow-sm"
                : "text-on-surface/70 hover:text-on-surface"
            }`}
          >
            En Cocina ({kitchenCount})
          </button>
          <button
            onClick={() => setActiveFilter("delivered")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeFilter === "delivered"
                ? "bg-surface-container-lowest text-emerald-800 shadow-sm"
                : "text-on-surface/70 hover:text-on-surface"
            }`}
          >
            Entregados ({deliveredCount})
          </button>
          <button
            onClick={() => setActiveFilter("cancelled")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeFilter === "cancelled"
                ? "bg-surface-container-lowest text-red-800 shadow-sm"
                : "text-on-surface/70 hover:text-on-surface"
            }`}
          >
            Cancelados ({orders.filter((o) => o.status === "cancelled" || o.status === "failed").length})
          </button>
        </div>
      </div>

      {/* ─── ORDERS TABLE (DESKTOP) ─── */}
      <div className="hidden overflow-hidden rounded-3xl bg-surface-container-lowest shadow-sm small:block print:hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-outline-variant/10 text-[10px] font-bold uppercase tracking-[0.2em] text-tertiary">
                <th className="px-6 py-5">Fecha & ID</th>
                <th className="px-6 py-5">Cliente</th>
                <th className="px-6 py-5">Tamales / Items</th>
                <th className="px-6 py-5">Estado</th>
                <th className="px-6 py-5 text-right">Total</th>
                <th className="px-6 py-5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-tertiary">
                    {busy
                      ? "Cargando pedidos..."
                      : searchQuery
                      ? "No se encontraron pedidos que coincidan con la búsqueda."
                      : "Aún no hay pedidos registrados."}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const initials = (order.customer.name || order.customer.email || "P")
                    .split(/\s+/)
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <tr key={order.id} className="transition-colors hover:bg-surface-container-low/40">
                      <td className="px-6 py-5 align-top">
                        <p className="text-sm font-semibold">{formatWhen(order.createdAt)}</p>
                        <p className="mt-1 font-mono text-[11px] text-tertiary">{order.id.slice(0, 16)}…</p>
                      </td>

                      <td className="px-6 py-5 align-top">
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary-container text-xs font-bold text-on-secondary-container">
                            {initials}
                          </div>
                          <div>
                            <p className="font-semibold text-on-surface">{order.customer.name || "Sin nombre"}</p>
                            <p className="text-xs text-tertiary">{order.customer.email}</p>
                            {order.customer.phone && (
                              <a
                                href={`tel:${order.customer.phone}`}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                              >
                                <HiOutlinePhone className="h-3.5 w-3.5" />
                                {order.customer.phone}
                              </a>
                            )}
                            <p className="mt-1 text-xs text-on-surface-variant">
                              {order.customer.address}
                              {order.customer.city ? `, ${order.customer.city}` : ""}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5 align-top text-sm">
                        <div className="space-y-1">
                          {order.items.map((item, idx) => (
                            <p key={idx} className="font-medium text-on-surface">
                              <span className="font-bold text-primary">{item.quantity}×</span> {item.name}
                            </p>
                          ))}
                        </div>
                        {order.customer.notes && (
                          <p className="mt-2 rounded-lg bg-surface-container px-2 py-1 text-xs text-tertiary">
                            💬 <em>{order.customer.notes}</em>
                          </p>
                        )}
                      </td>

                      <td className="px-6 py-5 align-top">
                        <div className="space-y-2">
                          <div>{getStatusBadge(order.status)}</div>
                          <select
                            value={order.status}
                            disabled={busy}
                            onChange={(e) => void changeStatus(order.id, e.target.value as KitchenStatus)}
                            className="rounded-xl border border-outline-variant/30 bg-surface px-2.5 py-1.5 text-xs font-semibold focus:border-primary focus:outline-none"
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>
                                Cambiar a {s}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>

                      <td className="px-6 py-5 align-top text-right font-heading text-lg font-bold text-on-surface">
                        {formatMoney(order.total, order.currency)}
                      </td>

                      <td className="px-6 py-5 align-top text-center">
                        <div className="flex items-center justify-center gap-2">
                          {getCustomerWhatsAppUrl(order) && (
                            <a
                              href={getCustomerWhatsAppUrl(order)!}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-xl bg-[#25D366]/15 p-2.5 text-[#128C7E] transition-colors hover:bg-[#25D366]/25"
                              title="Escribir por WhatsApp al cliente"
                            >
                              <FaWhatsapp className="h-4 w-4" />
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="rounded-xl bg-surface-container-high p-2.5 text-on-surface hover:bg-surface-variant"
                            title="Ver detalle del pedido"
                          >
                            <HiOutlineEye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePrintTicket(order)}
                            className="rounded-xl bg-secondary/10 p-2.5 text-secondary hover:bg-secondary/20"
                            title="Imprimir comanda para cocina"
                          >
                            <HiOutlinePrinter className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── ORDERS CARDS (MOBILE) ─── */}
      <div className="space-y-4 small:hidden print:hidden">
        {filteredOrders.length === 0 ? (
          <p className="rounded-2xl bg-surface-container-lowest p-6 text-center text-sm text-tertiary">
            {busy ? "Cargando pedidos..." : "No se encontraron pedidos."}
          </p>
        ) : (
          filteredOrders.map((order) => (
            <article key={order.id} className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-on-surface">{order.customer.name || "Sin nombre"}</p>
                  <p className="text-xs text-tertiary">{formatWhen(order.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="font-heading text-lg font-bold text-on-surface">
                    {formatMoney(order.total, order.currency)}
                  </p>
                  <div className="mt-1">{getStatusBadge(order.status)}</div>
                </div>
              </div>

              {/* Items summary */}
              <div className="rounded-xl bg-surface-container-low/50 p-3 text-sm">
                {order.items.map((item, idx) => (
                  <p key={idx} className="font-medium text-on-surface">
                    <span className="font-bold text-primary">{item.quantity}×</span> {item.name}
                  </p>
                ))}
              </div>

              {/* Customer info */}
              <div className="space-y-1 text-xs text-tertiary">
                {order.customer.phone && (
                  <a href={`tel:${order.customer.phone}`} className="block font-semibold text-primary">
                    📞 {order.customer.phone}
                  </a>
                )}
                <p>📍 {order.customer.address} {order.customer.city ? `, ${order.customer.city}` : ""}</p>
                {order.customer.notes && (
                  <p className="rounded bg-surface-container px-2 py-1 font-medium">💬 {order.customer.notes}</p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <select
                  value={order.status}
                  disabled={busy}
                  onChange={(e) => void changeStatus(order.id, e.target.value as KitchenStatus)}
                  className="flex-1 rounded-xl border border-outline-variant/30 bg-surface px-3 py-2 text-xs font-semibold"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                {getCustomerWhatsAppUrl(order) && (
                  <a
                    href={getCustomerWhatsAppUrl(order)!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl bg-[#25D366] px-3 py-2 text-xs font-bold text-white"
                    title="WhatsApp al cliente"
                  >
                    <FaWhatsapp className="h-4 w-4" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedOrder(order)}
                  className="rounded-xl bg-surface-container-high px-3 py-2 text-xs font-bold text-on-surface"
                >
                  Detalle
                </button>
                <button
                  type="button"
                  onClick={() => handlePrintTicket(order)}
                  className="rounded-xl bg-secondary px-3 py-2 text-xs font-bold text-on-secondary"
                >
                  <HiOutlinePrinter className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      {/* ─── ORDER DETAIL MODAL ─── */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm print:hidden">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-surface-container-lowest p-6 shadow-2xl small:p-8">
            <button
              type="button"
              onClick={() => setSelectedOrder(null)}
              className="absolute right-5 top-5 rounded-full p-2 text-on-surface/60 hover:bg-surface-container"
              aria-label="Cerrar"
            >
              <HiOutlineX className="h-5 w-5" />
            </button>

            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-tertiary">Detalle de Orden</span>
              <h2 className="font-heading text-2xl font-bold text-on-surface">{selectedOrder.customer.name || "Cliente"}</h2>
              <p className="font-mono text-xs text-tertiary">ID: {selectedOrder.id}</p>
              <p className="text-xs text-tertiary">{formatWhen(selectedOrder.createdAt)}</p>
            </div>

            {/* Status change in modal */}
            <div className="mb-6 flex items-center justify-between rounded-2xl bg-surface-container-low p-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-secondary">Estado Actual</p>
                <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
              </div>
              <select
                value={selectedOrder.status}
                disabled={busy}
                onChange={(e) => void changeStatus(selectedOrder.id, e.target.value as KitchenStatus)}
                className="rounded-xl border border-outline-variant/30 bg-surface px-4 py-2 text-sm font-bold focus:border-primary focus:outline-none"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    Cambiar a {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Customer Details */}
            <div className="mb-6 rounded-2xl border border-outline-variant/20 p-5 space-y-2">
              <h3 className="font-bold text-sm text-secondary uppercase tracking-wider">Datos de Entrega</h3>
              <p className="text-sm"><strong>Email:</strong> {selectedOrder.customer.email || "—"}</p>
              <p className="text-sm">
                <strong>Teléfono:</strong>{" "}
                {selectedOrder.customer.phone ? (
                  <a href={`tel:${selectedOrder.customer.phone}`} className="text-primary font-bold hover:underline">
                    {selectedOrder.customer.phone}
                  </a>
                ) : (
                  "—"
                )}
              </p>
              <p className="text-sm">
                <strong>Dirección:</strong> {selectedOrder.customer.address} {selectedOrder.customer.city ? `, ${selectedOrder.customer.city}` : ""}
              </p>
              {selectedOrder.customer.notes && (
                <div className="mt-3 rounded-xl bg-amber-500/10 p-3 text-xs text-amber-900 border border-amber-500/20">
                  <strong>Notas especiales de entrega:</strong> {selectedOrder.customer.notes}
                </div>
              )}
            </div>

            {/* Items Breakdown */}
            <div className="mb-6">
              <h3 className="mb-3 font-bold text-sm text-secondary uppercase tracking-wider">Productos Ordenados</h3>
              <div className="divide-y divide-outline-variant/15 rounded-2xl border border-outline-variant/20 overflow-hidden">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-surface">
                    <div>
                      <p className="font-bold text-sm text-on-surface">{item.name}</p>
                      <p className="text-xs text-tertiary">
                        {item.quantity} unidad(es) × {formatMoney(item.unitAmount, item.currency)}
                      </p>
                    </div>
                    <p className="font-bold text-sm text-on-surface">
                      {formatMoney(item.quantity * item.unitAmount, item.currency)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between px-2">
                <span className="font-heading text-lg font-bold text-on-surface">Total Cobrado (Stripe):</span>
                <span className="font-heading text-2xl font-bold text-primary">
                  {formatMoney(selectedOrder.total, selectedOrder.currency)}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-outline-variant/20">
              {getCustomerWhatsAppUrl(selectedOrder) && (
                <a
                  href={getCustomerWhatsAppUrl(selectedOrder)!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-[#1ebe5d]"
                >
                  <FaWhatsapp className="h-5 w-5" />
                  WhatsApp al Cliente
                </a>
              )}
              <button
                type="button"
                onClick={() => handlePrintTicket(selectedOrder)}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-secondary px-5 py-3 text-sm font-bold text-on-secondary shadow-md hover:bg-secondary/90"
              >
                <HiOutlinePrinter className="h-5 w-5" />
                Imprimir Comanda de Cocina
              </button>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="rounded-xl bg-surface-container-high px-5 py-3 text-sm font-bold text-on-surface hover:bg-surface-variant"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
