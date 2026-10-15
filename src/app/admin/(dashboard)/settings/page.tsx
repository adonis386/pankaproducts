"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  HiOutlineBookOpen,
  HiOutlineCheck,
  HiOutlineClock,
  HiOutlineLocationMarker,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlinePhotograph,
  HiOutlinePlus,
  HiOutlineSave,
  HiOutlineShieldCheck,
  HiOutlineSpeakerphone,
  HiOutlineTrash,
  HiOutlineTruck,
  HiOutlineUpload,
  HiOutlineUserAdd,
  HiOutlineUserRemove,
  HiOutlineUsers,
} from "react-icons/hi";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { DEFAULT_SITE_SETTINGS, type SiteSettings } from "@/lib/site-settings-types";
import { useSettings } from "@/context/SettingsContext";

const PRESET_GALLERY_IMAGES = [
  { label: "Foto Tamales 1 (Mesa)", url: "/assets/photo2.jpg" },
  { label: "Foto Tamales 2 (Detalle)", url: "/assets/photo3.jpg" },
  { label: "Hero Portada 1 (Cocina)", url: "/hero_1.jpg" },
  { label: "Hero Portada 2 (Vapor)", url: "/hero_2.jpg" },
  { label: "Hero Portada 3 (Masa)", url: "/hero_3.jpg" },
  { label: "Tamal Criollo de Cerdo", url: "/tamales/Tamales-de-Puerco.webp" },
  { label: "Tamalito Verde de Pollo", url: "/tamales/tamalitos-verdes.webp" },
  { label: "Humita Andina Dulce", url: "/tamales/humita.webp" },
  { label: "Tamal Vegano Artesanal", url: "/tamales/tamal vegano.webp" },
  { label: "Chicharrón de Cerdo", url: "/tamales/Chicharrón_fried_pork_rinds-e1630513624548.webp" },
];

async function getIdTokenOrThrow() {
  if (!auth?.currentUser) throw new Error("No authenticated user.");
  return await auth.currentUser.getIdToken();
}

interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  disabled: boolean;
  creationTime?: string;
  lastSignInTime?: string;
}

type TabKey = "hero_promo" | "story" | "delivery" | "footer" | "announcements" | "admins";

export default function AdminSettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const { refreshSettings } = useSettings();
  const [activeTab, setActiveTab] = useState<TabKey>("hero_promo");

  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadingSlideId, setUploadingSlideId] = useState<string | null>(null);
  const [uploadingPromoBanner, setUploadingPromoBanner] = useState<boolean>(false);

  // New admin form state
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [newAdminName, setNewAdminName] = useState("");
  const [adminBusy, setAdminBusy] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const loadAll = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const token = await getIdTokenOrThrow();

      // Load Settings
      const setRes = await fetch("/admin/api/settings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (setRes.ok) {
        const setData = (await setRes.json()) as { settings?: SiteSettings };
        if (setData.settings) {
          setSettings({
            ...DEFAULT_SITE_SETTINGS,
            ...setData.settings,
            hero: {
              ...DEFAULT_SITE_SETTINGS.hero,
              ...(setData.settings.hero || {}),
              slides: setData.settings.hero?.slides || DEFAULT_SITE_SETTINGS.hero.slides,
            },
            promoBanner: {
              ...DEFAULT_SITE_SETTINGS.promoBanner,
              ...(setData.settings.promoBanner || {}),
            },
            deliveryInfo: {
              delivery: {
                ...DEFAULT_SITE_SETTINGS.deliveryInfo.delivery,
                ...(setData.settings.deliveryInfo?.delivery || {}),
              },
              pickup: {
                ...DEFAULT_SITE_SETTINGS.deliveryInfo.pickup,
                ...(setData.settings.deliveryInfo?.pickup || {}),
              },
              schedule: {
                ...DEFAULT_SITE_SETTINGS.deliveryInfo.schedule,
                ...(setData.settings.deliveryInfo?.schedule || {}),
              },
            },
          });
        }
      }

      // Load Admins
      const admRes = await fetch("/admin/api/admins", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (admRes.ok) {
        const admData = (await admRes.json()) as { admins?: AdminUser[] };
        if (Array.isArray(admData.admins)) setAdmins(admData.admins);
      }
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : "Error loading data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) void loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  const handleSaveSettings = async () => {
    setSaving(true);
    setErrorMessage("");
    try {
      const sanitizedSettings: SiteSettings = {
        ...settings,
        hero: {
          ...settings.hero,
          slides: (settings.hero?.slides || []).map((s, idx) => ({
            ...s,
            src: s.src?.trim() || (idx % 2 === 0 ? "/assets/photo2.jpg" : "/assets/photo3.jpg"),
          })),
        },
        promoBanner: {
          ...settings.promoBanner,
          image: settings.promoBanner?.image?.trim() || "/hero_3.jpg",
        },
      };

      const token = await getIdTokenOrThrow();
      const res = await fetch("/admin/api/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(sanitizedSettings),
      });

      const data = (await res.json()) as { ok?: boolean; error?: string; settings?: SiteSettings };
      if (!res.ok) throw new Error(data.error || "Failed to save settings.");

      if (data.settings) setSettings(data.settings);
      await refreshSettings();
      showToast("Configuración y contenidos guardados correctamente.");
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail.trim()) return;

    setAdminBusy(true);
    setErrorMessage("");
    try {
      const token = await getIdTokenOrThrow();
      const res = await fetch("/admin/api/admins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: newAdminEmail.trim(),
          password: newAdminPassword.trim() || undefined,
          displayName: newAdminName.trim() || undefined,
          action: newAdminPassword.trim() ? "create" : "grant",
        }),
      });

      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) throw new Error(data.error || "Failed to grant admin.");

      setNewAdminEmail("");
      setNewAdminPassword("");
      setNewAdminName("");
      showToast("Permiso de administrador asignado.");
      await loadAll();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Error adding admin.");
    } finally {
      setAdminBusy(false);
    }
  };

  const handleRevokeAdmin = async (targetUid: string, email: string) => {
    if (!window.confirm(`¿Seguro que deseas revocar los permisos de administrador a ${email}?`)) {
      return;
    }

    setAdminBusy(true);
    setErrorMessage("");
    try {
      const token = await getIdTokenOrThrow();
      const res = await fetch("/admin/api/admins", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ uid: targetUid }),
      });

      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) throw new Error(data.error || "Failed to revoke admin.");

      showToast("Permiso de administrador revocado.");
      await loadAll();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Error revoking admin.");
    } finally {
      setAdminBusy(false);
    }
  };

  // Announcements helpers
  const handleAddAnnouncement = () => {
    const newId = `ann-${Date.now()}`;
    setSettings((prev) => ({
      ...prev,
      announcements: [
        ...prev.announcements,
        {
          id: newId,
          textEn: "New announcement message",
          textEs: "Nuevo mensaje de aviso",
          active: true,
        },
      ],
    }));
  };

  const handleRemoveAnnouncement = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      announcements: prev.announcements.filter((a) => a.id !== id),
    }));
  };

  const handleUpdateAnnouncement = (id: string, patch: Partial<SiteSettings["announcements"][0]>) => {
    setSettings((prev) => ({
      ...prev,
      announcements: prev.announcements.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    }));
  };

  // Hero slides helpers
  const handleAddHeroSlide = () => {
    const newId = `slide-${Date.now()}`;
    setSettings((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        slides: [
          ...(prev.hero?.slides || []),
          {
            id: newId,
            src: "/assets/photo2.jpg",
            altEn: "Artisan handcrafted tamales",
            altEs: "Tamales artesanales hechos a mano",
            active: true,
          },
        ],
      },
    }));
  };

  const handleRemoveHeroSlide = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        slides: (prev.hero?.slides || []).filter((s) => s.id !== id),
      },
    }));
  };

  const handleUpdateHeroSlide = (id: string, patch: Partial<SiteSettings["hero"]["slides"][0]>) => {
    setSettings((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        slides: (prev.hero?.slides || []).map((s) => (s.id === id ? { ...s, ...patch } : s)),
      },
    }));
  };

  const uploadImageFile = async (file: File): Promise<string> => {
    const token = await getIdTokenOrThrow();
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/admin/api/upload-image", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    const data = (await res.json()) as { url?: string; error?: string };
    if (!res.ok || !data.url) {
      throw new Error(data.error || "Error al subir la imagen.");
    }
    return data.url;
  };

  const handleSlideFileUpload = async (slideId: string, file: File) => {
    setUploadingSlideId(slideId);
    setErrorMessage("");
    try {
      const url = await uploadImageFile(file);
      handleUpdateHeroSlide(slideId, { src: url });
      showToast("Imagen subida y aplicada al slide.");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Error al subir la imagen del slide.");
    } finally {
      setUploadingSlideId(null);
    }
  };

  const handlePromoBannerFileUpload = async (file: File) => {
    setUploadingPromoBanner(true);
    setErrorMessage("");
    try {
      const url = await uploadImageFile(file);
      setSettings((s) => ({
        ...s,
        promoBanner: { ...s.promoBanner, image: url },
      }));
      showToast("Imagen del banner subida y aplicada.");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Error al subir la imagen del banner.");
    } finally {
      setUploadingPromoBanner(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-outline-variant border-t-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-lg rounded-[2rem] border border-outline-variant/20 bg-surface-container-lowest p-8 shadow-sm">
        <h1 className="mb-2 font-heading text-3xl font-bold text-on-surface">Admin</h1>
        <p className="text-on-surface-variant">Debes iniciar sesión para configurar la tienda.</p>
        <Link className="mt-4 inline-block font-semibold text-primary underline underline-offset-2" href="/admin">
          Ir a /admin
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-primary px-6 py-4 text-sm font-bold text-on-primary shadow-2xl transition-all">
          <HiOutlineCheck className="h-5 w-5" />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <header className="mb-8 flex flex-col gap-4 small:flex-row small:items-center small:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-tertiary">Panka Editorial CMS</p>
          <h1 className="font-heading text-4xl font-bold tracking-tight text-on-surface">Configuración y Contenidos</h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Edita los textos de la página, la historia de Panka, el footer, anuncios y cuentas administradoras.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void handleSaveSettings()}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 disabled:opacity-50"
        >
          <HiOutlineSave className="h-5 w-5" />
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </header>

      {errorMessage && (
        <div className="mb-6 rounded-2xl border border-error/20 bg-error-container/40 p-4 text-sm font-medium text-error">
          {errorMessage}
        </div>
      )}

      {/* Tabs Bar */}
      <nav aria-label="Settings Tabs" className="mb-8 flex flex-wrap gap-2 rounded-2xl bg-surface-container p-1.5">
        <button
          type="button"
          onClick={() => setActiveTab("hero_promo")}
          className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all ${
            activeTab === "hero_promo"
              ? "bg-surface-container-lowest text-primary shadow-sm"
              : "text-on-surface/70 hover:text-on-surface"
          }`}
        >
          <HiOutlinePhotograph className="h-5 w-5" />
          Hero & Promociones
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("story")}
          className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all ${
            activeTab === "story"
              ? "bg-surface-container-lowest text-primary shadow-sm"
              : "text-on-surface/70 hover:text-on-surface"
          }`}
        >
          <HiOutlineBookOpen className="h-5 w-5" />
          Historia & Marca
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("delivery")}
          className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all ${
            activeTab === "delivery"
              ? "bg-surface-container-lowest text-primary shadow-sm"
              : "text-on-surface/70 hover:text-on-surface"
          }`}
        >
          <HiOutlineTruck className="h-5 w-5" />
          Envíos & Entregas
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("footer")}
          className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all ${
            activeTab === "footer"
              ? "bg-surface-container-lowest text-primary shadow-sm"
              : "text-on-surface/70 hover:text-on-surface"
          }`}
        >
          <HiOutlineMail className="h-5 w-5" />
          Footer & Contacto
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("announcements")}
          className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all ${
            activeTab === "announcements"
              ? "bg-surface-container-lowest text-primary shadow-sm"
              : "text-on-surface/70 hover:text-on-surface"
          }`}
        >
          <HiOutlineSpeakerphone className="h-5 w-5" />
          Anuncios & Tienda
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("admins")}
          className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all ${
            activeTab === "admins"
              ? "bg-surface-container-lowest text-primary shadow-sm"
              : "text-on-surface/70 hover:text-on-surface"
          }`}
        >
          <HiOutlineUsers className="h-5 w-5" />
          Administradores
        </button>
      </nav>

      {/* ─── TAB: HERO & PROMOCIONES ─── */}
      {activeTab === "hero_promo" && (
        <div className="space-y-8">
          {/* Hero Content Section */}
          <section className="rounded-3xl bg-surface-container-lowest p-6 shadow-sm small:p-8">
            <div className="mb-6 border-b border-outline-variant/10 pb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-primary">Portada Principal</span>
              <h2 className="font-heading text-2xl font-bold text-on-surface">Hero — Textos y Llamados a la Acción</h2>
              <p className="mt-1 text-sm text-tertiary">
                Controla los titulares, subtítulos y botones principales de la primera vista del sitio web.
              </p>
            </div>

            <div className="space-y-6">
              {/* Badge */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                    Badge Superior (Español)
                  </label>
                  <input
                    type="text"
                    value={settings.hero.badge.es}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        hero: { ...s.hero, badge: { ...s.hero.badge, es: e.target.value } },
                      }))
                    }
                    className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                    Badge Superior (Inglés)
                  </label>
                  <input
                    type="text"
                    value={settings.hero.badge.en}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        hero: { ...s.hero, badge: { ...s.hero.badge, en: e.target.value } },
                      }))
                    }
                    className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Title Line 1 */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                    Título — Línea 1 (Español)
                  </label>
                  <input
                    type="text"
                    value={settings.hero.titleLine1.es}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        hero: { ...s.hero, titleLine1: { ...s.hero.titleLine1, es: e.target.value } },
                      }))
                    }
                    className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 text-sm font-semibold focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                    Título — Línea 1 (Inglés)
                  </label>
                  <input
                    type="text"
                    value={settings.hero.titleLine1.en}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        hero: { ...s.hero, titleLine1: { ...s.hero.titleLine1, en: e.target.value } },
                      }))
                    }
                    className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 text-sm font-semibold focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Title Line 2 */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                    Título — Línea 2 / Énfasis dorado (Español)
                  </label>
                  <input
                    type="text"
                    value={settings.hero.titleLine2.es}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        hero: { ...s.hero, titleLine2: { ...s.hero.titleLine2, es: e.target.value } },
                      }))
                    }
                    className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 text-sm font-semibold focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                    Título — Línea 2 / Énfasis dorado (Inglés)
                  </label>
                  <input
                    type="text"
                    value={settings.hero.titleLine2.en}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        hero: { ...s.hero, titleLine2: { ...s.hero.titleLine2, en: e.target.value } },
                      }))
                    }
                    className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 text-sm font-semibold focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Subtitle with newline support */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                    Subtítulo / Bajada (Español)
                  </label>
                  <p className="mb-2 text-xs text-tertiary">Los saltos de línea y párrafos se respetan en la web.</p>
                  <textarea
                    rows={3}
                    value={settings.hero.subtitle.es}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        hero: { ...s.hero, subtitle: { ...s.hero.subtitle, es: e.target.value } },
                      }))
                    }
                    className="w-full resize-y rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 text-sm leading-relaxed focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                    Subtítulo / Bajada (Inglés)
                  </label>
                  <p className="mb-2 text-xs text-tertiary">Newlines and paragraphs are preserved on the live site.</p>
                  <textarea
                    rows={3}
                    value={settings.hero.subtitle.en}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        hero: { ...s.hero, subtitle: { ...s.hero.subtitle, en: e.target.value } },
                      }))
                    }
                    className="w-full resize-y rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 text-sm leading-relaxed focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Primary Button */}
                <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-low/40 p-5">
                  <h3 className="mb-3 font-semibold text-on-surface">Botón Primario (Acción Principal)</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-secondary">Texto (Español)</label>
                      <input
                        type="text"
                        value={settings.hero.primaryBtnText.es}
                        onChange={(e) =>
                          setSettings((s) => ({
                            ...s,
                            hero: {
                              ...s.hero,
                              primaryBtnText: { ...s.hero.primaryBtnText, es: e.target.value },
                            },
                          }))
                        }
                        className="w-full rounded-xl border border-outline-variant/30 bg-surface px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-secondary">Texto (Inglés)</label>
                      <input
                        type="text"
                        value={settings.hero.primaryBtnText.en}
                        onChange={(e) =>
                          setSettings((s) => ({
                            ...s,
                            hero: {
                              ...s.hero,
                              primaryBtnText: { ...s.hero.primaryBtnText, en: e.target.value },
                            },
                          }))
                        }
                        className="w-full rounded-xl border border-outline-variant/30 bg-surface px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-secondary">Ruta / Enlace (Href)</label>
                      <input
                        type="text"
                        value={settings.hero.primaryBtnHref}
                        onChange={(e) =>
                          setSettings((s) => ({
                            ...s,
                            hero: { ...s.hero, primaryBtnHref: e.target.value },
                          }))
                        }
                        placeholder="/productos"
                        className="w-full rounded-xl border border-outline-variant/30 bg-surface px-3.5 py-2.5 font-mono text-sm focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Secondary Button */}
                <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-low/40 p-5">
                  <h3 className="mb-3 font-semibold text-on-surface">Botón Secundario</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-secondary">Texto (Español)</label>
                      <input
                        type="text"
                        value={settings.hero.secondaryBtnText.es}
                        onChange={(e) =>
                          setSettings((s) => ({
                            ...s,
                            hero: {
                              ...s.hero,
                              secondaryBtnText: { ...s.hero.secondaryBtnText, es: e.target.value },
                            },
                          }))
                        }
                        className="w-full rounded-xl border border-outline-variant/30 bg-surface px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-secondary">Texto (Inglés)</label>
                      <input
                        type="text"
                        value={settings.hero.secondaryBtnText.en}
                        onChange={(e) =>
                          setSettings((s) => ({
                            ...s,
                            hero: {
                              ...s.hero,
                              secondaryBtnText: { ...s.hero.secondaryBtnText, en: e.target.value },
                            },
                          }))
                        }
                        className="w-full rounded-xl border border-outline-variant/30 bg-surface px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-secondary">Ruta / Enlace (Href)</label>
                      <input
                        type="text"
                        value={settings.hero.secondaryBtnHref}
                        onChange={(e) =>
                          setSettings((s) => ({
                            ...s,
                            hero: { ...s.hero, secondaryBtnHref: e.target.value },
                          }))
                        }
                        placeholder="/nosotros"
                        className="w-full rounded-xl border border-outline-variant/30 bg-surface px-3.5 py-2.5 font-mono text-sm focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Hero Slides Carousel Section */}
          <section className="rounded-3xl bg-surface-container-lowest p-6 shadow-sm small:p-8">
            <div className="mb-6 flex flex-col gap-3 border-b border-outline-variant/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-primary">Galería Dinámica</span>
                <h2 className="font-heading text-2xl font-bold text-on-surface">Carrusel de Slides del Hero</h2>
                <p className="mt-1 text-sm text-tertiary">
                  Agrega, edita o desactiva las fotos que rotan en el carrusel de la portada.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddHeroSlide}
                className="inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-xs font-bold text-on-secondary transition-all hover:bg-secondary/90"
              >
                <HiOutlinePlus className="h-4 w-4" />
                Agregar nuevo slide
              </button>
            </div>

            <div className="space-y-4">
              {(!settings.hero.slides || settings.hero.slides.length === 0) && (
                <div className="rounded-2xl border border-dashed border-outline-variant/40 p-8 text-center text-sm text-tertiary">
                  No hay slides configurados. Haz clic en &ldquo;Agregar nuevo slide&rdquo; para sumar imágenes al carrusel.
                </div>
              )}

              {settings.hero.slides?.map((slide, index) => (
                <div
                  key={slide.id}
                  className="flex flex-col gap-4 rounded-2xl border border-outline-variant/20 bg-surface p-5 transition-all hover:border-outline-variant/40 md:flex-row md:items-center"
                >
                  {/* Thumbnail Preview */}
                  <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-outline-variant/20 bg-surface-container flex items-center justify-center">
                    {slide.src?.trim() ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={slide.src}
                        alt={slide.altEs || "Preview"}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = "/assets/photo2.jpg";
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-2 text-center">
                        <HiOutlinePhotograph className="h-6 w-6 text-outline-variant" />
                        <span className="text-[10px] font-bold text-error">Sin foto</span>
                      </div>
                    )}
                    <div className="absolute top-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      #{index + 1}
                    </div>
                  </div>

                  {/* Inputs */}
                  <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="sm:col-span-3">
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <label className="text-xs font-bold text-secondary">Imagen del Slide</label>
                        <div className="flex flex-wrap items-center gap-2">
                          {/* File upload button */}
                          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary transition-all hover:bg-primary hover:text-on-primary">
                            <HiOutlineUpload className="h-4 w-4 shrink-0" />
                            <span>{uploadingSlideId === slide.id ? "Subiendo..." : "Subir imagen"}</span>
                            <input
                              type="file"
                              accept="image/*"
                              disabled={uploadingSlideId === slide.id}
                              className="hidden"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) void handleSlideFileUpload(slide.id, f);
                              }}
                            />
                          </label>

                          {/* Preset gallery dropdown */}
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                handleUpdateHeroSlide(slide.id, { src: e.target.value });
                              }
                            }}
                            value=""
                            className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-3 py-1.5 text-xs font-medium text-on-surface-variant focus:border-primary focus:outline-none"
                            title="Seleccionar imagen de la galería de Panka"
                          >
                            <option value="" disabled>
                              🖼️ Elegir de galería...
                            </option>
                            {PRESET_GALLERY_IMAGES.map((img) => (
                              <option key={img.url} value={img.url}>
                                {img.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <input
                        type="text"
                        value={slide.src}
                        onChange={(e) => handleUpdateHeroSlide(slide.id, { src: e.target.value })}
                        placeholder="Ruta local (ej. /assets/photo2.jpg) o URL externa..."
                        className={`w-full rounded-xl border px-3.5 py-2 font-mono text-xs focus:outline-none ${
                          !slide.src?.trim()
                            ? "border-error/50 bg-error/5 focus:border-error"
                            : "border-outline-variant/30 bg-surface-container-lowest focus:border-primary"
                        }`}
                      />
                      {!slide.src?.trim() && (
                        <div className="mt-1 flex items-center justify-between text-[11px] text-error font-medium">
                          <span>⚠️ Si lo dejas vacío, el carrusel usará la imagen por defecto para no romperse.</span>
                          <button
                            type="button"
                            onClick={() => handleUpdateHeroSlide(slide.id, { src: "/assets/photo2.jpg" })}
                            className="underline hover:text-error/80"
                          >
                            Restaurar por defecto
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="sm:col-span-1">
                      <label className="mb-1 block text-xs font-medium text-tertiary">Texto Alternativo (Español)</label>
                      <input
                        type="text"
                        value={slide.altEs}
                        onChange={(e) => handleUpdateHeroSlide(slide.id, { altEs: e.target.value })}
                        placeholder="Descripción para accesibilidad"
                        className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-3 py-2 text-xs focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <label className="mb-1 block text-xs font-medium text-tertiary">Texto Alternativo (Inglés)</label>
                      <input
                        type="text"
                        value={slide.altEn}
                        onChange={(e) => handleUpdateHeroSlide(slide.id, { altEn: e.target.value })}
                        placeholder="Accessibility description"
                        className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-3 py-2 text-xs focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center justify-between sm:col-span-1 sm:justify-end gap-3 pt-4 sm:pt-0">
                      <label className="flex items-center gap-2 text-xs font-semibold text-on-surface cursor-pointer">
                        <input
                          type="checkbox"
                          checked={slide.active}
                          onChange={(e) => handleUpdateHeroSlide(slide.id, { active: e.target.checked })}
                          className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
                        />
                        <span>{slide.active ? "Activo" : "Pausado"}</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRemoveHeroSlide(slide.id)}
                        className="inline-flex items-center gap-1 rounded-xl p-2 text-error transition-all hover:bg-error-container/20"
                        title="Eliminar slide"
                      >
                        <HiOutlineTrash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Promotional Banner Section */}
          <section className="rounded-3xl bg-surface-container-lowest p-6 shadow-sm small:p-8">
            <div className="mb-6 flex flex-col gap-3 border-b border-outline-variant/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-secondary">Promoción Destacada</span>
                <h2 className="font-heading text-2xl font-bold text-on-surface">Banner Promocional de la Página de Inicio</h2>
                <p className="mt-1 text-sm text-tertiary">
                  Banner ancho con imagen y llamado a la acción ubicado entre la información de entrega y los carruseles.
                </p>
              </div>
              <label className="inline-flex items-center gap-2 rounded-xl bg-surface-container px-4 py-2.5 text-xs font-bold text-on-surface cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.promoBanner?.active !== false}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      promoBanner: { ...s.promoBanner, active: e.target.checked },
                    }))
                  }
                  className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
                />
                <span>{settings.promoBanner?.active !== false ? "Banner Activo" : "Banner Oculto"}</span>
              </label>
            </div>

            <div className="space-y-6">
              {/* Tag / Etiqueta */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                    Tag / Etiqueta (Español)
                  </label>
                  <input
                    type="text"
                    value={settings.promoBanner.tag.es}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        promoBanner: {
                          ...s.promoBanner,
                          tag: { ...s.promoBanner.tag, es: e.target.value },
                        },
                      }))
                    }
                    placeholder="Especiales"
                    className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                    Tag / Etiqueta (Inglés)
                  </label>
                  <input
                    type="text"
                    value={settings.promoBanner.tag.en}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        promoBanner: {
                          ...s.promoBanner,
                          tag: { ...s.promoBanner.tag, en: e.target.value },
                        },
                      }))
                    }
                    placeholder="Specials"
                    className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Title */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                    Título Promocional (Español)
                  </label>
                  <input
                    type="text"
                    value={settings.promoBanner.title.es}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        promoBanner: {
                          ...s.promoBanner,
                          title: { ...s.promoBanner.title, es: e.target.value },
                        },
                      }))
                    }
                    placeholder="Tamales Oaxaqueños"
                    className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 text-sm font-semibold focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                    Título Promocional (Inglés)
                  </label>
                  <input
                    type="text"
                    value={settings.promoBanner.title.en}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        promoBanner: {
                          ...s.promoBanner,
                          title: { ...s.promoBanner.title, en: e.target.value },
                        },
                      }))
                    }
                    placeholder="Tamales Oaxaqueños"
                    className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 text-sm font-semibold focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Description (Preserves newlines) */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                    Descripción (Español)
                  </label>
                  <p className="mb-2 text-xs text-tertiary">Los saltos de línea y párrafos se respetan en la tienda.</p>
                  <textarea
                    rows={3}
                    value={settings.promoBanner.description.es}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        promoBanner: {
                          ...s.promoBanner,
                          description: { ...s.promoBanner.description, es: e.target.value },
                        },
                      }))
                    }
                    className="w-full resize-y rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 text-sm leading-relaxed focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                    Descripción (Inglés)
                  </label>
                  <p className="mb-2 text-xs text-tertiary">Newlines and paragraphs will be preserved on the storefront.</p>
                  <textarea
                    rows={3}
                    value={settings.promoBanner.description.en}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        promoBanner: {
                          ...s.promoBanner,
                          description: { ...s.promoBanner.description, en: e.target.value },
                        },
                      }))
                    }
                    className="w-full resize-y rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 text-sm leading-relaxed focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Button and Image */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                    Texto del Botón (Español)
                  </label>
                  <input
                    type="text"
                    value={settings.promoBanner.buttonText.es}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        promoBanner: {
                          ...s.promoBanner,
                          buttonText: { ...s.promoBanner.buttonText, es: e.target.value },
                        },
                      }))
                    }
                    placeholder="Descubrir"
                    className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                    Texto del Botón (Inglés)
                  </label>
                  <input
                    type="text"
                    value={settings.promoBanner.buttonText.en}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        promoBanner: {
                          ...s.promoBanner,
                          buttonText: { ...s.promoBanner.buttonText, en: e.target.value },
                        },
                      }))
                    }
                    placeholder="Discover"
                    className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                    Enlace / Destino (Href)
                  </label>
                  <input
                    type="text"
                    value={settings.promoBanner.buttonHref}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        promoBanner: { ...s.promoBanner, buttonHref: e.target.value },
                      }))
                    }
                    placeholder="/productos?cat=especiales"
                    className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 font-mono text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Banner Image */}
              <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-low/40 p-5">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-secondary">
                    Imagen del Banner Promocional
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    {/* File upload button */}
                    <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary transition-all hover:bg-primary hover:text-on-primary">
                      <HiOutlineUpload className="h-4 w-4 shrink-0" />
                      <span>{uploadingPromoBanner ? "Subiendo..." : "Subir imagen"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingPromoBanner}
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) void handlePromoBannerFileUpload(f);
                        }}
                      />
                    </label>

                    {/* Preset gallery dropdown */}
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          setSettings((s) => ({
                            ...s,
                            promoBanner: { ...s.promoBanner, image: e.target.value },
                          }));
                        }
                      }}
                      value=""
                      className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-3 py-1.5 text-xs font-medium text-on-surface-variant focus:border-primary focus:outline-none"
                      title="Seleccionar imagen de la galería de Panka"
                    >
                      <option value="" disabled>
                        🖼️ Elegir de galería...
                      </option>
                      {PRESET_GALLERY_IMAGES.map((img) => (
                        <option key={img.url} value={img.url}>
                          {img.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="relative h-24 w-40 flex-shrink-0 overflow-hidden rounded-xl border border-outline-variant/20 bg-surface-container shadow-xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={settings.promoBanner.image || "/hero_3.jpg"}
                      alt="Banner Preview"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/hero_3.jpg";
                      }}
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={settings.promoBanner.image}
                      onChange={(e) =>
                        setSettings((s) => ({
                          ...s,
                          promoBanner: { ...s.promoBanner, image: e.target.value },
                        }))
                      }
                      placeholder="/hero_3.jpg o https://..."
                      className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-2.5 font-mono text-xs focus:border-primary focus:outline-none"
                    />
                    <p className="text-[11px] text-tertiary">
                      Puedes subir una imagen desde tu equipo, elegir una de la galería predeterminada, o ingresar un enlace directo.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ─── TAB 1: HISTORIA & MARCA ─── */}
      {activeTab === "story" && (
        <div className="space-y-8">
          <section className="rounded-3xl bg-surface-container-lowest p-6 shadow-sm small:p-8">
            <h2 className="mb-2 font-heading text-2xl font-bold text-on-surface">Encabezado de Nuestra Historia</h2>
            <p className="mb-6 text-sm text-tertiary">Aparece en la parte superior de la página /nosotros.</p>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                  Tag / Etiqueta (Español)
                </label>
                <input
                  type="text"
                  value={settings.story.tag.es}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      story: { ...s.story, tag: { ...s.story.tag, es: e.target.value } },
                    }))
                  }
                  className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 text-sm focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                  Tag / Etiqueta (English)
                </label>
                <input
                  type="text"
                  value={settings.story.tag.en}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      story: { ...s.story, tag: { ...s.story.tag, en: e.target.value } },
                    }))
                  }
                  className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 text-sm focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                  Título Principal (Español)
                </label>
                <input
                  type="text"
                  value={settings.story.title.es}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      story: { ...s.story, title: { ...s.story.title, es: e.target.value } },
                    }))
                  }
                  className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 text-sm focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                  Título Principal (English)
                </label>
                <input
                  type="text"
                  value={settings.story.title.en}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      story: { ...s.story, title: { ...s.story.title, en: e.target.value } },
                    }))
                  }
                  className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 text-sm focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </section>

          {/* Narrative Paragraphs */}
          <section className="rounded-3xl bg-surface-container-lowest p-6 shadow-sm small:p-8">
            <h2 className="mb-2 font-heading text-2xl font-bold text-on-surface">Párrafos de la Historia de Panka</h2>
            <p className="mb-6 text-sm text-tertiary">
              La narrativa que acompaña la foto principal de la preparación de los tamales.
            </p>
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                    Párrafo 1 (Español)
                  </label>
                  <textarea
                    rows={4}
                    value={settings.story.p1.es}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        story: { ...s.story, p1: { ...s.story.p1, es: e.target.value } },
                      }))
                    }
                    className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                    Párrafo 1 (English)
                  </label>
                  <textarea
                    rows={4}
                    value={settings.story.p1.en}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        story: { ...s.story, p1: { ...s.story.p1, en: e.target.value } },
                      }))
                    }
                    className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                    Párrafo 2 (Español)
                  </label>
                  <textarea
                    rows={4}
                    value={settings.story.p2.es}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        story: { ...s.story, p2: { ...s.story.p2, es: e.target.value } },
                      }))
                    }
                    className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                    Párrafo 2 (English)
                  </label>
                  <textarea
                    rows={4}
                    value={settings.story.p2.en}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        story: { ...s.story, p2: { ...s.story.p2, en: e.target.value } },
                      }))
                    }
                    className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                    Párrafo 3 - Origen del nombre Panka (Español)
                  </label>
                  <textarea
                    rows={3}
                    value={settings.story.p3.es}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        story: { ...s.story, p3: { ...s.story.p3, es: e.target.value } },
                      }))
                    }
                    className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                    Párrafo 3 - Origin of the name Panka (English)
                  </label>
                  <textarea
                    rows={3}
                    value={settings.story.p3.en}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        story: { ...s.story, p3: { ...s.story.p3, en: e.target.value } },
                      }))
                    }
                    className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Fanny (Founder) Section */}
          <section className="rounded-3xl bg-surface-container-lowest p-6 shadow-sm small:p-8">
            <h2 className="mb-2 font-heading text-2xl font-bold text-on-surface">Conoce a Fanny (Fundadora)</h2>
            <p className="mb-6 text-sm text-tertiary">Sección dedicada a la historia y trayectoria de la fundadora.</p>
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                    Título Sección (Español)
                  </label>
                  <input
                    type="text"
                    value={settings.story.fannyHeading.es}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        story: { ...s.story, fannyHeading: { ...s.story.fannyHeading, es: e.target.value } },
                      }))
                    }
                    className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                    Título Sección (English)
                  </label>
                  <input
                    type="text"
                    value={settings.story.fannyHeading.en}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        story: { ...s.story, fannyHeading: { ...s.story.fannyHeading, en: e.target.value } },
                      }))
                    }
                    className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                    Cargo / Subtítulo (Español)
                  </label>
                  <input
                    type="text"
                    value={settings.story.fannyRole.es}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        story: { ...s.story, fannyRole: { ...s.story.fannyRole, es: e.target.value } },
                      }))
                    }
                    className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                    Cargo / Subtítulo (English)
                  </label>
                  <input
                    type="text"
                    value={settings.story.fannyRole.en}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        story: { ...s.story, fannyRole: { ...s.story.fannyRole, en: e.target.value } },
                      }))
                    }
                    className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                    Biografía Párrafo 1 (Español)
                  </label>
                  <textarea
                    rows={4}
                    value={settings.story.fannyP1.es}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        story: { ...s.story, fannyP1: { ...s.story.fannyP1, es: e.target.value } },
                      }))
                    }
                    className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                    Biografía Párrafo 1 (English)
                  </label>
                  <textarea
                    rows={4}
                    value={settings.story.fannyP1.en}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        story: { ...s.story, fannyP1: { ...s.story.fannyP1, en: e.target.value } },
                      }))
                    }
                    className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                    Biografía Párrafo 2 (Español)
                  </label>
                  <textarea
                    rows={4}
                    value={settings.story.fannyP2.es}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        story: { ...s.story, fannyP2: { ...s.story.fannyP2, es: e.target.value } },
                      }))
                    }
                    className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                    Biografía Párrafo 2 (English)
                  </label>
                  <textarea
                    rows={4}
                    value={settings.story.fannyP2.en}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        story: { ...s.story, fannyP2: { ...s.story.fannyP2, en: e.target.value } },
                      }))
                    }
                    className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Values Section */}
          <section className="rounded-3xl bg-surface-container-lowest p-6 shadow-sm small:p-8">
            <h2 className="mb-2 font-heading text-2xl font-bold text-on-surface">Valores de Panka</h2>
            <p className="mb-6 text-sm text-tertiary">Los 3 pilares éticos y culinarios en /nosotros.</p>
            <div className="space-y-6">
              {/* Pasión */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                    Valor 1: Título & Descripción (Español)
                  </label>
                  <input
                    type="text"
                    value={settings.story.passionTitle.es}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        story: { ...s.story, passionTitle: { ...s.story.passionTitle, es: e.target.value } },
                      }))
                    }
                    className="mb-2 w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                  />
                  <textarea
                    rows={2}
                    value={settings.story.passionDesc.es}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        story: { ...s.story, passionDesc: { ...s.story.passionDesc, es: e.target.value } },
                      }))
                    }
                    className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                    Valor 1: Title & Description (English)
                  </label>
                  <input
                    type="text"
                    value={settings.story.passionTitle.en}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        story: { ...s.story, passionTitle: { ...s.story.passionTitle, en: e.target.value } },
                      }))
                    }
                    className="mb-2 w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                  />
                  <textarea
                    rows={2}
                    value={settings.story.passionDesc.en}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        story: { ...s.story, passionDesc: { ...s.story.passionDesc, en: e.target.value } },
                      }))
                    }
                    className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Tradición */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                    Valor 2: Título & Descripción (Español)
                  </label>
                  <input
                    type="text"
                    value={settings.story.traditionTitle.es}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        story: { ...s.story, traditionTitle: { ...s.story.traditionTitle, es: e.target.value } },
                      }))
                    }
                    className="mb-2 w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                  />
                  <textarea
                    rows={2}
                    value={settings.story.traditionDesc.es}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        story: { ...s.story, traditionDesc: { ...s.story.traditionDesc, es: e.target.value } },
                      }))
                    }
                    className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                    Valor 2: Title & Description (English)
                  </label>
                  <input
                    type="text"
                    value={settings.story.traditionTitle.en}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        story: { ...s.story, traditionTitle: { ...s.story.traditionTitle, en: e.target.value } },
                      }))
                    }
                    className="mb-2 w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                  />
                  <textarea
                    rows={2}
                    value={settings.story.traditionDesc.en}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        story: { ...s.story, traditionDesc: { ...s.story.traditionDesc, en: e.target.value } },
                      }))
                    }
                    className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Comunidad */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                    Valor 3: Título & Descripción (Español)
                  </label>
                  <input
                    type="text"
                    value={settings.story.communityTitle.es}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        story: { ...s.story, communityTitle: { ...s.story.communityTitle, es: e.target.value } },
                      }))
                    }
                    className="mb-2 w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                  />
                  <textarea
                    rows={2}
                    value={settings.story.communityDesc.es}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        story: { ...s.story, communityDesc: { ...s.story.communityDesc, es: e.target.value } },
                      }))
                    }
                    className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                    Valor 3: Title & Description (English)
                  </label>
                  <input
                    type="text"
                    value={settings.story.communityTitle.en}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        story: { ...s.story, communityTitle: { ...s.story.communityTitle, en: e.target.value } },
                      }))
                    }
                    className="mb-2 w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                  />
                  <textarea
                    rows={2}
                    value={settings.story.communityDesc.en}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        story: { ...s.story, communityDesc: { ...s.story.communityDesc, en: e.target.value } },
                      }))
                    }
                    className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ─── TAB: ENVÍOS & ENTREGAS (DELIVERY INFO) ─── */}
      {activeTab === "delivery" && (
        <div className="space-y-8">
          <section className="rounded-3xl bg-surface-container-lowest p-6 shadow-sm small:p-8">
            <div className="mb-6 border-b border-outline-variant/10 pb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-primary">Logística y Cobertura</span>
              <h2 className="font-heading text-2xl font-bold text-on-surface">Información de Envíos, Retiro y Programación</h2>
              <p className="mt-1 text-sm text-tertiary">
                Edita los textos y detalles de la tarjeta de entrega en el inicio. Aquí puedes definir la cobertura exclusiva para <strong>Miami-Dade y Broward</strong>, condiciones de envío gratis y horarios de pickup.
              </p>
            </div>

            {/* Sub-section 1: Local Delivery */}
            <div className="mb-10 rounded-2xl border border-outline-variant/20 bg-surface-container-low/40 p-6">
              <div className="mb-4 flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <HiOutlineTruck className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-heading text-lg font-bold text-on-surface">1. Pestaña: Entrega a Domicilio (Local Delivery)</h3>
                  <p className="text-xs text-secondary">Texto visible al seleccionar la primera opción de delivery.</p>
                </div>
              </div>

              <div className="space-y-5">
                {/* Titles */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                      Título de la Pestaña (Español)
                    </label>
                    <input
                      type="text"
                      value={settings.deliveryInfo?.delivery?.title?.es || ""}
                      onChange={(e) =>
                        setSettings((s) => ({
                          ...s,
                          deliveryInfo: {
                            ...s.deliveryInfo,
                            delivery: {
                              ...s.deliveryInfo.delivery,
                              title: { ...s.deliveryInfo.delivery.title, es: e.target.value },
                            },
                          },
                        }))
                      }
                      className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                      Tab Title (English)
                    </label>
                    <input
                      type="text"
                      value={settings.deliveryInfo?.delivery?.title?.en || ""}
                      onChange={(e) =>
                        setSettings((s) => ({
                          ...s,
                          deliveryInfo: {
                            ...s.deliveryInfo,
                            delivery: {
                              ...s.deliveryInfo.delivery,
                              title: { ...s.deliveryInfo.delivery.title, en: e.target.value },
                            },
                          },
                        }))
                      }
                      className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                      Descripción (Español)
                    </label>
                    <textarea
                      rows={2}
                      value={settings.deliveryInfo?.delivery?.description?.es || ""}
                      onChange={(e) =>
                        setSettings((s) => ({
                          ...s,
                          deliveryInfo: {
                            ...s.deliveryInfo,
                            delivery: {
                              ...s.deliveryInfo.delivery,
                              description: { ...s.deliveryInfo.delivery.description, es: e.target.value },
                            },
                          },
                        }))
                      }
                      className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                      Description (English)
                    </label>
                    <textarea
                      rows={2}
                      value={settings.deliveryInfo?.delivery?.description?.en || ""}
                      onChange={(e) =>
                        setSettings((s) => ({
                          ...s,
                          deliveryInfo: {
                            ...s.deliveryInfo,
                            delivery: {
                              ...s.deliveryInfo.delivery,
                              description: { ...s.deliveryInfo.delivery.description, en: e.target.value },
                            },
                          },
                        }))
                      }
                      className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                {/* Bullet 1: Cobertura */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                      Punto 1 — Cobertura (Español)
                    </label>
                    <input
                      type="text"
                      value={settings.deliveryInfo?.delivery?.detail1?.es || ""}
                      onChange={(e) =>
                        setSettings((s) => ({
                          ...s,
                          deliveryInfo: {
                            ...s.deliveryInfo,
                            delivery: {
                              ...s.deliveryInfo.delivery,
                              detail1: { ...s.deliveryInfo.delivery.detail1, es: e.target.value },
                            },
                          },
                        }))
                      }
                      placeholder="Ej: Cobertura exclusiva en condados de Miami-Dade y Broward"
                      className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                      Point 1 — Coverage (English)
                    </label>
                    <input
                      type="text"
                      value={settings.deliveryInfo?.delivery?.detail1?.en || ""}
                      onChange={(e) =>
                        setSettings((s) => ({
                          ...s,
                          deliveryInfo: {
                            ...s.deliveryInfo,
                            delivery: {
                              ...s.deliveryInfo.delivery,
                              detail1: { ...s.deliveryInfo.delivery.detail1, en: e.target.value },
                            },
                          },
                        }))
                      }
                      placeholder="e.g. Exclusive coverage in Miami-Dade & Broward County"
                      className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                {/* Bullet 2: Envío Gratis */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                      Punto 2 — Condición de Envío Gratis (Español)
                    </label>
                    <input
                      type="text"
                      value={settings.deliveryInfo?.delivery?.detail2?.es || ""}
                      onChange={(e) =>
                        setSettings((s) => ({
                          ...s,
                          deliveryInfo: {
                            ...s.deliveryInfo,
                            delivery: {
                              ...s.deliveryInfo.delivery,
                              detail2: { ...s.deliveryInfo.delivery.detail2, es: e.target.value },
                            },
                          },
                        }))
                      }
                      placeholder="Ej: Envío gratis en productos seleccionados y compras elegibles"
                      className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                      Point 2 — Free Shipping Terms (English)
                    </label>
                    <input
                      type="text"
                      value={settings.deliveryInfo?.delivery?.detail2?.en || ""}
                      onChange={(e) =>
                        setSettings((s) => ({
                          ...s,
                          deliveryInfo: {
                            ...s.deliveryInfo,
                            delivery: {
                              ...s.deliveryInfo.delivery,
                              detail2: { ...s.deliveryInfo.delivery.detail2, en: e.target.value },
                            },
                          },
                        }))
                      }
                      placeholder="e.g. Free shipping on selected items and eligible orders"
                      className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                {/* Bullet 3: Empaque y Conservación */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                      Punto 3 — Empaque y Frescura (Español)
                    </label>
                    <input
                      type="text"
                      value={settings.deliveryInfo?.delivery?.detail3?.es || ""}
                      onChange={(e) =>
                        setSettings((s) => ({
                          ...s,
                          deliveryInfo: {
                            ...s.deliveryInfo,
                            delivery: {
                              ...s.deliveryInfo.delivery,
                              detail3: { ...s.deliveryInfo.delivery.detail3, es: e.target.value },
                            },
                          },
                        }))
                      }
                      placeholder="Ej: Empaque térmico para mantener la temperatura y frescura"
                      className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                      Point 3 — Packaging & Freshness (English)
                    </label>
                    <input
                      type="text"
                      value={settings.deliveryInfo?.delivery?.detail3?.en || ""}
                      onChange={(e) =>
                        setSettings((s) => ({
                          ...s,
                          deliveryInfo: {
                            ...s.deliveryInfo,
                            delivery: {
                              ...s.deliveryInfo.delivery,
                              detail3: { ...s.deliveryInfo.delivery.detail3, en: e.target.value },
                            },
                          },
                        }))
                      }
                      placeholder="e.g. Thermal packaging to keep everything warm and fresh"
                      className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sub-section 2: Store Pick-Up */}
            <div className="mb-10 rounded-2xl border border-outline-variant/20 bg-surface-container-low/40 p-6">
              <div className="mb-4 flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <HiOutlineLocationMarker className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-heading text-lg font-bold text-on-surface">2. Pestaña: Recoger en Tienda (Store Pick-Up)</h3>
                  <p className="text-xs text-secondary">Texto visible al seleccionar la opción de retiro en local.</p>
                </div>
              </div>

              <div className="space-y-5">
                {/* Titles */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                      Título (Español)
                    </label>
                    <input
                      type="text"
                      value={settings.deliveryInfo?.pickup?.title?.es || ""}
                      onChange={(e) =>
                        setSettings((s) => ({
                          ...s,
                          deliveryInfo: {
                            ...s.deliveryInfo,
                            pickup: {
                              ...s.deliveryInfo.pickup,
                              title: { ...s.deliveryInfo.pickup.title, es: e.target.value },
                            },
                          },
                        }))
                      }
                      className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                      Title (English)
                    </label>
                    <input
                      type="text"
                      value={settings.deliveryInfo?.pickup?.title?.en || ""}
                      onChange={(e) =>
                        setSettings((s) => ({
                          ...s,
                          deliveryInfo: {
                            ...s.deliveryInfo,
                            pickup: {
                              ...s.deliveryInfo.pickup,
                              title: { ...s.deliveryInfo.pickup.title, en: e.target.value },
                            },
                          },
                        }))
                      }
                      className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                      Descripción (Español)
                    </label>
                    <textarea
                      rows={2}
                      value={settings.deliveryInfo?.pickup?.description?.es || ""}
                      onChange={(e) =>
                        setSettings((s) => ({
                          ...s,
                          deliveryInfo: {
                            ...s.deliveryInfo,
                            pickup: {
                              ...s.deliveryInfo.pickup,
                              description: { ...s.deliveryInfo.pickup.description, es: e.target.value },
                            },
                          },
                        }))
                      }
                      className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                      Description (English)
                    </label>
                    <textarea
                      rows={2}
                      value={settings.deliveryInfo?.pickup?.description?.en || ""}
                      onChange={(e) =>
                        setSettings((s) => ({
                          ...s,
                          deliveryInfo: {
                            ...s.deliveryInfo,
                            pickup: {
                              ...s.deliveryInfo.pickup,
                              description: { ...s.deliveryInfo.pickup.description, en: e.target.value },
                            },
                          },
                        }))
                      }
                      className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                {/* Bullets: Address, Week hours, Sat hours */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                      Punto 1 — Dirección de Retiro (Español)
                    </label>
                    <input
                      type="text"
                      value={settings.deliveryInfo?.pickup?.detail1?.es || ""}
                      onChange={(e) =>
                        setSettings((s) => ({
                          ...s,
                          deliveryInfo: {
                            ...s.deliveryInfo,
                            pickup: {
                              ...s.deliveryInfo.pickup,
                              detail1: { ...s.deliveryInfo.pickup.detail1, es: e.target.value },
                            },
                          },
                        }))
                      }
                      placeholder="Doral, FL — 9851 NW 58th St"
                      className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                      Point 1 — Pick-Up Address (English)
                    </label>
                    <input
                      type="text"
                      value={settings.deliveryInfo?.pickup?.detail1?.en || ""}
                      onChange={(e) =>
                        setSettings((s) => ({
                          ...s,
                          deliveryInfo: {
                            ...s.deliveryInfo,
                            pickup: {
                              ...s.deliveryInfo.pickup,
                              detail1: { ...s.deliveryInfo.pickup.detail1, en: e.target.value },
                            },
                          },
                        }))
                      }
                      placeholder="Doral, FL — 9851 NW 58th St"
                      className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                      Punto 2 — Horario Lun-Vie (Español)
                    </label>
                    <input
                      type="text"
                      value={settings.deliveryInfo?.pickup?.detail2?.es || ""}
                      onChange={(e) =>
                        setSettings((s) => ({
                          ...s,
                          deliveryInfo: {
                            ...s.deliveryInfo,
                            pickup: {
                              ...s.deliveryInfo.pickup,
                              detail2: { ...s.deliveryInfo.pickup.detail2, es: e.target.value },
                            },
                          },
                        }))
                      }
                      placeholder="Lunes a Viernes: 8am - 7pm"
                      className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                      Point 2 — Mon-Fri Hours (English)
                    </label>
                    <input
                      type="text"
                      value={settings.deliveryInfo?.pickup?.detail2?.en || ""}
                      onChange={(e) =>
                        setSettings((s) => ({
                          ...s,
                          deliveryInfo: {
                            ...s.deliveryInfo,
                            pickup: {
                              ...s.deliveryInfo.pickup,
                              detail2: { ...s.deliveryInfo.pickup.detail2, en: e.target.value },
                            },
                          },
                        }))
                      }
                      placeholder="Monday to Friday: 8am - 7pm"
                      className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                      Punto 3 — Horario Sábados (Español)
                    </label>
                    <input
                      type="text"
                      value={settings.deliveryInfo?.pickup?.detail3?.es || ""}
                      onChange={(e) =>
                        setSettings((s) => ({
                          ...s,
                          deliveryInfo: {
                            ...s.deliveryInfo,
                            pickup: {
                              ...s.deliveryInfo.pickup,
                              detail3: { ...s.deliveryInfo.pickup.detail3, es: e.target.value },
                            },
                          },
                        }))
                      }
                      placeholder="Sábados: 9am - 4pm"
                      className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                      Point 3 — Saturday Hours (English)
                    </label>
                    <input
                      type="text"
                      value={settings.deliveryInfo?.pickup?.detail3?.en || ""}
                      onChange={(e) =>
                        setSettings((s) => ({
                          ...s,
                          deliveryInfo: {
                            ...s.deliveryInfo,
                            pickup: {
                              ...s.deliveryInfo.pickup,
                              detail3: { ...s.deliveryInfo.pickup.detail3, en: e.target.value },
                            },
                          },
                        }))
                      }
                      placeholder="Saturday: 9am - 4pm"
                      className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sub-section 3: Scheduled Orders */}
            <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-low/40 p-6">
              <div className="mb-4 flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <HiOutlineClock className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-heading text-lg font-bold text-on-surface">3. Pestaña: Pedidos Programados (Schedule)</h3>
                  <p className="text-xs text-secondary">Texto visible al seleccionar la opción de pedidos anticipados o eventos.</p>
                </div>
              </div>

              <div className="space-y-5">
                {/* Titles */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                      Título (Español)
                    </label>
                    <input
                      type="text"
                      value={settings.deliveryInfo?.schedule?.title?.es || ""}
                      onChange={(e) =>
                        setSettings((s) => ({
                          ...s,
                          deliveryInfo: {
                            ...s.deliveryInfo,
                            schedule: {
                              ...s.deliveryInfo.schedule,
                              title: { ...s.deliveryInfo.schedule.title, es: e.target.value },
                            },
                          },
                        }))
                      }
                      className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                      Title (English)
                    </label>
                    <input
                      type="text"
                      value={settings.deliveryInfo?.schedule?.title?.en || ""}
                      onChange={(e) =>
                        setSettings((s) => ({
                          ...s,
                          deliveryInfo: {
                            ...s.deliveryInfo,
                            schedule: {
                              ...s.deliveryInfo.schedule,
                              title: { ...s.deliveryInfo.schedule.title, en: e.target.value },
                            },
                          },
                        }))
                      }
                      className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                      Descripción (Español)
                    </label>
                    <textarea
                      rows={2}
                      value={settings.deliveryInfo?.schedule?.description?.es || ""}
                      onChange={(e) =>
                        setSettings((s) => ({
                          ...s,
                          deliveryInfo: {
                            ...s.deliveryInfo,
                            schedule: {
                              ...s.deliveryInfo.schedule,
                              description: { ...s.deliveryInfo.schedule.description, es: e.target.value },
                            },
                          },
                        }))
                      }
                      className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                      Description (English)
                    </label>
                    <textarea
                      rows={2}
                      value={settings.deliveryInfo?.schedule?.description?.en || ""}
                      onChange={(e) =>
                        setSettings((s) => ({
                          ...s,
                          deliveryInfo: {
                            ...s.deliveryInfo,
                            schedule: {
                              ...s.deliveryInfo.schedule,
                              description: { ...s.deliveryInfo.schedule.description, en: e.target.value },
                            },
                          },
                        }))
                      }
                      className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                {/* Bullets: Advance days, Bulk pieces, Catering */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                      Punto 1 — Anticipación (Español)
                    </label>
                    <input
                      type="text"
                      value={settings.deliveryInfo?.schedule?.detail1?.es || ""}
                      onChange={(e) =>
                        setSettings((s) => ({
                          ...s,
                          deliveryInfo: {
                            ...s.deliveryInfo,
                            schedule: {
                              ...s.deliveryInfo.schedule,
                              detail1: { ...s.deliveryInfo.schedule.detail1, es: e.target.value },
                            },
                          },
                        }))
                      }
                      placeholder="Programa con hasta 7 días de anticipación"
                      className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                      Point 1 — Advance Notice (English)
                    </label>
                    <input
                      type="text"
                      value={settings.deliveryInfo?.schedule?.detail1?.en || ""}
                      onChange={(e) =>
                        setSettings((s) => ({
                          ...s,
                          deliveryInfo: {
                            ...s.deliveryInfo,
                            schedule: {
                              ...s.deliveryInfo.schedule,
                              detail1: { ...s.deliveryInfo.schedule.detail1, en: e.target.value },
                            },
                          },
                        }))
                      }
                      placeholder="Schedule up to 7 days in advance"
                      className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                      Punto 2 — Volumen o Mayoreo (Español)
                    </label>
                    <input
                      type="text"
                      value={settings.deliveryInfo?.schedule?.detail2?.es || ""}
                      onChange={(e) =>
                        setSettings((s) => ({
                          ...s,
                          deliveryInfo: {
                            ...s.deliveryInfo,
                            schedule: {
                              ...s.deliveryInfo.schedule,
                              detail2: { ...s.deliveryInfo.schedule.detail2, es: e.target.value },
                            },
                          },
                        }))
                      }
                      placeholder="Pedidos por mayoreo desde 50 piezas"
                      className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                      Point 2 — Bulk Minimum (English)
                    </label>
                    <input
                      type="text"
                      value={settings.deliveryInfo?.schedule?.detail2?.en || ""}
                      onChange={(e) =>
                        setSettings((s) => ({
                          ...s,
                          deliveryInfo: {
                            ...s.deliveryInfo,
                            schedule: {
                              ...s.deliveryInfo.schedule,
                              detail2: { ...s.deliveryInfo.schedule.detail2, en: e.target.value },
                            },
                          },
                        }))
                      }
                      placeholder="Bulk orders starting at 50 pieces"
                      className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                      Punto 3 — Catering y Empaque (Español)
                    </label>
                    <input
                      type="text"
                      value={settings.deliveryInfo?.schedule?.detail3?.es || ""}
                      onChange={(e) =>
                        setSettings((s) => ({
                          ...s,
                          deliveryInfo: {
                            ...s.deliveryInfo,
                            schedule: {
                              ...s.deliveryInfo.schedule,
                              detail3: { ...s.deliveryInfo.schedule.detail3, es: e.target.value },
                            },
                          },
                        }))
                      }
                      placeholder="Servicio de catering y empaque especial para eventos"
                      className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                      Point 3 — Catering & Packaging (English)
                    </label>
                    <input
                      type="text"
                      value={settings.deliveryInfo?.schedule?.detail3?.en || ""}
                      onChange={(e) =>
                        setSettings((s) => ({
                          ...s,
                          deliveryInfo: {
                            ...s.deliveryInfo,
                            schedule: {
                              ...s.deliveryInfo.schedule,
                              detail3: { ...s.deliveryInfo.schedule.detail3, en: e.target.value },
                            },
                          },
                        }))
                      }
                      placeholder="Catering service and custom event packaging"
                      className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ─── TAB 2: FOOTER & CONTACTO ─── */}
      {activeTab === "footer" && (
        <div className="space-y-8">
          <section className="rounded-3xl bg-surface-container-lowest p-6 shadow-sm small:p-8">
            <h2 className="mb-2 font-heading text-2xl font-bold text-on-surface">Información de Contacto</h2>
            <p className="mb-6 text-sm text-tertiary">
              Estos canales se reflejan automáticamente en el footer y en los enlaces de contacto (tel:, mailto:, wa.me).
            </p>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondary">
                  <HiOutlineMail className="h-4 w-4" />
                  Correo de atención al cliente
                </label>
                <input
                  type="email"
                  value={settings.contact.email}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      contact: { ...s.contact, email: e.target.value },
                    }))
                  }
                  className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 text-sm focus:border-primary focus:outline-none"
                  placeholder="hello@pankatamales.com"
                />
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondary">
                  <HiOutlinePhone className="h-4 w-4" />
                  Teléfono de contacto
                </label>
                <input
                  type="text"
                  value={settings.contact.phone}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      contact: { ...s.contact, phone: e.target.value },
                    }))
                  }
                  className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 text-sm focus:border-primary focus:outline-none"
                  placeholder="+1 (954) 901-4340"
                />
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondary">
                  WhatsApp (solo dígitos con código de país)
                </label>
                <input
                  type="text"
                  value={settings.contact.whatsapp}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      contact: { ...s.contact, whatsapp: e.target.value },
                    }))
                  }
                  className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 text-sm focus:border-primary focus:outline-none"
                  placeholder="19549014340"
                />
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondary">
                  <HiOutlineClock className="h-4 w-4" />
                  Horario de atención
                </label>
                <input
                  type="text"
                  value={settings.contact.hours}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      contact: { ...s.contact, hours: e.target.value },
                    }))
                  }
                  className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 text-sm focus:border-primary focus:outline-none"
                  placeholder="Mon-Fri: 8am - 7pm · Sat: 9am - 4pm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                  Dirección física de pickup / cocina
                </label>
                <input
                  type="text"
                  value={settings.contact.address}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      contact: { ...s.contact, address: e.target.value },
                    }))
                  }
                  className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 text-sm focus:border-primary focus:outline-none"
                  placeholder="Doral, FL — 9851 NW 58th St"
                />
              </div>
            </div>
          </section>

          <section className="rounded-3xl bg-surface-container-lowest p-6 shadow-sm small:p-8">
            <h2 className="mb-2 font-heading text-2xl font-bold text-on-surface">Descripción al Pie de Página (Footer)</h2>
            <p className="mb-6 text-sm text-tertiary">
              Texto descriptivo de marca ubicado debajo del logo de Panka en el pie de página.
            </p>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                  Descripción en Español
                </label>
                <textarea
                  rows={4}
                  value={settings.contact.footerDesc.es}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      contact: {
                        ...s.contact,
                        footerDesc: { ...s.contact.footerDesc, es: e.target.value },
                      },
                    }))
                  }
                  className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 text-sm focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                  Descripción en English
                </label>
                <textarea
                  rows={4}
                  value={settings.contact.footerDesc.en}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      contact: {
                        ...s.contact,
                        footerDesc: { ...s.contact.footerDesc, en: e.target.value },
                      },
                    }))
                  }
                  className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 text-sm focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ─── TAB 3: ANUNCIOS & TIENDA ─── */}
      {activeTab === "announcements" && (
        <div className="space-y-8">
          <section className="rounded-3xl bg-surface-container-lowest p-6 shadow-sm small:p-8">
            <div className="mb-6 flex flex-col gap-4 small:flex-row small:items-center small:justify-between">
              <div>
                <h2 className="font-heading text-2xl font-bold text-on-surface">Barra Superior de Anuncios</h2>
                <p className="text-sm text-tertiary">
                  Mensajes rotativos que aparecen en la barra marrón superior de la tienda.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddAnnouncement}
                className="inline-flex items-center gap-2 rounded-xl bg-surface-container-high px-4 py-2.5 text-xs font-bold text-on-surface hover:bg-surface-variant"
              >
                <HiOutlinePlus className="h-4 w-4" />
                Agregar anuncio
              </button>
            </div>

            <div className="space-y-4">
              {settings.announcements.map((ann, idx) => (
                <div
                  key={ann.id}
                  className="flex flex-col gap-4 rounded-2xl border border-outline-variant/20 bg-surface-container-low/40 p-5 small:flex-row small:items-center"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-container text-xs font-bold text-tertiary">
                    {idx + 1}
                  </div>
                  <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-secondary">
                        Texto (Español)
                      </label>
                      <input
                        type="text"
                        value={ann.textEs}
                        onChange={(e) => handleUpdateAnnouncement(ann.id, { textEs: e.target.value })}
                        className="w-full rounded-xl border border-outline-variant/30 bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-secondary">
                        Text (English)
                      </label>
                      <input
                        type="text"
                        value={ann.textEn}
                        onChange={(e) => handleUpdateAnnouncement(ann.id, { textEn: e.target.value })}
                        className="w-full rounded-xl border border-outline-variant/30 bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center justify-end gap-3 pt-2 small:pt-0">
                    <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-tertiary">
                      <input
                        type="checkbox"
                        checked={ann.active}
                        onChange={(e) => handleUpdateAnnouncement(ann.id, { active: e.target.checked })}
                        className="h-4 w-4 rounded accent-primary"
                      />
                      Activo
                    </label>
                    <button
                      type="button"
                      onClick={() => handleRemoveAnnouncement(ann.id)}
                      className="rounded-xl p-2 text-error/80 hover:bg-error-container/20 hover:text-error"
                      title="Eliminar anuncio"
                    >
                      <HiOutlineTrash className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Store status section */}
          <section className="rounded-3xl bg-surface-container-lowest p-6 shadow-sm small:p-8">
            <h2 className="mb-2 font-heading text-2xl font-bold text-on-surface">Estado de la Tienda</h2>
            <p className="mb-6 text-sm text-tertiary">
              Controla si la tienda está abierta para recibir pedidos o en pausa temporal.
            </p>
            <div className="flex items-center gap-4">
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={settings.storeStatus.isOpen}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      storeStatus: { ...s.storeStatus, isOpen: e.target.checked },
                    }))
                  }
                  className="sr-only peer"
                />
                <div className="h-7 w-14 rounded-full bg-surface-container-highest transition-colors peer-checked:bg-primary peer-focus:outline-none after:absolute after:left-[4px] after:top-[4px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-7" />
              </label>
              <div>
                <p className="text-sm font-bold text-on-surface">
                  {settings.storeStatus.isOpen ? "Tienda Abierta" : "Tienda en Pausa / Cerrada temporalmente"}
                </p>
                <p className="text-xs text-tertiary">
                  {settings.storeStatus.isOpen
                    ? "Los clientes pueden agregar productos y pagar en el checkout."
                    : "Se muestra un aviso informativo a los clientes."}
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ─── TAB 4: ADMINISTRADORES ─── */}
      {activeTab === "admins" && (
        <div className="space-y-8">
          {/* Add / Grant admin */}
          <section className="rounded-3xl bg-surface-container-lowest p-6 shadow-sm small:p-8">
            <h2 className="mb-2 font-heading text-2xl font-bold text-on-surface">Agregar o Autorizar Administrador</h2>
            <p className="mb-6 text-sm text-tertiary">
              Puedes autorizar un correo existente con Google/Email o crear una cuenta nueva con contraseña directamente.
            </p>

            <form onSubmit={handleCreateAdmin} className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-secondary">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  required
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="admin@ejemplo.com"
                  className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-secondary">
                  Nombre (Opcional)
                </label>
                <input
                  type="text"
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  placeholder="Fanny Panka"
                  className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-secondary">
                  Contraseña (si es cuenta nueva)
                </label>
                <input
                  type="password"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div className="md:col-span-3">
                <button
                  type="submit"
                  disabled={adminBusy || !newAdminEmail.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-on-primary transition-all hover:bg-primary/90 disabled:opacity-50"
                >
                  <HiOutlineUserAdd className="h-5 w-5" />
                  {adminBusy ? "Procesando..." : "Asignar permiso de administrador"}
                </button>
              </div>
            </form>
          </section>

          {/* List admins */}
          <section className="overflow-hidden rounded-3xl bg-surface-container-lowest shadow-sm">
            <div className="border-b border-outline-variant/10 p-6">
              <h2 className="font-heading text-2xl font-bold text-on-surface">Administradores Activos</h2>
              <p className="text-sm text-tertiary">
                Usuarios con el permiso <code className="font-mono text-xs font-bold text-primary">admin: true</code> en Firebase Auth.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-outline-variant/10 text-[10px] font-bold uppercase tracking-wider text-tertiary">
                    <th className="px-6 py-4">Usuario</th>
                    <th className="px-6 py-4">UID</th>
                    <th className="px-6 py-4">Último Acceso</th>
                    <th className="px-6 py-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {admins.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-sm text-tertiary">
                        No se encontraron otros administradores.
                      </td>
                    </tr>
                  ) : (
                    admins.map((adm) => {
                      const isSelf = user.uid === adm.uid;
                      return (
                        <tr key={adm.uid} className="hover:bg-surface-container-low/40">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary-container text-xs font-bold text-on-secondary-container">
                                {adm.displayName ? adm.displayName.slice(0, 2).toUpperCase() : adm.email.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-on-surface">
                                  {adm.displayName || "Admin"} {isSelf && <span className="text-xs text-primary font-bold">(Tú)</span>}
                                </p>
                                <p className="text-xs text-tertiary">{adm.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-mono text-xs text-on-surface-variant">
                            {adm.uid.slice(0, 16)}…
                          </td>
                          <td className="px-6 py-4 text-xs text-tertiary">
                            {adm.lastSignInTime ? new Date(adm.lastSignInTime).toLocaleDateString() : "Nunca"}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {!isSelf && (
                              <button
                                type="button"
                                onClick={() => void handleRevokeAdmin(adm.uid, adm.email)}
                                disabled={adminBusy}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-error/30 bg-error-container/20 px-3.5 py-2 text-xs font-bold text-error transition-all hover:bg-error-container/50 disabled:opacity-50"
                              >
                                <HiOutlineUserRemove className="h-4 w-4" />
                                Revocar acceso
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
