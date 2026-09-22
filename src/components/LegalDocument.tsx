"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import type { LegalDoc } from "@/lib/legal-content";

export default function LegalDocument({ doc }: { doc: LegalDoc }) {
  const { t } = useLanguage();

  return (
    <article className="mx-auto max-w-3xl px-6 py-14 small:py-20">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary/60">
        {t("legal.lastUpdated")}: {doc.lastUpdated}
      </p>
      <h1 className="mt-3 font-heading text-4xl font-bold tracking-tight text-on-surface small:text-5xl">
        {doc.title}
      </h1>
      <p className="mt-5 text-base leading-relaxed text-secondary/90">{doc.intro}</p>

      <div className="mt-10 space-y-10">
        {doc.sections.map((section) => (
          <section key={section.heading} aria-labelledby={section.heading}>
            <h2
              id={section.heading}
              className="font-heading text-2xl font-bold text-on-surface"
            >
              {section.heading}
            </h2>
            {section.paragraphs.map((p) => (
              <p key={p.slice(0, 48)} className="mt-3 text-base leading-relaxed text-secondary/90">
                {p}
              </p>
            ))}
            {section.bullets && section.bullets.length > 0 && (
              <ul className="mt-3 list-disc space-y-2 pl-5 text-base leading-relaxed text-secondary/90">
                {section.bullets.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <aside className="mt-12 rounded-2xl border border-outline-variant/20 bg-surface-container px-5 py-4 text-sm leading-relaxed text-tertiary">
        {doc.disclaimer}
      </aside>

      <p className="mt-8 text-sm text-secondary/70">
        <Link href="/cookies" className="underline underline-offset-4 hover:text-secondary">
          {t("footer.cookies")}
        </Link>
        {" · "}
        <Link href="/accesibilidad" className="underline underline-offset-4 hover:text-secondary">
          {t("footer.accessibility")}
        </Link>
        {" · "}
        <Link href="/privacidad" className="underline underline-offset-4 hover:text-secondary">
          {t("footer.privacy")}
        </Link>
      </p>
    </article>
  );
}
