"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function SkipToContent() {
  const { t } = useLanguage();
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-panka-brown-500 focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white"
    >
      {t("a11y.skipToContent")}
    </a>
  );
}
