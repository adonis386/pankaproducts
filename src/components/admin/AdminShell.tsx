"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HiOutlineCog,
  HiOutlinePrinter,
  HiOutlineReceiptRefund,
  HiOutlineViewGrid,
  HiOutlineViewList,
} from "react-icons/hi";
import { useAuth } from "@/context/AuthContext";
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
  { href: "#orders", label: "Orders", icon: HiOutlineReceiptRefund, exact: false, disabled: true },
  { href: "#settings", label: "Settings", icon: HiOutlineCog, exact: false, disabled: true },
];

function isActive(pathname: string, href: string, exact: boolean) {
  if (href.startsWith("#")) return false;
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

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
      <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col gap-2 bg-surface-container py-8">
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

        <div className="mt-auto px-8">
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

      <main className="ml-64 min-h-screen p-8 md:p-12">{children}</main>

      <button
        type="button"
        onClick={() => window.print()}
        className="fixed bottom-10 right-10 z-50 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-on-secondary shadow-[0_16px_32px_-10px_rgba(122,88,41,0.3)] transition-transform hover:scale-105"
        aria-label="Print"
      >
        <HiOutlinePrinter className="h-6 w-6" />
      </button>
    </div>
  );
}
