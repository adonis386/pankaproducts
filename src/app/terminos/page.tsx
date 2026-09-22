"use client";

import LegalDocument from "@/components/LegalDocument";
import { termsOfService } from "@/lib/legal-content";
import { useLanguage } from "@/context/LanguageContext";

export default function TerminosPage() {
  const { locale } = useLanguage();
  return <LegalDocument doc={termsOfService[locale]} />;
}
