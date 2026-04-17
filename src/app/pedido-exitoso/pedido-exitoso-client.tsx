"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { HiOutlineCheckCircle, HiOutlinePrinter } from "react-icons/hi";
import { useLanguage } from "@/context/LanguageContext";

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
  const { t } = useLanguage();
  const sp = useSearchParams();
  const sessionId = sp.get("session_id") || "";

  const [order, setOrder] = useState<SuccessOrder | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

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
      try {
        const res = await fetch(endpoint, { cache: "no-store" });
        const data = (await res.json()) as SuccessOrder & { error?: string };
        if (!res.ok) throw new Error(data.error || "Order not found.");
        if (!cancelled) setOrder(data);
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

  return (
    <section className="bg-surface pb-20 pt-14">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-10 flex flex-col items-start justify-between gap-6 small:flex-row small:items-center">
          <div className="flex items-start gap-4">
            <HiOutlineCheckCircle className="mt-1 h-10 w-10 text-primary" aria-hidden />
            <div>
              <h1 className="font-heading text-4xl font-bold tracking-tight text-on-surface">
                {t("success.title")}
              </h1>
              <p className="mt-2 text-tertiary">{t("success.subtitle")}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-xl bg-surface-container-high px-5 py-3 text-sm font-bold text-on-surface transition-colors hover:bg-surface-variant"
            >
              <HiOutlinePrinter className="h-5 w-5" aria-hidden />
              {t("success.print")}
            </button>
            <Link
              href="/productos"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-bold text-on-primary transition-all hover:bg-primary-container"
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

