"use client";

import { useState } from "react";
import { HiX } from "react-icons/hi";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login, register, loginWithGoogle } = useAuth();
  const { t } = useLanguage();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") await login(email, password);
      else await register(email, password, name);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    try { await loginWithGoogle(); onClose(); }
    catch (err: unknown) { setError(err instanceof Error ? err.message : "Error"); }
  };

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-sm rounded-2xl bg-white p-8 shadow-panka-lg animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={onClose} className="absolute right-4 top-4 rounded-circle p-1.5 text-grey-40 transition-colors hover:bg-grey-10 hover:text-grey-70">
            <HiX className="h-4 w-4" />
          </button>

          <h2 className="mb-1 font-heading text-2xl font-bold text-panka-brown-500">
            {mode === "login" ? t("auth.welcomeBack") : t("auth.createAccount")}
          </h2>
          <p className="mb-6 text-sm text-grey-40">
            {mode === "login" ? t("auth.signInDesc") : t("auth.signUpDesc")}
          </p>

          <button
            onClick={handleGoogle}
            className="mb-4 flex w-full items-center justify-center gap-3 rounded-xl border border-grey-20 py-3 text-sm font-medium text-grey-70 transition-all hover:bg-grey-5 hover:shadow-panka-sm"
          >
            <FcGoogle className="h-5 w-5" />
            {t("auth.google")}
          </button>

          <div className="mb-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-grey-10" />
            <span className="text-xs text-grey-30">{t("auth.or")}</span>
            <div className="h-px flex-1 bg-grey-10" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {mode === "register" && (
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("auth.namePlaceholder")} required className="rounded-xl border border-grey-20 bg-grey-5 px-4 py-3 text-sm text-grey-80 outline-none transition-all placeholder:text-grey-30 focus:border-panka-green-400 focus:ring-2 focus:ring-panka-green-50" />
            )}
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("auth.emailPlaceholder")} required className="rounded-xl border border-grey-20 bg-grey-5 px-4 py-3 text-sm text-grey-80 outline-none transition-all placeholder:text-grey-30 focus:border-panka-green-400 focus:ring-2 focus:ring-panka-green-50" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t("auth.passwordPlaceholder")} required minLength={6} className="rounded-xl border border-grey-20 bg-grey-5 px-4 py-3 text-sm text-grey-80 outline-none transition-all placeholder:text-grey-30 focus:border-panka-green-400 focus:ring-2 focus:ring-panka-green-50" />
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}
            <button type="submit" disabled={loading} className="mt-1 rounded-xl bg-panka-brown-500 py-3 text-sm font-bold text-white transition-all hover:bg-panka-brown-600 disabled:opacity-50">
              {loading ? t("auth.loading") : mode === "login" ? t("auth.signInBtn") : t("auth.signUpBtn")}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-grey-40">
            {mode === "login" ? t("auth.noAccount") : t("auth.hasAccount")}
            <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }} className="font-semibold text-panka-green-500 hover:underline">
              {mode === "login" ? t("auth.signUpLink") : t("auth.signInLink")}
            </button>
          </p>
        </div>
      </div>
    </>
  );
}
