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
  
  // Create a reference to the navbar element to check where clicks happen
  const navRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { href: `/${locale}`, label: t("home") },
    { href: `/${locale}/properties`, label: t("properties") },
    { href: `/${locale}/about`, label: t("about") },
    { href: `/${locale}/evaluation`, label: t("evaluation") },
    { href: `/${locale}/contact`, label: t("contact") },
  ];

  // Effect hook to handle clicks outside the navbar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // If the menu is open and the click target is not inside the navbar, close it
      if (menuOpen && navRef.current && !navRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    // Bind the event listener to the document body
    document.addEventListener("mousedown", handleClickOutside);
    
    // Clean up the event listener when component unmounts
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  return (
    // Attached the navRef here to wrap the header area
    <header ref={navRef} className="sticky top-0 z-50 bg-[#1a2b4a] shadow-md">
      {/* py-[2px] gives micro padding top and bottom to the whole nav row */}
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 py-[2px] sm:px-6 lg:px-8"> 
        
        {/* Logo Link Wrapper */}
        <Link
          href={`/${locale}`}
          className="flex items-center"
          onClick={() => setMenuOpen(false)}
        >
          <div className="relative h-20 w-40 sm:w-44 md:w-48 lg:w-52">
            <Image
              src="/images/LaTourImmoLogoPng.png"
              alt="LaTour Immo Logo"
              fill
              priority
              className="object-contain object-left"
              sizes="(max-width: 768px) 160px, 208px"
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

        {/* Desktop Action Box (Language Switcher and Phone Button) */}
        <div className="hidden items-center gap-3 md:flex">
          <Link 
            href={`/${locale}/admin`}
            className="text-white transition-colors hover:text-[#c9a84c]"
            aria-label="Admin Login"
          >
            {/* Person Icon */}
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
            href="tel:+212661141811"
            className="rounded-md bg-[#c9a84c] px-5 py-2.5 text-sm font-semibold text-[#1a2b4a] transition-colors hover:bg-[#d4b85e] lg:text-base"
          >
            +212661141811
          </a>
        </div>

        {/* Mobile Controls (Person Icon on the left of Menu Icon) */}
        <div className="flex items-center gap-3 md:hidden">
          <Link 
            href={`/${locale}/admin`}
            className="p-2 text-white transition-colors hover:text-[#c9a84c]"
            aria-label="Admin Login"
            onClick={() => setMenuOpen(false)}
          >
            {/* Person Icon */}
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
            {/* Sized at h-7 w-7 for improved mobile visibility */}
            <svg
              className="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              aria-hidden="true"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Smooth Mobile Dropdown Menu Container */}
      <div 
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out md:hidden
                    ${menuOpen ? "grid-rows-[1fr] border-t border-white/10" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden bg-[#1a2b4a]">
          <ul className="flex flex-col px-4 py-4 sm:px-6">
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
                +212661141811
              </a>
            </li>
            <li className="pt-4 mt-4 border-t border-white/10">
              <LanguageSwitcher />
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}