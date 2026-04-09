"use client";

import { useState } from "react";
import { HiOutlineCheck } from "react-icons/hi";
import { useLanguage } from "@/context/LanguageContext";

export default function Newsletter() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) { setSubmitted(true); setEmail(""); }
  };

  return (
    <section className="py-16 bg-surface">
      <div className="mx-auto max-w-7xl px-6">
        <div className="rounded-3xl bg-surface-container-low px-6 py-14 text-center shadow-[var(--shadow-editorial)] small:px-16">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-secondary">
            {t("newsletter.tag")}
          </p>
          <h2 className="mb-3 font-heading text-4xl font-bold text-on-surface small:text-5xl">
            {t("newsletter.title")}
          </h2>
          <p className="mx-auto mb-8 max-w-md text-base text-tertiary">
            {t("newsletter.desc")}
          </p>

          {submitted ? (
            <div className="mx-auto flex max-w-sm items-center justify-center gap-2 rounded-xl bg-panka-green-50 py-4 text-sm font-medium text-panka-green-600 animate-scale-in">
              <HiOutlineCheck className="h-5 w-5" />
              {t("newsletter.thanks")}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mx-auto flex max-w-sm flex-col gap-3 xsmall:flex-row">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("newsletter.placeholder")}
                required
                className="flex-1 rounded-xl border-0 bg-surface-container-highest px-5 py-3.5 text-base text-on-surface outline-none placeholder:text-tertiary/60 focus:ring-2 focus:ring-primary/15"
              />
              <button
                type="submit"
                className="rounded-xl bg-gradient-to-br from-primary to-primary-container px-7 py-3.5 text-base font-bold text-on-primary shadow-[var(--shadow-editorial)] transition-all hover:brightness-[1.02]"
              >
                {t("newsletter.submit")}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
