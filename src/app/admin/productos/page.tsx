"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { HiCheckCircle, HiOutlinePhotograph, HiOutlineRefresh, HiOutlineSave, HiOutlineTrash } from "react-icons/hi";

type AdminProduct = {
  id: string;
  name: string;
  active: boolean;
  description: string;
  image: string;
  popular: boolean;
  seedKey: string;
  sort: number;
  category: string;
  price: number | null;
  currency: string;
  defaultPriceId: string | null;
};

async function getIdTokenOrThrow() {
  if (!auth?.currentUser) throw new Error("No authenticated user.");
  return await auth.currentUser.getIdToken();
}

export default function AdminProductosPage() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const [items, setItems] = useState<AdminProduct[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [draftUploading, setDraftUploading] = useState(false);

  const [edits, setEdits] = useState<Record<string, Partial<AdminProduct>>>({});

  const [wizardStep, setWizardStep] = useState<0 | 1 | 2 | 3>(0); // details -> photo -> review -> done
  const [createdProductId, setCreatedProductId] = useState<string>("");

  const [draft, setDraft] = useState({
    name: "",
    price: 5,
    image: "/tamales/pollo.webp",
    popular: false,
    active: true,
    sort: 9999,
    description: "",
    category: "salados",
  });

  const canUseAdmin = useMemo(() => Boolean(user?.email), [user?.email]);

  const toast = (msg: string) => {
    setNotice(msg);
    window.setTimeout(() => setNotice(""), 3000);
  };

  const load = async () => {
    setBusy(true);
    setError("");
    try {
      const token = await getIdTokenOrThrow();
      const res = await fetch("/admin/api/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await res.json()) as { products?: AdminProduct[]; error?: string };
      if (!res.ok) throw new Error(data.error || "Failed to load products.");
      setItems(Array.isArray(data.products) ? data.products : []);
      setEdits({});
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load products.");
      setItems([]);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (user) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  const createProduct = async () => {
    setBusy(true);
    setError("");
    try {
      const token = await getIdTokenOrThrow();
      const res = await fetch("/admin/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(draft),
      });
      const data = (await res.json()) as { id?: string; error?: string };
      if (!res.ok) throw new Error(data.error || "Failed to create product.");
      setCreatedProductId(data.id || "");
      setWizardStep(3);
      toast("Producto creado.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create product.");
    } finally {
      setBusy(false);
    }
  };

  const updateProduct = async (p: Partial<AdminProduct> & { id: string }) => {
    setBusy(true);
    setError("");
    try {
      const token = await getIdTokenOrThrow();
      const res = await fetch("/admin/api/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(p),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) throw new Error(data.error || "Failed to update product.");
      await load();
      toast("Cambios guardados.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update product.");
    } finally {
      setBusy(false);
    }
  };

  const deleteProduct = async (id: string) => {
    const ok = window.confirm("¿Eliminar (archivar) este producto? Se ocultará de la tienda.");
    if (!ok) return;

    setBusy(true);
    setError("");
    try {
      const token = await getIdTokenOrThrow();
      const res = await fetch("/admin/api/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) throw new Error(data.error || "Failed to delete product.");
      await load();
      toast("Producto archivado.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete product.");
    } finally {
      setBusy(false);
    }
  };

  const uploadImageToStripe = async (file: File) => {
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
      throw new Error(data.error || "Error subiendo imagen.");
    }
    return data.url;
  };

  const uploadForExisting = async (productId: string, file: File) => {
    setUploading((m) => ({ ...m, [productId]: true }));
    setError("");
    try {
      const url = await uploadImageToStripe(file);
      await updateProduct({ id: productId, image: url });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error subiendo imagen.");
    } finally {
      setUploading((m) => ({ ...m, [productId]: false }));
    }
  };

  const uploadForDraft = async (file: File) => {
    setDraftUploading(true);
    setError("");
    try {
      const url = await uploadImageToStripe(file);
      setDraft((d) => ({ ...d, image: url }));
      toast("Imagen cargada.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error subiendo imagen.");
    } finally {
      setDraftUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-6 w-6 animate-ring rounded-circle border-2 border-grey-20 border-t-panka-brown-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-16">
        <div className="rounded-2xl border border-grey-10 bg-white p-8">
          <h1 className="mb-2 font-heading text-3xl font-bold text-panka-brown-500">
            Admin
          </h1>
          <p className="text-grey-50">Debes iniciar sesión para acceder al panel.</p>
          <p className="mt-4 text-sm text-grey-40">
            Ve a <Link className="underline" href="/admin">/admin</Link> e inicia sesión.
          </p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="border-b border-grey-10 bg-white pb-8 pt-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col gap-3 small:flex-row small:items-end small:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-grey-30">
                Admin
              </p>
              <h1 className="font-heading text-4xl font-bold text-panka-brown-500">
                Productos
              </h1>
              <p className="mt-2 text-sm text-grey-40">
                Gestiona tu menú sin entrar a Stripe.
              </p>
            </div>
            <button
              onClick={load}
              disabled={!canUseAdmin || busy}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-grey-10 bg-white px-5 py-3 text-sm font-semibold text-grey-70 transition-colors hover:bg-grey-5 disabled:opacity-50"
            >
              <HiOutlineRefresh className="h-5 w-5" />
              Refresh
            </button>
          </div>
          {notice && (
            <div className="mt-6 rounded-xl border border-panka-green-100 bg-panka-green-50 p-4 text-sm font-medium text-panka-green-700">
              {notice}
            </div>
          )}
          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>
      </section>

      <section className="py-10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-8 small:grid-cols-3">
            <div className="small:col-span-1">
              <div className="rounded-2xl border border-grey-10 bg-white p-6">
                <div className="mb-5">
                  <p className="text-sm font-semibold uppercase tracking-widest text-grey-30">Nuevo</p>
                  <h2 className="mt-1 text-lg font-bold text-grey-80">Crear producto</h2>
                </div>

                {/* Wizard stepper */}
                <ol className="mb-6 flex items-center justify-between gap-2">
                  {[
                    { label: "Detalles", idx: 0 },
                    { label: "Foto", idx: 1 },
                    { label: "Confirmar", idx: 2 },
                  ].map((s) => (
                    <li key={s.label} className="flex flex-1 items-center gap-2">
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-xl border text-sm font-bold transition-colors ${
                          wizardStep >= s.idx
                            ? "border-panka-green-200 bg-panka-green-50 text-panka-green-600"
                            : "border-grey-10 bg-white text-grey-40"
                        }`}
                      >
                        {wizardStep > s.idx ? "✓" : s.idx + 1}
                      </span>
                      <span className={`text-xs font-semibold ${wizardStep >= s.idx ? "text-grey-70" : "text-grey-30"}`}>
                        {s.label}
                      </span>
                    </li>
                  ))}
                </ol>

                {/* Step content with simple transitions */}
                <div className="relative">
                  {wizardStep === 0 && (
                    <div className="space-y-4 animate-fade-in-top">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-grey-50">Nombre</label>
                        <input
                          value={draft.name}
                          onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                          className="w-full rounded-xl border border-grey-20 bg-grey-5 px-4 py-3 text-base text-grey-80 outline-none focus:border-panka-green-400 focus:ring-2 focus:ring-panka-green-50"
                          placeholder="Ej. Tamalito verde"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-grey-50">Precio ($)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={draft.price}
                            onChange={(e) => setDraft((d) => ({ ...d, price: Number(e.target.value) }))}
                            className="w-full rounded-xl border border-grey-20 bg-grey-5 px-4 py-3 text-base text-grey-80 outline-none focus:border-panka-green-400 focus:ring-2 focus:ring-panka-green-50"
                          />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-grey-50">Orden</label>
                          <input
                            type="number"
                            value={draft.sort}
                            onChange={(e) => setDraft((d) => ({ ...d, sort: Number(e.target.value) }))}
                            className="w-full rounded-xl border border-grey-20 bg-grey-5 px-4 py-3 text-base text-grey-80 outline-none focus:border-panka-green-400 focus:ring-2 focus:ring-panka-green-50"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-grey-50">Descripción</label>
                        <textarea
                          value={draft.description}
                          onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                          rows={3}
                          className="w-full resize-none rounded-xl border border-grey-20 bg-grey-5 px-4 py-3 text-base text-grey-80 outline-none focus:border-panka-green-400 focus:ring-2 focus:ring-panka-green-50"
                          placeholder="Opcional"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="inline-flex items-center gap-2 text-sm font-medium text-grey-60">
                          <input
                            type="checkbox"
                            checked={draft.active}
                            onChange={(e) => setDraft((d) => ({ ...d, active: e.target.checked }))}
                          />
                          Activo
                        </label>
                        <label className="inline-flex items-center gap-2 text-sm font-medium text-grey-60">
                          <input
                            type="checkbox"
                            checked={draft.popular}
                            onChange={(e) => setDraft((d) => ({ ...d, popular: e.target.checked }))}
                          />
                          Popular
                        </label>
                      </div>

                      <button
                        onClick={() => setWizardStep(1)}
                        disabled={!draft.name.trim()}
                        className="w-full rounded-xl bg-panka-brown-500 py-4 text-base font-bold text-white transition-all hover:bg-panka-brown-600 hover:shadow-panka-md disabled:opacity-50"
                      >
                        Siguiente
                      </button>
                    </div>
                  )}

                  {wizardStep === 1 && (
                    <div className="space-y-4 animate-fade-in-top">
                      <div className="flex items-start gap-4">
                        <div className="relative h-24 w-24 overflow-hidden rounded-2xl bg-grey-5">
                          <Image src={draft.image || "/tamales/pollo.webp"} alt="Preview" fill className="object-cover" />
                        </div>
                        <div className="flex-1">
                          <label className="mb-1.5 block text-sm font-medium text-grey-50">Foto</label>
                          <div className="flex items-center gap-2">
                            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-grey-10 bg-white px-4 py-2.5 text-sm font-semibold text-grey-70 transition-all hover:bg-grey-5 hover:shadow-panka-sm">
                              <HiOutlinePhotograph className="h-5 w-5" />
                              Subir
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if (f) void uploadForDraft(f);
                                }}
                              />
                            </label>
                            {draftUploading && <span className="text-sm text-grey-40">Subiendo...</span>}
                          </div>
                          <p className="mt-2 text-xs text-grey-40">
                            La imagen se sube a Stripe y se guarda en el producto.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setWizardStep(0)}
                          className="w-full rounded-xl border border-grey-10 bg-white py-3.5 text-base font-semibold text-grey-70 transition-colors hover:bg-grey-5"
                        >
                          Atrás
                        </button>
                        <button
                          onClick={() => setWizardStep(2)}
                          className="w-full rounded-xl bg-panka-brown-500 py-3.5 text-base font-bold text-white transition-all hover:bg-panka-brown-600 hover:shadow-panka-md"
                        >
                          Siguiente
                        </button>
                      </div>
                    </div>
                  )}

                  {wizardStep === 2 && (
                    <div className="space-y-4 animate-fade-in-top">
                      <div className="rounded-2xl border border-grey-10 bg-grey-5 p-4">
                        <p className="text-sm font-semibold text-grey-80">{draft.name}</p>
                        <p className="text-sm text-grey-50">${draft.price.toFixed(2)} · Orden {draft.sort}</p>
                        <p className="mt-2 text-sm text-grey-50">{draft.description || "Sin descripción"}</p>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                          <span className={`rounded-lg px-2 py-1 font-semibold ${draft.active ? "bg-panka-green-50 text-panka-green-700" : "bg-grey-10 text-grey-50"}`}>
                            {draft.active ? "Activo" : "Inactivo"}
                          </span>
                          {draft.popular && (
                            <span className="rounded-lg bg-amber-50 px-2 py-1 font-semibold text-amber-700">
                              Popular
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setWizardStep(1)}
                          className="w-full rounded-xl border border-grey-10 bg-white py-3.5 text-base font-semibold text-grey-70 transition-colors hover:bg-grey-5"
                        >
                          Atrás
                        </button>
                        <button
                          onClick={createProduct}
                          disabled={busy || !draft.name.trim()}
                          className="w-full rounded-xl bg-panka-brown-500 py-3.5 text-base font-bold text-white transition-all hover:bg-panka-brown-600 hover:shadow-panka-md disabled:opacity-50"
                        >
                          Crear producto
                        </button>
                      </div>
                    </div>
                  )}

                  {wizardStep === 3 && (
                    <div className="space-y-4 animate-scale-in">
                      <div className="rounded-2xl border border-panka-green-100 bg-panka-green-50 p-4">
                        <div className="flex items-start gap-3">
                          <HiCheckCircle className="h-6 w-6 text-panka-green-600" />
                          <div>
                            <p className="text-base font-bold text-panka-green-700">Producto creado</p>
                            {createdProductId && (
                              <p className="mt-1 text-xs text-panka-green-700/80">
                                ID: <span className="font-mono">{createdProductId}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => {
                            setDraft((d) => ({ ...d, name: "", description: "" }));
                            setCreatedProductId("");
                            setWizardStep(0);
                          }}
                          className="w-full rounded-xl bg-panka-brown-500 py-3.5 text-base font-bold text-white transition-all hover:bg-panka-brown-600 hover:shadow-panka-md"
                        >
                          Crear otro
                        </button>
                        <button
                          onClick={load}
                          className="w-full rounded-xl border border-grey-10 bg-white py-3.5 text-base font-semibold text-grey-70 transition-colors hover:bg-grey-5"
                        >
                          Ver lista
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="small:col-span-2">
              <div className="rounded-2xl border border-grey-10 bg-white p-6">
                <h2 className="mb-5 text-lg font-bold text-grey-80">Productos</h2>
                <div className="space-y-4">
                  {items.length === 0 ? (
                    <p className="text-sm text-grey-40">No hay productos.</p>
                  ) : (
                    items
                      .sort((a, b) => (a.sort || 9999) - (b.sort || 9999))
                      .map((p) => (
                        <div
                          key={p.id}
                          className={`rounded-2xl border border-grey-10 p-5 transition-all ${
                            p.active ? "bg-white" : "bg-grey-5/60 opacity-80"
                          }`}
                        >
                          <div className="flex flex-col gap-4 small:flex-row small:items-start small:justify-between">
                            <div className="flex items-start gap-4 min-w-0">
                              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-grey-5">
                                <Image
                                  src={p.image || "/tamales/pollo.webp"}
                                  alt={p.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-lg font-bold text-grey-80 truncate">
                                  {p.name}
                                </p>
                                {!p.active && (
                                  <span className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-700">
                                    No disponible
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-grey-40 truncate">{p.id}</p>
                              <p className="mt-2 text-sm text-grey-50">
                                Precio:{" "}
                                <span className="font-semibold text-grey-80">
                                  {p.price == null ? "—" : `$${p.price.toFixed(2)}`}
                                </span>
                              </p>
                            </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => updateProduct({ id: p.id, active: !p.active })}
                                disabled={busy}
                                className="rounded-xl border border-grey-10 bg-white px-4 py-2 text-sm font-semibold text-grey-70 hover:bg-grey-5 disabled:opacity-50"
                              >
                                {p.active ? "Desactivar" : "Activar"}
                              </button>
                              <button
                                onClick={() => updateProduct({ id: p.id, popular: !p.popular })}
                                disabled={busy || !p.active}
                                className="rounded-xl border border-grey-10 bg-white px-4 py-2 text-sm font-semibold text-grey-70 hover:bg-grey-5 disabled:opacity-50"
                              >
                                {p.popular ? "Quitar popular" : "Marcar popular"}
                              </button>
                              <button
                                onClick={() => deleteProduct(p.id)}
                                disabled={busy || !p.active}
                                className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                              >
                                <HiOutlineTrash className="h-5 w-5" />
                                Eliminar
                              </button>
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-1 gap-3 xsmall:grid-cols-2">
                            <div>
                              <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-grey-30">
                                Foto
                              </label>
                              <div className="flex items-center gap-2">
                                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-grey-10 bg-white px-4 py-2.5 text-sm font-semibold text-grey-70 hover:bg-grey-5">
                                  <HiOutlinePhotograph className="h-5 w-5" />
                                  Subir
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const f = e.target.files?.[0];
                                      if (f) void uploadForExisting(p.id, f);
                                    }}
                                    disabled={!p.active}
                                  />
                                </label>
                                {uploading[p.id] && <span className="text-sm text-grey-40">Subiendo...</span>}
                              </div>
                            </div>
                            <div>
                              <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-grey-30">
                                Precio ($)
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                value={edits[p.id]?.price ?? p.price ?? 0}
                                onChange={(e) =>
                                  setEdits((m) => ({
                                    ...m,
                                    [p.id]: { ...(m[p.id] || {}), price: Number(e.target.value) },
                                  }))
                                }
                                className="w-full rounded-xl border border-grey-20 bg-grey-5 px-4 py-3 text-sm text-grey-80 outline-none focus:border-panka-green-400 focus:ring-2 focus:ring-panka-green-50"
                              />
                            </div>
                            <div className="xsmall:col-span-2">
                              <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-grey-30">
                                Descripción
                              </label>
                              <textarea
                                value={edits[p.id]?.description ?? p.description}
                                rows={2}
                                onChange={(e) =>
                                  setEdits((m) => ({
                                    ...m,
                                    [p.id]: { ...(m[p.id] || {}), description: e.target.value },
                                  }))
                                }
                                className="w-full resize-none rounded-xl border border-grey-20 bg-grey-5 px-4 py-3 text-sm text-grey-80 outline-none focus:border-panka-green-400 focus:ring-2 focus:ring-panka-green-50"
                              />
                            </div>
                            <div className="xsmall:col-span-2 flex justify-end">
                              <button
                                onClick={() => updateProduct({ id: p.id, ...edits[p.id] })}
                                disabled={busy || !edits[p.id] || Object.keys(edits[p.id] || {}).length === 0}
                                className="inline-flex items-center gap-2 rounded-xl bg-panka-brown-500 px-5 py-3 text-sm font-bold text-white transition-all hover:bg-panka-brown-600 hover:shadow-panka-sm disabled:opacity-50"
                              >
                                <HiOutlineSave className="h-5 w-5" />
                                Guardar cambios
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
              <p className="mt-3 text-xs text-grey-40">
                {t("nav.signIn")} / {t("nav.signOut")} vienen de Firebase Auth. Acceso admin se controla por <code className="font-mono">ADMIN_EMAILS</code>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

