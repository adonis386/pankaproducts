"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  HiOutlineArrowRight,
  HiOutlineCalendar,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
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
            <h2 className="mt-1 font-heading text-3xl font-bold">—</h2>
            <p className="mt-1 text-xs text-on-surface-variant">Connect billing to show totals</p>
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
            <p className="text-sm text-tertiary">Sample preview — live orders when connected</p>
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-bold text-primary/80">
            View All Orders
            <HiOutlineArrowRight className="h-4 w-4" aria-hidden />
          </span>
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
              {[
                { id: "#PK-9231", initials: "AM", name: "Adriana Morales", status: "Delivered", tone: "ok" as const, total: "$124.00" },
                { id: "#PK-9232", initials: "RC", name: "Ricardo Castillo", status: "Preparing", tone: "prep" as const, total: "$48.50" },
                { id: "#PK-9233", initials: "LH", name: "Lucia Herrera", status: "New Order", tone: "new" as const, total: "$92.15" },
                { id: "#PK-9234", initials: "GT", name: "Gabriel Torres", status: "Cancelled", tone: "bad" as const, total: "$15.00" },
              ].map((row) => (
                <tr key={row.id} className="group transition-colors hover:bg-surface-container-low">
                  <td className="px-8 py-5 font-mono text-sm text-on-surface-variant">{row.id}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-highest text-xs font-bold">
                        {row.initials}
                      </div>
                      <span className="font-semibold">{row.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    {row.tone === "ok" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-panka-green-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-panka-green-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-panka-green-500" />
                        {row.status}
                      </span>
                    )}
                    {row.tone === "prep" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-secondary-container/50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-secondary">
                        <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                        {row.status}
                      </span>
                    )}
                    {row.tone === "new" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                        {row.status}
                      </span>
                    )}
                    {row.tone === "bad" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-error/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-error">
                        <span className="h-1.5 w-1.5 rounded-full bg-error" />
                        {row.status}
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-5 text-right font-bold">{row.total}</td>
                  <td className="px-8 py-5 text-center">
                    <button
                      type="button"
                      className="rounded-lg p-2 opacity-0 transition-opacity hover:bg-surface-container group-hover:opacity-100"
                      aria-label="More"
                    >
                      <HiOutlineDotsVertical className="text-on-surface-variant" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-4 border-t border-outline-variant/10 p-8 small:flex-row small:items-center small:justify-between">
          <p className="text-xs font-medium text-tertiary">Showing 4 of 248 orders (demo)</p>
          <div className="flex gap-2">
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-outline-variant/30 transition-colors hover:bg-surface-container-low"
              aria-label="Previous page"
            >
              <HiOutlineChevronLeft className="h-4 w-4" />
            </button>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xs font-bold text-on-primary">
              1
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-outline-variant/30 text-xs font-bold">
              2
            </span>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-outline-variant/30 transition-colors hover:bg-surface-container-low"
              aria-label="Next page"
            >
              <HiOutlineChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <footer className="mt-12 flex flex-col gap-8 md:flex-row md:items-start">
        <div className="flex-1 rounded-[2rem] border border-secondary-fixed-dim/30 bg-secondary-fixed-dim/20 p-8">
          <div className="mb-4 flex items-center gap-4">
            <HiOutlineSparkles className="h-6 w-6 text-secondary" aria-hidden />
            <h4 className="text-lg font-bold">Inventory Insight</h4>
          </div>
          <p className="text-sm leading-relaxed text-on-secondary-fixed-variant">
            Banana leaf stocks are currently high. Ideal time to promote Oaxacan-style tamales for the upcoming
            weekend rush.
          </p>
          <button type="button" className="mt-6 text-sm font-bold text-secondary underline underline-offset-4">
            Create Promotion
          </button>
        </div>
        <div className="w-full rounded-[2rem] bg-surface-container-high p-8 md:w-1/3">
          <h4 className="mb-6 font-heading text-lg font-bold">System Health</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Online Orders</span>
              <span className="flex items-center gap-1 text-xs font-bold text-primary">
                Active
                <span className="h-2 w-2 rounded-full bg-primary" />
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-outline-variant/30">
              <div className="h-full w-[98%] rounded-full bg-primary" />
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm">Server Latency</span>
              <span className="text-xs font-bold text-primary">24ms</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
