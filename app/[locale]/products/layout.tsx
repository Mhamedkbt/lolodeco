import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const titles: Record<string, string> = {
    fr: 'Nos Produits — Décoration intérieure et extérieure',
    en: 'Our Products — Interior and Exterior Decoration',
    ar: 'منتجاتنا — ديكور داخلي وخارجي',
    es: 'Nuestros Productos — Decoración interior y exterior',
  }
  return {
    title: titles[locale] ?? titles.fr,
    description:
      'Parcourez notre collection de produits de décoration : Bardage PVC, Marbre PVC, Papier peint, Cheminées et plus à Agadir.',
    alternates: {
      canonical: `https://lolodeco.ma/${locale}/products`,
    },
  }
}

export default function ProductsLayout({ children }: { children: ReactNode }) {
  return children
}
