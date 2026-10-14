"use client";

import { useState, useEffect, useMemo } from "react";
import { HiX } from "react-icons/hi";
import { useLanguage } from "@/context/LanguageContext";
import { useSettings } from "@/context/SettingsContext";

export default function AnnouncementBar() {
  const { t, locale } = useLanguage();
  const { settings } = useSettings();
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);

  const activeAnnouncements = useMemo(() => {
    const list = settings.announcements.filter((a) => a.active);
    if (list.length > 0) {
      return list.map((a) => (locale === "es" ? a.textEs : a.textEn));
    }
    return [t("announce.1"), t("announce.2"), t("announce.3")];
  }, [settings.announcements, locale, t]);

  useEffect(() => {
    if (activeAnnouncements.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % activeAnnouncements.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [activeAnnouncements.length]);

  if (!visible || activeAnnouncements.length === 0) return null;

  return (
    <div className="relative bg-panka-brown-500 text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-center px-10 py-2.5">
        <p className="text-center text-sm font-medium tracking-wide transition-opacity duration-500">
          {activeAnnouncements[current]}
        </p>
        <button
          onClick={() => setVisible(false)}
          className="absolute right-4 rounded-circle p-1 text-panka-brown-200 transition-colors hover:text-white"
          aria-label={t("announce.close")}
        >
          <HiX className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
