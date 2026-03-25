"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "@/components/AuthModal";
import { auth } from "@/lib/firebase";

async function getIdTokenOrThrow() {
  if (!auth?.currentUser) throw new Error("No authenticated user.");
  return await auth.currentUser.getIdToken();
}

export default function AdminHomePage() {
  const { user, loading } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [checking, setChecking] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const check = async () => {
      if (!user) {
        setIsAdmin(null);
        return;
      }
      setChecking(true);
      setError("");
      try {
        const token = await getIdTokenOrThrow();
        const res = await fetch("/admin/api/products", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const data = (await res.json()) as { error?: string };
          throw new Error(data.error || "Not authorized.");
        }
        setIsAdmin(true);
      } catch (e) {
        setIsAdmin(false);
        setError(e instanceof Error ? e.message : "Not authorized.");
      } finally {
        setChecking(false);
      }
    };
    void check();
  }, [user?.uid, user]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-6 w-6 animate-ring rounded-circle border-2 border-grey-20 border-t-panka-brown-500" />
      </div>
    );
  }

  return (
    <>
      <section className="mx-auto max-w-3xl px-6 py-16">
        <div className="rounded-2xl border border-grey-10 bg-white p-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-grey-30">
            Admin
          </p>
          <h1 className="mb-2 font-heading text-4xl font-bold text-panka-brown-500">
            Panel de control
          </h1>
          <p className="text-grey-50">
            Gestiona tu menú y precios sin entrar a Stripe.
          </p>

          {!user ? (
            <div className="mt-8">
              <button
                onClick={() => setAuthOpen(true)}
                className="w-full rounded-xl bg-panka-brown-500 py-4 text-base font-bold text-white transition-all hover:bg-panka-brown-600 hover:shadow-panka-md"
              >
                Iniciar sesión
              </button>
              <p className="mt-3 text-sm text-grey-40">
                Usa el mismo login de la tienda.
              </p>
            </div>
          ) : (
            <div className="mt-8">
              <div className="rounded-xl border border-grey-10 bg-grey-5 p-4">
                <p className="text-sm text-grey-60">
                  Sesión: <span className="font-semibold text-grey-80">{user.email}</span>
                </p>
              </div>

              {checking && (
                <p className="mt-4 text-sm text-grey-40">Verificando acceso…</p>
              )}

              {error && !checking && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              {isAdmin && !checking && (
                <div className="mt-6 flex flex-col gap-3 small:flex-row">
                  <Link
                    href="/admin/productos"
                    className="inline-flex w-full items-center justify-center rounded-xl bg-panka-brown-500 py-4 text-base font-bold text-white transition-all hover:bg-panka-brown-600 hover:shadow-panka-md"
                  >
                    Administrar productos
                  </Link>
                  <Link
                    href="/"
                    className="inline-flex w-full items-center justify-center rounded-xl border border-grey-10 bg-white py-4 text-base font-semibold text-grey-70 transition-colors hover:bg-grey-5"
                  >
                    Volver a la tienda
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}

