"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

const STORAGE_KEY = "panka-cookie-consent";

type ConsentValue = "essential" | "all";

export default function CookieConsent() {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as ConsentValue | null;
      if (!saved) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const save = (value: ConsentValue) => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* ignore quota / private mode */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-desc"
      className="fixed inset-x-0 bottom-0 z-[80] p-4 small:p-6"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-4 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-[var(--shadow-editorial-lg)] small:flex-row small:items-end small:gap-6">
        <div className="min-w-0 flex-1">
          <h2 id="cookie-consent-title" className="text-base font-bold text-on-surface">
            {t("cookies.title")}
          </h2>
          <p id="cookie-consent-desc" className="mt-2 text-sm leading-relaxed text-secondary/85">
            {t("cookies.body")}{" "}
            <Link href="/cookies" className="font-semibold underline underline-offset-4">
              {t("cookies.learnMore")}
            </Link>
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 xsmall:flex-row">
          <button
            type="button"
            onClick={() => save("essential")}
            className="rounded-xl border border-outline-variant/30 bg-white px-4 py-2.5 text-sm font-semibold text-secondary transition-colors hover:bg-surface-container"
          >
            {t("cookies.essential")}
          </button>
          <button
            type="button"
            onClick={() => save("all")}
            className="rounded-xl bg-panka-brown-500 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-panka-brown-600"
          >
            {t("cookies.accept")}
          </button>
        </div>
      </div>
    </div>
  );
}
