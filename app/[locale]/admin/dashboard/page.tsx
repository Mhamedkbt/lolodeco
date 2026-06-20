"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useTranslations, useLocale } from "next-intl";
import {
  Squares2X2Icon,
  Cog6ToothIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  UsersIcon,
  ClipboardDocumentCheckIcon,
  StarIcon,
} from "@heroicons/react/24/outline";

export const dynamic = "force-dynamic";

const navItems = [
  { labelKey: "nav_dashboard", href: "/admin/dashboard", icon: "dashboard" },
  { labelKey: "nav_properties", href: "/admin/products", icon: "properties" },
  { labelKey: "nav_messages", href: "/admin/messages", icon: "messages" },
];

const dashboardStatCards = [
  { labelKey: "stat_total_properties", key: "totalProperties", icon: "building" },
  { labelKey: "stat_total_messages", key: "totalMessages", icon: "envelope" },
  { labelKey: "stat_featured_properties", key: "featuredProperties", icon: "star" },
];

function getIcon(iconType: string) {
  switch (iconType) {
    case "dashboard":
      return <Squares2X2Icon className="h-5 w-5" />;

      case "properties":
        return (
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
            />
          </svg>
        );

    case "messages":
      return <EnvelopeIcon className="h-5 w-5" />;

    case "evaluations":
      return <ClipboardDocumentCheckIcon className="h-5 w-5" />;

    case "building":
      return <BuildingOfficeIcon className="h-6 w-6" />;

    case "envelope":
      return <EnvelopeIcon className="h-6 w-6" />;

    case "star":
      return <StarIcon className="h-6 w-6" />;

    default:
      return <Squares2X2Icon className="h-6 w-6" />;
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("admin");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    totalProperties: 0,
    totalMessages: 0,
    featuredProperties: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error || !data.session) {
          router.push(`/${locale}/admin`);
          return;
        }
        setIsCheckingAuth(false);
      } catch (_err) {
        router.push(`/${locale}/admin`);
      }
    }

    checkAuth();
  }, [router]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [
          { count: totalProperties },
          { count: totalMessages },
          { count: featuredProperties },
        ] = await Promise.all([
          supabase
            .from("products")
            .select("*", { count: "exact", head: true }),
          supabase
            .from("messages")
            .select("*", { count: "exact", head: true }),
          supabase
            .from("products")
            .select("*", { count: "exact", head: true })
            .eq("is_promotion", true),
        ]);

        setDashboardStats({
          totalProperties: totalProperties ?? 0,
          totalMessages: totalMessages ?? 0,
          featuredProperties: featuredProperties ?? 0,
        });
      } catch (_err) {
        console.error("Error fetching dashboard stats:", _err);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, []);

  async function handleLogout() {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      router.push(`/${locale}/admin`);
    } catch (_err) {
      setLoading(false);
    }
  }

  function closeSidebar() {
    setSidebarOpen(false);
  }

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#EFBA1C]"></div>
          <p className="mt-4 text-gray-600">{t("loading_dashboard")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#f8f8f8] text-[#404040] border-r border-gray-200 shadow-lg transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:top-auto top-16 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <nav className="flex-1 px-4 pt-10 md:pt-6 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={`/${locale}${item.href}`}
                onClick={closeSidebar}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-[#404040] transition-colors hover:bg-gray-200 focus:outline-none focus:bg-gray-200"
              >
                <span className="text-[#EFBA1C]">{getIcon(item.icon)}</span>
                {t(item.labelKey)}
              </Link>
            ))}
          </nav>

          <div className="border-t border-gray-200 p-4">
            <button
              onClick={handleLogout}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#EFBA1C] px-4 py-3 text-sm font-semibold text-[#404040] transition-colors hover:bg-[#F0C040] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#EFBA1C]"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
              {loading ? t("logging_out") : t("logout")}
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={closeSidebar}
        />
      )}

      <main className="flex-1 w-full">
        <div className="p-4 sm:p-6 lg:p-8 pt-4 md:pt-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mb-4 inline-flex md:hidden items-center justify-center rounded-lg p-2 text-[#404040] hover:bg-white/50 focus:outline-none focus:ring-2 focus:ring-[#EFBA1C]"
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              {sidebarOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#404040]">{t("dashboard_title")}</h2>
            <p className="mt-2 text-sm sm:text-base text-gray-600">{t("dashboard_subtitle")}</p>
          </div>

          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {dashboardStatCards.map((stat) => (
              <div
                key={stat.labelKey}
                className="rounded-xl border border-gray-100 bg-white p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">
                      {t(stat.labelKey)}
                    </p>
                    <p className="mt-2 text-2xl sm:text-3xl font-bold text-[#EFBA1C]">
                      {statsLoading ? (
                        <span className="inline-block w-8 h-8 animate-pulse bg-yellow-100 rounded" />
                      ) : (
                        dashboardStats[stat.key as keyof typeof dashboardStats]
                      )}
                    </p>
                  </div>
                  <div className="text-[#EFBA1C]">
                    {getIcon(stat.icon)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-xl border border-gray-100 bg-white p-4 sm:p-6 shadow-md">
            <h3 className="text-lg font-bold text-[#404040]">{t("quick_actions_title")}</h3>
            <div className="mt-4 grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
              <Link href={`/${locale}/admin/products`} className="rounded-lg border border-[#EFBA1C]/30 bg-[#EFBA1C]/5 px-4 py-3 text-center font-medium text-[#404040] transition-colors hover:bg-[#EFBA1C]/10">
                {t("manage_properties")}
              </Link>
              <Link href={`/${locale}/admin/messages`} className="rounded-lg border border-[#EFBA1C]/30 bg-[#EFBA1C]/5 px-4 py-3 text-center font-medium text-[#404040] transition-colors hover:bg-[#EFBA1C]/10">
                {t("view_messages")}
              </Link>
              <Link href={`/${locale}`} className="rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-center font-medium text-[#404040] transition-colors hover:bg-gray-100">
                {t("back_to_site")}
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


//className="h-5 w-5"