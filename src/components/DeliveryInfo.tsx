"use client";

import { useState } from "react";
import { HiOutlineTruck, HiOutlineLocationMarker, HiOutlineClock } from "react-icons/hi";
import { useLanguage } from "@/context/LanguageContext";

export default function DeliveryInfo() {
  const { t } = useLanguage();
  const [active, setActive] = useState("delivery");

  const tabs = [
    {
      id: "delivery",
      label: t("delivery.tabDelivery"),
      icon: HiOutlineTruck,
      title: t("delivery.deliveryTitle"),
      description: t("delivery.deliveryDesc"),
      details: [t("delivery.deliveryD1"), t("delivery.deliveryD2"), t("delivery.deliveryD3")],
    },
    {
      id: "pickup",
      label: t("delivery.tabPickup"),
      icon: HiOutlineLocationMarker,
      title: t("delivery.pickupTitle"),
      description: t("delivery.pickupDesc"),
      details: [t("delivery.pickupD1"), t("delivery.pickupD2"), t("delivery.pickupD3")],
    },
    {
      id: "schedule",
      label: t("delivery.tabSchedule"),
      icon: HiOutlineClock,
      title: t("delivery.scheduleTitle"),
      description: t("delivery.scheduleDesc"),
      details: [t("delivery.scheduleD1"), t("delivery.scheduleD2"), t("delivery.scheduleD3")],
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
