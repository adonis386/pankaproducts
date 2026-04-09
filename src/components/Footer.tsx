"use client";

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

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
        { href: "mailto:hello@pankatamales.com", label: "hello@pankatamales.com" },
        { href: "tel:+13054001234", label: "+1 (305) 400-1234" },
        { href: "https://wa.me/13054001234", label: t("footer.whatsapp") },
      ],
    },
  ];

  return (
    <footer className="bg-surface-container">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-2 gap-10 small:grid-cols-5">
          <div className="col-span-2">
            <Link href="/" className="mb-4 inline-flex items-center gap-2.5">
              <Image src="/assets/PNAKALOGO.png" alt="Panka" width={160} height={48} className="h-8 w-auto" />
              <span className="sr-only">Panka</span>
            </Link>
            <p className="mt-3 max-w-xs text-base leading-relaxed text-tertiary/90">
              {t("footer.desc")}
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
          <div className="flex gap-4 text-xs uppercase tracking-widest text-secondary/60">
            <Link href="#" className="hover:text-secondary">{t("footer.privacy")}</Link>
            <Link href="#" className="hover:text-secondary">{t("footer.terms")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
