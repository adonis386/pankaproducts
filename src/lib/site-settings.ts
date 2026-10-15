import "server-only";

import { adminDb } from "@/lib/firebase-admin";
import { SETTINGS_COLLECTION } from "@/lib/stripe";
import { FieldValue } from "firebase-admin/firestore";
import {
  DEFAULT_SITE_SETTINGS,
  type SiteSettings,
} from "./site-settings-types";

export * from "./site-settings-types";

const DOC_ID = "general";

function mergeTab(defaultTab: import("./site-settings-types").DeliveryTabContent, customTab?: Partial<import("./site-settings-types").DeliveryTabContent>) {
  return {
    title: { ...defaultTab.title, ...(customTab?.title || {}) },
    description: { ...defaultTab.description, ...(customTab?.description || {}) },
    detail1: { ...defaultTab.detail1, ...(customTab?.detail1 || {}) },
    detail2: { ...defaultTab.detail2, ...(customTab?.detail2 || {}) },
    detail3: { ...defaultTab.detail3, ...(customTab?.detail3 || {}) },
  };
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const db = adminDb();
    const snap = await db.collection(SETTINGS_COLLECTION).doc(DOC_ID).get();
    if (!snap.exists) {
      return DEFAULT_SITE_SETTINGS;
    }
    const data = snap.data() || {};
    return {
      contact: {
        ...DEFAULT_SITE_SETTINGS.contact,
        ...(data.contact || {}),
        footerDesc: {
          ...DEFAULT_SITE_SETTINGS.contact.footerDesc,
          ...(data.contact?.footerDesc || {}),
        },
      },
      announcements: Array.isArray(data.announcements)
        ? data.announcements
        : DEFAULT_SITE_SETTINGS.announcements,
      hero: {
        ...DEFAULT_SITE_SETTINGS.hero,
        ...(data.hero || {}),
        slides: Array.isArray(data.hero?.slides)
          ? data.hero.slides
          : DEFAULT_SITE_SETTINGS.hero.slides,
      },
      promoBanner: {
        ...DEFAULT_SITE_SETTINGS.promoBanner,
        ...(data.promoBanner || {}),
      },
      story: {
        ...DEFAULT_SITE_SETTINGS.story,
        ...(data.story || {}),
      },
      deliveryInfo: {
        delivery: mergeTab(DEFAULT_SITE_SETTINGS.deliveryInfo.delivery, data.deliveryInfo?.delivery),
        pickup: mergeTab(DEFAULT_SITE_SETTINGS.deliveryInfo.pickup, data.deliveryInfo?.pickup),
        schedule: mergeTab(DEFAULT_SITE_SETTINGS.deliveryInfo.schedule, data.deliveryInfo?.schedule),
      },
      storeStatus: {
        ...DEFAULT_SITE_SETTINGS.storeStatus,
        ...(data.storeStatus || {}),
      },
    };
  } catch (err) {
    console.error("Failed to fetch site settings from Firestore:", err);
    return DEFAULT_SITE_SETTINGS;
  }
}

export async function updateSiteSettings(patch: Partial<SiteSettings>): Promise<SiteSettings> {
  const db = adminDb();
  const ref = db.collection(SETTINGS_COLLECTION).doc(DOC_ID);

  await ref.set(
    {
      ...patch,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  return getSiteSettings();
}
