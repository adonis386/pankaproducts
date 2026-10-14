"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useSettings } from "@/context/SettingsContext";

const SLIDE_INTERVAL_MS = 5500;

export default function Hero() {
  const { t, locale } = useLanguage();
  const { settings } = useSettings();
  const [index, setIndex] = useState(0);

  const hero = settings.hero;

  const badge = hero.badge?.[locale] || t("hero.badge");
  const titleLine1 = hero.titleLine1?.[locale] || t("hero.titleLine1");
  const titleLine2 = hero.titleLine2?.[locale] || t("hero.titleLine2");
  const subtitle = hero.subtitle?.[locale] || t("hero.subtitle");
  const primaryBtnText = hero.primaryBtnText?.[locale] || t("hero.orderNow");
  const primaryBtnHref = hero.primaryBtnHref || "/productos";
  const secondaryBtnText = hero.secondaryBtnText?.[locale] || t("nav.about");
  const secondaryBtnHref = hero.secondaryBtnHref || "/nosotros";

  const activeSlides = useMemo(() => {
    const list = (hero.slides || []).filter((s) => s.active);
    if (list.length > 0) return list;
    return [
      {
        id: "slide-1",
        src: "/assets/photo2.jpg",
        altEn: "Hand-wrapped tamales in a basket on a wooden tray",
        altEs: "Tamales envueltos a mano en una canasta sobre bandeja de madera",
        active: true,
      },
      {
        id: "slide-2",
        src: "/assets/photo3.jpg",
        altEn: "Artisan tamales — close-up of texture and leaves",
        altEs: "Tamales artesanales, detalle de textura y hojas",
        active: true,
      },
    ];
  }, [hero.slides]);

  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % activeSlides.length);
    }, SLIDE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [activeSlides.length]);

  return (
    <section className="relative overflow-hidden bg-surface pt-14">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 pb-16 pt-10 small:grid-cols-12 small:pb-24">
        <div className="relative z-10 small:col-span-6">
          <span className="mb-6 block text-sm font-semibold uppercase tracking-[0.2em] text-secondary">
            {badge}
          </span>

          <h1 className="mb-8 font-heading text-5xl font-bold leading-[1.1] text-on-surface small:text-7xl medium:text-8xl">
            {titleLine1}{" "}
            <span className="italic text-primary">{titleLine2}</span>
          </h1>

          <p className="mb-10 max-w-md text-lg font-light leading-relaxed text-tertiary whitespace-pre-line">
            {subtitle}
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              href={primaryBtnHref}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-primary to-primary-container px-8 py-4 font-semibold text-on-primary shadow-[var(--shadow-editorial)] transition-all hover:brightness-[1.02] active:scale-[0.99]"
            >
              {primaryBtnText}
              <span aria-hidden className="text-sm">
                →
              </span>
            </Link>
            <Link
              href={secondaryBtnHref}
              className="rounded-xl bg-surface-container-highest px-8 py-4 font-semibold text-on-secondary-container shadow-[var(--shadow-editorial)] transition-colors hover:bg-surface-variant"
            >
              {secondaryBtnText}
            </Link>
          </div>
        </div>

        <div
          className="relative small:col-span-6"
          role="region"
          aria-roledescription="carousel"
          aria-label={t("hero.carouselLabel")}
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-[var(--shadow-editorial-lg)] small:rotate-2">
            {activeSlides.map((slide, i) => (
              <Image
                key={slide.id || slide.src}
                src={slide.src}
                alt={locale === "es" ? slide.altEs : slide.altEn}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority={i === 0}
                className={`object-cover transition-[opacity] duration-1000 ease-in-out ${
                  i === index ? "z-[1] opacity-100" : "z-0 opacity-0"
                }`}
                aria-hidden={i !== index}
              />
            ))}

            {activeSlides.length > 1 && (
              <div
                className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2 rounded-full bg-on-surface/25 px-3 py-2 backdrop-blur-sm"
                role="tablist"
                aria-label={t("hero.carouselLabel")}
              >
                {activeSlides.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    role="tab"
                    aria-selected={i === index}
                    tabIndex={i === index ? 0 : -1}
                    aria-label={`${t("hero.goToSlide")} ${i + 1}`}
                    onClick={() => setIndex(i)}
                    className={[
                      "h-2 rounded-full transition-all duration-300",
                      i === index ? "w-7 bg-surface-container-lowest" : "w-2 bg-surface-container-lowest/60 hover:bg-surface-container-lowest/80",
                    ].join(" ")}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-circle bg-secondary-container/40 blur-3xl" />
          <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-circle bg-primary-container/25 blur-3xl" />
        </div>
      </div>
    </section>
  );
}
