"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-panka-cream">
      <div className="mx-auto grid max-w-7xl grid-cols-1 small:grid-cols-2 small:min-h-[80vh]">
        <div className="flex flex-col justify-center px-6 py-16 small:py-24 small:pr-12">
          <span className="mb-5 inline-flex w-fit items-center gap-2 rounded-circle bg-panka-green-50 px-4 py-2 text-sm font-semibold uppercase tracking-wider text-panka-green-600">
            <span className="h-1.5 w-1.5 rounded-circle bg-panka-green-500" />
            {t("hero.badge")}
          </span>

          <h1 className="mb-6 font-heading text-5xl font-bold leading-[1.08] text-panka-brown-500 small:text-[5rem]">
            {t("hero.titleLine1")}
            <br />
            <span className="text-panka-green-500">{t("hero.titleLine2")}</span>
          </h1>

          <p className="mb-8 max-w-md text-lg leading-relaxed text-grey-50">
            {t("hero.subtitle")}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/productos"
              className="rounded-xl bg-panka-brown-500 px-8 py-4 text-base font-bold text-white transition-all hover:bg-panka-brown-600 hover:shadow-panka-md"
            >
              {t("hero.orderNow")}
            </Link>
            <Link
              href="/productos"
              className="rounded-xl border border-grey-20 px-8 py-4 text-base font-medium text-grey-60 transition-all hover:border-grey-30 hover:bg-grey-5"
            >
              {t("hero.viewMenu")}
            </Link>
          </div>

          <div className="mt-10 flex items-center gap-6 border-t border-grey-10 pt-6">
            <div>
              <p className="text-3xl font-bold text-panka-brown-500">500+</p>
              <p className="text-sm text-grey-40">{t("hero.ordersMonth")}</p>
            </div>
            <div className="h-10 w-px bg-grey-10" />
            <div>
              <p className="text-3xl font-bold text-panka-brown-500">4.9</p>
              <p className="text-sm text-grey-40">{t("hero.rating")}</p>
            </div>
            <div className="h-10 w-px bg-grey-10" />
            <div>
              <p className="text-3xl font-bold text-panka-brown-500">24h</p>
              <p className="text-sm text-grey-40">{t("hero.delivery")}</p>
            </div>
          </div>
        </div>

        <div className="relative min-h-[400px] small:min-h-0">
          <Image src="/hero_1.jpg" alt="Panka Tamales" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-panka-cream/20 via-transparent to-transparent small:bg-gradient-to-r small:from-panka-cream/30" />
          <div className="absolute bottom-6 left-6 right-6 rounded-2xl glass p-4 small:bottom-8 small:left-8 small:right-auto small:max-w-[240px]">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-panka-green-600">
              {t("hero.bestSeller")}
            </p>
            <p className="text-sm font-bold text-panka-brown-500">Tamales de Mole Rojo</p>
            <p className="text-xs text-grey-40">$5.50 &middot; 4.9 ★</p>
          </div>
        </div>
      </div>
    </section>
  );
}
