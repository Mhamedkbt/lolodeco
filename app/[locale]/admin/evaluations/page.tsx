"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useTranslations, useLocale } from "next-intl";

import {
  Squares2X2Icon,
  ClipboardDocumentCheckIcon,
  Cog6ToothIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

const isVideoUrl = (url: string): boolean => {
  return /\.(mp4|webm|mov|avi|quicktime)(\?|$)/i.test(url)
}

interface Evaluation {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  type: string | null;
  location: string | null;
  surface: number | null;
  desired_price: number | null;
  notes: string | null;
  photos: string[] | null;
  created_at: string | null;
  status: string | null;
}

const navItems = [
  { labelKey: "nav_dashboard", href: "/admin/dashboard", icon: "dashboard" },
  { labelKey: "nav_properties", href: "/admin/properties", icon: "properties" },
  { labelKey: "nav_messages", href: "/admin/messages", icon: "messages" },
  { labelKey: "nav_evaluations", href: "/admin/evaluations", icon: "evaluations" },
];

function getIcon(iconType: string) {
  switch (iconType) {
    case "dashboard":
      return <Squares2X2Icon className="h-5 w-5" />;
    case "properties":
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      );
    case "messages":
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
      );
    case "evaluations":
      return <ClipboardDocumentCheckIcon className="h-5 w-5" />;
    default:
      return null;
  }
}

export default function EvaluationsPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("admin");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [filteredEvaluations, setFilteredEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "reviewed" | "contacted">("all");
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);
  const [lightboxPhotos, setLightboxPhotos] = useState<string[]>([]);

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error || !data.session) {
          router.push(`/${locale}/admin`);
          return;
        }
        setIsCheckingAuth(false);
        await fetchEvaluations();
      } catch (_err) {
        router.push(`/${locale}/admin`);
      }
    }

    checkAuth();
  }, [router]);

  useEffect(() => {
    const filtered = evaluations.filter((evaluation) => {
      let matches = true;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        matches = (
          (evaluation.name?.toLowerCase().includes(query) ?? false) ||
          (evaluation.email?.toLowerCase().includes(query) ?? false) ||
          (evaluation.location?.toLowerCase().includes(query) ?? false)
        );
      }

      if (matches && statusFilter !== "all") {
        matches = evaluation.status === statusFilter;
      }

      return matches;
    });

    setFilteredEvaluations(filtered);
  }, [searchQuery, statusFilter, evaluations]);

  async function fetchEvaluations() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("evaluations")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setEvaluations(data || []);
    } catch (err) {
      console.error("Error fetching evaluations:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    setLogoutLoading(true);
    try {
      await supabase.auth.signOut();
      router.push(`/${locale}/admin`);
    } catch (_err) {
      setLogoutLoading(false);
    }
  }

  async function handleStatusChange(id: string, newStatus: "pending" | "reviewed" | "contacted") {
    try {
      const { error } = await supabase
        .from("evaluations")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      setEvaluations((prev) =>
        prev.map((evaluation) => (evaluation.id === id ? { ...evaluation, status: newStatus } : evaluation))
      );

      if (selectedEvaluation?.id === id) {
        setSelectedEvaluation({ ...selectedEvaluation, status: newStatus });
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  }

  async function handleDeleteEvaluation(id: string) {
    setIsDeleting(true);
    try {
      const { error } = await supabase.from("evaluations").delete().eq("id", id);
      if (error) throw error;

      setEvaluations((prev) => prev.filter((evaluation) => evaluation.id !== id));
      if (selectedEvaluation?.id === id) {
        setShowModal(false);
        setSelectedEvaluation(null);
      }
      setDeleteConfirmId(null);
    } catch (err) {
      console.error("Error deleting evaluation:", err);
    } finally {
      setIsDeleting(false);
    }
  }

  function closeSidebar() {
    setSidebarOpen(false);
  }

  function openEvaluation(evaluation: Evaluation) {
    setSelectedEvaluation(evaluation);
    setShowModal(true);
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getStatusBadgeColor(status: string | null | undefined) {
    switch (status ?? "pending") {
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "reviewed":
        return "bg-blue-100 text-blue-800";
      case "contacted":
        return "bg-green-100 text-green-800";
      default:
        return "bg-amber-100 text-amber-800";
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#c9a84c]"></div>
          <p className="mt-4 text-gray-600">{t("loading")}</p>
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
                href={`/${locale}${item.href}`}
                onClick={closeSidebar}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-white/10 focus:outline-none focus:bg-white/10"
              >
                <span className="text-[#c9a84c]">{getIcon(item.icon)}</span>
                {t(item.labelKey)}
              </Link>
            ))}
          </nav>

          <div className="border-t border-white/10 p-4">
            <button
              onClick={handleLogout}
              disabled={logoutLoading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#c9a84c] px-4 py-3 text-sm font-semibold text-[#1a2b4a] transition-colors hover:bg-[#d4b85e] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
              {logoutLoading ? t("logging_out") : t("logout")}
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

      <main className="flex-1 w-full overflow-x-hidden">
        <div className="p-4 sm:p-6 md:p-8 w-full overflow-x-hidden pt-4 md:pt-0">
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

          <div className="mt-8 mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1a2b4a]">{t("manage_evaluations_title")}</h2>
            <p className="mt-1 text-sm text-gray-600">{evaluations.length} evaluation{evaluations.length !== 1 ? "s" : ""}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6 w-full">
            <input
              type="text"
              placeholder="Search by name, email, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-[#c9a84c] focus:border-transparent"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | "pending" | "reviewed" | "contacted")}
              className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-[#c9a84c] focus:border-transparent"
            >
              <option value="all">{t("all_statuses")}</option>
              <option value="pending">{t("pending")}</option>
              <option value="reviewed">{t("reviewed")}</option>
              <option value="contacted">{t("contacted")}</option>
            </select>
          </div>

          {loading ? (
            <div className="rounded-xl border border-gray-100 bg-white p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#c9a84c]"></div>
              <p className="mt-3 text-gray-600">{t("loading_evaluations")}</p>
            </div>
          ) : filteredEvaluations.length === 0 ? (
            <div className="rounded-xl border border-gray-100 bg-white p-12 text-center">
              <svg className="h-12 w-12 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.66V18a2.25 2.25 0 002.25 2.25h10.5m-16.5 0h16.5" />
              </svg>
              <p className="mt-4 text-lg font-medium text-gray-600">{t("no_evaluations")}</p>
              <p className="mt-1 text-sm text-gray-500">
                {evaluations.length === 0 ? "No evaluations yet." : "Try adjusting your search or filters."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEvaluations.map((evaluation) => (
                <div
                  key={evaluation.id}
                  className="rounded-lg border border-gray-100 bg-white p-4 cursor-pointer shadow-sm hover:shadow-md transition-all"
                  onClick={() => openEvaluation(evaluation)}
                >
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="flex items-start gap-4 min-w-0 w-full">
                      {evaluation.photos && evaluation.photos.length > 0 && (
                        isVideoUrl(evaluation.photos[0]) ? (
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden 
                                          bg-gray-900 flex-shrink-0 border border-gray-200">
                            <video
                              src={evaluation.photos[0]}
                              className="w-full h-full object-cover"
                              muted
                              preload="metadata"
                            />
                            <div className="absolute inset-0 flex items-center justify-center 
                                            bg-black/50">
                              <svg xmlns="http://www.w3.org/2000/svg"
                                   className="w-4 h-4 text-white" fill="currentColor"
                                   viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                            </div>
                          </div>
                        ) : (
                          <img
                            src={evaluation.photos[0]}
                            alt="Property"
                            className="w-16 h-16 object-cover rounded-lg border border-gray-200 
                                       flex-shrink-0"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        )
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <h3 className="text-sm font-semibold text-gray-900 truncate">{evaluation.name ?? "Unknown"}</h3>
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(evaluation.status)}`}>
                            {((evaluation.status ?? "pending").charAt(0).toUpperCase() + (evaluation.status ?? "pending").slice(1))}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mb-1 break-all">{evaluation.email ?? "—"}</p>
                        {evaluation.phone && (
                          <p className="text-xs text-gray-500 mb-1">{evaluation.phone}</p>
                        )}
                        <p className="text-xs text-gray-600 mb-1.5">
                          <span className="font-medium">{evaluation.type ?? "—"}</span> • {evaluation.location ?? "—"}
                          {evaluation.surface && <span> • {evaluation.surface} m²</span>}
                        </p>
                        {evaluation.desired_price && (
                          <p className="text-xs text-gray-600 mb-1.5">{evaluation.desired_price.toLocaleString()} MAD</p>
                        )}
                        <p className="text-xs text-gray-400">{formatDate(evaluation.created_at ?? "")}</p>
                        {evaluation.notes && (
                          <p className="mt-1 text-xs text-gray-400 line-clamp-1 italic">
                            &ldquo;{evaluation.notes}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Fixed Actions for Mobile Layout Wrap */}
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100 shrink-0">
                      <select
                        value={evaluation.status ?? "pending"}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleStatusChange(evaluation.id, e.target.value as "pending" | "reviewed" | "contacted");
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="px-2 py-1 text-xs rounded-lg border border-gray-300 bg-white text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-[#c9a84c] focus:border-transparent flex-1 sm:flex-none"
                      >
                        <option value="pending">{t("pending")}</option>
                        <option value="reviewed">{t("reviewed")}</option>
                        <option value="contacted">{t("contacted")}</option>
                      </select>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmId(evaluation.id);
                        }}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 dark:hover:bg-red-100 rounded-lg transition-colors flex items-center justify-center"
                        title="Delete evaluation"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {showModal && selectedEvaluation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl my-auto">
            <div className="sticky top-0 border-b border-gray-200 bg-white p-6 sm:p-8 flex items-start justify-between z-10">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#1a2b4a] pr-4">Evaluation from {selectedEvaluation.name ?? "Unknown"}</h3>
                <p className="mt-1 text-sm text-gray-600">{selectedEvaluation.created_at ? formatDate(selectedEvaluation.created_at) : "—"}</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-600 mb-1">{t("full_name")}</h4>
                  <p className="text-gray-900 break-words">{selectedEvaluation.name ?? "Unknown"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-600 mb-1">{t("email")}</h4>
                  <a href={`mailto:${selectedEvaluation.email ?? ""}`} className="text-[#c9a84c] hover:underline break-all">
                    {selectedEvaluation.email ?? "—"}
                  </a>
                </div>
                {selectedEvaluation.phone && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-600 mb-1">{t("phone")}</h4>
                    <a href={`tel:${selectedEvaluation.phone}`} className="text-[#c9a84c] hover:underline">
                      {selectedEvaluation.phone}
                    </a>
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-semibold text-gray-600 mb-1">{t("status")}</h4>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(selectedEvaluation.status)}`}>
                    {((selectedEvaluation.status ?? "pending").charAt(0).toUpperCase() + (selectedEvaluation.status ?? "pending").slice(1))}
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-600 mb-1">{t("property_type")}</h4>
                  <p className="text-gray-900">{selectedEvaluation.type ?? "—"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-600 mb-1">{t("location")}</h4>
                  <p className="text-gray-900">{selectedEvaluation.location ?? "—"}</p>
                </div>
                {selectedEvaluation.surface && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-600 mb-1">{t("surface_area")}</h4>
                    <p className="text-gray-900">{selectedEvaluation.surface} m²</p>
                  </div>
                )}
                {selectedEvaluation.desired_price && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-600 mb-1">{t("desired_price")}</h4>
                    <p className="text-gray-900">{selectedEvaluation.desired_price.toLocaleString()} MAD</p>
                  </div>
                )}
              </div>

              {selectedEvaluation.notes && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    Additional Notes
                  </p>
                  <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3">
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {selectedEvaluation.notes}
                    </p>
                  </div>
                </div>
              )}

              {selectedEvaluation.photos && selectedEvaluation.photos.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-600 mb-2">Property Photos ({selectedEvaluation.photos.length})</p>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedEvaluation.photos.map((url, index) => (
                      isVideoUrl(url) ? (
                        <div key={index} className="relative w-full h-32 rounded-lg overflow-hidden 
                                                    bg-gray-900 border border-gray-200">
                          <video
                            src={url}
                            className="w-full h-full object-cover"
                            controls
                            playsInline
                            preload="metadata"
                          />
                        </div>
                      ) : (
                        <div key={index}
                          className="relative group cursor-zoom-in"
                          onClick={() => {
                            setLightboxPhotos(selectedEvaluation.photos!)
                            setLightboxIndex(index)
                            setLightboxUrl(url)
                          }}
                        >
                          <img
                            src={url}
                            alt={`Property photo ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-200
                                       transition-all duration-200 group-hover:brightness-75"
                            onError={(e) => { 
                              e.currentTarget.parentElement!.style.display = "none" 
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center
                                          opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-black/60 rounded-full p-2">
                              <svg xmlns="http://www.w3.org/2000/svg" 
                                   className="w-5 h-5 text-white"
                                   fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <select
                  value={selectedEvaluation.status ?? "pending"}
                  onChange={(e) => {
                    handleStatusChange(selectedEvaluation.id, e.target.value as "pending" | "reviewed" | "contacted");
                  }}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#c9a84c] focus:border-transparent"
                >
                  <option value="pending">{t("mark_pending")}</option>
                  <option value="reviewed">{t("mark_reviewed")}</option>
                  <option value="contacted">{t("mark_contacted")}</option>
                </select>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setDeleteConfirmId(selectedEvaluation.id);
                  }}
                  className="flex-1 rounded-lg border border-red-300 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl">
            <div className="p-6 sm:p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t("delete_evaluation")}</h3>
              <p className="text-gray-700 mb-6">{t("delete_evaluation_confirm")}</p>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 font-semibold transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteConfirmId && handleDeleteEvaluation(deleteConfirmId)}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold transition-colors hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                  {isDeleting ? t("deleting") : t("delete")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-sm"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-all duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/10 text-white text-sm px-4 py-1.5 rounded-full">
            {lightboxIndex + 1} / {lightboxPhotos.length}
          </div>

          {lightboxPhotos.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                const newIndex = (lightboxIndex - 1 + lightboxPhotos.length) % lightboxPhotos.length;
                setLightboxIndex(newIndex);
                setLightboxUrl(lightboxPhotos[newIndex]);
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 text-white rounded-full p-3 transition-all duration-200 z-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {lightboxUrl && isVideoUrl(lightboxUrl) ? (
            <video
              src={lightboxUrl}
              className="max-w-[90vw] max-h-[85vh] rounded-xl shadow-2xl"
              controls
              autoPlay
              playsInline
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <img
              src={lightboxUrl!}
              alt="Property fullscreen view"
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          )}

          {lightboxPhotos.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                const newIndex = (lightboxIndex + 1) % lightboxPhotos.length;
                setLightboxIndex(newIndex);
                setLightboxUrl(lightboxPhotos[newIndex]);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 text-white rounded-full p-3 transition-all duration-200 z-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}