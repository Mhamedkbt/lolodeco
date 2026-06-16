"use client";

import Link from "next/link";
import { useState } from "react";
import Image from "next/image";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/properties", label: "Properties" },
  { href: "/about", label: "About" },
  { href: "/evaluation", label: "Evaluation" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#1a2b4a] shadow-md">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"> 
        
        {/* Logo Link Wrapper */}
        <Link
          href="/"
          className="flex items-center"
          onClick={() => setMenuOpen(false)}
        >
          {/* Scaled naturally with consistent aspect ratio preservation */}
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

        {/* Desktop Call Button */}
        <div className="hidden md:block">
          <a
            href="tel:0661141811"
            className="rounded-md bg-[#c9a84c] px-5 py-2.5 text-sm font-semibold text-[#1a2b4a] transition-colors hover:bg-[#d4b85e] lg:text-base"
          >
            0661141811
          </a>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-white hover:text-[#c9a84c] md:hidden"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <svg
            className="h-6 w-6"
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
      </nav>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="border-t border-white/10 bg-[#1a2b4a] md:hidden">
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
                0661141811
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}