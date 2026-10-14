"use client";

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { useSettings } from "@/context/SettingsContext";

export default function Footer() {
  const { t, locale } = useLanguage();
  const { settings } = useSettings();

  const email = settings.contact.email || "hello@pankatamales.com";
  const phone = settings.contact.phone || "+1 (954) 901-4340";
  const rawWa = settings.contact.whatsapp || "19549014340";
  const waClean = rawWa.replace(/[^0-9]/g, "");
  const phoneClean = phone.replace(/[^0-9+]/g, "");
  const footerDesc = settings.contact.footerDesc?.[locale] || t("footer.desc");
  const waMessage = encodeURIComponent(
    locale === "es"
      ? "¡Hola Panka! Me gustaría hacer un pedido de tamales por WhatsApp."
      : "Hello Panka! I would like to place a tamales order via WhatsApp."
  );

  const sections = [
    {
      title: t("footer.shop"),
      links: [
        { href: "/productos?cat=salados", label: t("footer.savory") },
        { href: "/productos?cat=dulces", label: t("footer.sweet") },
        { href: "/productos?cat=especiales", label: t("footer.specials") },
        { href: "/productos", label: t("footer.allTamales") },
      ],
    },
    {
      title: t("footer.info"),
      links: [
        { href: "/nosotros", label: t("footer.aboutUs") },
        { href: "/productos", label: t("footer.menu") },
        { href: "/checkout", label: t("footer.placeOrder") },
      ],
    },
    {
      title: t("footer.contact"),
      links: [
        { href: `mailto:${email}`, label: email },
        { href: `tel:${phoneClean}`, label: phone },
        { href: `https://wa.me/${waClean}?text=${waMessage}`, label: `WhatsApp: ${phone}` },
      ],
    },
  ];

  return (
    <footer className="bg-surface-container">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-2 gap-10 small:grid-cols-5">
          <div className="col-span-2">
            <Link href="/" className="mb-4 inline-flex items-center gap-2.5">
              <Image src="/assets/PNAKALOGO.png" alt="Panka — artisan tamales" width={160} height={48} className="h-8 w-auto" />
              <span className="sr-only">Panka</span>
            </Link>
            <p className="mt-3 max-w-xs text-base leading-relaxed text-tertiary/90">
              {footerDesc}
            </p>
          </div>

          {sections.map((section) => (
            <div key={section.title}>
              <h4 className="mb-4 text-sm font-bold uppercase tracking-widest text-primary">{section.title}</h4>
              <ul className="flex flex-col gap-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm uppercase tracking-widest text-secondary/80 transition-colors hover:text-secondary hover:underline underline-offset-4 decoration-secondary-fixed-dim">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 border-t border-outline-variant/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <p className="text-xs uppercase tracking-widest text-secondary/60">
            &copy; {new Date().getFullYear()} Panka · {t("footer.tagline")}
          </p>
          <div className="flex flex-wrap justify-end gap-x-4 gap-y-2 text-xs uppercase tracking-widest text-secondary/60">
            <Link href="/privacidad" className="hover:text-secondary">
              {t("footer.privacy")}
            </Link>
            <Link href="/cookies" className="hover:text-secondary">
              {t("footer.cookies")}
            </Link>
            <Link href="/accesibilidad" className="hover:text-secondary">
              {t("footer.accessibility")}
            </Link>
            <Link href="/terminos" className="hover:text-secondary">
              {t("footer.terms")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
