"use client";

import { useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { useSettings } from "@/context/SettingsContext";
import { useLanguage } from "@/context/LanguageContext";

export default function WhatsAppButton() {
  const { settings } = useSettings();
  const { locale } = useLanguage();
  const [isHovered, setIsHovered] = useState(false);

  const rawWa = settings.contact.whatsapp || "19549014340";
  const phone = settings.contact.phone || "+1 (954) 901-4340";
  const waClean = rawWa.replace(/[^0-9]/g, "");

  const prefilledMessage = encodeURIComponent(
    locale === "es"
      ? "¡Hola Panka! Quisiera hacer un pedido por WhatsApp."
      : "Hello Panka! I would like to place an order via WhatsApp."
  );

  const whatsappUrl = `https://wa.me/${waClean}?text=${prefilledMessage}`;

  return (
    <aside aria-label={locale === "es" ? "Contacto y pedidos por WhatsApp" : "Contact and orders via WhatsApp"}>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 rounded-full bg-[#25D366] px-4 py-3.5 text-white shadow-2xl transition-all duration-300 hover:bg-[#20ba5a] hover:scale-105 hover:shadow-[0_12px_28px_rgba(37,211,102,0.4)] active:scale-95"
        aria-label={`${locale === "es" ? "Hacer pedido por WhatsApp" : "Order via WhatsApp"}: ${phone}`}
      >
        <FaWhatsapp className="h-6 w-6 shrink-0" aria-hidden />
        <span
          className={`overflow-hidden whitespace-nowrap text-xs font-bold tracking-wide transition-all duration-300 ${
            isHovered ? "max-w-xs opacity-100" : "max-w-0 opacity-0 sm:max-w-xs sm:opacity-100"
          }`}
        >
          {locale === "es" ? "Pedidos WhatsApp" : "WhatsApp Orders"}
        </span>
      </a>
    </aside>
  );
}
