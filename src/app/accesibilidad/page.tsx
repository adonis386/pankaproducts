"use client";

import LegalDocument from "@/components/LegalDocument";
import { accessibilityStatement } from "@/lib/legal-content";
import { useLanguage } from "@/context/LanguageContext";

export default function AccesibilidadPage() {
  const { locale } = useLanguage();
  return <LegalDocument doc={accessibilityStatement[locale]} />;
}
