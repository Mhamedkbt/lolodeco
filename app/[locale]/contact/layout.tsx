import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const titles: Record<string, string> = {
    fr: 'Contact — Lolo Deco',
    en: 'Contact — Lolo Deco',
    ar: 'اتصل بنا — Lolo Deco',
    es: 'Contacto — Lolo Deco',
  }
  return {
    title: titles[locale] ?? titles.fr,
    description: 'Contactez Lolo Deco pour toute question sur nos produits de décoration à Agadir.',
    alternates: {
      canonical: `https://lolodeco.ma/${locale}/contact`,
    },
  }
}

export default function ContactLayout({ children }: { children: ReactNode }) {
  return children
}
