'use client'

import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'

const languages = [
  {
    code: 'fr',
    label: 'Français',
    short: 'FR',
    flag: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2" className="h-4 w-6 rounded-sm overflow-hidden flex-shrink-0">
        <rect width="1" height="2" fill="#002395"/>
        <rect x="1" width="1" height="2" fill="#FFFFFF"/>
        <rect x="2" width="1" height="2" fill="#ED2939"/>
      </svg>
    ),
  },
  {
    code: 'en',
    label: 'English',
    short: 'EN',
    flag: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" className="h-4 w-6 rounded-sm overflow-hidden flex-shrink-0">
        <clipPath id="a"><path d="M0 0v30h60V0z"/></clipPath>
        <clipPath id="b"><path d="M30 15h30v15zv15H0zH0V0zV0h30z"/></clipPath>
        <g clipPath="url(#a)">
          <path d="M0 0v30h60V0z" fill="#012169"/>
          <path d="M0 0l60 30m0-30L0 30" stroke="#fff" strokeWidth="6"/>
          <path d="M0 0l60 30m0-30L0 30" clipPath="url(#b)" stroke="#C8102E" strokeWidth="4"/>
          <path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10"/>
          <path d="M30 0v30M0 15h60" stroke="#C8102E" strokeWidth="6"/>
        </g>
      </svg>
    ),
  },
  {
    code: 'ar',
    label: 'العربية',
    short: 'ع',
    flag: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" className="h-4 w-6 rounded-sm overflow-hidden flex-shrink-0">
        <rect width="900" height="600" fill="#c1272d"/>
        <path 
          d="M450,162 L484,267 L573,199 L539,304 L628,372 L518,372 L450,478 L382,372 L272,372 L361,304 L327,199 L416,267 Z 
             M450,225 L427,294 L362,247 L387,323 L322,372 L402,372 L450,447 L498,372 L578,372 L513,323 L538,247 L473,294 Z" 
          fill="#006233"
        />
      </svg>
    ),
  },
  {
    code: 'es',
    label: 'Español',
    short: 'ES',
    flag: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 750 500" className="h-4 w-6 rounded-sm overflow-hidden flex-shrink-0">
        <rect width="750" height="500" fill="#a5001a"/>
        <rect y="125" width="750" height="250" fill="#fabd00"/>
        <g transform="translate(190, 185) scale(0.9)">
          <path d="M0,40 L0,90 C0,115 40,115 40,90 L40,40 Z" fill="#a5001a" stroke="#fabd00" strokeWidth="8"/>
          <path d="M0,40 L0,90 C0,115 40,115 40,90 L40,40 Z" fill="#fabd00"/>
          <rect x="-25" y="30" width="10" height="75" fill="#ffffff" stroke="#a5001a" strokeWidth="4"/>
          <rect x="55" y="30" width="10" height="75" fill="#ffffff" stroke="#a5001a" strokeWidth="4"/>
          <circle cx="-20" cy="25" r="8" fill="#fabd00"/>
          <circle cx="60" cy="25" r="8" fill="#fabd00"/>
          <path d="M-15,15 Q20,-5 55,15 Q20,5 -15,15 Z" fill="#a5001a"/>
          <path d="M-5,40 L45,40 M-5,65 L45,65 M20,40 L20,105" stroke="#a5001a" strokeWidth="4"/>
        </g>
      </svg>
    ),
  },
]

export default function LanguageSwitcher() {
  const locale = useLocale()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [openUpward, setOpenUpward] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const current = languages.find((l) => l.code === locale) ?? languages[0]

  const switchLanguage = (newLocale: string) => {
    const segments = pathname.split('/')
    segments[1] = newLocale
    window.location.href = segments.join('/')
  }

  // Check spatial clearance when opened
  const toggleDropdown = () => {
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      // If remaining room under switcher component is less than 210px, display onto top instead
      if (spaceBelow < 210) {
        setOpenUpward(true)
      } else {
        setOpenUpward(false)
      }
    }
    setOpen(!open)
  }

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">

      {/* Trigger Button */}
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-2 rounded-lg border border-white/20 
                   bg-white/10 px-3 py-2 text-white backdrop-blur-sm 
                   transition-all duration-200 hover:bg-white/20 
                   hover:border-[#c9a84c]/50 min-w-[80px]"
      >
        {current.flag}
        <span className="text-xs font-bold tracking-wider">{current.short}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-3 w-3 ml-auto transition-transform duration-200 
                      ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round"
                strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Smart Positioning Dropdown */}
      {open && (
        <div
          className={`absolute left-0 sm:left-auto sm:right-0 z-[9999] w-44 overflow-hidden 
                      rounded-xl border border-gray-100 bg-white shadow-2xl
                      ${openUpward ? 'bottom-full mb-2' : 'top-full mt-2'}`}
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                switchLanguage(lang.code)
                setOpen(false)
              }}
              className={`flex w-full items-center gap-3 px-4 py-3 
                          text-left text-sm transition-colors duration-150
                          ${locale === lang.code
                            ? 'bg-[#c9a84c]/10 font-bold text-[#c9a84c]'
                            : 'font-medium text-gray-700 hover:bg-gray-50'
                          }`}
            >
              {lang.flag}
              <span className="flex-1">{lang.label}</span>
              {locale === lang.code && (
                <svg xmlns="http://www.w3.org/2000/svg"
                     className="h-4 w-4 flex-shrink-0 text-[#c9a84c]"
                     fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round"
                        strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}