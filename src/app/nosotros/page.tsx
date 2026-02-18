"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function NosotrosPage() {
  const { t } = useLanguage();

  return (
    <>
      <section className="border-b border-grey-10 bg-white pb-14 pt-14">
        <div className="mx-auto max-w-7xl px-6">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-grey-30">
            {t("about.tag")}
          </p>
          <h1 className="max-w-lg font-heading text-4xl font-bold text-panka-brown-500 small:text-5xl">
            {t("about.title")}
          </h1>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 items-center gap-12 small:grid-cols-2">
            <div className="relative h-[420px] overflow-hidden rounded-2xl">
              <Image src="/hero_2.jpg" alt="Panka Story" fill className="object-cover" />
            </div>
            <div>
              <span className="mb-4 inline-block rounded-xl bg-panka-green-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-panka-green-600">
                {t("about.since")}
              </span>
              <div className="space-y-4 text-base leading-relaxed text-grey-50">
                <p>{t("about.p1")}</p>
                <p>{t("about.p2")}</p>
                <p dangerouslySetInnerHTML={{ __html: t("about.p3") }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-grey-10 bg-white py-16">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="mb-10 font-heading text-3xl font-bold text-panka-brown-500">
            {t("about.valuesTitle")}
          </h2>
          <div className="grid grid-cols-1 gap-6 xsmall:grid-cols-3">
            {[
              { title: t("about.passion"), desc: t("about.passionDesc") },
              { title: t("about.tradition"), desc: t("about.traditionDesc") },
              { title: t("about.community"), desc: t("about.communityDesc") },
            ].map((v) => (
              <div key={v.title} className="rounded-2xl border border-grey-10 p-7 transition-all hover:shadow-panka-sm">
                <h3 className="mb-2 text-lg font-bold text-panka-brown-500">{v.title}</h3>
                <p className="text-base leading-relaxed text-grey-50">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="rounded-2xl bg-panka-cream px-8 py-14 text-center">
            <h2 className="mb-3 font-heading text-3xl font-bold text-panka-brown-500">
              {t("about.ctaTitle")}
            </h2>
            <p className="mx-auto mb-6 max-w-md text-base text-grey-50">{t("about.ctaDesc")}</p>
            <Link href="/productos" className="inline-block rounded-xl bg-panka-brown-500 px-8 py-4 text-base font-bold text-white transition-all hover:bg-panka-brown-600 hover:shadow-panka-md">
              {t("about.ctaBtn")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
