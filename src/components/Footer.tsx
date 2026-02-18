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
        { href: "https://wa.me/13054001234", label: "WhatsApp" },
      ],
    },
  ];

  return (
    <footer className="border-t border-grey-10 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-2 gap-10 small:grid-cols-5">
          <div className="col-span-2">
            <Link href="/" className="mb-4 inline-flex items-center gap-2.5">
              <Image src="/logo.png" alt="Panka" width={32} height={32} className="rounded-circle" />
              <span className="font-heading text-lg font-bold text-panka-brown-500">Panka</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-grey-40">
              {t("footer.desc")}
            </p>
          </div>

          {sections.map((section) => (
            <div key={section.title}>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-grey-30">{section.title}</h4>
              <ul className="flex flex-col gap-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-[13px] text-grey-50 transition-colors hover:text-panka-brown-500">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-grey-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <p className="text-[11px] text-grey-30">&copy; {new Date().getFullYear()} Panka.</p>
          <div className="flex gap-4 text-[11px] text-grey-30">
            <Link href="#" className="hover:text-grey-50">{t("footer.privacy")}</Link>
            <Link href="#" className="hover:text-grey-50">{t("footer.terms")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
