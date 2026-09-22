"use client";

import LegalDocument from "@/components/LegalDocument";
import { privacyPolicy } from "@/lib/legal-content";
import { useLanguage } from "@/context/LanguageContext";

export default function PrivacidadPage() {
  const { locale } = useLanguage();
  return <LegalDocument doc={privacyPolicy[locale]} />;
}
