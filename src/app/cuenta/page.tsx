"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { auth } from "@/lib/firebase";
import type { PublicOrder } from "@/lib/order-types";
import Link from "next/link";
import { HiOutlineUser, HiOutlineLogout } from "react-icons/hi";

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

export default function CuentaPage() {
  const { user, logout, loading } = useAuth();
  const { t } = useLanguage();
  const [orders, setOrders] = useState<PublicOrder[]>([]);
  const [ordersError, setOrdersError] = useState("");
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setOrders([]);
      return;
    }
    let cancelled = false;
    const run = async () => {
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
        if (!cancelled) setOrders(Array.isArray(data.orders) ? data.orders : []);
      } catch (e) {
        if (!cancelled) setOrdersError(e instanceof Error ? e.message : "Failed to load orders.");
      } finally {
        if (!cancelled) setOrdersLoading(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-6 w-6 animate-ring rounded-circle border-2 border-grey-20 border-t-panka-brown-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center py-20">
        <div className="mx-auto max-w-sm px-6 text-center">
          <HiOutlineUser className="mx-auto mb-4 h-12 w-12 text-grey-20" />
          <h1 className="mb-2 font-heading text-2xl font-bold text-panka-brown-500">{t("account.signInRequired")}</h1>
          <p className="mb-6 text-base text-grey-40">{t("account.signInDesc")}</p>
          <Link href="/" className="inline-block rounded-xl bg-panka-brown-500 px-8 py-3.5 text-base font-bold text-white transition-all hover:bg-panka-brown-600">
            {t("account.goHome")}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="border-b border-grey-10 bg-white pb-10 pt-14">
        <div className="mx-auto max-w-7xl px-6">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-grey-30">{t("account.tag")}</p>
          <h1 className="font-heading text-4xl font-bold text-panka-brown-500">
            {t("account.hi")} {user.displayName || "there"}
          </h1>
        </div>
      </section>

      <section className="py-10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-6 small:grid-cols-3">
            <div className="rounded-2xl border border-grey-10 bg-white p-6">
              <h2 className="mb-4 text-base font-bold text-grey-80">{t("account.profile")}</h2>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-circle bg-panka-green-50 text-base font-bold text-panka-green-600">
                  {user.displayName?.[0] || user.email?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-grey-80">{user.displayName || t("account.noName")}</p>
                  <p className="text-xs text-grey-40">{user.email}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-grey-10 bg-white p-6 small:col-span-2">
              <h2 className="mb-4 text-base font-bold text-grey-80">{t("account.myOrders")}</h2>
              {ordersLoading ? (
                <p className="text-sm text-grey-40">{t("account.loadingOrders")}</p>
              ) : ordersError ? (
                <p className="text-sm text-grey-40">{ordersError}</p>
              ) : orders.length === 0 ? (
                <>
                  <p className="text-sm text-grey-40">{t("account.noOrders")}</p>
                  <Link href="/productos" className="mt-4 inline-block rounded-xl bg-grey-5 px-5 py-2.5 text-sm font-semibold text-grey-60 transition-colors hover:bg-grey-10">
                    {t("cart.browseTamales")}
                  </Link>
                </>
              ) : (
                <ul className="space-y-4">
                  {orders.map((order) => (
                    <li key={order.id} className="rounded-xl bg-grey-5 px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-grey-80">
                            {order.items.map((item) => `${item.quantity}× ${item.name}`).join(", ")}
                          </p>
                          <p className="text-xs uppercase tracking-wider text-grey-40">{order.status}</p>
                        </div>
                        <p className="text-sm font-bold text-grey-80">{formatMoney(order.total, order.currency)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-2xl border border-grey-10 bg-white p-6">
              <h2 className="mb-4 text-base font-bold text-grey-80">{t("account.settings")}</h2>
              <button onClick={logout} className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm text-grey-50 transition-colors hover:bg-grey-5">
                <HiOutlineLogout className="h-4 w-4" />
                {t("nav.signOut")}
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
