"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useSettings } from "@/context/SettingsContext";

const FANNY_SRC = "/assets/20-678x1024.jpg";
const STORY_HERO_SRC = "/assets/photo3.jpg";

export default function NosotrosPage() {
  const { t, locale } = useLanguage();
  const { settings } = useSettings();
  const story = settings.story;

  const tag = story.tag?.[locale] || t("about.tag");
  const title = story.title?.[locale] || t("about.title");
  const sectionTitle = story.sectionTitle?.[locale] || t("about.storySectionTitle");
  const since = story.since?.[locale] || t("about.since");
  const p1 = story.p1?.[locale] || t("about.p1");
  const p2 = story.p2?.[locale] || t("about.p2");
  const p3 = story.p3?.[locale] || t("about.p3");
  const fannyHeading = story.fannyHeading?.[locale] || t("about.fannyHeading");
  const fannyRole = story.fannyRole?.[locale] || t("about.fannyRole");
  const fannyP1 = story.fannyP1?.[locale] || t("about.fannyP1");
  const fannyP2 = story.fannyP2?.[locale] || t("about.fannyP2");
  const valuesTitle = story.valuesTitle?.[locale] || t("about.valuesTitle");

  const values = [
    {
      title: story.passionTitle?.[locale] || t("about.passion"),
      desc: story.passionDesc?.[locale] || t("about.passionDesc"),
    },
    {
      title: story.traditionTitle?.[locale] || t("about.tradition"),
      desc: story.traditionDesc?.[locale] || t("about.traditionDesc"),
    },
    {
      title: story.communityTitle?.[locale] || t("about.community"),
      desc: story.communityDesc?.[locale] || t("about.communityDesc"),
    },
  ];

  return (
    <>
      <section className="border-b border-outline-variant/20 bg-surface pb-12 pt-14">
        <div className="mx-auto max-w-7xl px-6">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-tertiary">
            {tag}
          </p>
          <h1 className="max-w-2xl font-heading text-4xl font-bold leading-tight text-on-surface small:text-5xl">
            {title}
          </h1>
        </div>
      </section>

      {/* Lo que ya iba: foto izquierda · historia a la derecha */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="order-1">
              <div className="relative h-[min(70vw,420px)] overflow-hidden rounded-3xl bg-surface-container-low shadow-[var(--shadow-editorial-lg)] lg:h-[min(32rem,52vw)] lg:max-h-[480px]">
                <Image
                  src={STORY_HERO_SRC}
                  alt={t("about.storyImageAlt")}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              </div>
            </div>
            <div className="order-2">
              <h2 className="font-heading text-3xl font-bold text-on-surface md:text-4xl">
                {sectionTitle}
              </h2>
              <span className="mt-4 inline-block rounded-xl bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary">
                {since}
              </span>
              <div className="mt-8 space-y-5 text-base leading-relaxed text-on-surface-variant md:text-lg">
                <p>{p1}</p>
                <p>{p2}</p>
                <p dangerouslySetInnerHTML={{ __html: p3 }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Meet Fanny: texto izquierda · foto derecha */}
      <section className="border-t border-outline-variant/15 bg-surface-container-low py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="order-1 lg:order-1">
              <h2 className="font-heading text-4xl font-bold tracking-tight text-on-surface md:text-5xl">
                {fannyHeading}
              </h2>
              <p className="mt-3 text-xs font-bold uppercase tracking-[0.2em] text-primary">
                {fannyRole}
              </p>
              <div className="mt-8 space-y-5 text-base leading-relaxed text-tertiary md:text-lg">
                <p>{fannyP1}</p>
                <p>{fannyP2}</p>
              </div>
            </div>
            <div className="order-2 lg:order-2">
              <div className="relative mx-auto aspect-[678/1024] max-w-md overflow-hidden rounded-3xl bg-surface-container shadow-[var(--shadow-editorial-lg)] lg:max-w-none">
                <Image
                  src={FANNY_SRC}
                  alt={t("about.fannyImageAlt")}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-outline-variant/15 bg-surface py-16">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="mb-10 font-heading text-3xl font-bold text-on-surface">
            {valuesTitle}
          </h2>
          <div className="grid grid-cols-1 gap-6 xsmall:grid-cols-3">
            {values.map((v) => (
              <div
                key={v.title}
                className="rounded-2xl border border-outline-variant/20 bg-surface-container-low/50 p-7 transition-all hover:shadow-[var(--shadow-editorial)]"
              >
                <h3 className="mb-2 text-lg font-bold text-secondary">{v.title}</h3>
                <p className="text-base leading-relaxed text-tertiary">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="rounded-[2rem] border border-outline-variant/20 bg-surface-container px-8 py-14 text-center shadow-sm">
            <h2 className="mb-3 font-heading text-3xl font-bold text-on-surface">{t("about.ctaTitle")}</h2>
            <p className="mx-auto mb-6 max-w-md text-base text-tertiary">{t("about.ctaDesc")}</p>
            <Link
              href="/productos"
              className="inline-block rounded-xl bg-primary px-8 py-4 text-base font-bold text-on-primary transition-all hover:bg-primary-container hover:shadow-lg hover:shadow-primary/15"
            >
              {t("about.ctaBtn")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
