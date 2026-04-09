"use client";

import Hero from "@/components/Hero";
import ProductCarousel from "@/components/ProductCarousel";
import DeliveryInfo from "@/components/DeliveryInfo";
import Newsletter from "@/components/Newsletter";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { useCatalog } from "@/context/CatalogContext";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";

export default function Home() {
  const { t } = useLanguage();
  const { products, loading } = useCatalog();
  const popular = products.filter((p) => p.isPopular);
  const salados = products.filter((p) => p.category === "salados");
  const dulces = products.filter((p) => p.category === "dulces");
  const especiales = products.filter((p) => p.category === "especiales");
  const categoryCount =
    (salados.length > 0 ? 1 : 0) + (dulces.length > 0 ? 1 : 0) + (especiales.length > 0 ? 1 : 0);

  const onlyOneCategory = categoryCount === 1;

  const bannerHref = especiales.length > 0 ? "/productos?cat=especiales" : "/productos";
  const bannerTag = especiales.length > 0 ? t("home.specials") : t("home.bestSellers");

  const featured = [...popular, ...products.filter((p) => !p.isPopular)].slice(0, 3);

  return (
    <>
      <Hero />

      {loading && (
        <section className="py-10">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-6 flex items-end justify-between">
              <div className="h-8 w-56 rounded bg-grey-5 animate-pulse" />
              <div className="h-9 w-20 rounded-xl bg-grey-5 animate-pulse" />
            </div>
            <div className="scrollbar-hide flex gap-4 overflow-x-auto px-2 pb-4">
              {Array.from({ length: 4 }).map((_, idx) => (
                <ProductCardSkeleton key={idx} compact />
              ))}
            </div>
          </div>
        </section>
      )}

      {!loading && onlyOneCategory && products.length > 0 && (
        <ProductCarousel title={t("home.allTamales")} products={products} href="/productos" />
      )}

      {!loading && !onlyOneCategory && popular.length > 0 && (
        <ProductCarousel title={t("home.bestSellers")} products={popular} href="/productos" />
      )}

      {!loading && featured.length > 0 && (
        <section className="py-24 bg-surface-container-low">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-16 flex items-end justify-between gap-6">
              <div>
                <h2 className="mb-4 font-heading text-4xl text-on-surface">{t("home.seasonalSelections")}</h2>
                <p className="text-tertiary">{t("home.signatureDesc")}</p>
              </div>
              <Link
                href="/productos"
                className="hidden small:inline-flex items-center gap-2 text-primary font-semibold hover:underline underline-offset-8 transition-all"
              >
                {t("home.viewAllFlavors")} <span aria-hidden>→</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-8 small:grid-cols-3">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      <DeliveryInfo />

      {/* Banner */}
      <section className="py-20 bg-surface">
        <div className="mx-auto max-w-7xl px-6">
          <div className="relative overflow-hidden rounded-3xl bg-surface-container shadow-[var(--shadow-editorial-lg)]">
            <div className="grid grid-cols-1 small:grid-cols-2">
              <div className="relative z-10 flex flex-col justify-center px-8 py-14 small:px-14 small:py-20">
                <span className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-secondary">
                  {bannerTag}
                </span>
                <h3 className="mb-4 max-w-xl font-heading text-4xl font-bold leading-[1.15] text-on-surface">
                  {t("home.allTamales")}
                </h3>
                <p className="mb-8 max-w-sm text-base leading-relaxed text-tertiary">
                  {t("home.bannerDesc")}
                </p>
                <a
                  href={bannerHref}
                  className="w-fit rounded-xl bg-gradient-to-br from-primary to-primary-container px-7 py-3.5 text-base font-semibold text-on-primary shadow-[var(--shadow-editorial)] transition-all hover:brightness-[1.02]"
                >
                  {t("home.discover")}
                </a>
              </div>
              <div className="relative min-h-[250px]">
                <Image src="/hero_3.jpg" alt="Tamales" fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-surface-container via-surface-container/30 to-transparent small:from-surface-container/70" />
                <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-circle bg-secondary-container/35 blur-3xl" />
                <div className="pointer-events-none absolute -top-10 -right-10 h-52 w-52 rounded-circle bg-primary-container/25 blur-3xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {!loading && !onlyOneCategory && salados.length > 0 && (
        <ProductCarousel title={t("home.savory")} products={salados} href="/productos?cat=salados" />
      )}
      {!loading && !onlyOneCategory && dulces.length > 0 && (
        <ProductCarousel title={t("home.sweet")} products={dulces} href="/productos?cat=dulces" />
      )}
      {!loading && !onlyOneCategory && especiales.length > 0 && (
        <ProductCarousel title={t("home.specials")} products={especiales} href="/productos?cat=especiales" />
      )}

      {/* Reviews */}
      <section className="py-16 bg-grey-5/60">
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
              <div key={review.name} className="rounded-2xl bg-white p-6 shadow-panka-xs transition-all hover:shadow-panka-sm">
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
