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
    <section className="py-14">
      <div className="mx-auto max-w-7xl px-6">
        <div className="rounded-2xl bg-panka-cream px-6 py-14 text-center small:px-16">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-panka-brown-300">
            {t("newsletter.tag")}
          </p>
          <h2 className="mb-3 font-heading text-3xl font-bold text-panka-brown-500 small:text-4xl">
            {t("newsletter.title")}
          </h2>
          <p className="mx-auto mb-8 max-w-md text-base text-grey-50">
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
                className="flex-1 rounded-xl border border-panka-brown-100 bg-white px-5 py-3.5 text-base text-grey-80 outline-none placeholder:text-grey-30 focus:border-panka-green-400 focus:ring-2 focus:ring-panka-green-50"
              />
              <button
                type="submit"
                className="rounded-xl bg-panka-brown-500 px-7 py-3.5 text-base font-bold text-white transition-all hover:bg-panka-brown-600 hover:shadow-panka-sm"
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
