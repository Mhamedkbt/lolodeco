'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useTranslations, useLocale } from 'next-intl'

export const dynamic = 'force-dynamic'

const isVideoUrl = (url: string): boolean => {
  return /\.(mp4|webm|mov|avi|quicktime)(\?|$)/i.test(url)
}

interface Property {
  id: string
  title: string | null
  city: string | null
  price: number | null
  surface: number | null
  rooms: number | null
  type: string | null
  status: string | null
  images: string[] | null
  featured: boolean | null
  description: string | null
  created_at: string | null
}

interface ContactForm {
  name: string
  email: string
  phone: string
  message: string
}

export default function PropertyPage() {
  const params = useParams()
  const router = useRouter()
  const id = typeof params.id === 'string' ? params.id : ''
  const locale = useLocale()
  const t = useTranslations("property_detail")

  const [property, setProperty] = useState<Property | null>(null)
  const [similarProperties, setSimilarProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [activeImage, setActiveImage] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [formSent, setFormSent] = useState(false)
  const [formSending, setFormSending] = useState(false)
  const [formError, setFormError] = useState('')
  const [form, setForm] = useState<ContactForm>({
    name: '',
    email: '',
    phone: '',
    message: '',
  })

  useEffect(() => {
    if (!id) return

    const fetchProperty = async () => {
      setLoading(true)

      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) {
        console.error('Property not found:', error)
        setNotFound(true)
        setLoading(false)
        return
      }

      setProperty(data)
      setActiveImage(0)

      const { data: similar } = await supabase
        .from('properties')
        .select('*')
        .eq('type', data.type ?? '')
        .neq('id', id)
        .limit(3)

      if (!similar || similar.length === 0) {
        const { data: others } = await supabase
          .from('properties')
          .select('*')
          .neq('id', id)
          .limit(3)
        setSimilarProperties(others ?? [])
      } else {
        setSimilarProperties(similar)
      }

      setLoading(false)
    }

    fetchProperty()
  }, [id])

  useEffect(() => {
    if (!lightboxOpen || !property?.images || property.images.length === 0)
      return

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false)
      if (e.key === 'ArrowRight') {
        setLightboxIndex(
          (prev) => (prev + 1) % (property.images?.length ?? 1)
        )
      }
      if (e.key === 'ArrowLeft') {
        setLightboxIndex(
          (prev) =>
            (prev - 1 + (property.images?.length ?? 1)) %
            (property.images?.length ?? 1)
        )
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightboxOpen, property?.images])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormSending(true)
    setFormError('')

    const { error } = await supabase.from('messages').insert({
      name: form.name,
      email: form.email,
      phone: form.phone,
      message: `[Property: ${property?.title ?? id}] ${form.message}`,
      read: false,
    })

    if (error) {
      console.error('Error sending message:', error)
      setFormError(t('form_error'))
      setFormSending(false)
      return
    }

    setFormSent(true)
    setFormSending(false)
    setForm({ name: '', email: '', phone: '', message: '' })
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#c9a84c] border-t-transparent" />
          <p className="mt-4 text-gray-500">{t('loading')}</p>
        </div>
      </div>
    )
  }

  if (notFound || !property) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
        <div className="text-center">
          <div className="rounded-full bg-gray-100 p-6 mx-auto w-fit mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-12 h-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#1a2b4a]">
            {t('property_not_found')}
          </h1>
          <p className="mt-2 text-gray-500">
            {t('not_found_desc')}
          </p>
          <Link
            href={`/${locale}/properties`}
            className="mt-6 inline-block rounded-lg bg-[#c9a84c] px-8 py-3 font-semibold text-[#1a2b4a] hover:bg-[#d4b85e] transition-colors"
          >
            {t('browse_all')}
          </Link>
        </div>
      </div>
    )
  }

  const images =
    property.images && property.images.length > 0 ? property.images : []
  const hasImages = images.length > 0

  // Shared inner details UI component content to keep the layout synchronized
  const propertyDetailsCardContent = (
    <>
      <p className="text-3xl font-bold text-[#c9a84c] sm:text-4xl">
        {property.price
          ? `${property.price.toLocaleString()} MAD`
          : t('price_on_request')}
      </p>

      <ul className="mt-6 space-y-4">
        {[
          { label: t('rooms'), value: property.rooms ?? '—' },
          { label: t('surface'), value: property.surface ? `${property.surface} m²` : '—' },
          { label: t('type'), value: property.type ?? '—' },
          { label: t('status'), value: property.status ?? '—' },
          { label: t('city'), value: property.city ?? '—' },
        ].map((detail) => (
          <li
            key={detail.label}
            className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0"
          >
            <span className="text-sm text-gray-500">{detail.label}</span>
            <span className="text-sm font-semibold text-[#1a2b4a] capitalize">{detail.value}</span>
          </li>
        ))}
      </ul>

      <a
        href={`https://wa.me/212661141811?text=Hello, I'm interested in the property: ${encodeURIComponent(property.title ?? '')} - ${encodeURIComponent(`${process.env.NEXT_PUBLIC_APP_URL}/properties/${property.id}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#20bd5a]"
      >
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        {t('contact_whatsapp')}
      </a>
    </>
  )

  // Shared Request Information Form Content to avoid repeating markup
  const requestInfoFormContent = (
    <>
      <h3 className="text-lg font-bold text-[#1a2b4a]">
        {t('request_information')}
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        {t('fill_form')}
      </p>

      {formSent ? (
        <div className="mt-6 rounded-lg bg-green-50 px-4 py-4 text-center">
          <p className="text-sm font-semibold text-green-700">
            ✅ {t('message_sent')}
          </p>
          <p className="mt-1 text-xs text-green-600">
            {t('message_sent_sub')}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {formError && (
            <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">
              {formError}
            </p>
          )}
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-[#1a2b4a]">
              {t('name')}
            </label>
            <input
              id="name"
              type="text"
              required
              placeholder={t('name_placeholder')}
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-[#1a2b4a] placeholder:text-gray-400 focus:border-[#c9a84c] focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/30"
            />
          </div>
          <div>
            <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-[#1a2b4a]">
              {t('phone')}
            </label>
            <input
              id="phone"
              type="tel"
              required
              placeholder={t('phone_placeholder')}
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-[#1a2b4a] placeholder:text-gray-400 focus:border-[#c9a84c] focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/30"
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[#1a2b4a]">
              {t('email')}
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder={t('email_placeholder')}
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-[#1a2b4a] placeholder:text-gray-400 focus:border-[#c9a84c] focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/30"
            />
          </div>
          <div>
            <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-[#1a2b4a]">
              {t('message')}
            </label>
            <textarea
              id="message"
              required
              rows={4}
              placeholder={t('message_placeholder')}
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              className="w-full resize-none rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-[#1a2b4a] placeholder:text-gray-400 focus:border-[#c9a84c] focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/30"
            />
          </div>
          <button
            type="submit"
            disabled={formSending}
            className="w-full rounded-lg bg-[#c9a84c] px-6 py-3 text-sm font-semibold text-[#1a2b4a] transition-colors hover:bg-[#d4b85e] focus:outline-none focus:ring-2 focus:ring-[#c9a84c] focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {formSending ? t('sending') : t('send_message')}
          </button>
        </form>
      )}
    </>
  )

  return (
    <div className="bg-white">
      <section className="relative h-[45vh] min-h-[320px] w-full sm:h-[50vh] lg:h-[55vh]">
        {hasImages ? (
          isVideoUrl(images[0]) ? (
            <video
              src={images[0]}
              className="h-full w-full object-cover"
              muted
              autoPlay
              loop
              playsInline
              preload="metadata"
            />
          ) : (
            <img
              src={images[0]}
              alt={property.title ?? 'Property'}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          )
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-[#1a2b4a] to-[#2a3b5a] flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-20 h-20 text-white/20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a2b4a]/90 via-[#1a2b4a]/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 px-4 pb-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <p className="text-sm font-medium uppercase tracking-wider text-[#c9a84c]">
              {property.city ?? '—'} · {property.type ?? '—'}
            </p>
            <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              {property.title ?? t('property_details')}
            </h1>
          </div>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-12">
          
          {/* MAIN LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-8">
            {hasImages && (
              <div>
                <div
                  className="relative h-72 overflow-hidden rounded-xl sm:h-96 lg:h-[420px] cursor-zoom-in group"
                  onClick={() => {
                    setLightboxIndex(activeImage)
                    setLightboxOpen(true)
                  }}
                >
                  {isVideoUrl(images[activeImage]) ? (
                    <video
                      src={images[activeImage]}
                      className="h-full w-full object-cover rounded-xl"
                      controls
                      playsInline
                      preload="metadata"
                    />
                  ) : (
                    <img
                      src={images[activeImage]}
                      alt={`${property.title} photo ${activeImage + 1}`}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onClick={() => { setLightboxIndex(activeImage); setLightboxOpen(true) }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  )}
                  {images.length > 1 && (
                    <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
                      {activeImage + 1} / {images.length}
                    </div>
                  )}
                </div>

                {images.length > 1 && (
                  <div className="mt-3 grid grid-cols-4 gap-3">
                    {images.slice(0, 4).map((src, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setActiveImage(index)}
                        className={`relative h-20 overflow-hidden rounded-lg sm:h-24 transition-all duration-200 ${
                          activeImage === index
                            ? 'ring-2 ring-[#c9a84c] ring-offset-2 opacity-100'
                            : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        {isVideoUrl(src) ? (
                          <div className="relative h-full w-full">
                            <video
                              src={src}
                              className="h-full w-full object-cover"
                              muted
                              preload="metadata"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                            </div>
                          </div>
                        ) : (
                          <img
                            src={src}
                            alt={`${property.title} thumbnail ${index + 1}`}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.parentElement!.style.display = 'none'
                            }}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* MOBILE ONLY: Price and Details Box */}
            <div className="block lg:hidden rounded-xl border border-gray-100 bg-white p-6 shadow-lg">
              {propertyDetailsCardContent}
            </div>

            {/* DESCRIPTION SECTION */}
            <div>
              <h2 className="text-2xl font-bold text-[#1a2b4a] sm:text-3xl">
                {t('description')}
              </h2>
              <div className="mt-2 h-1 w-16 rounded-full bg-[#c9a84c]" />
              <p className="whitespace-pre-line text-[#1a2b4a] leading-relaxed">
  {property.description}
</p>
              <p className="mt-4 leading-relaxed text-gray-600">
                {t('viewing_text')}
              </p>
            </div>

            {/* MOBILE ONLY: Request Information Box (Appears precisely here, after description, on mobile) */}
            <div className="block lg:hidden rounded-xl border border-gray-100 bg-white p-6 shadow-lg">
              {requestInfoFormContent}
            </div>

            {/* SIMILAR PROPERTIES */}
            {similarProperties.length > 0 && (
              <div className="mt-14">
                <h2 className="text-2xl font-bold text-[#1a2b4a] sm:text-3xl">
                  {t('similar_properties')}
                </h2>
                <div className="mt-2 h-1 w-16 rounded-full bg-[#c9a84c]" />
                <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {similarProperties.map((item) => (
                    <article
                      key={item.id}
                      className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl"
                    >
                      {item.images && item.images.length > 0 ? (
                        isVideoUrl(item.images[0]) ? (
                          <div className="relative h-40 w-full overflow-hidden">
                            <video
                              src={item.images[0]}
                              className="h-full w-full object-cover"
                              muted
                              autoPlay
                              loop
                              playsInline
                              preload="metadata"
                            />
                            <div className="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                              VIDEO
                            </div>
                          </div>
                        ) : (
                          <img
                            src={item.images[0]}
                            alt={item.title ?? 'Property'}
                            className="h-40 w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        )
                      ) : (
                        <div className="h-40 w-full bg-gradient-to-br from-[#1a2b4a] to-[#2a3b5a] flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                        </div>
                      )}
                      <div className="p-4">
                        {item.type && (
                          <span className="rounded-full bg-[#1a2b4a] px-2.5 py-0.5 text-xs font-medium text-white capitalize">
                            {item.type}
                          </span>
                        )}
                        <h3 className="mt-2 font-semibold text-[#1a2b4a] line-clamp-1">
                          {item.title ?? 'Property'}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {item.city ?? '—'} · {item.surface ? `${item.surface} m²` : '—'}
                        </p>
                        <p className="mt-2 font-bold text-[#c9a84c]">
                          {item.price ? `${item.price.toLocaleString()} MAD` : t('price_on_request')}
                        </p>
                        <Link
                          href={`/${locale}/properties/${item.id}`}
                          className="mt-3 block w-full rounded-lg bg-[#c9a84c] py-2.5 text-center text-sm font-semibold text-[#1a2b4a] transition-colors hover:bg-[#d4b85e]"
                        >
                          {t('view_details')}
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* DESKTOP STICKY ASIDE COLUMN */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              
              {/* PC ONLY: Price and Details Box (Hidden on mobile devices completely) */}
              <div className="hidden lg:block rounded-xl border border-gray-100 bg-white p-6 shadow-lg">
                {propertyDetailsCardContent}
              </div>

              {/* PC ONLY: REQUEST INFORMATION FORM */}
              <div className="hidden lg:block rounded-xl border border-gray-100 bg-white p-6 shadow-lg">
                {requestInfoFormContent}
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* LIGHTBOX CODE REMAINED PERFECTLY UNTOUCHED */}
      {lightboxOpen && images.length > 0 && (
        <div
          className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-white/15 backdrop-blur-sm text-white text-sm px-4 py-1.5 rounded-full z-10 select-none">
            {lightboxIndex + 1} / {images.length}
          </div>

          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/25 text-white rounded-full p-2.5 transition-all duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setLightboxIndex((prev) => (prev - 1 + images.length) % images.length)
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/25 text-white rounded-full p-3 transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {isVideoUrl(images[lightboxIndex]) ? (
            <video
              src={images[lightboxIndex]}
              className="max-w-[88vw] max-h-[80vh] rounded-lg shadow-2xl"
              controls
              autoPlay
              playsInline
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <img
              src={images[lightboxIndex]}
              alt={`${property?.title} photo ${lightboxIndex + 1}`}
              className="max-w-[88vw] max-h-[80vh] object-contain select-none rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          )}

          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setLightboxIndex((prev) => (prev + 1) % images.length)
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/25 text-white rounded-full p-3 transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {images.length > 1 && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {images.map((url, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation()
                    setLightboxIndex(index)
                  }}
                  className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all duration-200 flex-shrink-0 ${
                    index === lightboxIndex
                      ? 'border-[#c9a84c] opacity-100 scale-110'
                      : 'border-white/20 opacity-50 hover:opacity-80'
                  }`}
                >
                  {isVideoUrl(url) ? (
                    <div className="relative w-full h-full">
                      <video src={url} className="w-full h-full object-cover" muted preload="metadata" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <img src={url} alt={`Thumb ${index + 1}`} className="w-full h-full object-cover" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// description
