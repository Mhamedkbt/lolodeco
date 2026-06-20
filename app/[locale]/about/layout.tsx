import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const titles: Record<string, string> = {
    fr: 'À Propos — Lolo Deco',
    en: 'About — Lolo Deco',
    ar: 'عن Lolo Deco',
    es: 'Sobre Nosotros — Lolo Deco',
  }
  return {
    title: titles[locale] ?? titles.fr,
    description: 'Découvrez Lolo Deco, votre spécialiste en décoration intérieure et extérieure à Agadir.',
    alternates: {
      canonical: `https://lolodeco.ma/${locale}/about`,
    },
  }
}

export default function AboutLayout({ children }: { children: ReactNode }) {
  return children
}
