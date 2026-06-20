"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useTranslations, useLocale } from "next-intl";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message || t("login_failed"));
        setLoading(false);
        return;
      }

      if (data.user) {
        router.push(`/${locale}/admin/dashboard`);
      }
    } catch (_err) {
      setError(t("unexpected_error"));
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md rounded-2xl border border-gray-200/10 bg-white p-8 shadow-2xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold sm:text-3xl">
            <span className="text-[#404040]">{t("brand_name")}</span>
            <br />
            <span className="text-[#EFBA1C]">{t("admin_panel")}</span>
          </h1>
          <p className="mt-3 text-sm text-gray-600">
            {t("sign_in_subtitle")}
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#404040]">
              {t("email_address")}
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-3 text-[#404040] placeholder:text-gray-400 focus:border-[#EFBA1C] focus:outline-none focus:ring-2 focus:ring-[#EFBA1C]/30"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#404040]">
              {t("password")}
            </label>
            <input
              id="password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-3 text-[#404040] placeholder:text-gray-400 focus:border-[#EFBA1C] focus:outline-none focus:ring-2 focus:ring-[#EFBA1C]/30"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#EFBA1C] px-4 py-3 text-base font-semibold text-[#404040] transition-colors hover:bg-[#F0C040] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#EFBA1C] focus:ring-offset-2"
          >
            {loading ? t("signing_in") : t("sign_in")}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-500">
          {t("authorized_only")}
        </p>
      </div>
    </div>
  );
}
