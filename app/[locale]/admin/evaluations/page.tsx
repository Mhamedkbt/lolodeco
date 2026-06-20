"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

export const dynamic = "force-dynamic";

// The Évaluations section is hidden. Any direct access is redirected to the dashboard.
export default function EvaluationsHiddenRedirect() {
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    router.replace(`/${locale}/admin/dashboard`);
  }, [router, locale]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="inline-block h-10 w-10 animate-spin rounded-full border-b-2 border-[#EFBA1C]" />
    </div>
  );
}
