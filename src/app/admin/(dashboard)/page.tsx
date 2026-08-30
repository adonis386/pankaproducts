"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  HiOutlineArrowRight,
  HiOutlineCalendar,
  HiOutlineCurrencyDollar,
  HiOutlineDotsVertical,
  HiOutlinePlus,
  HiOutlineShoppingBag,
  HiOutlineSparkles,
  HiOutlineStar,
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

export default function AdminHomePage() {
  const { user, loading } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [checking, setChecking] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const [productCount, setProductCount] = useState<number | null>(null);
  const [topSeller, setTopSeller] = useState<string>("—");
  const [orders, setOrders] = useState<PublicOrder[]>([]);

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
        if (!res.ok || !Array.isArray(data.products)) return;
        setProductCount(data.products.length);
        const popular = data.products.find((p) => p.popular);
        const name = popular?.name || data.products[0]?.name;
        if (name) setTopSeller(name);

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

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-6 w-6 animate-ring rounded-circle border-2 border-outline-variant border-t-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <div className="mx-auto max-w-lg rounded-[2rem] border border-outline-variant/20 bg-surface-container-lowest p-8 shadow-sm">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-tertiary">Admin</p>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-on-surface">Panel de control</h1>
          <p className="mt-2 text-sm font-medium text-tertiary">
            Gestiona tu menú y precios sin entrar a Stripe.
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
        <div className="h-6 w-6 animate-ring rounded-circle border-2 border-outline-variant border-t-primary" />
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
      <header className="mb-12 flex flex-col gap-6 small:flex-row small:items-end small:justify-between">
        <div>
          <h1 className="font-heading text-4xl font-bold tracking-tight text-on-surface">Overview</h1>
          <p className="mt-2 font-medium text-tertiary">Welcome back to the Panka Editorial dashboard.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-surface-container-high px-6 py-3 text-sm font-bold transition-colors hover:bg-surface-variant"
          >
            <HiOutlineCalendar className="h-5 w-5" aria-hidden />
            Last 24 Hours
          </button>
          <Link
            href="/admin/productos"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/10 transition-all hover:opacity-90"
          >
            <HiOutlinePlus className="h-5 w-5" aria-hidden />
            Menu & products
          </Link>
        </div>
      </header>

      <section className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="flex flex-col justify-between rounded-[2rem] border-b-4 border-primary/20 bg-surface-container-lowest p-8 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="rounded-2xl bg-primary-fixed-dim/20 p-3 text-primary">
              <HiOutlineCurrencyDollar className="h-6 w-6" aria-hidden />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-primary">—</span>
          </div>
          <div className="mt-6">
            <p className="text-sm font-bold uppercase tracking-widest text-tertiary">Total Revenue</p>
            <h2 className="mt-1 font-heading text-3xl font-bold">
              {`$${orders
                .filter((o) => o.status !== "cancelled" && o.status !== "failed")
                .reduce((sum, o) => sum + o.total, 0)
                .toFixed(2)}`}
            </h2>
            <p className="mt-1 text-xs text-on-surface-variant">
              {orders.length} paid order{orders.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-[2rem] border-b-4 border-secondary-fixed-dim/40 bg-surface-container-lowest p-8 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="rounded-2xl bg-secondary-container/30 p-3 text-secondary">
              <HiOutlineShoppingBag className="h-6 w-6" aria-hidden />
            </div>
            <span className="text-xs font-bold text-secondary">Menu items</span>
          </div>
          <div className="mt-6">
            <p className="text-sm font-bold uppercase tracking-widest text-tertiary">Active products</p>
            <h2 className="mt-1 font-heading text-3xl font-bold">
              {productCount !== null ? productCount : "—"}
            </h2>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-[2rem] border-b-4 border-tertiary/20 bg-surface-container-lowest p-8 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="rounded-2xl bg-surface-container-highest p-3 text-tertiary">
              <HiOutlineStar className="h-6 w-6" aria-hidden />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-tertiary">Best seller</span>
          </div>
          <div className="mt-6">
            <p className="text-sm font-bold uppercase tracking-widest text-tertiary">Top item</p>
            <h2 className="mt-1 font-heading text-2xl font-bold leading-tight">{topSeller}</h2>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[2.5rem] bg-surface-container-lowest shadow-sm">
        <div className="flex flex-col gap-4 border-b border-outline-variant/10 bg-surface-container-low/50 p-8 small:flex-row small:items-center small:justify-between">
          <div>
            <h3 className="font-heading text-2xl font-bold">Recent Orders</h3>
            <p className="text-sm text-tertiary">Pedidos reales desde Stripe + Firestore</p>
          </div>
          <Link href="/admin/pedidos" className="inline-flex items-center gap-1 text-sm font-bold text-primary/80">
            View All Orders
            <HiOutlineArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-outline-variant/10 text-[10px] font-bold uppercase tracking-[0.2em] text-tertiary">
                <th className="px-8 py-6">Order ID</th>
                <th className="px-8 py-6">Customer</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6 text-right">Total</th>
                <th className="px-8 py-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {orders.slice(0, 6).length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-10 text-sm text-tertiary">
                    Aún no hay pedidos. Cuando un cliente pague, aparece aquí.
                  </td>
                </tr>
              ) : (
                orders.slice(0, 6).map((row) => {
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
                      <td className="px-8 py-5 font-mono text-sm text-on-surface-variant">{row.id.slice(0, 18)}…</td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-highest text-xs font-bold">
                            {initials}
                          </div>
                          <span className="font-semibold">{row.customer.name || row.customer.email || "—"}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        {tone === "ok" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-panka-green-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-panka-green-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-panka-green-500" />
                            {row.status}
                          </span>
                        )}
                        {tone === "prep" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-secondary-container/50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-secondary">
                            <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                            {row.status}
                          </span>
                        )}
                        {tone === "new" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
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
                      <td className="px-8 py-5 text-right font-bold">${row.total.toFixed(2)}</td>
                      <td className="px-8 py-5 text-center">
                        <Link
                          href="/admin/pedidos"
                          className="rounded-lg p-2 inline-flex hover:bg-surface-container"
                          aria-label="Open orders"
                        >
                          <HiOutlineDotsVertical className="text-on-surface-variant" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-4 border-t border-outline-variant/10 p-8 small:flex-row small:items-center small:justify-between">
          <p className="text-xs font-medium text-tertiary">
            Showing {Math.min(6, orders.length)} of {orders.length} orders
          </p>
          <Link
            href="/admin/pedidos"
            className="rounded-lg bg-surface-container-high px-4 py-2 text-xs font-bold hover:bg-surface-variant"
          >
            Open orders
          </Link>
        </div>
      </section>

      <footer className="mt-12 flex flex-col gap-8 md:flex-row md:items-start">
        <div className="flex-1 rounded-[2rem] border border-secondary-fixed-dim/30 bg-secondary-fixed-dim/20 p-8">
          <div className="mb-4 flex items-center gap-4">
            <HiOutlineSparkles className="h-6 w-6 text-secondary" aria-hidden />
            <h4 className="text-lg font-bold">Kitchen queue</h4>
          </div>
          <p className="text-sm leading-relaxed text-on-secondary-fixed-variant">
            {orders.filter((o) => o.status === "confirmed" || o.status === "preparing").length} order(s)
            waiting or in prep. Use Menu Management for the catalog; use Orders for kitchen status.
          </p>
          <Link href="/admin/pedidos" className="mt-6 inline-block text-sm font-bold text-secondary underline underline-offset-4">
            Open orders
          </Link>
        </div>
        <div className="w-full rounded-[2rem] bg-surface-container-high p-8 md:w-1/3">
          <h4 className="mb-6 font-heading text-lg font-bold">Last payment</h4>
          <p className="text-sm text-tertiary">
            {orders[0]
              ? `${orders[0].customer.name || orders[0].customer.email} · $${orders[0].total.toFixed(2)}`
              : "No payments yet."}
          </p>
        </div>
      </footer>
    </>
  );
}
