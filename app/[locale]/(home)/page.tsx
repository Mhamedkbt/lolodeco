"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { getCategoryLabel } from "@/lib/categories";
import { getUnitLabel } from "@/lib/units";
import { TestimonialsSlider } from "@/components/TestimonialsSlider";
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

const statsData = [
  { target: 100, suffix: "+", label: "Produits" },
  { target: 3, suffix: "+", label: "Ans Experience" },
  { target: 100, suffix: "+", label: "Clients Satisfaits" },
  { target: 1, suffix: "", label: "Magasin Agadir" },
];

export default function Home() {
  const locale = useLocale();
  const t = useTranslations("home");
  const tp = useTranslations("properties");
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);
  const [counts, setCounts] = useState([0, 0, 0, 0]);
  const statsRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    document.body.style.overflow = pageLoading ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [pageLoading]);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_visible", true)
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) {
        console.error("Error fetching products:", error);
        setLoadingProducts(false);
        setPageLoading(false);
        return;
      }

      setFeaturedProducts(data ?? []);
      setLoadingProducts(false);
      setTimeout(() => setPageLoading(false), 600);
    };

    fetchFeaturedProducts();
  }, []);

  useEffect(() => {
    const currentRef = statsRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 1500;
          const frameRate = 1000 / 60;
          const totalFrames = Math.round(duration / frameRate);
          let frame = 0;

          const timer = setInterval(() => {
            frame++;
            const progress = frame / totalFrames;
            const easeProgress = progress * (2 - progress);
            setCounts(statsData.map((stat) => Math.floor(easeProgress * stat.target)));
            if (frame >= totalFrames) {
              setCounts(statsData.map((s) => s.target));
              clearInterval(timer);
            }
          }, frameRate);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(currentRef);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HomeGoodsStore",
            name: "Lolo Deco",
            description: "Spécialiste en décoration intérieure et extérieure à Agadir",
            url: "https://lolodeco.ma",
            logo: "https://lolodeco.ma/images/LoloDecoLogo.jpg",
            image: "https://lolodeco.ma/images/LoloDecoLogo.jpg",
            telephone: "+212660546352",
            email: "contact@lolodeco.ma",
            address: {
              "@type": "PostalAddress",
              streetAddress: "Rue Iligh",
              addressLocality: "Agadir",
              addressCountry: "MA",
            },
            areaServed: ["Agadir"],
            sameAs: [],
            openingHours: "Mo-Sa 09:00-18:00",
          }),
        }}
      />

      {pageLoading && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white transition-all duration-500">
          <div className="relative flex h-20 w-20 items-center justify-center">
            <div className="absolute h-full w-full rounded-full border-4 border-[#EFBA1C]/10"></div>
            <div className="absolute h-full w-full rounded-full border-4 border-t-[#EFBA1C] border-r-transparent border-b-transparent border-l-transparent animate-spin duration-700"></div>
            <div className="absolute h-12 w-12 rounded-full border-[3px] border-b-[#EFBA1C] border-t-transparent border-r-transparent border-l-transparent animate-[spin_1s_linear_infinite_reverse] opacity-40"></div>
          </div>
          <p className="mt-6 text-sm font-semibold tracking-widest text-[#EFBA1C] uppercase animate-pulse">
            Lolo Deco
          </p>
        </div>
      )}

      {/* HERO */}
      <section className="relative flex min-h-[92vh] items-center justify-center overflow-hidden px-4 py-24 sm:px-6 lg:px-8">
        {/* Background Visual Stack */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1920&q=80"
            alt="Décoration intérieure moderne"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center scale-110 animate-[aliveBackground_35s_ease-in-out_infinite]"
          />
          {/* Multi-layered Premium Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/60 to-[#404040]/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
          
          {/* Subtle Fine Design Grid Overlay */}
          <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:4rem_4rem]" />
          
          {/* Dynamic Lighting Ambient Aura */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#EFBA1C]/10 rounded-full blur-[120px] animate-pulse pointer-events-none duration-[8000ms]" />
        </div>

        {/* Dynamic Global Animations Rules */}
        <style jsx global>{`
          @keyframes aliveBackground {
            0% { transform: scale(1.08) translate(0px, 0px) rotate(0deg); }
            50% { transform: scale(1.15) translate(-8px, -6px) rotate(0.5deg); }
            100% { transform: scale(1.08) translate(0px, 0px) rotate(0deg); }
          }
          @keyframes slideUpEntrance {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-up {
            animation: slideUpEntrance 1s cubic-bezier(0.215, 0.610, 0.355, 1.000) forwards;
          }
        `}</style>

        {/* Content Box */}
        <div className="relative z-10 mx-auto w-full max-w-4xl text-center">
          {/* Location Badge */}
          <div className="opacity-0 animate-fade-in-up [animation-delay:200ms]">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#EFBA1C]/40 bg-black/40 backdrop-blur-md px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#EFBA1C] shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-transform hover:scale-105">
              <span className="h-1.5 w-1.5 rounded-full bg-[#EFBA1C] animate-ping" />
              {t("location_badge")}
            </span>
          </div>

          {/* Core Headline */}
          <h1 className="opacity-0 animate-fade-in-up [animation-delay:450ms] mt-8 text-4xl font-extrabold leading-[1.15] tracking-tight text-white drop-shadow-xl sm:text-5xl lg:text-6xl px-2">
            {t("hero_title")}
          </h1>

          {/* Subtitle / Pitch */}
          <p className="opacity-0 animate-fade-in-up [animation-delay:700ms] mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-gray-200/95 drop-shadow-sm sm:text-lg lg:text-xl">
            {t("hero_subtitle")}
          </p>

          {/* CTAs with Dynamic Micro-interactions */}
          <div className="opacity-0 animate-fade-in-up [animation-delay:950ms] mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row px-4">
            <Link
              href={`/${locale}/products`}
              className="group relative w-full overflow-hidden rounded-xl bg-[#EFBA1C] px-8 py-4 text-base font-bold text-[#404040] shadow-lg shadow-[#EFBA1C]/20 transition-all duration-300 hover:bg-[#F0C040] hover:shadow-xl hover:shadow-[#EFBA1C]/30 active:scale-[0.98] sm:w-auto"
            >
              <span className="relative z-10">{t("view_all")}</span>
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
            </Link>
            <Link
              href={`/${locale}/contact`}
              className="w-full rounded-xl border-2 border-white/60 bg-white/5 px-8 py-4 text-base font-bold text-white backdrop-blur-md shadow-lg transition-all duration-300 hover:border-[#EFBA1C] hover:bg-white hover:text-[#404040] hover:shadow-white/5 active:scale-[0.98] sm:w-auto"
            >
              {t("contact_us")}
            </Link>
          </div>
        </div>

        {/* Elegant Modern Scroll Down Prompt */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/50 opacity-0 animate-fade-in-up [animation-delay:1400ms]">
          <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-gray-400">Scroll</span>
          <div className="flex h-9 w-5 items-start justify-center rounded-full border-2 border-white/30 p-1">
            <div className="h-1.5 w-1 rounded-full bg-[#EFBA1C] animate-[scrollIndicator_2s_ease-in-out_infinite]" />
          </div>
        </div>

        {/* Scroll Animation Keyframes style */}
        <style jsx>{`
          @keyframes scrollIndicator {
            0% { transform: translateY(0); opacity: 1; }
            50% { transform: translateY(10px); opacity: 0.3; }
            100% { transform: translateY(0); opacity: 1; }
          }
        `}</style>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-[#404040] sm:text-4xl">{t("featured_title")}</h2>
            <p className="mt-3 text-lg text-gray-500">{t("featured_subtitle")}</p>
          </div>

          {loadingProducts && (
            <div className="mt-16 flex items-center justify-center">
              <div className="relative flex h-14 w-14 items-center justify-center">
                <div className="absolute h-full w-full rounded-full border-4 border-[#404040]/10"></div>
                <div className="absolute h-full w-full rounded-full border-4 border-t-[#EFBA1C] border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
              </div>
            </div>
          )}

          {!loadingProducts && featuredProducts.length === 0 && (
            <div className="mt-12 flex flex-col items-center justify-center py-16 text-center">
              <p className="text-xl font-semibold text-[#404040]">{t("featured_empty")}</p>
              <p className="mt-2 text-gray-500">{t("featured_empty_sub")}</p>
            </div>
          )}

          {!loadingProducts && featuredProducts.length > 0 && (
            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {featuredProducts.map((product) => {
                const hasPromo = product.is_promotion && product.promo_price != null;
                const shown = hasPromo ? product.promo_price : product.price;
                return (
                  <article
                    key={product.id}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_30px_rgba(0,0,0,0.12)]"
                  >
                    <Link href={`/${locale}/products/${product.id}`} className="relative block h-64 w-full overflow-hidden bg-gray-50">
                      {product.images && product.images.length > 0 ? (
                        isVideoUrl(product.images[0]) ? (
                          <video src={product.images[0]} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" muted autoPlay loop playsInline preload="metadata" />
                        ) : (
                          <Image src={product.images[0]} alt={product.title ?? "Produit"} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                        )
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#404040] to-[#606060]" />
                      )}
                      <div className="absolute left-3 top-3 flex flex-col gap-2">
                        {product.category && (
                          <span className="rounded-lg bg-[#404040] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm">{getCategoryLabel(product.category, locale)}</span>
                        )}
                        {hasPromo && (
                          <span className="rounded-lg bg-green-500 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm">{tp("promo")}</span>
                        )}
                      </div>
                    </Link>
                    <div className="flex flex-1 flex-col p-6">
                      <Link href={`/${locale}/products/${product.id}`}>
                        <h3 className="text-lg font-semibold text-[#404040] line-clamp-2 transition-colors group-hover:text-[#EFBA1C]">
                          {product.title ?? tp("untitled")}
                        </h3>
                      </Link>
                      <div className="mt-3 flex items-end gap-2">
                        {shown != null ? (
                          <>
                            <span className="text-xl font-bold text-[#404040]">{shown.toLocaleString()} MAD</span>
                            <span className="text-xs text-gray-400">/ {getUnitLabel(product.price_unit, locale)}</span>
                            {hasPromo && product.price != null && (
                              <span className="ml-1 text-sm text-gray-400 line-through">{product.price.toLocaleString()}</span>
                            )}
                          </>
                        ) : (
                          <span className="text-base font-semibold text-gray-500">{tp("price_on_request")}</span>
                        )}
                      </div>
                      <Link
                        href={`/${locale}/products/${product.id}`}
                        className="mt-5 block w-full rounded-xl bg-[#EFBA1C] py-3 text-center text-sm font-semibold text-[#404040] transition-colors hover:bg-[#F0C040]"
                      >
                        {t("view_details")}
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {!loadingProducts && featuredProducts.length > 0 && (
            <div className="mt-14 text-center">
              <Link
                href={`/${locale}/products`}
                className="inline-block rounded-xl border-2 border-[#404040] px-10 py-3.5 font-semibold text-[#404040] transition-all hover:bg-[#404040] hover:text-white"
              >
                {t("view_all")}
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* STATS */}
      <section ref={statsRef} className="bg-[#f8f8f8] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-10 gap-x-4 lg:grid-cols-4">
          {statsData.map((stat, idx) => (
            <div key={stat.label} className="border-r border-gray-200 px-2 text-center last:border-0">
              <p className="text-4xl font-extrabold text-[#EFBA1C] tabular-nums sm:text-5xl">
                {counts[idx]}
                {stat.suffix}
              </p>
              <p className="mt-2 text-sm font-medium text-[#404040] sm:text-base">
                {t(`stat_${stat.label.toLowerCase().replace(/\s+/g, "_")}`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-[#404040] sm:text-4xl">{t("about_title")}</h2>
            <p className="mt-6 leading-relaxed text-gray-600 font-light">{t("about_p1")}</p>
            <p className="mt-4 leading-relaxed text-gray-600 font-light">{t("about_p2")}</p>
            <Link
              href={`/${locale}/contact`}
              className="mt-8 inline-block rounded-xl bg-[#EFBA1C] px-8 py-3.5 font-bold text-[#404040] shadow-sm transition-all hover:bg-[#F0C040]"
            >
              {t("contact_us")}
            </Link>
          </div>
          <div className="relative h-[450px] overflow-hidden rounded-2xl bg-gray-100 shadow-xl">
            <Image
              src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80"
              alt="Lolo Deco décoration intérieure"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center"
            />
          </div>
        </div>
      </section>

      <TestimonialsSlider />
    </>
  );
}