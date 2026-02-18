"use client";

import Hero from "@/components/Hero";
import ProductCarousel from "@/components/ProductCarousel";
import DeliveryInfo from "@/components/DeliveryInfo";
import Newsletter from "@/components/Newsletter";
import { getPopularProducts, getProductsByCategory } from "@/lib/products";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";

export default function Home() {
  const popular = getPopularProducts();
  const salados = getProductsByCategory("salados");
  const dulces = getProductsByCategory("dulces");
  const { t } = useLanguage();

  return (
    <>
      <Hero />

      <ProductCarousel title={t("home.bestSellers")} products={popular} href="/productos" />

      <DeliveryInfo />

      {/* Banner */}
      <section className="py-14">
        <div className="mx-auto max-w-7xl px-6">
          <div className="relative overflow-hidden rounded-2xl bg-panka-brown-500">
            <div className="grid grid-cols-1 small:grid-cols-2">
              <div className="relative z-10 flex flex-col justify-center px-8 py-14 small:px-14 small:py-20">
                <span className="mb-3 text-sm font-semibold uppercase tracking-widest text-panka-brown-200">
                  {t("home.specials")}
                </span>
                <h2 className="mb-4 font-heading text-4xl font-bold text-white small:text-5xl">
                  {t("home.bannerTitle")}
                </h2>
                <p className="mb-6 max-w-sm text-base leading-relaxed text-panka-brown-200">
                  {t("home.bannerDesc")}
                </p>
                <a href="/productos?cat=especiales" className="w-fit rounded-xl bg-white px-7 py-3.5 text-base font-bold text-panka-brown-500 transition-all hover:shadow-panka-md">
                  {t("home.discover")}
                </a>
              </div>
              <div className="relative min-h-[250px]">
                <Image src="/hero_3.jpg" alt="Tamales Oaxaqueños" fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-panka-brown-500 via-panka-brown-500/40 to-transparent small:from-panka-brown-500/60" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <ProductCarousel title={t("home.savory")} products={salados} href="/productos?cat=salados" />
      <ProductCarousel title={t("home.sweet")} products={dulces} href="/productos?cat=dulces" />

      {/* Reviews */}
      <section className="py-14">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="mb-8 font-heading text-3xl font-bold text-panka-brown-500">
            {t("home.reviewsTitle")}
          </h2>
          <div className="grid grid-cols-1 gap-4 xsmall:grid-cols-2 small:grid-cols-3">
            {[
              { name: "María G.", text: t("home.review1") },
              { name: "Carlos L.", text: t("home.review2") },
              { name: "Ana M.", text: t("home.review3") },
            ].map((review) => (
              <div key={review.name} className="rounded-2xl border border-grey-10 bg-white p-6 transition-all hover:shadow-panka-sm">
                <div className="mb-3 flex gap-0.5 text-sm text-amber-400">
                  {"★★★★★".split("").map((s, i) => <span key={i}>{s}</span>)}
                </div>
                <p className="mb-4 text-base leading-relaxed text-grey-50">&ldquo;{review.text}&rdquo;</p>
                <p className="text-sm font-semibold text-grey-70">{review.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Newsletter />
    </>
  );
}
