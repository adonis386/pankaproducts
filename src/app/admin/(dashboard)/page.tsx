"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  HiOutlineAdjustments,
  HiOutlineArrowRight,
  HiOutlineCalendar,
  HiOutlineCog,
  HiOutlineCurrencyDollar,
  HiOutlineDotsVertical,
  HiOutlinePlus,
  HiOutlineShoppingBag,
  HiOutlineSparkles,
  HiOutlineStar,
  HiOutlineTruck,
} from "react-icons/hi";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "@/components/AuthModal";
import { auth } from "@/lib/firebase";
import type { PublicOrder } from "@/lib/order-types";

async function getIdTokenOrThrow() {
  if (!auth?.currentUser) throw new Error("No authenticated user.");
  return await auth.currentUser.getIdToken();
}

type AdminProduct = { name: string; popular?: boolean };
type TimeRange = "24h" | "7d" | "30d" | "all";

export default function AdminHomePage() {
  const { user, loading } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [checking, setChecking] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const [productCount, setProductCount] = useState<number | null>(null);
  const [defaultTopSeller, setDefaultTopSeller] = useState<string>("—");
  const [orders, setOrders] = useState<PublicOrder[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>("all");

  useEffect(() => {
    const check = async () => {
      if (!user) {
        setIsAdmin(null);
        return;
      }
      setChecking(true);
      setError("");
      try {
        const token = await getIdTokenOrThrow();
        const res = await fetch("/admin/api/products", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const data = (await res.json()) as { error?: string };
          throw new Error(data.error || "Not authorized.");
        }
        setIsAdmin(true);
      } catch (e) {
        setIsAdmin(false);
        setError(e instanceof Error ? e.message : "Not authorized.");
      } finally {
        setChecking(false);
      }
    };
    void check();
  }, [user?.uid, user]);

  useEffect(() => {
    if (!isAdmin || !user) return;
    (async () => {
      try {
        const token = await getIdTokenOrThrow();
        const res = await fetch("/admin/api/products", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = (await res.json()) as { products?: AdminProduct[] };
        if (res.ok && Array.isArray(data.products)) {
          setProductCount(data.products.length);
          const popular = data.products.find((p) => p.popular);
          const name = popular?.name || data.products[0]?.name;
          if (name) setDefaultTopSeller(name);
        }

        const ordersRes = await fetch("/admin/api/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const ordersData = (await ordersRes.json()) as { orders?: PublicOrder[] };
        if (ordersRes.ok && Array.isArray(ordersData.orders)) {
          setOrders(ordersData.orders);
        }
      } catch {
        /* optional metrics */
      }
    })();
  }, [isAdmin, user?.uid]);

  // Filter orders by time range
  const filteredOrders = useMemo(() => {
    if (timeRange === "all") return orders;
    const now = Date.now();
    const msLimit =
      timeRange === "24h"
        ? 24 * 60 * 60 * 1000
        : timeRange === "7d"
        ? 7 * 24 * 60 * 60 * 1000
        : 30 * 24 * 60 * 60 * 1000;

    return orders.filter((o) => {
      if (!o.createdAt) return false;
      const orderTime = new Date(o.createdAt).getTime();
      return now - orderTime <= msLimit;
    });
  }, [orders, timeRange]);

  // Dynamic top seller calculated from selected period
  const topSeller = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const order of filteredOrders) {
      if (order.status === "cancelled" || order.status === "failed") continue;
      for (const item of order.items) {
        counts[item.name] = (counts[item.name] || 0) + item.quantity;
      }
    }
    const entries = Object.entries(counts);
    if (entries.length === 0) return defaultTopSeller;
    entries.sort((a, b) => b[1] - a[1]);
    return `${entries[0][0]} (${entries[0][1]} uds)`;
  }, [filteredOrders, defaultTopSeller]);

  const periodRevenue = useMemo(() => {
    return filteredOrders
      .filter((o) => o.status !== "cancelled" && o.status !== "failed")
      .reduce((sum, o) => sum + o.total, 0);
  }, [filteredOrders]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-outline-variant border-t-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <div className="mx-auto max-w-lg rounded-[2rem] border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-sm small:p-8">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-tertiary">Admin</p>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-on-surface">Panel de control</h1>
          <p className="mt-2 text-sm font-medium text-tertiary">
            Gestiona tu menú, pedidos y contenidos de Panka.
          </p>
          <button
            type="button"
            onClick={() => setAuthOpen(true)}
            className="mt-8 w-full rounded-xl bg-primary py-4 text-sm font-bold text-on-primary transition-all hover:opacity-90"
          >
            Iniciar sesión
          </button>
          <p className="mt-3 text-center text-xs text-on-surface-variant">Usa el mismo login de la tienda.</p>
        </div>
        <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
      </>
    );
  }

  if (checking || isAdmin === null) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-outline-variant border-t-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-lg rounded-[2rem] border border-error/20 bg-error-container/30 p-8">
        <h1 className="font-heading text-2xl font-bold text-on-surface">Sin acceso</h1>
        <p className="mt-2 text-sm text-on-surface-variant">{error}</p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-xl bg-surface-container-high px-5 py-3 text-sm font-bold text-on-surface transition-colors hover:bg-surface-variant"
        >
          Volver a la tienda
        </Link>
      </div>
    );
  }

  return (
    <>
      <header className="mb-8 flex flex-col gap-6 small:mb-12 small:flex-row small:items-end small:justify-between">
        <div>
          <h1 className="font-heading text-4xl font-bold tracking-tight text-on-surface">Dashboard</h1>
          <p className="mt-2 font-medium text-tertiary">Bienvenido al panel editorial de Panka Products.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Time range selector */}
          <div className="flex rounded-2xl bg-surface-container p-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setTimeRange("24h")}
              className={`rounded-xl px-3 py-2 transition-all ${
                timeRange === "24h"
                  ? "bg-surface-container-lowest text-primary shadow-sm"
                  : "text-on-surface/70 hover:text-on-surface"
              }`}
            >
              24 Horas
            </button>
            <button
              type="button"
              onClick={() => setTimeRange("7d")}
              className={`rounded-xl px-3 py-2 transition-all ${
                timeRange === "7d"
                  ? "bg-surface-container-lowest text-primary shadow-sm"
                  : "text-on-surface/70 hover:text-on-surface"
              }`}
            >
              7 Días
            </button>
            <button
              type="button"
              onClick={() => setTimeRange("30d")}
              className={`rounded-xl px-3 py-2 transition-all ${
                timeRange === "30d"
                  ? "bg-surface-container-lowest text-primary shadow-sm"
                  : "text-on-surface/70 hover:text-on-surface"
              }`}
            >
              30 Días
            </button>
            <button
              type="button"
              onClick={() => setTimeRange("all")}
              className={`rounded-xl px-3 py-2 transition-all ${
                timeRange === "all"
                  ? "bg-surface-container-lowest text-primary shadow-sm"
                  : "text-on-surface/70 hover:text-on-surface"
              }`}
            >
              Histórico
            </button>
          </div>

          <Link
            href="/admin/settings"
            className="inline-flex items-center gap-2 rounded-xl bg-surface-container-high px-4 py-2.5 text-xs font-bold text-on-surface hover:bg-surface-variant transition-colors"
          >
            <HiOutlineCog className="h-4 w-4" />
            Configuración & CMS
          </Link>

          <Link
            href="/admin/productos"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-on-primary shadow-md hover:bg-primary/90 transition-all"
          >
            <HiOutlinePlus className="h-4 w-4" />
            Menú & Productos
          </Link>
        </div>
      </header>

      {/* Metric Cards */}
      <section className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="flex flex-col justify-between rounded-[2rem] border-b-4 border-primary/20 bg-surface-container-lowest p-6 shadow-sm small:p-8">
          <div className="flex items-start justify-between">
            <div className="rounded-2xl bg-primary-fixed-dim/20 p-3 text-primary">
              <HiOutlineCurrencyDollar className="h-6 w-6" aria-hidden />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-primary">
              {timeRange === "all" ? "Total acumulado" : `Últimos ${timeRange}`}
            </span>
          </div>
          <div className="mt-6">
            <p className="text-sm font-bold uppercase tracking-widest text-tertiary">Ingresos del Período</p>
            <h2 className="mt-1 font-heading text-3xl font-bold">${periodRevenue.toFixed(2)}</h2>
            <p className="mt-1 text-xs text-on-surface-variant">
              {filteredOrders.length} pedido{filteredOrders.length === 1 ? "" : "s"} pagado{filteredOrders.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-[2rem] border-b-4 border-secondary-fixed-dim/40 bg-surface-container-lowest p-6 shadow-sm small:p-8">
          <div className="flex items-start justify-between">
            <div className="rounded-2xl bg-secondary-container/30 p-3 text-secondary">
              <HiOutlineShoppingBag className="h-6 w-6" aria-hidden />
            </div>
            <span className="text-xs font-bold text-secondary">Catálogo activo</span>
          </div>
          <div className="mt-6">
            <p className="text-sm font-bold uppercase tracking-widest text-tertiary">Productos en Menú</p>
            <h2 className="mt-1 font-heading text-3xl font-bold">
              {productCount !== null ? productCount : "—"}
            </h2>
            <p className="mt-1 text-xs text-on-surface-variant">Sincronizados con Stripe & Firestore</p>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-[2rem] border-b-4 border-tertiary/20 bg-surface-container-lowest p-6 shadow-sm small:p-8">
          <div className="flex items-start justify-between">
            <div className="rounded-2xl bg-surface-container-highest p-3 text-tertiary">
              <HiOutlineStar className="h-6 w-6" aria-hidden />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-tertiary">Más vendido</span>
          </div>
          <div className="mt-6">
            <p className="text-sm font-bold uppercase tracking-widest text-tertiary">Top del Período</p>
            <h2 className="mt-1 font-heading text-2xl font-bold leading-tight">{topSeller}</h2>
          </div>
        </div>
      </section>

      {/* Recent Orders Section */}
      <section className="overflow-hidden rounded-[2.5rem] bg-surface-container-lowest shadow-sm">
        <div className="flex flex-col gap-4 border-b border-outline-variant/10 bg-surface-container-low/50 p-5 small:flex-row small:p-8 small:items-center small:justify-between">
          <div>
            <h3 className="font-heading text-2xl font-bold">Pedidos Recientes</h3>
            <p className="text-sm text-tertiary">
              {timeRange === "all" ? "Todos los pedidos" : `Filtrado por: ${timeRange}`} · Stripe + Firestore
            </p>
          </div>
          <Link href="/admin/pedidos" className="inline-flex items-center gap-1 text-sm font-bold text-primary/80 hover:text-primary">
            Ver y gestionar todos los pedidos
            <HiOutlineArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] border-collapse text-left">
            <thead>
              <tr className="border-b border-outline-variant/10 text-[10px] font-bold uppercase tracking-[0.2em] text-tertiary">
                <th className="px-4 py-4 small:px-8 small:py-6">ID Pedido</th>
                <th className="px-4 py-4 small:px-8 small:py-6">Cliente</th>
                <th className="px-4 py-4 small:px-8 small:py-6">Estado</th>
                <th className="px-4 py-4 small:px-8 small:py-6 text-right">Total</th>
                <th className="px-4 py-4 small:px-8 small:py-6 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {filteredOrders.slice(0, 6).length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-sm small:px-8 text-tertiary">
                    No hay pedidos en este período seleccionado.
                  </td>
                </tr>
              ) : (
                filteredOrders.slice(0, 6).map((row) => {
                  const initials = (row.customer.name || row.customer.email || "P")
                    .split(/\s+/)
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();
                  const tone =
                    row.status === "delivered"
                      ? "ok"
                      : row.status === "preparing"
                      ? "prep"
                      : row.status === "cancelled" || row.status === "failed"
                      ? "bad"
                      : "new";
                  return (
                    <tr key={row.id} className="group transition-colors hover:bg-surface-container-low">
                      <td className="px-4 py-4 small:px-8 small:py-5 font-mono text-sm text-on-surface-variant">
                        {row.id.slice(0, 18)}…
                      </td>
                      <td className="px-4 py-4 small:px-8 small:py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-highest text-xs font-bold">
                            {initials}
                          </div>
                          <div>
                            <span className="font-semibold block">{row.customer.name || row.customer.email || "—"}</span>
                            {row.customer.phone && <span className="text-xs text-tertiary">{row.customer.phone}</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 small:px-8 small:py-5">
                        {tone === "ok" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            {row.status}
                          </span>
                        )}
                        {tone === "prep" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-800">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                            {row.status}
                          </span>
                        )}
                        {tone === "new" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            {row.status}
                          </span>
                        )}
                        {tone === "bad" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-error/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-error">
                            <span className="h-1.5 w-1.5 rounded-full bg-error" />
                            {row.status}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 small:px-8 small:py-5 text-right font-bold">${row.total.toFixed(2)}</td>
                      <td className="px-4 py-4 small:px-8 small:py-5 text-center">
                        <Link
                          href="/admin/pedidos"
                          className="rounded-lg p-2 inline-flex hover:bg-surface-container text-primary font-bold text-xs"
                          title="Gestionar en Pedidos"
                        >
                          Ver orden →
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-4 border-t border-outline-variant/10 p-5 small:flex-row small:p-8 small:items-center small:justify-between">
          <p className="text-xs font-medium text-tertiary">
            Mostrando {Math.min(6, filteredOrders.length)} de {filteredOrders.length} pedidos
          </p>
          <Link
            href="/admin/pedidos"
            className="rounded-lg bg-surface-container-high px-4 py-2 text-xs font-bold hover:bg-surface-variant"
          >
            Abrir todos los pedidos
          </Link>
        </div>
      </section>

      {/* Quick Access Footer */}
      <footer className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-[2rem] border border-secondary-fixed-dim/30 bg-secondary-fixed-dim/20 p-6 small:p-8">
          <div className="mb-4 flex items-center gap-3">
            <HiOutlineSparkles className="h-6 w-6 text-secondary" aria-hidden />
            <h4 className="text-lg font-bold">Cola de Cocina</h4>
          </div>
          <p className="text-sm leading-relaxed text-on-secondary-fixed-variant">
            {orders.filter((o) => o.status === "confirmed" || o.status === "preparing").length} pedido(s)
            esperando o en preparación. Usa comanda de cocina para imprimir tickets.
          </p>
          <Link href="/admin/pedidos" className="mt-4 inline-block text-xs font-bold text-secondary underline underline-offset-4">
            Ir a órdenes de cocina →
          </Link>
        </div>

        <div className="rounded-[2rem] bg-surface-container-lowest p-6 small:p-8 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <HiOutlinePlus className="h-6 w-6 text-primary" aria-hidden />
            <h4 className="text-lg font-bold">Menú y Precios</h4>
          </div>
          <p className="text-sm text-tertiary">
            Cambia precios, disponibilidad de cocina (isAvailable), destacados o crea nuevos sabores de tamales.
          </p>
          <Link href="/admin/productos" className="mt-4 inline-block text-xs font-bold text-primary underline underline-offset-4">
            Gestionar productos →
          </Link>
        </div>

        <div className="rounded-[2rem] bg-surface-container-high p-6 small:p-8">
          <div className="mb-4 flex items-center gap-3">
            <HiOutlineCog className="h-6 w-6 text-on-surface" aria-hidden />
            <h4 className="font-heading text-lg font-bold">CMS & Ajustes</h4>
          </div>
          <p className="text-sm text-tertiary">
            Edita los textos de la historia, Fanny, valores, el footer, anuncios rotativos y administra las cuentas de acceso.
          </p>
          <Link href="/admin/settings" className="mt-4 inline-block text-xs font-bold text-primary underline underline-offset-4">
            Editar configuración web →
          </Link>
        </div>
      </footer>
    </>
  );
}
