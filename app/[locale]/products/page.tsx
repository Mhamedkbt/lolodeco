"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { categories, getCategoryFilterValues, getCategoryLabel } from "@/lib/categories";
import { useTranslations, useLocale } from "next-intl";

export const dynamic = "force-dynamic";

const isVideoUrl = (url: string): boolean => {
  return /\.(mp4|webm|mov|avi|quicktime)(\?|$)/i.test(url);
};

interface Product {
  id: string;
  title: string | null;
  category: string | null;
  price: number | null;
  price_unit: string | null;
  is_promotion: boolean | null;
  promo_price: number | null;
  free_delivery: boolean | null;
  stock_status: string | null;
  images: string[] | null;
  created_at: string | null;
}

const ITEMS_PER_PAGE = 9;

export default function ProductsPage() {
  const t = useTranslations("properties");
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f8f8f8] p-8 text-[#404040]">
          <p className="text-xl font-semibold">{t("loading")}</p>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations("properties");

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [availability, setAvailability] = useState(searchParams.get("availability") ?? "");
  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  const fetchProducts = useCallback(
    async (page: number) => {
      setLoading(true);
      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from("products")
        .select("*", { count: "exact" })
        .eq("is_visible", true)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (category) query = query.in("category", getCategoryFilterValues(category));
      if (availability) query = query.eq("stock_status", availability);
      if (search) query = query.ilike("title", `%${search}%`);

      const { data, error, count } = await query;

      if (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
        return;
      }

      setProducts(data ?? []);
      setTotalCount(count ?? 0);
      setLoading(false);
    },
    [category, availability, search]
  );

  useEffect(() => {
    void fetchProducts(currentPage);
  }, [currentPage, fetchProducts]);

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts(1);
  }

  function handleClearFilters() {
    setCategory("");
    setAvailability("");
    setSearch("");
    setCurrentPage(1);
  }

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const hasFilters = category || availability || search;

  const filterFields = (idSuffix: string) => (
    <>
      <div>
        <label htmlFor={`search-${idSuffix}`} className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#404040]/80">
          {t("search")}
        </label>
        <input
          id={`search-${idSuffix}`}
          type="text"
          placeholder={t("search_placeholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm text-[#404040] placeholder:text-gray-400 focus:border-[#EFBA1C] focus:outline-none focus:ring-2 focus:ring-[#EFBA1C]/30"
        />
      </div>
      <div>
        <label htmlFor={`category-${idSuffix}`} className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#404040]/80">
          {t("category_label")}
        </label>
        <select
          id={`category-${idSuffix}`}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-[#404040] focus:border-[#EFBA1C] focus:outline-none focus:ring-2 focus:ring-[#EFBA1C]/30"
        >
          <option value="">{t("all_categories")}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {getCategoryLabel(c.id, locale)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor={`availability-${idSuffix}`} className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#404040]/80">
          {t("availability_label")}
        </label>
        <select
          id={`availability-${idSuffix}`}
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-[#404040] focus:border-[#EFBA1C] focus:outline-none focus:ring-2 focus:ring-[#EFBA1C]/30"
        >
          <option value="">{t("sale_or_rent")}</option>
          <option value="in_stock">{t("in_stock")}</option>
          <option value="out_of_stock">{t("out_of_stock")}</option>
        </select>
      </div>
      <button
        type="submit"
        className="w-full rounded-lg bg-[#EFBA1C] px-6 py-2.5 text-sm font-semibold text-[#404040] transition-colors hover:bg-[#F0C040] focus:outline-none focus:ring-2 focus:ring-[#EFBA1C]"
      >
        {t("search")}
      </button>
    </>
  );

  return (
    <div>
      <section className="bg-[#f8f8f8] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="text-3xl font-bold text-[#404040] sm:text-4xl lg:text-5xl">{t("our_properties")}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">{t("browse_collection")}</p>
        </div>
      </section>

      <section className="bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 lg:flex-row">
          <aside className="w-full shrink-0 lg:w-72">
            <div className="block rounded-xl border border-gray-100 bg-white p-4 shadow-lg lg:hidden">
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between text-lg font-semibold text-[#404040]">
                  <span>{t("filters")}</span>
                  <span className="text-gray-400 transition-transform group-open:rotate-180">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <form onSubmit={handleSearch} className="mt-4 hidden space-y-4 group-open:block">
                  {filterFields("mobile")}
                </form>
              </details>
            </div>

            <div className="hidden rounded-xl border border-gray-100 bg-white p-6 shadow-lg lg:block">
              <h2 className="text-lg font-semibold text-[#404040]">{t("filters")}</h2>
              <form onSubmit={handleSearch} className="mt-5 space-y-4">
                {filterFields("desktop")}
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
                {hasFilters && (
                  <button onClick={handleClearFilters} className="text-sm font-medium text-[#EFBA1C] hover:underline">
                    {t("clear_filters")}
                  </button>
                )}
              </div>
            )}

            {loading && (
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="animate-pulse overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
                    <div className="h-48 w-full bg-gray-200" />
                    <div className="space-y-3 p-6">
                      <div className="h-6 w-3/4 rounded bg-gray-200" />
                      <div className="h-4 w-1/2 rounded bg-gray-200" />
                      <div className="mt-4 h-10 w-full rounded-lg bg-gray-200" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && products.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="mb-4 rounded-full bg-gray-100 p-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <p className="text-xl font-semibold text-[#404040]">{t("no_properties_found")}</p>
                <p className="mt-2 text-gray-500">{t("try_adjusting")}</p>
                <button onClick={handleClearFilters} className="mt-6 rounded-lg bg-[#EFBA1C] px-6 py-2.5 text-sm font-semibold text-[#404040] transition-colors hover:bg-[#F0C040]">
                  {t("clear_filters_btn")}
                </button>
              </div>
            )}

            {!loading && products.length > 0 && (
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => {
                  const hasPromo = product.is_promotion && product.promo_price != null;
                  const shown = hasPromo ? product.promo_price : product.price;
                  return (
                    <article
                      key={product.id}
                      className="group flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl"
                    >
                      <Link href={`/${locale}/products/${product.id}`} className="relative block h-52 w-full overflow-hidden">
                        {product.images && product.images.length > 0 ? (
                          isVideoUrl(product.images[0]) ? (
                            <video src={product.images[0]} className="h-full w-full object-cover" muted autoPlay loop playsInline preload="metadata" />
                          ) : (
                            <Image src={product.images[0]} alt={product.title ?? "Produit"} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-300 group-hover:scale-105" />
                          )
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#404040] to-[#606060]">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </div>
                        )}
                        <div className="absolute left-3 top-3 z-10 flex flex-col gap-2">
                          {product.category && (
                            <span className="rounded bg-[#404040] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-md">{getCategoryLabel(product.category, locale)}</span>
                          )}
                          {hasPromo && (
                            <span className="rounded bg-green-500 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-md">{t("promo")}</span>
                          )}
                        </div>
                        {product.stock_status === "out_of_stock" && (
                          <span className="absolute right-3 top-3 z-10 rounded bg-white/90 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#404040] shadow-md">
                            {t("out_of_stock")}
                          </span>
                        )}
                      </Link>

                      <div className="flex flex-1 flex-col p-6">
                        <Link href={`/${locale}/products/${product.id}`}>
                          <h3 className="text-lg font-semibold text-[#404040] line-clamp-2 transition-colors group-hover:text-[#EFBA1C]">
                            {product.title ?? t("untitled")}
                          </h3>
                        </Link>

                        <div className="mt-3 flex flex-1 items-end gap-2">
                          {shown != null ? (
                            <>
                              <span className="text-xl font-bold text-[#404040]">{shown.toLocaleString()} MAD</span>
                              <span className="text-xs text-gray-400">/ {product.price_unit ?? "pièce"}</span>
                              {hasPromo && product.price != null && (
                                <span className="ml-1 text-sm text-gray-400 line-through">{product.price.toLocaleString()}</span>
                              )}
                            </>
                          ) : (
                            <span className="text-base font-semibold text-gray-500">{t("price_on_request")}</span>
                          )}
                        </div>

                        {product.free_delivery && (
                          <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-green-600">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-6m0 0V6.75A1.125 1.125 0 009.375 5.625H4.5m0 0V3.75m0 1.875h.75" />
                            </svg>
                            {t("free_delivery")}
                          </p>
                        )}

                        <Link
                          href={`/${locale}/products/${product.id}`}
                          className="mt-5 block w-full rounded-lg bg-[#EFBA1C] py-3 text-center text-sm font-semibold text-[#404040] transition-colors hover:bg-[#F0C040]"
                        >
                          {t("view_details")}
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {!loading && totalCount > ITEMS_PER_PAGE && (
              <nav aria-label="Pagination" className="mt-12 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-[#404040] transition-colors hover:border-[#EFBA1C] hover:text-[#EFBA1C] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {t("previous")}
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      currentPage === page
                        ? "bg-[#EFBA1C] text-[#404040]"
                        : "border border-gray-200 text-[#404040] hover:border-[#EFBA1C] hover:text-[#EFBA1C]"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-[#404040] transition-colors hover:border-[#EFBA1C] hover:text-[#EFBA1C] disabled:cursor-not-allowed disabled:opacity-40"
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

// PROMO