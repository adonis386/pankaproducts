"use client";

import LegalDocument from "@/components/LegalDocument";
import { cookiePolicy } from "@/lib/legal-content";
import { useLanguage } from "@/context/LanguageContext";

export default function CookiesPage() {
  const { locale } = useLanguage();
  return <LegalDocument doc={cookiePolicy[locale]} />;
}
