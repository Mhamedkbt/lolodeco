'use client'

import Image from 'next/image'
import { useEffect, useState, useRef } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { TestimonialsSlider } from '../../../components/TestimonialsSlider'

interface HighlightItem {
  value: string
  label: string
}

const CounterItem = ({ item }: { item: HighlightItem }) => {
  const [count, setCount] = useState<string | number>(0)
  const elementRef = useRef<HTMLParagraphElement>(null)
  const hasAnimated = useRef<boolean>(false)

  useEffect(() => {
    const target = elementRef.current
    if (!target) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          const numericTarget = parseInt(item.value, 10)

          if (isNaN(numericTarget)) {
            setCount(item.value)
            return
          }

          const duration = 2000
          const frameDuration = 1000 / 60
          const totalFrames = Math.round(duration / frameDuration)
          let frame = 0

          const counter = setInterval(() => {
            frame++
            const progress = frame / totalFrames
            const easeOutProgress = progress * (2 - progress)
            const currentCount = Math.floor(easeOutProgress * numericTarget)

            if (frame >= totalFrames) {
              clearInterval(counter)
              setCount(item.value)
            } else {
              const suffix = item.value.replace(/[0-9]/g, '')
              setCount(`${currentCount}${suffix}`)
            }
          }, frameDuration)
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [item.value])

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 text-center shadow-sm">
      <p ref={elementRef} className="text-3xl font-bold tabular-nums text-[#c9a84c] sm:text-4xl">
        {count}
      </p>
      <p className="mt-2 text-sm font-semibold text-[#1a2b4a] sm:text-base">
        {item.label}
      </p>
    </div>
  )
}

export default function AboutPage() {
  const t = useTranslations('about')
  const [currentSlide, setCurrentSlide] = useState<number>(0)

  const values = [
    {
      title: t('value1_title'),
      description: t('value1_desc'),
      icon: (
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24"
             strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      ),
    },
    {
      title: t('value2_title'),
      description: t('value2_desc'),
      icon: (
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24"
             strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
      ),
    },
    {
      title: t('value3_title'),
      description: t('value3_desc'),
      icon: (
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24"
             strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      ),
    },
  ]

  const highlights = [
    { value: '3+',   label: t('stat_experience') },
    { value: '20+',  label: t('stat_sold') },
    { value: '30+',  label: t('stat_clients') },
    { value: '24/7', label: t('stat_support') },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="bg-[#1a2b4a] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            {t('title')}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-300">
            {t('subtitle')}
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="bg-white px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="text-2xl font-bold text-[#1a2b4a] sm:text-3xl">
              {t('story_title')}
            </h2>
            <div className="mt-2 h-1 w-16 rounded-full bg-[#c9a84c]" />
            <p className="mt-6 leading-relaxed text-gray-600">
              {t('story_p1')}
            </p>
            <p className="mt-4 leading-relaxed text-gray-600">
              <span className="font-semibold text-[#1a2b4a]">{t('mission_label')}</span>{' '}
              {t('mission_text')}{' '}
              <span className="font-semibold text-[#1a2b4a]">{t('vision_label')}</span>{' '}
              {t('vision_text')}
            </p>
          </div>
          <div className="relative aspect-4/3 overflow-hidden rounded-2xl shadow-xl">
            <Image
              src="/images/modern-luxury-villa-pool-medulin.jpg"
              alt="Luxury villa with pool in Morocco"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-[#1a2b4a] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-2xl font-bold text-white sm:text-3xl">
            {t('values_title')}
          </h2>
          <div className="mx-auto mt-2 h-1 w-16 rounded-full bg-[#c9a84c]" />
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {values.map((value) => (
              <div
                key={value.title}
                className="rounded-xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-sm"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#1a2b4a] text-[#c9a84c] ring-2 ring-[#c9a84c]/40">
                  {value.icon}
                </div>
                <h3 className="mt-4 text-lg font-bold text-white">
                  {value.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-300">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-gray-50 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-2xl font-bold text-[#1a2b4a] sm:text-3xl">
            {t('why_title')}
          </h2>
          <div className="mx-auto mt-2 h-1 w-16 rounded-full bg-[#c9a84c]" />
          <div className="mt-10 grid grid-cols-2 gap-6 lg:grid-cols-4">
            {highlights.map((item) => (
              <CounterItem key={item.label} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsSlider />
    </div>
  )
}
