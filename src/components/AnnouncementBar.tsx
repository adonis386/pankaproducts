"use client";

import { useState, useEffect } from "react";
import { HiX } from "react-icons/hi";
import { useLanguage } from "@/context/LanguageContext";

export default function AnnouncementBar() {
  const { t } = useLanguage();
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);

  const messages = [t("announce.1"), t("announce.2"), t("announce.3")];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="relative bg-panka-brown-500 text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-center px-10 py-2.5">
        <p className="text-center text-sm font-medium tracking-wide transition-opacity duration-500">
          {messages[current]}
        </p>
        <button
          onClick={() => setVisible(false)}
          className="absolute right-4 rounded-circle p-1 text-panka-brown-200 transition-colors hover:text-white"
          aria-label="Close"
        >
          <HiX className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
