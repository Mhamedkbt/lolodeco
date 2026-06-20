import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const titles: Record<string, string> = {
    fr: 'Accueil — Lolo Deco Décoration Agadir',
    en: 'Home — Lolo Deco Home Decoration',
    ar: 'الرئيسية — Lolo Deco للديكور',
    es: 'Inicio — Lolo Deco Decoración',
  }
  const descs: Record<string, string> = {
    fr: 'Transformez votre intérieur avec Lolo Deco. Bardage PVC, moulures, marbre PVC, papier peint à Agadir.',
    en: 'Transform your interior with Lolo Deco. PVC cladding, moldings, PVC marble, wallpaper in Agadir.',
    ar: 'حول ديكور منزلك مع Lolo Deco. بارده PVC، قوالب، رخام PVC، ورق جدران في أكادير.',
    es: 'Transforma tu interior con Lolo Deco. Revestimiento PVC, molduras, mármol PVC en Agadir.',
  }
  return {
    title: titles[locale] ?? titles.fr,
    description: descs[locale] ?? descs.fr,
    alternates: {
      canonical: `https://lolodeco.ma/${locale}`,
      languages: {
        'fr': 'https://lolodeco.ma/fr',
        'en': 'https://lolodeco.ma/en',
        'ar': 'https://lolodeco.ma/ar',
        'es': 'https://lolodeco.ma/es',
      },
    },
  }
}

export default function HomeLayout({ children }: { children: ReactNode }) {
  return children
}
