"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const t = useTranslations("nav");
  const locale = useLocale();
  
  const headerRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { href: `/${locale}`, label: t("home") },
    { href: `/${locale}/properties`, label: t("properties") },
    { href: `/${locale}/about`, label: t("about") },
    { href: `/${locale}/evaluation`, label: t("evaluation") },
    { href: `/${locale}/contact`, label: t("contact") },
  ];

  useEffect(() => {
    if (!menuOpen) return;

    const handleScroll = () => {
      setMenuOpen(false);
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <header ref={headerRef} className="sticky top-0 z-50 bg-[#1a2b4a] shadow-md">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"> 
        
        {/* Logo Link Wrapper */}
        <Link
          href={`/${locale}`}
          className="flex items-center"
          onClick={() => setMenuOpen(false)}
        >
          <div className="relative h-16 w-36 sm:w-40 md:w-44">
            <Image
              src="/images/LaTourImmoLogoPng.png"
              alt="LaTour Immo Logo"
              fill
              priority
              className="object-contain object-left"
              sizes="(max-width: 768px) 155px, 184px"
            />
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm font-medium text-white transition-colors hover:text-[#c9a84c] lg:text-base"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop Action Box */}
        <div className="hidden items-center gap-3 md:flex">
          <Link 
            href={`/${locale}/admin`}
            className="text-white transition-colors hover:text-[#c9a84c]"
            aria-label="Admin Login"
          >
            <svg 
              className="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={2} 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </Link>

          <LanguageSwitcher />
          
          <a
            href="tel:0661141811"
            className="rounded-md bg-[#c9a84c] px-5 py-2.5 text-sm font-semibold text-[#1a2b4a] transition-colors hover:bg-[#d4b85e] lg:text-base"
          >
            0661141811
          </a>
        </div>

        {/* Mobile Controls */}
        <div className="flex items-center gap-3 md:hidden">
          <Link 
            href={`/${locale}/admin`}
            className="p-2 text-white transition-colors hover:text-[#c9a84c]"
            aria-label="Admin Login"
            onClick={() => setMenuOpen(false)}
          >
            <svg 
              className="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={2} 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </Link>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-white hover:text-[#c9a84c]"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <div className="relative h-6 w-6 flex items-center justify-center">
              {/* Hamburger Icon Lines */}
              <span className={`absolute h-0.5 w-6 bg-current transform transition-all duration-300 ease-in-out ${menuOpen ? "rotate-45" : "-translate-y-2"}`} />
              <span className={`absolute h-0.5 w-6 bg-current transform transition-all duration-200 ease-in-out ${menuOpen ? "opacity-0" : "opacity-100"}`} />
              <span className={`absolute h-0.5 w-6 bg-current transform transition-all duration-300 ease-in-out ${menuOpen ? "-rotate-45" : "translate-y-2"}`} />
            </div>
          </button>
        </div>
      </nav>

      {/* Modern Animated Mobile Dropdown Menu */}
      <div 
        className={`overflow-hidden border-white/10 bg-[#1a2b4a] md:hidden transition-all duration-300 ease-in-out ${
          menuOpen 
            ? "max-h-[400px] opacity-100 border-t" 
            : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        <ul className={`flex flex-col px-4 py-4 sm:px-6 transition-all duration-500 delay-75 transform ${
          menuOpen ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
        }`}>
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="block py-3 text-base font-medium text-white transition-colors hover:text-[#c9a84c]"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li className="pt-2">
            <a
              href="tel:0661141811"
              className="block rounded-md bg-[#c9a84c] px-4 py-3 text-center text-base font-semibold text-[#1a2b4a] transition-colors hover:bg-[#d4b85e]"
            >
              0661141811
            </a>
          </li>
          <li className="pt-4 mt-4 border-t border-white/10">
            <LanguageSwitcher />
          </li>
        </ul>
      </div>
    </header>
  );
}