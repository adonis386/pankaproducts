"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import type { KitchenStatus, PublicOrder } from "@/lib/order-types";

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

export default function AdminPedidosPage() {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<PublicOrder[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

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
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update order.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-6 w-6 animate-ring rounded-circle border-2 border-grey-20 border-t-panka-brown-500" />
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
      <header className="mb-10">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-tertiary">Orders</p>
        <h1 className="font-heading text-4xl font-bold tracking-tight text-on-surface">Pedidos</h1>
        <p className="mt-2 text-sm font-medium text-tertiary">
          Pedidos pagados en Stripe. Cambia el estado para cocina y entrega.
        </p>
      </header>

      {error ? (
        <p className="mb-6 rounded-xl border border-error/20 bg-error-container/30 p-4 text-sm text-on-surface">
          {error}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-[2rem] bg-surface-container-lowest">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-outline-variant/10 text-[10px] font-bold uppercase tracking-[0.2em] text-tertiary">
                <th className="px-6 py-5">Cuando</th>
                <th className="px-6 py-5">Cliente</th>
                <th className="px-6 py-5">Items</th>
                <th className="px-6 py-5">Estado</th>
                <th className="px-6 py-5 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-sm text-tertiary">
                    {busy ? "Cargando…" : "Aún no hay pedidos pagados."}
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="align-top">
                    <td className="px-6 py-5">
                      <p className="text-sm font-semibold">{formatWhen(order.createdAt)}</p>
                      <p className="mt-1 font-mono text-[11px] text-on-surface-variant">{order.id}</p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="font-semibold">{order.customer.name || "—"}</p>
                      <p className="text-xs text-tertiary">{order.customer.email}</p>
                      <p className="text-xs text-tertiary">{order.customer.phone}</p>
                      <p className="mt-1 text-xs text-on-surface-variant">
                        {order.customer.address}
                        {order.customer.city ? `, ${order.customer.city}` : ""}
                      </p>
                    </td>
                    <td className="px-6 py-5 text-sm">
                      {order.items.map((item, idx) => (
                        <p key={`${order.id}-${idx}`}>
                          {item.quantity}× {item.name}
                        </p>
                      ))}
                    </td>
                    <td className="px-6 py-5">
                      <select
                        className="rounded-lg border border-outline-variant/30 bg-surface-container-lowest px-3 py-2 text-sm"
                        value={STATUSES.includes(order.status) ? order.status : "confirmed"}
                        disabled={busy}
                        onChange={(e) => void changeStatus(order.id, e.target.value as KitchenStatus)}
                      >
                        {STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-5 text-right font-bold">
                      {formatMoney(order.total, order.currency)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
