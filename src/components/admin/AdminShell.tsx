"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  HiOutlineBell,
  HiOutlineCog,
  HiOutlineMenu,
  HiOutlinePrinter,
  HiOutlineReceiptRefund,
  HiOutlineViewGrid,
  HiOutlineViewList,
  HiOutlineX,
} from "react-icons/hi";
import { FaWhatsapp } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import type { PublicOrder } from "@/lib/order-types";
import type { IconType } from "react-icons";

type NavItem = {
  href: string;
  label: string;
  icon: IconType;
  exact: boolean;
  disabled?: boolean;
};

const nav: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: HiOutlineViewGrid, exact: true },
  { href: "/admin/productos", label: "Menu Management", icon: HiOutlineViewList, exact: false },
  { href: "/admin/pedidos", label: "Orders", icon: HiOutlineReceiptRefund, exact: false },
  { href: "/admin/settings", label: "Settings & Content", icon: HiOutlineCog, exact: false },
];

function isActive(pathname: string, href: string, exact: boolean) {
  if (href.startsWith("#")) return false;
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function playOrderBell() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const playTone = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.22, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };
    const now = ctx.currentTime;
    playTone(880, now, 0.25);
    playTone(1174.66, now + 0.18, 0.45);
  } catch {
    // ignore audio autoplay restrictions
  }
}

function formatCustomerWhatsAppUrl(order: PublicOrder) {
  let digits = (order.customer.phone || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 10) digits = `1${digits}`;
  const shortId = order.id.slice(-8).toUpperCase();
  const itemsSummary = order.items.map((i) => `${i.quantity}x ${i.name}`).join(", ");
  const msg =
    `¡Hola ${order.customer.name || "Cliente"}! 🫔 Te escribimos de *Panka Products*.\n\n` +
    `Confirmamos la recepción de tu pedido *#${shortId}* (${itemsSummary}) por *$${order.total.toFixed(2)} USD*.\n` +
    `Dirección de entrega: ${order.customer.address}${
      order.customer.city ? `, ${order.customer.city}` : ""
    }.\n\n` +
    `¡Ya está en nuestra cocina! Te avisaremos cuando salga a reparto.`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(msg)}`;
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  // Browser notification state & live order toast
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | "unsupported">(
    "default"
  );
  const [liveToastOrder, setLiveToastOrder] = useState<PublicOrder | null>(null);
  const knownOrderIdsRef = useRef<Set<string> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setNotifPermission("unsupported");
      return;
    }
    setNotifPermission(Notification.permission);
  }, []);

  const requestBrowserNotifications = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    const perm = await Notification.requestPermission();
    setNotifPermission(perm);
    if (perm === "granted") {
      playOrderBell();
      try {
        new Notification("🔔 Alertas de Cocina Activadas — Panka Admin", {
          body: "Recibirás una notificación con sonido cada vez que entre un nuevo pedido pagado.",
          icon: "/assets/ICON.png",
        });
      } catch {
        // ignore
      }
    }
  };

  const triggerNewOrderAlert = useCallback(
    (order: PublicOrder) => {
      playOrderBell();
      setLiveToastOrder(order);
      window.dispatchEvent(new CustomEvent("panka:new-order", { detail: order }));

      if (
        typeof window !== "undefined" &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        try {
          const itemsText = order.items.map((i) => `${i.quantity}x ${i.name}`).join(", ");
          const n = new Notification(
            `🫔 ¡Nuevo Pedido Pagado! — $${order.total.toFixed(2)}`,
            {
              body: `${order.customer.name || "Cliente"} • ${itemsText} (${
                order.customer.city || "Entrega"
              })`,
              icon: "/assets/ICON.png",
              tag: `order-${order.id}`,
            }
          );
          n.onclick = () => {
            window.focus();
            router.push("/admin/pedidos");
            n.close();
          };
        } catch {
          // ignore
        }
      }
    },
    [router]
  );

  // Poll for new orders every 15 seconds while Admin is open
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const checkOrders = async () => {
      try {
        if (!auth?.currentUser) return;
        const token = await auth.currentUser.getIdToken();
        const res = await fetch("/admin/api/orders", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as { orders?: PublicOrder[] };
        if (cancelled || !Array.isArray(data.orders)) return;

        // First load: record existing order IDs without ringing
        if (knownOrderIdsRef.current === null) {
          knownOrderIdsRef.current = new Set(data.orders.map((o) => o.id));
          return;
        }

        const currentKnown = knownOrderIdsRef.current;
        for (const ord of data.orders) {
          if (!currentKnown.has(ord.id)) {
            currentKnown.add(ord.id);
            triggerNewOrderAlert(ord);
          }
        }
      } catch {
        // ignore transient network errors
      }
    };

    void checkOrders();
    const interval = window.setInterval(() => {
      void checkOrders();
    }, 15000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [user, triggerNewOrderAlert]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const initials =
    user?.displayName
      ?.split(/\s+/)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ||
    user?.email?.slice(0, 2).toUpperCase() ||
    "—";

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      {/* Live New Order Floating Toast */}
      {liveToastOrder && (
        <div className="fixed right-4 top-4 z-50 w-full max-w-sm rounded-3xl border border-emerald-500/30 bg-surface-container-lowest p-5 shadow-2xl animate-scale-in print:hidden">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                ¡Nuevo Pedido Recibido!
              </span>
            </div>
            <button
              type="button"
              onClick={() => setLiveToastOrder(null)}
              className="rounded-lg p-1 text-tertiary hover:bg-surface-container"
            >
              <HiOutlineX className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-2 font-heading text-lg font-bold text-on-surface">
            {liveToastOrder.customer.name || "Cliente"} — ${liveToastOrder.total.toFixed(2)}
          </p>
          <p className="mt-1 text-xs text-tertiary">
            {liveToastOrder.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}
          </p>
          {liveToastOrder.customer.city && (
            <p className="mt-1 text-[11px] font-medium text-on-surface-variant">
              📍 {liveToastOrder.customer.address}, {liveToastOrder.customer.city}
            </p>
          )}
          <div className="mt-4 flex gap-2">
            <Link
              href="/admin/pedidos"
              onClick={() => setLiveToastOrder(null)}
              className="flex-1 rounded-xl bg-primary py-2.5 text-center text-xs font-bold text-on-primary"
            >
              Ver en Pedidos
            </Link>
            {formatCustomerWhatsAppUrl(liveToastOrder) && (
              <a
                href={formatCustomerWhatsAppUrl(liveToastOrder)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700"
              >
                <FaWhatsapp className="h-4 w-4" />
                WhatsApp
              </a>
            )}
          </div>
        </div>
      )}

      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-outline-variant/20 bg-surface-container/95 px-4 py-3 backdrop-blur small:hidden print:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="rounded-xl p-2 text-on-surface hover:bg-surface-container-high"
            aria-label="Abrir menú"
            aria-expanded={menuOpen}
          >
            <HiOutlineMenu className="h-6 w-6" />
          </button>
          <Image
            src="/assets/ICON.png"
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
          />
          <span className="font-heading text-lg text-on-surface">Admin Panel</span>
        </div>

        {notifPermission !== "unsupported" && (
          <button
            type="button"
            onClick={() => void requestBrowserNotifications()}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold ${
              notifPermission === "granted"
                ? "bg-emerald-500/15 text-emerald-700"
                : "bg-primary/15 text-primary"
            }`}
          >
            <HiOutlineBell className="h-4 w-4" />
            {notifPermission === "granted" ? "Alertas Activas" : "Activar Alertas"}
          </button>
        )}
      </header>

      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 small:hidden"
          onClick={() => setMenuOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={[
          "fixed left-0 top-0 z-50 flex h-dvh w-64 flex-col gap-2 overflow-y-auto bg-surface-container py-8 transition-transform duration-200 print:hidden",
          menuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full",
          "small:translate-x-0 small:shadow-none",
        ].join(" ")}
      >
        <button
          type="button"
          onClick={() => setMenuOpen(false)}
          className="absolute right-3 top-3 rounded-xl p-2 text-on-surface/60 hover:bg-surface-container-high small:hidden"
          aria-label="Cerrar menú"
        >
          <HiOutlineX className="h-5 w-5" />
        </button>
        <div className="mb-10 flex items-center gap-3 px-8">
          <Image
            src="/assets/ICON.png"
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 object-contain"
          />
          <div className="flex flex-col">
            <span className="font-heading text-xl text-on-surface">Admin Panel</span>
            <span className="text-[10px] font-sans uppercase tracking-widest text-tertiary">
              Panka Editorial
            </span>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {nav.map((item) => {
            const active = !item.disabled && isActive(pathname, item.href, item.exact);
            const Icon = item.icon;

            if (item.disabled) {
              return (
                <span
                  key={item.href}
                  className="flex cursor-not-allowed items-center gap-3 px-8 py-3 text-sm font-semibold text-on-surface/40"
                  title="Próximamente"
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {item.label}
                </span>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={[
                  "ml-4 flex items-center gap-3 rounded-l-full py-3 pl-4 text-sm font-semibold transition-all duration-200",
                  active
                    ? "translate-x-1 bg-surface-container-lowest text-primary shadow-[var(--shadow-editorial)]"
                    : "text-on-surface/60 hover:bg-surface-container-low hover:text-on-surface",
                ].join(" ")}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Browser Notifications Card in Sidebar */}
        {notifPermission !== "unsupported" && (
          <div className="mx-6 mt-6 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-3.5">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-on-surface">
                <HiOutlineBell className="h-4 w-4 text-primary" />
                Alertas Navegador
              </span>
              {notifPermission === "granted" && (
                <span className="flex h-2 w-2 rounded-full bg-emerald-500" title="Activas" />
              )}
            </div>
            {notifPermission === "granted" ? (
              <div className="mt-1.5">
                <p className="text-[10px] text-emerald-700 font-semibold">
                  Notificaciones y sonido activos en tiempo real.
                </p>
                <button
                  type="button"
                  onClick={() => void requestBrowserNotifications()}
                  className="mt-2 text-[10px] font-bold text-primary underline underline-offset-2"
                >
                  Probar sonido y alerta
                </button>
              </div>
            ) : notifPermission === "denied" ? (
              <p className="mt-1.5 text-[10px] text-error">
                Permiso bloqueado en el navegador. Habilítalo en el ícono de candado junto a la URL.
              </p>
            ) : (
              <button
                type="button"
                onClick={() => void requestBrowserNotifications()}
                className="mt-2 w-full rounded-xl bg-primary py-2 text-[11px] font-bold text-on-primary transition-all hover:opacity-90"
              >
                Activar Notificaciones
              </button>
            )}
          </div>
        )}

        <div className="mt-auto px-8 pt-4">
          <div className="flex items-center gap-3 rounded-xl bg-surface-container-highest p-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary-container text-xs font-bold text-on-secondary-container">
              {initials}
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="block truncate text-xs font-bold text-on-surface">
                {user?.displayName || user?.email || "Guest"}
              </span>
              {user ? (
                <button
                  type="button"
                  onClick={() => void logout()}
                  className="text-left text-[10px] font-medium text-tertiary underline-offset-2 hover:text-secondary hover:underline"
                >
                  Sign out
                </button>
              ) : (
                <Link
                  href="/admin"
                  className="text-left text-[10px] font-medium text-primary underline-offset-2 hover:underline"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      </aside>

      <div className="min-h-screen p-4 xsmall:p-6 small:ml-64 small:p-8 medium:p-12">{children}</div>

      <button
        type="button"
        onClick={() => window.print()}
        className="fixed bottom-10 right-10 z-30 hidden small:flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-on-secondary shadow-[0_16px_32px_-10px_rgba(122,88,41,0.3)] transition-transform hover:scale-105 print:hidden"
        aria-label="Print"
      >
        <HiOutlinePrinter className="h-6 w-6" />
      </button>
    </div>
  );
}
