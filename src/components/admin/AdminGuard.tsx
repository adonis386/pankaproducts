"use client";

import { useEffect, useState, useCallback, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  HiOutlineShieldCheck,
  HiOutlineLockClosed,
  HiOutlineExclamation,
  HiOutlineArrowLeft,
  HiOutlineLogout,
} from "react-icons/hi";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";

export default function AdminGuard({ children }: { children: ReactNode }) {
  const { user, loading: authLoading, login, loginWithGoogle, logout } = useAuth();
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [errorReason, setErrorReason] = useState("");

  // Dedicated admin login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState("");

  const verifyAdminStatus = useCallback(async () => {
    if (!user) {
      setIsAdmin(null);
      setChecking(false);
      return;
    }

    setChecking(true);
    setErrorReason("");

    try {
      // 1. Force refresh ID token to get fresh custom claims
      const tokenResult = await user.getIdTokenResult(true);
      const hasClaim = Boolean(tokenResult.claims.admin);

      if (!hasClaim) {
        setIsAdmin(false);
        setErrorReason("Tu cuenta no tiene asignado el rol de administrador en Firebase Auth.");
        setChecking(false);
        return;
      }

      // 2. Double-check with backend server-side verify endpoint (checks allowlist and token validity)
      const token = tokenResult.token;
      const res = await fetch("/admin/api/verify", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setIsAdmin(false);
        setErrorReason(data.error || "Acceso denegado por políticas de seguridad del servidor.");
        setChecking(false);
        return;
      }

      setIsAdmin(true);
    } catch (err) {
      setIsAdmin(false);
      setErrorReason(err instanceof Error ? err.message : "Error al validar credenciales.");
    } finally {
      setChecking(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      void verifyAdminStatus();
    }
  }, [authLoading, verifyAdminStatus]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Credenciales inválidas.");
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoginError("");
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Error en autenticación con Google.");
      setIsSubmitting(false);
    }
  };

  // 1. Loading state
  if (authLoading || checking) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-12 w-12 animate-pulse">
            <Image src="/assets/ICON.png" alt="" fill className="object-contain" />
          </div>
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-outline-variant border-t-primary" />
          <p className="text-xs font-semibold uppercase tracking-widest text-tertiary">
            Verificando credenciales de administrador...
          </p>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated state -> Dedicated Admin Login (No public registration allowed here)
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-container-lowest p-6">
        <div className="w-full max-w-md rounded-3xl border border-outline-variant/20 bg-surface p-8 shadow-editorial-lg">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image src="/assets/ICON.png" alt="" width={36} height={36} className="h-9 w-9 object-contain" />
              <div>
                <span className="font-heading text-xl font-bold text-on-surface">Panka Products</span>
                <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Panel de Administración</p>
              </div>
            </div>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <HiOutlineLockClosed className="h-4 w-4" />
            </span>
          </div>

          <div className="mb-6 border-b border-outline-variant/15 pb-4">
            <h1 className="font-heading text-2xl font-bold text-on-surface">Iniciar Sesión Admin</h1>
            <p className="mt-1 text-xs text-tertiary">
              Área restringida. Solo usuarios con rol de administrador activo pueden ingresar.
            </p>
          </div>

          {loginError && (
            <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-error/20 bg-error-container/40 p-3.5 text-xs font-medium text-error">
              <HiOutlineExclamation className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-secondary">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="admin@pankaproducts.com"
                className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface outline-none transition-all placeholder:text-tertiary/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-secondary">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface outline-none transition-all placeholder:text-tertiary/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-on-primary shadow-md shadow-primary/20 transition-all hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? "Autenticando..." : "Ingresar al Panel"}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-outline-variant/20" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-tertiary">o</span>
            <div className="h-px flex-1 bg-outline-variant/20" />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-outline-variant/30 bg-surface-container-lowest py-3 text-xs font-bold text-on-surface transition-all hover:bg-surface-container-low"
          >
            <FcGoogle className="h-4 w-4" />
            Acceder con Google Workspace
          </button>

          <div className="mt-6 border-t border-outline-variant/15 pt-4 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-tertiary transition-colors hover:text-on-surface"
            >
              <HiOutlineArrowLeft className="h-3.5 w-3.5" />
              Volver a la tienda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. User logged in BUT NOT ADMIN (Access Denied 403)
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-container-lowest p-6">
        <div className="w-full max-w-md rounded-3xl border border-error/30 bg-surface p-8 shadow-editorial-lg text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-error/10 text-error">
            <HiOutlineExclamation className="h-8 w-8" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-error">Acceso Denegado (403)</span>
          <h1 className="mt-1 font-heading text-2xl font-bold text-on-surface">Cuenta Sin Privilegios</h1>
          <p className="mt-3 text-sm text-on-surface-variant leading-relaxed">
            Has iniciado sesión con <strong>{user.email}</strong>, pero esta cuenta no tiene permisos de administrador en el sistema.
          </p>

          {errorReason && (
            <p className="mt-3 rounded-xl bg-error-container/40 p-3 text-xs text-error font-medium">
              {errorReason}
            </p>
          )}

          <div className="mt-6 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => void logout()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-xs font-bold text-on-primary shadow-sm hover:bg-primary/90"
            >
              <HiOutlineLogout className="h-4 w-4" />
              Cerrar sesión de esta cuenta
            </button>
            <Link
              href="/"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-outline-variant/30 py-3 text-xs font-bold text-on-surface hover:bg-surface-container-low"
            >
              <HiOutlineArrowLeft className="h-4 w-4" />
              Ir al inicio de la tienda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 4. Authorized Admin -> render protected shell and pages
  return <>{children}</>;
}
