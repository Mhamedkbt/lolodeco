"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

const isVideoUrl = (url: string): boolean => {
  return /\.(mp4|webm|mov|avi|quicktime)(\?|$)/i.test(url);
};

interface Property {
  id: string;
  title: string | null;
  city: string | null;
  price: number | null;
  surface: number | null;
  type: string | null;
  status: string | null;
  images: string[] | null;
  featured: boolean | null;
  description: string | null;
  created_at: string | null;
}

// Updated data targets exactly matching your requested values
const statsData = [
  { target: 10, suffix: "+", label: "Properties" },
  { target: 3, suffix: "+", label: "Years Experience" },
  { target: 50, suffix: "+", label: "Happy Clients" },
  { target: 6, suffix: "+", label: "Cities" },
];

export default function Home() {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(true);

  // States for animated counters
  const [counts, setCounts] = useState([0, 0, 0, 0]);
  const statsRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("featured", true)
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) {
        console.error("Error fetching featured properties:", error);
        setLoadingProperties(false); // FIXED typo here
        return;
      }

      setFeaturedProperties(data ?? []);
      setLoadingProperties(false); // FIXED typo here
    };

    fetchFeaturedProperties();
  }, []);

  // Scroll-triggered counter effect
  useEffect(() => {
    const currentRef = statsRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          
          const duration = 1500; // Total animation length in ms
          const frameRate = 1000 / 60; 
          const totalFrames = Math.round(duration / frameRate);
          let frame = 0;

          const timer = setInterval(() => {
            frame++;
            const progress = frame / totalFrames;
            // Ease out quad formula for smooth decelerating crawl
            const easeProgress = progress * (2 - progress); 

            const nextCounts = statsData.map((stat) => 
              Math.floor(easeProgress * stat.target)
            );

            setCounts(nextCounts);

            if (frame >= totalFrames) {
              setCounts(statsData.map(s => s.target));
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

  function handleSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (type) params.set("type", type);
    if (status) params.set("status", status);
    const query = params.toString();
    router.push(query ? `/properties?${query}` : "/properties");
  }

  return (
    <>
      {/* Dynamic Animated Hero Section */}
      <section className="relative flex min-h-[90vh] items-center justify-center bg-[#0d1a2e00] px-4 py-20 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1920&q=80" 
            alt="Moroccan Modern Architecture" 
            className="h-full w-full object-cover object-center scale-105 animate-[aliveBackground_20s_ease-in-out_infinite]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1a2b4a]/90 via-[#1a2b4a]/85 to-[#0d1a2e]/90 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0d1a2e]/40 to-[#0d1a2e]" />
        </div>

        <style jsx global>{`
          @keyframes aliveBackground {
            0% { transform: scale(1.05) translate(0px, 0px); }
            55% { transform: scale(1.12) translate(-8px, 4px); }
            100% { transform: scale(1.05) translate(0px, 0px); }
          }
          @keyframes contentEntrance {
            from { opacity: 0; transform: translateY(15px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        <div className="relative z-10 mx-auto w-full max-w-5xl text-center animate-[contentEntrance_1s_ease-out_forwards]">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl drop-shadow-md">
            Find Your Dream Property in Morocco
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-300 sm:text-xl drop-shadow-sm font-light">
            Luxury villas, apartments and commercial spaces across Morocco
          </p>

          <form
            onSubmit={handleSearch}
            className="mx-auto mt-12 w-full max-w-4xl rounded-2xl bg-white p-4 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)] sm:p-6 transition-all duration-300 hover:shadow-[0_30px_60px_-10px_rgba(0,0,0,0.5)]"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-2">
              <div className="text-left px-2">
                <label htmlFor="city" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#1a2b4a]">
                  City
                </label>
                <input
                  id="city"
                  type="text"
                  placeholder="Casablanca, Marrakech..."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-3 text-[#1a2b4a] transition-all placeholder:text-gray-400 focus:border-[#c9a84c] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/30"
                />
              </div>

              <div className="text-left px-2">
                <label htmlFor="type" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#1a2b4a]">
                  Type
                </label>
                <select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-3 text-[#1a2b4a] transition-all focus:border-[#c9a84c] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/30"
                >
                  <option value="">All types</option>
                  <option value="apartment">Apartment</option>
                  <option value="villa">Villa</option>
                  <option value="land">Land</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>

              <div className="text-left px-2">
                <label htmlFor="status" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#1a2b4a]">
                  Status
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-3 text-[#1a2b4a] transition-all focus:border-[#c9a84c] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/30"
                >
                  <option value="">Sale or Rent</option>
                  <option value="sale">Sale</option>
                  <option value="rent">Rent</option>
                </select>
              </div>

              <div className="flex items-end px-2 pt-2 sm:pt-0">
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#c9a84c] px-6 py-3 text-base font-bold text-[#1a2b4a] shadow-md transition-all hover:bg-[#d4b85e] hover:shadow-lg active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[#c9a84c] focus:ring-offset-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-[#1a2b4a] sm:text-4xl">
              Featured Properties
            </h2>
            <p className="mt-3 text-lg text-gray-500">
              Discover our handpicked luxury properties
            </p>
          </div>

          {/* Perfect Loading Spinner and Skeleton View */}
          {loadingProperties && (
            <div className="mt-16 flex flex-col items-center justify-center gap-12">
              <div className="relative flex h-14 w-14 items-center justify-center">
                <div className="absolute h-full w-full rounded-full border-4 border-[#1a2b4a]/10"></div>
                <div className="absolute h-full w-full rounded-full border-4 border-t-[#c9a84c] border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
              </div>
              <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg animate-pulse">
                    <div className="h-48 w-full bg-gray-200" />
                    <div className="p-6 space-y-3">
                      <div className="flex gap-2">
                        <div className="h-6 w-16 bg-gray-200 rounded-full" />
                        <div className="h-6 w-16 bg-gray-200 rounded-full" />
                      </div>
                      <div className="h-6 w-3/4 bg-gray-200 rounded" />
                      <div className="h-4 w-1/2 bg-gray-200 rounded" />
                      <div className="h-4 w-full bg-gray-200 rounded" />
                      <div className="h-10 w-full bg-gray-200 rounded-lg mt-4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loadingProperties && featuredProperties.length === 0 && (
            <div className="mt-12 flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-gray-100 p-6 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-gray-400" 
                     fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <p className="text-xl font-semibold text-[#1a2b4a]">No featured properties yet</p>
              <p className="mt-2 text-gray-500">Check back soon for our latest listings.</p>
            </div>
          )}

          {/* Premium Formatted Dynamic Cards */}
          {!loadingProperties && featuredProperties.length > 0 && (
            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {featuredProperties.map((property) => (
                <article
                  key={property.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] 
                             transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_30px_rgba(0,0,0,0.12)]"
                >
                  <div className="relative h-64 w-full overflow-hidden bg-gray-50">
                    {property.images && property.images.length > 0 ? (
                      isVideoUrl(property.images[0]) ? (
                        <div className="h-full w-full">
                          <video
                            src={property.images[0]}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            muted autoPlay loop playsInline preload="metadata"
                          />
                          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[10px] tracking-wider font-semibold px-2.5 py-1 rounded-md flex items-center gap-1 z-10">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                            VIDEO
                          </div>
                        </div>
                      ) : (
                        <img
                          src={property.images[0]}
                          alt={property.title ?? "Property"}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      )
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-[#1a2b4a] to-[#2a3b5a] flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                      </div>
                    )}
                    
                    {/* Tags Container styled neatly */}
                    <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
                      {property.type && (
                        <span className="rounded-lg bg-[#1a2b4a] px-3 py-1.5 text-xs font-medium text-white capitalize shadow-sm backdrop-blur-xs">
                          {property.type}
                        </span>
                      )}
                      {property.status && (
                        <span className="rounded-lg border border-[#1a2b4a]/20 bg-white px-3 py-1.5 text-xs font-medium text-[#1a2b4a] capitalize shadow-sm">
                          {property.status}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-[#1a2b4a] tracking-tight line-clamp-1 group-hover:text-[#c9a84c] transition-colors duration-200">
                        {property.title ?? "Untitled Property"}
                      </h3>
                      <p className="mt-1.5 text-sm text-gray-400 font-light tracking-wide flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400/80 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {property.city ?? "—"}
                      </p>
                    </div>

                    <div className="mt-3 pt-4 border-t border-gray-50 flex items-center justify-between">
                      <p className="text-lg font-bold text-[#1a2b4a] tracking-tight">
                        {property.price
                          ? `${property.price.toLocaleString()} MAD`
                          : "Price on request"}
                      </p>
                      <p className="text-sm text-gray-400 font-light tracking-wide">
                        {property.surface ? `${property.surface} m²` : "—"}
                      </p>
                    </div>

                    <Link
                      href={`/properties/${property.id}`}
                      className="mt-5 block w-full rounded-xl bg-[#c9a84c] py-3.5 text-center 
                                 text-sm font-semibold text-[#1a2b4a] transition-all duration-200 
                                 hover:bg-[#d4b85e] shadow-xs hover:shadow-sm"
                    >
                      View Details
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}

          {!loadingProperties && featuredProperties.length > 0 && (
            <div className="mt-14 text-center">
              <Link
                href="/properties"
                className="inline-block rounded-xl border-2 border-[#1a2b4a] px-10 py-3.5 
                           font-semibold text-[#1a2b4a] transition-all duration-200 
                           hover:bg-[#1a2b4a] hover:text-white"
              >
                View All Properties
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Stats Counter Section - Triggers smoothly from zero when scrolled into frame */}
      <section ref={statsRef} className="bg-[#1a2b4a] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-10 gap-x-4 lg:grid-cols-4">
          {statsData.map((stat, idx) => (
            <div key={stat.label} className="text-center border-r last:border-0 border-white/10 px-2">
              <p className="text-4xl font-extrabold text-[#c9a84c] sm:text-5xl tabular-nums tracking-tight">
                {counts[idx]}{stat.suffix}
              </p>
              <p className="mt-2 text-sm font-medium tracking-wide text-white/90 sm:text-base">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* About Section with Real Premium Architectural Image */}
      <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-[#1a2b4a] sm:text-4xl">
              About LaTour Immo
            </h2>
            <p className="mt-6 leading-relaxed text-gray-600 font-light">
              LaTour Immo is a leading real estate agency in Morocco, dedicated
              to helping clients find exceptional properties across the
              kingdom. With over a decade of experience, we specialize in
              luxury villas, modern apartments, and premium commercial spaces
              in Morocco&apos;s most sought-after cities.
            </p>
            <p className="mt-4 leading-relaxed text-gray-600 font-light">
              Our team of expert agents provides personalized service, guiding
              you through every step of buying, selling, or renting your
              perfect property. Trust LaTour Immo to turn your real estate dreams
              into reality.
            </p>
            <Link
              href="/contact"
              className="mt-8 inline-block rounded-xl bg-[#c9a84c] px-8 py-3.5 font-bold text-[#1a2b4a] shadow-sm transition-all hover:bg-[#d4b85e] hover:shadow"
            >
              Contact Us
            </Link>
          </div>
          <div className="relative h-[450px] overflow-hidden rounded-2xl shadow-xl bg-gray-100 group">
            <img 
              src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80"
              alt="Luxury Morocco Riad Interior Architecture"
              className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d1a2e]/20 to-transparent pointer-events-none" />
          </div>
        </div>
      </section>
    </>
  );
}