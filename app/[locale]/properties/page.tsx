"use client";

import Link from "next/link";
import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useTranslations, useLocale } from "next-intl";

export const dynamic = "force-dynamic";

const isVideoUrl = (url: string): boolean => {
  return /\.(mp4|webm|mov|avi|quicktime)(\?|$)/i.test(url)
}

interface Property {
  id: string;
  title: string | null;
  city: string | null;
  price: number | null;
  surface: number | null;
  rooms: number | null;
  type: string | null;
  status: string | null;
  images: string[] | null;
  featured: boolean | null;
  description: string | null;
  created_at: string | null;
}

const ITEMS_PER_PAGE = 6;

export default function PropertiesPage() {
  const t = useTranslations("properties");
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#1a2b4a] flex items-center justify-center text-white p-8">
        <div className="text-center">
          <p className="text-xl font-semibold">{t("loading")}</p>
        </div>
      </div>
    }>
      <PropertiesContent />
    </Suspense>
  );
}

function PropertiesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("properties");

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [type, setType] = useState(searchParams.get("type") ?? "");
  const [city, setCity] = useState(searchParams.get("city") ?? "");
  const [status, setStatus] = useState(searchParams.get("status") ?? "");
  const [priceRange, setPriceRange] = useState("");
  const [surfaceRange, setSurfaceRange] = useState("");

  const fetchProperties = useCallback(
    async (page: number) => {
      setLoading(true);
      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from("properties")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);

      if (type) {
        query = query.ilike("type", type);
      }

      if (city) {
        query = query.ilike("city", `%${city}%`);
      }

      if (status) {
        query = query.ilike("status", status);
      }

      if (priceRange) {
        if (priceRange === "0-500000") {
          query = query.lte("price", 500000);
        } else if (priceRange === "500000-2000000") {
          query = query.gte("price", 500000).lte("price", 2000000);
        } else if (priceRange === "2000000-5000000") {
          query = query.gte("price", 2000000).lte("price", 5000000);
        } else if (priceRange === "5000000+") {
          query = query.gte("price", 5000000);
        }
      }

      if (surfaceRange) {
        if (surfaceRange === "0-50") {
          query = query.lte("surface", 50);
        } else if (surfaceRange === "50-100") {
          query = query.gte("surface", 50).lte("surface", 100);
        } else if (surfaceRange === "100-200") {
          query = query.gte("surface", 100).lte("surface", 200);
        } else if (surfaceRange === "200+") {
          query = query.gte("surface", 200);
        }
      }

      const { data, error, count } = await query;

      if (error) {
        console.error("Error fetching properties:", error);
        setLoading(false);
        return;
      }

      setProperties(data ?? []);
      setTotalCount(count ?? 0);
      setLoading(false);
    },
    [type, city, status, priceRange, surfaceRange]
  );

  useEffect(() => {
    void fetchProperties(currentPage);
  }, [currentPage, fetchProperties]);

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCurrentPage(1);
    fetchProperties(1);
  }

  function handleClearFilters() {
    setType("");
    setCity("");
    setStatus("");
    setPriceRange("");
    setSurfaceRange("");
    setCurrentPage(1);
  }

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div>
      <section className="bg-[#1a2b4a] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            {t("our_properties")}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-300">
            {t("browse_collection")}
          </p>
        </div>
      </section>

      <section className="bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-72">
            {/* 1. MOBILE RESPONSIVE FILTER (Closed by default, hidden on PC) */}
            <div className="block lg:hidden rounded-xl border border-gray-100 bg-white p-4 shadow-lg">
              <details className="group">
                <summary className="flex cursor-pointer items-center justify-between list-none text-lg font-semibold text-[#1a2b4a]">
                  <span>{t("filters")}</span>
                  <span className="text-gray-400 transition-transform group-open:rotate-180">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>

                <form onSubmit={handleSearch} className="mt-4 hidden group-open:block">
                  <div className="grid grid-cols-1 gap-y-3.5 sm:grid-cols-2 gap-x-4">
                    {/* Filter Fields Area */}
                    <div>
                      <label htmlFor="type-mobile" className="mb-1 block text-xs font-semibold text-[#1a2b4a]/80 uppercase tracking-wider">{t("type_label")}</label>
                      <select id="type-mobile" value={type} onChange={(e) => setType(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#1a2b4a] focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/30">
                        <option value="">{t("all_types")}</option>
                        <option value="apartment">{t("apartment")}</option>
                        <option value="villa">{t("villa")}</option>
                        <option value="land">{t("land")}</option>
                        <option value="commercial">{t("commercial")}</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="city-mobile" className="mb-1 block text-xs font-semibold text-[#1a2b4a]/80 uppercase tracking-wider">{t("city_label")}</label>
                      <input id="city-mobile" type="text" placeholder={t("city_placeholder")} value={city} onChange={(e) => setCity(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#1a2b4a] focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/30" />
                    </div>

                    <div>
                      <label htmlFor="status-mobile" className="mb-1 block text-xs font-semibold text-[#1a2b4a]/80 uppercase tracking-wider">{t("status_label")}</label>
                      <select id="status-mobile" value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#1a2b4a] focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/30">
                        <option value="">{t("sale_or_rent")}</option>
                        <option value="sale">{t("sale")}</option>
                        <option value="rent">{t("rent")}</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="priceRange-mobile" className="mb-1 block text-xs font-semibold text-[#1a2b4a]/80 uppercase tracking-wider">{t("price_range")}</label>
                      <select id="priceRange-mobile" value={priceRange} onChange={(e) => setPriceRange(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#1a2b4a] focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/30">
                        <option value="">{t("any_price")}</option>
                        <option value="0-500000">{t("price_up_to_500k")}</option>
                        <option value="500000-2000000">{t("price_500k_2m")}</option>
                        <option value="2000000-5000000">{t("price_2m_5m")}</option>
                        <option value="5000000+">{t("price_5m_plus")}</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="surfaceRange-mobile" className="mb-1 block text-xs font-semibold text-[#1a2b4a]/80 uppercase tracking-wider">{t("surface_area")}</label>
                      <select id="surfaceRange-mobile" value={surfaceRange} onChange={(e) => setSurfaceRange(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#1a2b4a] focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/30">
                        <option value="">{t("any_size")}</option>
                        <option value="0-50">{t("surface_up_to_50")}</option>
                        <option value="50-100">{t("surface_50_100")}</option>
                        <option value="100-200">{t("surface_100_200")}</option>
                        <option value="200+">{t("surface_200_plus")}</option>
                      </select>
                    </div>
                  </div>

                  <button type="submit" className="w-full mt-4 rounded-lg bg-[#c9a84c] px-6 py-2.5 text-sm font-semibold text-[#1a2b4a] hover:bg-[#d4b85e] transition-colors">
                    {t("search")}
                  </button>
                </form>
              </details>
            </div>

            {/* 2. PC DESKTOP FILTER (Always Open, hidden on mobile layouts) */}
            <div className="hidden lg:block rounded-xl border border-gray-100 bg-white p-6 shadow-lg">
              <h2 className="text-lg font-semibold text-[#1a2b4a]">{t("filters")}</h2>
              
              <form onSubmit={handleSearch} className="mt-5 space-y-4">
                <div>
                  <label htmlFor="type-desktop" className="mb-1.5 block text-xs font-semibold text-[#1a2b4a]/80 uppercase tracking-wider">{t("type_label")}</label>
                  <select id="type-desktop" value={type} onChange={(e) => setType(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-[#1a2b4a] focus:border-[#c9a84c] focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/30">
                    <option value="">{t("all_types")}</option>
                    <option value="apartment">{t("apartment")}</option>
                    <option value="villa">{t("villa")}</option>
                    <option value="land">{t("land")}</option>
                    <option value="commercial">{t("commercial")}</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="city-desktop" className="mb-1.5 block text-xs font-semibold text-[#1a2b4a]/80 uppercase tracking-wider">{t("city_label")}</label>
                  <input id="city-desktop" type="text" placeholder={t("city_placeholder")} value={city} onChange={(e) => setCity(e.target.value)} className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm text-[#1a2b4a]/80 placeholder:text-gray-400 focus:border-[#c9a84c] focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/30" />
                </div>

                <div>
                  <label htmlFor="status-desktop" className="mb-1.5 block text-xs font-semibold text-[#1a2b4a]/80 uppercase tracking-wider">{t("status_label")}</label>
                  <select id="status-desktop" value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-[#1a2b4a] focus:border-[#c9a84c] focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/30">
                    <option value="">{t("sale_or_rent")}</option>
                    <option value="sale">{t("sale")}</option>
                    <option value="rent">{t("rent")}</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="priceRange-desktop" className="mb-1.5 block text-xs font-semibold text-[#1a2b4a]/80 uppercase tracking-wider">{t("price_range")}</label>
                  <select id="priceRange-desktop" value={priceRange} onChange={(e) => setPriceRange(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-[#1a2b4a] focus:border-[#c9a84c] focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/30">
                    <option value="">{t("any_price")}</option>
                    <option value="0-500000">{t("price_up_to_500k")}</option>
                    <option value="500000-2000000">{t("price_500k_2m")}</option>
                    <option value="2000000-5000000">{t("price_2m_5m")}</option>
                    <option value="5000000+">{t("price_5m_plus")}</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="surfaceRange-desktop" className="mb-1.5 block text-xs font-semibold text-[#1a2b4a]/80 uppercase tracking-wider">{t("surface_area")}</label>
                  <select id="surfaceRange-desktop" value={surfaceRange} onChange={(e) => setSurfaceRange(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-[#1a2b4a] focus:border-[#c9a84c] focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/30">
                    <option value="">{t("any_size")}</option>
                    <option value="0-50">{t("surface_up_to_50")}</option>
                    <option value="50-100">{t("surface_50_100")}</option>
                    <option value="100-200">{t("surface_100_200")}</option>
                    <option value="200+">{t("surface_200_plus")}</option>
                  </select>
                </div>

                <button type="submit" className="w-full rounded-lg bg-[#c9a84c] px-6 py-3 text-sm font-semibold text-[#1a2b4a] transition-colors hover:bg-[#d4b85e] focus:outline-none focus:ring-2 focus:ring-[#c9a84c] focus:ring-offset-2">
                  {t("search")}
                </button>
              </form>
            </div>
          </aside>

          <div className="flex-1">
            {!loading && (
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  {totalCount === 0
                    ? t("no_properties_found")
                    : `${t("showing_results")} ${Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, totalCount)}–${Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} ${t("of")} ${totalCount} ${t("properties")}`}
                </p>
                {(type || city || status || priceRange || surfaceRange) && (
                  <button
                    onClick={handleClearFilters}
                    className="text-sm text-[#c9a84c] hover:underline font-medium"
                  >
                    {t("clear_filters")}
                  </button>
                )}
              </div>
            )}

            {loading && (
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg animate-pulse"
                  >
                    <div className="h-48 w-full bg-gray-200" />
                    <div className="p-6 space-y-3">
                      <div className="flex gap-2">
                        <div className="h-6 w-16 bg-gray-200 rounded-full" />
                        <div className="h-6 w-16 bg-gray-200 rounded-full" />
                      </div>
                      <div className="h-6 w-3/4 bg-gray-200 rounded" />
                      <div className="h-4 w-1/2 bg-gray-200 rounded" />
                      <div className="h-4 w-1/3 bg-gray-200 rounded" />
                      <div className="h-4 w-full bg-gray-200 rounded" />
                      <div className="h-10 w-full bg-gray-200 rounded-lg mt-4" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && properties.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="rounded-full bg-gray-100 p-6 mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-10 h-10 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                </div>
                <p className="text-xl font-semibold text-[#1a2b4a]">
                  {t("no_properties_found")}
                </p>
                <p className="mt-2 text-gray-500">
                  {t("try_adjusting")}
                </p>
                <button
                  onClick={handleClearFilters}
                  className="mt-6 rounded-lg bg-[#c9a84c] px-6 py-2.5 text-sm font-semibold text-[#1a2b4a] hover:bg-[#d4b85e] transition-colors"
                >
                  {t("clear_filters_btn")}
                </button>
              </div>
            )}

            {!loading && properties.length > 0 && (
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
                {properties.map((property) => (
                  <article
                    key={property.id}
                    className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl"
                  >
                    {/* Media Container with absolute badges overlay */}
                    <div className="relative h-48 w-full overflow-hidden">
                      {property.images && property.images.length > 0 ? (
                        isVideoUrl(property.images[0]) ? (
                          <video
                            src={property.images[0]}
                            className="h-full w-full object-cover"
                            muted
                            autoPlay
                            loop
                            playsInline
                            preload="metadata"
                          />
                        ) : (
                          <img
                            src={property.images[0]}
                            alt={property.title ?? "Property"}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        )
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-[#1a2b4a] to-[#2a3b5a] flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-12 h-12 text-white/30"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1}
                              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                            />
                          </svg>
                        </div>
                      )}

                      {/* Floating Badges Overlay */}
                      <div className="absolute top-3 left-3 z-10 flex gap-2">
                        {property.type && (
                          <span className="rounded bg-[#1a2b4a] px-2.5 py-1 text-[11px] font-bold text-white uppercase tracking-wider shadow-md">
                            {property.type}
                          </span>
                        )}
                        {property.status && (
                          <span className="rounded bg-white px-2.5 py-1 text-[11px] font-bold text-[#1a2b4a] uppercase tracking-wider shadow-md">
                            {property.status}
                          </span>
                        )}
                      </div>

                      {/* Video Tag Indicator */}
                      {property.images && property.images.length > 0 && isVideoUrl(property.images[0]) && (
                        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-3 h-3"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                          VIDEO
                        </div>
                      )}
                    </div>

                    {/* Information Content Section */}
                    <div className="p-6">
                      {/* Featured inline badge row */}
                      {property.featured && (
                        <div className="mb-2">
                          <span className="inline-flex items-center gap-1 rounded bg-[#c9a84c]/20 px-2.5 py-0.5 text-xs font-semibold text-[#1a2b4a]">
                            ⭐ {t("featured")}
                          </span>
                        </div>
                      )}

                      <h3 className="text-xl font-semibold text-[#1a2b4a] line-clamp-1">
                        {property.title ?? t("untitled")}
                      </h3>

                      <p className="mt-1 text-sm text-gray-400 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400/80 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {property.city ?? "—"}
                      </p>

                      <div className="mt-3 pt-4 border-t border-gray-50 flex items-center justify-between">
                        <p className="text-lg font-bold text-[#1a2b4a] tracking-tight">
                          {property.price
                            ? `${property.price.toLocaleString()} MAD`
                            : t("price_on_request")}
                        </p>
                        <p className="text-sm text-gray-400 font-light tracking-wide">
                          {property.surface ? `${property.surface} m²` : "—"}
                        </p>
                      </div>

                      <Link
                        href={`/${locale}/properties/${property.id}`}
                        className="mt-5 block w-full rounded-lg bg-[#c9a84c] py-3 text-center text-sm font-semibold text-[#1a2b4a] transition-colors hover:bg-[#d4b85e]"
                      >
                        {t("view_details")}
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {!loading && totalCount > ITEMS_PER_PAGE && (
              <nav
                aria-label="Pagination"
                className="mt-12 flex items-center justify-center gap-2 flex-wrap"
              >
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-[#1a2b4a] transition-colors hover:border-[#c9a84c] hover:text-[#c9a84c] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {t("previous")}
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                        currentPage === page
                          ? "bg-[#1a2b4a] text-white"
                          : "border border-gray-200 text-[#1a2b4a] hover:border-[#c9a84c] hover:text-[#c9a84c]"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((p) =>
                      Math.min(Math.ceil(totalCount / ITEMS_PER_PAGE), p + 1)
                    )
                  }
                  disabled={currentPage === Math.ceil(totalCount / ITEMS_PER_PAGE)}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-[#1a2b4a] transition-colors hover:border-[#c9a84c] hover:text-[#c9a84c] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {t("next")}
                </button>
              </nav>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}



// <aside className