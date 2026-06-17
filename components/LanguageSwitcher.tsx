'use client'

import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'

const languages = [
  { code: 'fr', label: 'FR' },
  { code: 'en', label: 'EN' },
  { code: 'ar', label: 'ع' },
]

export default function LanguageSwitcher() {
  const locale = useLocale()
  const pathname = usePathname()

  const switchLanguage = (newLocale: string) => {
    const segments = pathname.split('/')
    segments[1] = newLocale
    const newPath = segments.join('/')
    window.location.href = newPath
  }

  return (
    <div className="flex items-center gap-1">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => switchLanguage(lang.code)}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold 
                      transition-all duration-200 ${
            locale === lang.code
              ? 'bg-[#c9a84c] text-[#1a2b4a]'
              : 'text-white hover:bg-white/10 border border-white/20'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  )
}