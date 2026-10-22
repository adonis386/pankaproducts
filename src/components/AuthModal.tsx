"use client";

import { useState } from "react";
import { HiX, HiOutlineExclamationCircle } from "react-icons/hi";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { getFriendlyAuthErrorMessage } from "@/lib/auth-errors";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login, register, loginWithGoogle } = useAuth();
  const { t, locale } = useLanguage();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setError("");
    setPassword("");
    setConfirmPassword("");
    onClose();
  };

  const handleSwitchMode = (nextMode: "login" | "register") => {
    setMode(nextMode);
    setError("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleanEmail = email.trim();
    const cleanName = name.trim();

    if (mode === "register") {
      if (password.length < 6) {
        setError(t("auth.passwordMinLength"));
        return;
      }
      if (password !== confirmPassword) {
        setError(t("auth.passwordsMismatch"));
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === "login") {
        await login(cleanEmail, password);
      } else {
        await register(cleanEmail, password, cleanName);
      }
      handleClose();
    } catch (err: unknown) {
      setError(getFriendlyAuthErrorMessage(err, locale));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    try {
      await loginWithGoogle();
      handleClose();
    } catch (err: unknown) {
      setError(getFriendlyAuthErrorMessage(err, locale));
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity" onClick={handleClose} />
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-sm rounded-3xl bg-surface p-7 shadow-editorial-lg animate-scale-in border border-outline-variant/20"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 rounded-xl p-1.5 text-tertiary transition-colors hover:bg-surface-container-high hover:text-on-surface"
            aria-label="Cerrar modal"
          >
            <HiX className="h-4 w-4" />
          </button>

          <h2 className="mb-1 font-heading text-2xl font-bold text-on-surface">
            {mode === "login" ? t("auth.welcomeBack") : t("auth.createAccount")}
          </h2>
          <p className="mb-5 text-xs text-tertiary">
            {mode === "login" ? t("auth.signInDesc") : t("auth.signUpDesc")}
          </p>

          <button
            onClick={handleGoogle}
            type="button"
            className="mb-4 flex w-full items-center justify-center gap-2.5 rounded-xl border border-outline-variant/30 bg-surface-container-lowest py-3 text-xs font-bold text-on-surface transition-all hover:bg-surface-container-low active:scale-[0.99]"
          >
            <FcGoogle className="h-4 w-4" />
            {t("auth.google")}
          </button>

          <div className="mb-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-outline-variant/20" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-tertiary">{t("auth.or")}</span>
            <div className="h-px flex-1 bg-outline-variant/20" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {mode === "register" && (
              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-secondary">
                  {locale === "es" ? "Nombre Completo" : "Full Name"}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("auth.namePlaceholder")}
                  required
                  className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-3.5 py-2.5 text-sm text-on-surface outline-none transition-all placeholder:text-tertiary/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            )}

            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-secondary">
                {locale === "es" ? "Correo Electrónico" : "Email Address"}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("auth.emailPlaceholder")}
                required
                autoComplete="email"
                className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-3.5 py-2.5 text-sm text-on-surface outline-none transition-all placeholder:text-tertiary/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-secondary">
                {t("auth.passwordPlaceholder")}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-3.5 py-2.5 text-sm text-on-surface outline-none transition-all placeholder:text-tertiary/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {mode === "register" && (
              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-secondary">
                  {t("auth.confirmPasswordPlaceholder")}
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-3.5 py-2.5 text-sm text-on-surface outline-none transition-all placeholder:text-tertiary/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-error/20 bg-error-container/40 p-3 text-xs text-error font-medium">
                <HiOutlineExclamationCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-1 flex w-full items-center justify-center rounded-xl bg-primary py-3 text-sm font-bold text-on-primary shadow-md shadow-primary/20 transition-all hover:bg-primary/90 disabled:opacity-50 active:scale-[0.99]"
            >
              {loading
                ? t("auth.loading")
                : mode === "login"
                ? t("auth.signInBtn")
                : t("auth.signUpBtn")}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-tertiary">
            {mode === "login" ? t("auth.noAccount") : t("auth.hasAccount")}
            <button
              type="button"
              onClick={() => handleSwitchMode(mode === "login" ? "register" : "login")}
              className="font-bold text-primary hover:underline ml-1"
            >
              {mode === "login" ? t("auth.signUpLink") : t("auth.signInLink")}
            </button>
          </p>
        </div>
      </div>
    </>
  );
}
