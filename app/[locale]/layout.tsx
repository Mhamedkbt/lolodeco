import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import '../globals.css'

const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3002'),
  title: {
    default: 'Lolo Deco — Décoration Intérieure & Extérieure à Agadir',
    template: '%s | Lolo Deco',
  },
  description: 'Lolo Deco est votre spécialiste en décoration d\'intérieur et d\'extérieur à Agadir. Bardage PVC, moulures, marbre PVC, papier peint, cheminées et parquet.',
  keywords: [
    'décoration intérieur maroc',
    'décoration extérieur agadir',
    'bardage pvc maroc',
    'moulures pvc',
    'marbre pvc',
    'papier peint agadir',
    'Lolo Deco',
    'lolodeco',
    'home decoration morocco',
  ],
  authors: [{ name: 'Lolo Deco' }],
  creator: 'Lolo Deco',
  publisher: 'Lolo Deco',
  icons: {
    icon: '/images/LoloDecoLogo.jpg',
    shortcut: '/images/LoloDecoLogo.jpg',
    apple: '/images/LoloDecoLogo.jpg',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_MA',
    url: 'https://lolodeco.ma',
    siteName: 'Lolo Deco',
    title: 'Lolo Deco — Décoration Intérieure & Extérieure à Agadir',
    description: 'Découvrez nos produits de décoration : PVC, marbre, papier peint et plus à Agadir.',
    images: [
      {
        url: '/images/LoloDecoLogo.jpg',
        width: 1200,
        height: 630,
        alt: 'Lolo Deco',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lolo Deco — Décoration à Agadir',
    description: 'Spécialiste en décoration intérieure et extérieure à Agadir.',
    images: ['/images/LoloDecoLogo.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

const locales = ['fr', 'en', 'ar', 'es']

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!locales.includes(locale)) notFound()

  const messages = await getMessages()
  const isRTL = locale === 'ar'

  return (
    <html
      lang={locale}
      dir={isRTL ? 'rtl' : 'ltr'}
      className={`${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

export function generateStaticParams() {
  return [{ locale: 'fr' }, { locale: 'en' }, { locale: 'ar' }, { locale: 'es' }]
}