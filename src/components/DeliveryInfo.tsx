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
    <section className="py-14">
      <div className="mx-auto max-w-7xl px-6">
        <div className="overflow-hidden rounded-2xl border border-grey-10 bg-white">
          <div className="flex border-b border-grey-10">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                className={`flex flex-1 items-center justify-center gap-2 px-4 py-4 text-sm font-medium transition-all ${
                  active === tab.id
                    ? "border-b-2 border-panka-brown-500 text-panka-brown-500 bg-panka-cream/30"
                    : "text-grey-40 hover:text-grey-60 hover:bg-grey-5"
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
                <h3 className="mb-2 font-heading text-2xl font-bold text-panka-brown-500">
                  {current.title}
                </h3>
                <p className="text-base leading-relaxed text-grey-50">{current.description}</p>
              </div>
              <ul className="flex flex-col gap-3">
                {current.details.map((detail, i) => (
                  <li key={i} className="flex items-start gap-3 text-base text-grey-60">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-circle bg-panka-green-400" />
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
