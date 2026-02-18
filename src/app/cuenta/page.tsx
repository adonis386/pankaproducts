"use client";

import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import { HiOutlineUser, HiOutlineLogout } from "react-icons/hi";

export default function CuentaPage() {
  const { user, logout, loading } = useAuth();
  const { t } = useLanguage();

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
          <h1 className="mb-2 font-heading text-xl font-bold text-panka-brown-500">{t("account.signInRequired")}</h1>
          <p className="mb-6 text-sm text-grey-40">{t("account.signInDesc")}</p>
          <Link href="/" className="inline-block rounded-xl bg-panka-brown-500 px-7 py-3 text-sm font-bold text-white transition-all hover:bg-panka-brown-600">
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
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-grey-30">{t("account.tag")}</p>
          <h1 className="font-heading text-3xl font-bold text-panka-brown-500">
            {t("account.hi")} {user.displayName || "there"}
          </h1>
        </div>
      </section>

      <section className="py-10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-6 small:grid-cols-3">
            <div className="rounded-2xl border border-grey-10 bg-white p-6">
              <h2 className="mb-4 text-sm font-bold text-grey-80">{t("account.profile")}</h2>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-circle bg-panka-green-50 text-sm font-bold text-panka-green-600">
                  {user.displayName?.[0] || user.email?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-grey-80">{user.displayName || t("account.noName")}</p>
                  <p className="text-xs text-grey-40">{user.email}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-grey-10 bg-white p-6">
              <h2 className="mb-4 text-sm font-bold text-grey-80">{t("account.myOrders")}</h2>
              <p className="text-sm text-grey-40">{t("account.noOrders")}</p>
              <Link href="/productos" className="mt-4 inline-block rounded-xl bg-grey-5 px-4 py-2 text-xs font-semibold text-grey-60 transition-colors hover:bg-grey-10">
                {t("cart.browseTamales")}
              </Link>
            </div>

            <div className="rounded-2xl border border-grey-10 bg-white p-6">
              <h2 className="mb-4 text-sm font-bold text-grey-80">{t("account.settings")}</h2>
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
