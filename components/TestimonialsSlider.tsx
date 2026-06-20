"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  text: string;
  rating: number;
}

export function TestimonialsSlider() {
  const t = useTranslations("testimonials");
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  const testimonialsData: Testimonial[] = [
    {
      id: 1,
      name: t("t1_name"),
      role: t("t1_role"),
      text: t("t1_text"),
      rating: 5,
    },
    {
      id: 2,
      name: t("t2_name"),
      role: t("t2_role"),
      text: t("t2_text"),
      rating: 5,
    },
    {
      id: 3,
      name: t("t3_name"),
      role: t("t3_role"),
      text: t("t3_text"),
      rating: 5,
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonialsData.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonialsData.length]);

  return (
    <section className="bg-gray-50 px-4 py-17 sm:px-6 lg:px-8 overflow-hidden border-t border-gray-100 w-full">
      <div className="mx-auto max-w-4xl text-center">
        <span className="text-xs font-bold uppercase tracking-widest text-[#EFBA1C]">
          {t("label")}
        </span>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#404040] sm:text-4xl">
          {t("title")}
        </h2>

        <div className="relative mt-12 min-h-[220px] flex items-center justify-center">
          {testimonialsData.map((testimonial, idx) => (
            <div
              key={testimonial.id}
              className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 ease-in-out ${
                idx === currentSlide
                  ? "opacity-100 translate-x-0 pointer-events-auto"
                  : "opacity-0 translate-x-8 pointer-events-none"
              }`}
            >
              <div className="flex gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-[#EFBA1C]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <p className="text-xl sm:text-2xl text-[#404040] font-light max-w-2xl leading-relaxed italic">
                &ldquo;{testimonial.text}&rdquo;
              </p>

              <h4 className="mt-6 text-base font-bold text-[#404040] tracking-wide">
                {testimonial.name}
              </h4>
              <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-medium">
                {testimonial.role}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center gap-2.5">
          {testimonialsData.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentSlide ? "w-8 bg-[#EFBA1C]" : "w-2 bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
