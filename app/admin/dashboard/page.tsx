"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

import {
  Squares2X2Icon,
  Cog6ToothIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  UsersIcon,
  ClipboardDocumentCheckIcon,
  StarIcon,
} from "@heroicons/react/24/outline";

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "dashboard" },
  { label: "Properties", href: "/admin/properties", icon: "properties" },
  { label: "Messages", href: "/admin/messages", icon: "messages" },
  { label: "Evaluations", href: "/admin/evaluations", icon: "evaluations" },
];

const dashboardStatCards = [
  { label: "Total Properties", key: "totalProperties", icon: "building" },
  { label: "Total Messages", key: "totalMessages", icon: "envelope" },
  {
    label: "Total Evaluations",
    key: "totalEvaluations",
    icon: "evaluations",
  },
  { label: "Featured Properties", key: "featuredProperties", icon: "star" },
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
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    totalProperties: 0,
    totalMessages: 0,
    totalEvaluations: 0,
    featuredProperties: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error || !data.session) {
          router.push("/admin");
          return;
        }
        setIsCheckingAuth(false);
      } catch (_err) {
        router.push("/admin");
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
          { count: totalEvaluations },
          { count: featuredProperties },
        ] = await Promise.all([
          supabase
            .from("properties")
            .select("*", { count: "exact", head: true }),
          supabase
            .from("messages")
            .select("*", { count: "exact", head: true }),
          supabase
            .from("evaluations")
            .select("*", { count: "exact", head: true }),
          supabase
            .from("properties")
            .select("*", { count: "exact", head: true })
            .eq("featured", true),
        ]);

        setDashboardStats({
          totalProperties: totalProperties ?? 0,
          totalMessages: totalMessages ?? 0,
          totalEvaluations: totalEvaluations ?? 0,
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
      router.push("/admin");
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
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#c9a84c]"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#1a2b4a] text-white shadow-lg transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:top-auto top-16 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <nav className="flex-1 px-4 pt-6 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeSidebar}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-white/10 focus:outline-none focus:bg-white/10"
              >
                <span className="text-[#c9a84c]">{getIcon(item.icon)}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="border-t border-white/10 p-4">
            <button
              onClick={handleLogout}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#c9a84c] px-4 py-3 text-sm font-semibold text-[#1a2b4a] transition-colors hover:bg-[#d4b85e] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
              {loading ? "Logging out..." : "Logout"}
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
            className="mb-4 inline-flex md:hidden items-center justify-center rounded-lg p-2 text-[#1a2b4a] hover:bg-white/50 focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
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
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1a2b4a]">Dashboard</h2>
            <p className="mt-2 text-sm sm:text-base text-gray-600">Welcome to LaTour Immo Admin Panel</p>
          </div>

          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {dashboardStatCards.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-gray-100 bg-white p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-2xl sm:text-3xl font-bold text-[#c9a84c]">
                      {statsLoading ? (
                        <span className="inline-block w-8 h-8 animate-pulse bg-yellow-100 rounded" />
                      ) : (
                        dashboardStats[stat.key as keyof typeof dashboardStats]
                      )}
                    </p>
                  </div>
                  <div className="text-[#c9a84c]">
                    {getIcon(stat.icon)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-xl border border-gray-100 bg-white p-4 sm:p-6 shadow-md">
            <h3 className="text-lg font-bold text-[#1a2b4a]">Quick Actions</h3>
            <div className="mt-4 grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
              <Link href="/admin/properties" className="rounded-lg border border-[#c9a84c]/30 bg-[#c9a84c]/5 px-4 py-3 text-center font-medium text-[#1a2b4a] transition-colors hover:bg-[#c9a84c]/10">
                Manage Properties
              </Link>
              <Link href="/admin/messages" className="rounded-lg border border-[#c9a84c]/30 bg-[#c9a84c]/5 px-4 py-3 text-center font-medium text-[#1a2b4a] transition-colors hover:bg-[#c9a84c]/10">
                View Messages
              </Link>
              <Link href="/admin/evaluations" className="rounded-lg border border-[#c9a84c]/30 bg-[#c9a84c]/5 px-4 py-3 text-center font-medium text-[#1a2b4a] transition-colors hover:bg-[#c9a84c]/10">
                Review Evaluations
              </Link>
              <Link href="/" className="rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-center font-medium text-[#1a2b4a] transition-colors hover:bg-gray-100">
                Back to Site
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


//className="h-5 w-5"