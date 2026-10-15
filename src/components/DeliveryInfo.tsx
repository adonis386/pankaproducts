"use client";

import { useState } from "react";
import { HiOutlineTruck, HiOutlineLocationMarker, HiOutlineClock } from "react-icons/hi";
import { useLanguage } from "@/context/LanguageContext";
import { useSettings } from "@/context/SettingsContext";

export default function DeliveryInfo() {
  const { locale, t } = useLanguage();
  const { settings } = useSettings();
  const [active, setActive] = useState("delivery");

  const dInfo = settings.deliveryInfo;

  const tabs = [
    {
      id: "delivery",
      label: t("delivery.tabDelivery"),
      icon: HiOutlineTruck,
      title:
        (locale === "es" ? dInfo?.delivery?.title?.es : dInfo?.delivery?.title?.en) ||
        t("delivery.deliveryTitle"),
      description:
        (locale === "es" ? dInfo?.delivery?.description?.es : dInfo?.delivery?.description?.en) ||
        t("delivery.deliveryDesc"),
      details: [
        (locale === "es" ? dInfo?.delivery?.detail1?.es : dInfo?.delivery?.detail1?.en) ||
          t("delivery.deliveryD1"),
        (locale === "es" ? dInfo?.delivery?.detail2?.es : dInfo?.delivery?.detail2?.en) ||
          t("delivery.deliveryD2"),
        (locale === "es" ? dInfo?.delivery?.detail3?.es : dInfo?.delivery?.detail3?.en) ||
          t("delivery.deliveryD3"),
      ],
    },
    {
      id: "pickup",
      label: t("delivery.tabPickup"),
      icon: HiOutlineLocationMarker,
      title:
        (locale === "es" ? dInfo?.pickup?.title?.es : dInfo?.pickup?.title?.en) ||
        t("delivery.pickupTitle"),
      description:
        (locale === "es" ? dInfo?.pickup?.description?.es : dInfo?.pickup?.description?.en) ||
        t("delivery.pickupDesc"),
      details: [
        (locale === "es" ? dInfo?.pickup?.detail1?.es : dInfo?.pickup?.detail1?.en) ||
          t("delivery.pickupD1"),
        (locale === "es" ? dInfo?.pickup?.detail2?.es : dInfo?.pickup?.detail2?.en) ||
          t("delivery.pickupD2"),
        (locale === "es" ? dInfo?.pickup?.detail3?.es : dInfo?.pickup?.detail3?.en) ||
          t("delivery.pickupD3"),
      ],
    },
    {
      id: "schedule",
      label: t("delivery.tabSchedule"),
      icon: HiOutlineClock,
      title:
        (locale === "es" ? dInfo?.schedule?.title?.es : dInfo?.schedule?.title?.en) ||
        t("delivery.scheduleTitle"),
      description:
        (locale === "es" ? dInfo?.schedule?.description?.es : dInfo?.schedule?.description?.en) ||
        t("delivery.scheduleDesc"),
      details: [
        (locale === "es" ? dInfo?.schedule?.detail1?.es : dInfo?.schedule?.detail1?.en) ||
          t("delivery.scheduleD1"),
        (locale === "es" ? dInfo?.schedule?.detail2?.es : dInfo?.schedule?.detail2?.en) ||
          t("delivery.scheduleD2"),
        (locale === "es" ? dInfo?.schedule?.detail3?.es : dInfo?.schedule?.detail3?.en) ||
          t("delivery.scheduleD3"),
      ],
    },
  ];

  const current = tabs.find((tab) => tab.id === active)!;

  return (
    <section className="py-20 bg-surface">
      <div className="mx-auto max-w-7xl px-6">
        <div className="overflow-hidden rounded-3xl bg-surface-container-low shadow-[var(--shadow-editorial)]">
          <div className="flex bg-surface-container">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                className={`flex flex-1 items-center justify-center gap-2 px-4 py-4 text-sm font-semibold uppercase tracking-widest transition-all ${
                  active === tab.id
                    ? "text-primary bg-surface-container-lowest"
                    : "text-secondary/70 hover:text-secondary hover:bg-surface-container-highest"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden xsmall:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="p-6 small:p-8">
            <div className="grid grid-cols-1 gap-6 small:grid-cols-2">
              <div>
                <h3 className="mb-3 font-heading text-3xl font-bold text-on-surface">
                  {current.title}
                </h3>
                <p className="text-base leading-relaxed text-tertiary">{current.description}</p>
              </div>
              <ul className="flex flex-col gap-3">
                {current.details.map((detail, i) => (
                  <li key={i} className="flex items-start gap-3 text-base text-tertiary">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-circle bg-primary" />
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
