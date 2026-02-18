"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  HiOutlineShoppingBag,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineUser,
  HiOutlineGlobeAlt,
} from "react-icons/hi";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import AuthModal from "./AuthModal";

export default function Navbar() {
  const { totalItems, toggleCart } = useCart();
  const { user, logout } = useAuth();
  const { locale, setLocale, t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/productos", label: t("nav.tamales") },
    { href: "/nosotros", label: t("nav.about") },
  ];

  const toggleLang = () => setLocale(locale === "en" ? "es" : "en");

  return (
    <>
      <header className="sticky top-0 z-40 glass border-b border-grey-20/60">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="Panka" width={42} height={42} className="rounded-circle" />
            <span className="font-heading text-2xl font-bold text-panka-brown-500">Panka</span>
          </Link>

          <ul className="hidden small:flex items-center gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="rounded-xl px-5 py-2.5 text-[15px] font-medium text-grey-60 transition-colors hover:bg-grey-5 hover:text-panka-brown-500"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-1.5">
            {/* Language toggle */}
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-medium text-grey-50 transition-colors hover:bg-grey-5 hover:text-grey-70"
              aria-label="Change language"
            >
              <HiOutlineGlobeAlt className="h-4 w-4" />
              <span className="uppercase">{locale}</span>
            </button>

            {/* Auth */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-grey-60 transition-colors hover:bg-grey-5"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-circle bg-panka-green-50 text-xs font-bold text-panka-green-600">
                    {user.displayName?.[0] || user.email?.[0]?.toUpperCase() || "U"}
                  </div>
                  <span className="hidden xsmall:block max-w-[100px] truncate">
                    {user.displayName || t("nav.myAccount")}
                  </span>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-grey-10 bg-white p-1.5 shadow-panka-md animate-scale-in">
                    <Link
                      href="/cuenta"
                      onClick={() => setUserMenuOpen(false)}
                      className="block rounded-lg px-3 py-2 text-sm text-grey-60 transition-colors hover:bg-grey-5"
                    >
                      {t("nav.myAccount")}
                    </Link>
                    <button
                      onClick={() => { logout(); setUserMenuOpen(false); }}
                      className="block w-full rounded-lg px-3 py-2 text-left text-sm text-grey-60 transition-colors hover:bg-grey-5"
                    >
                      {t("nav.signOut")}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="hidden xsmall:flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium text-grey-60 transition-colors hover:bg-grey-5"
              >
                <HiOutlineUser className="h-4 w-4" />
                {t("nav.signIn")}
              </button>
            )}

            {/* Cart */}
            <button
              onClick={toggleCart}
              className="relative rounded-xl bg-grey-5 p-2.5 transition-all hover:bg-grey-10"
              aria-label={t("nav.cart")}
            >
              <HiOutlineShoppingBag className="h-5 w-5 text-grey-70" />
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-[18px] w-[18px] items-center justify-center rounded-circle bg-panka-green-500 text-[9px] font-bold text-white">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="small:hidden rounded-xl p-2.5 text-grey-60 transition-colors hover:bg-grey-5"
            >
              {mobileOpen ? <HiOutlineX className="h-5 w-5" /> : <HiOutlineMenu className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        {mobileOpen && (
          <div className="small:hidden border-t border-grey-10 bg-white animate-fade-in-top">
            <div className="flex flex-col gap-0.5 px-4 py-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm font-medium text-grey-70 transition-colors hover:bg-grey-5"
                >
                  {link.label}
                </Link>
              ))}
              {!user && (
                <button
                  onClick={() => { setAuthOpen(true); setMobileOpen(false); }}
                  className="mt-2 rounded-xl bg-panka-brown-500 py-3 text-sm font-bold text-white"
                >
                  {t("nav.signIn")}
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
