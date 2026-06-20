'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getCategoryFilterValues, getCategoryLabel } from '@/lib/categories'
import { getUnitLabel } from '@/lib/units'
import { useTranslations, useLocale } from 'next-intl'

export const dynamic = 'force-dynamic'

const WHATSAPP_NUMBER = '212660546352'

const isVideoUrl = (url: string): boolean => {
  return /\.(mp4|webm|mov|avi|quicktime)(\?|$)/i.test(url)
}

interface Product {
  id: string
  title: string | null
  slug: string | null
  description: string | null
  category: string | null
  dimensions: string | null
  thickness: string | null
  price: number | null
  price_unit: string | null
  is_promotion: boolean | null
  promo_price: number | null
  free_delivery: boolean | null
  stock_status: string | null
  is_visible: boolean | null
  images: string[] | null
  created_at: string | null
}

interface ContactForm {
  name: string
  email: string
  phone: string
  message: string
}

export default function ProductPage() {
  const params = useParams()
  const id = typeof params.id === 'string' ? params.id : ''
  const locale = useLocale()
  const t = useTranslations('product_detail')

  const [product, setProduct] = useState<Product | null>(null)
  const [similarProducts, setSimilarProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [activeImage, setActiveImage] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [formSent, setFormSent] = useState(false)
  const [formSending, setFormSending] = useState(false)
  const [formError, setFormError] = useState('')
  const [form, setForm] = useState<ContactForm>({ name: '', email: '', phone: '', message: '' })

  useEffect(() => {
    if (!id) return

    const fetchProduct = async () => {
      setLoading(true)
      const { data, error } = await supabase.from('products').select('*').eq('id', id).single()

      if (error || !data) {
        console.error('Product not found:', error)
        setNotFound(true)
        setLoading(false)
        return
      }

      setProduct(data)
      setActiveImage(0)

      const categoryValues = data.category ? getCategoryFilterValues(data.category) : []
      const similarQuery = supabase
        .from('products')
        .select('*')
        .eq('is_visible', true)
        .neq('id', id)
        .limit(3)

      const { data: similar } =
        categoryValues.length > 0
          ? await similarQuery.in('category', categoryValues)
          : await similarQuery

      if (!similar || similar.length === 0) {
        const { data: others } = await supabase
          .from('products')
          .select('*')
          .eq('is_visible', true)
          .neq('id', id)
          .limit(3)
        setSimilarProducts(others ?? [])
      } else {
        setSimilarProducts(similar)
      }

      setLoading(false)
    }

    fetchProduct()
  }, [id])

  useEffect(() => {
    if (!lightboxOpen || !product?.images || product.images.length === 0) return

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false)
      if (e.key === 'ArrowRight') setLightboxIndex((prev) => (prev + 1) % (product.images?.length ?? 1))
      if (e.key === 'ArrowLeft')
        setLightboxIndex((prev) => (prev - 1 + (product.images?.length ?? 1)) % (product.images?.length ?? 1))
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightboxOpen, product?.images])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormSending(true)
    setFormError('')

    const { error } = await supabase.from('messages').insert({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      message: `[Produit: ${product?.title ?? id}] ${form.message.trim()}`,
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

  function buildWhatsappOrderUrl(p: Product): string {
    const origin =
      typeof window !== 'undefined'
        ? window.location.origin
        : process.env.NEXT_PUBLIC_APP_URL ?? 'https://lolodeco.ma'
    const link = `${origin}/${locale}/products/${p.id}`
    const hasPromo = p.is_promotion && p.promo_price != null
    const priceShown = hasPromo ? p.promo_price : p.price
    const priceLine = priceShown != null ? `${priceShown.toLocaleString()} MAD / ${p.price_unit ?? 'pièce'}` : '—'
    const lines = [
      'Bonjour Lolo Deco, je souhaite commander ce produit :',
      '',
      `🛍️ ${p.title ?? ''}`,
      p.category ? `📂 ${getCategoryLabel(p.category, locale)}` : '',
      p.dimensions ? `📏 ${p.dimensions}` : '',
      `💰 ${priceLine}`,
      '',
      `🔗 ${link}`,
    ].filter(Boolean)
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#EFBA1C] border-t-transparent" />
          <p className="mt-4 text-gray-500">{t('loading')}</p>
        </div>
      </div>
    )
  }

  if (notFound || !product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 w-fit rounded-full bg-gray-100 p-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#404040]">{t('property_not_found')}</h1>
          <p className="mt-2 text-gray-500">{t('not_found_desc')}</p>
          <Link href={`/${locale}/products`} className="mt-6 inline-block rounded-lg bg-[#EFBA1C] px-8 py-3 font-semibold text-[#404040] transition-colors hover:bg-[#F0C040]">
            {t('browse_all')}
          </Link>
        </div>
      </div>
    )
  }

  const images = product.images && product.images.length > 0 ? product.images : []
  const hasImages = images.length > 0
  const hasPromo = product.is_promotion && product.promo_price != null
  const priceShown = hasPromo ? product.promo_price : product.price

  const detailsCardContent = (
    <>
      <div className="flex flex-wrap items-end gap-2">
        {priceShown != null ? (
          <>
            <p className="text-3xl font-bold text-[#EFBA1C] sm:text-4xl">{priceShown.toLocaleString()} MAD</p>
            <span className="mb-1 text-sm text-gray-400">/ {getUnitLabel(product.price_unit, locale)}</span>
            {hasPromo && product.price != null && (
              <span className="mb-1 ml-1 text-lg text-gray-400 line-through">{product.price.toLocaleString()}</span>
            )}
          </>
        ) : (
          <p className="text-2xl font-bold text-gray-500">{t('price_on_request')}</p>
        )}
      </div>

      {product.free_delivery && (
        <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-6m0 0V6.75A1.125 1.125 0 009.375 5.625H4.5m0 0V3.75m0 1.875h.75" />
          </svg>
          {t('free_delivery')}
        </p>
      )}

      <ul className="mt-6 space-y-4">
        {[
          { label: t('category'), value: product.category ? getCategoryLabel(product.category, locale) : '—' },
          { label: t('dimensions'), value: product.dimensions ?? '—' },
          { label: t('thickness'), value: product.thickness ?? '—' },
          {
            label: t('availability'),
            value: product.stock_status === 'out_of_stock' ? t('out_of_stock') : t('in_stock'),
          },
        ].map((detail) => (
          <li key={detail.label} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
            <span className="text-sm text-gray-500">{detail.label}</span>
            <span className="text-sm font-semibold capitalize text-[#404040]">{detail.value}</span>
          </li>
        ))}
      </ul>

      <a
        href={buildWhatsappOrderUrl(product)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#20bd5a]"
      >
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        {t('order_whatsapp')}
      </a>
    </>
  )

  const requestInfoFormContent = (
    <>
      <h3 className="text-lg font-bold text-[#404040]">{t('request_information')}</h3>
      <p className="mt-1 text-sm text-gray-500">{t('fill_form')}</p>

      {formSent ? (
        <div className="mt-6 rounded-lg bg-green-50 px-4 py-4 text-center">
          <p className="text-sm font-semibold text-green-700">✅ {t('message_sent')}</p>
          <p className="mt-1 text-xs text-green-600">{t('message_sent_sub')}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {formError && <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{formError}</p>}
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-[#404040]">{t('name')}</label>
            <input id="name" type="text" required placeholder={t('name_placeholder')} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-[#404040] placeholder:text-gray-400 focus:border-[#EFBA1C] focus:outline-none focus:ring-2 focus:ring-[#EFBA1C]/30" />
          </div>
          <div>
            <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-[#404040]">{t('phone')}</label>
            <input id="phone" type="tel" required placeholder={t('phone_placeholder')} value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-[#404040] placeholder:text-gray-400 focus:border-[#EFBA1C] focus:outline-none focus:ring-2 focus:ring-[#EFBA1C]/30" />
          </div>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[#404040]">{t('email')}</label>
            <input id="email" type="email" required placeholder={t('email_placeholder')} value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-[#404040] placeholder:text-gray-400 focus:border-[#EFBA1C] focus:outline-none focus:ring-2 focus:ring-[#EFBA1C]/30" />
          </div>
          <div>
            <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-[#404040]">{t('message')}</label>
            <textarea id="message" required rows={4} placeholder={t('message_placeholder')} value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} className="w-full resize-none rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-[#404040] placeholder:text-gray-400 focus:border-[#EFBA1C] focus:outline-none focus:ring-2 focus:ring-[#EFBA1C]/30" />
          </div>
          <button type="submit" disabled={formSending} className="w-full rounded-lg bg-[#EFBA1C] px-6 py-3 text-sm font-semibold text-[#404040] transition-colors hover:bg-[#F0C040] disabled:cursor-not-allowed disabled:opacity-60">
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
            <video src={images[0]} className="h-full w-full object-cover" muted autoPlay loop playsInline preload="metadata" />
          ) : (
            <Image src={images[0]} alt={product.title ?? 'Produit'} fill priority sizes="100vw" className="object-cover" />
          )
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#404040] to-[#606060]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#404040]/90 via-[#404040]/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 px-4 pb-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <p className="text-sm font-medium uppercase tracking-wider text-[#EFBA1C]">{product.category ? getCategoryLabel(product.category, locale) : '—'}</p>
            <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">{product.title ?? t('property_details')}</h1>
          </div>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-12">
          <div className="space-y-8 lg:col-span-2">
            {hasImages && (
              <div>
                <div
                  className="group relative h-72 cursor-zoom-in overflow-hidden rounded-xl sm:h-96 lg:h-[420px]"
                  onClick={() => {
                    setLightboxIndex(activeImage)
                    setLightboxOpen(true)
                  }}
                >
                  {isVideoUrl(images[activeImage]) ? (
                    <video src={images[activeImage]} className="h-full w-full rounded-xl object-cover" controls playsInline preload="metadata" />
                  ) : (
                    <Image src={images[activeImage]} alt={`${product.title} photo ${activeImage + 1}`} fill sizes="(max-width: 1024px) 100vw, 66vw" className="object-cover transition-transform duration-300 group-hover:scale-105" />
                  )}
                  {images.length > 1 && (
                    <div className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
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
                        className={`relative h-20 overflow-hidden rounded-lg transition-all duration-200 sm:h-24 ${
                          activeImage === index ? 'opacity-100 ring-2 ring-[#EFBA1C] ring-offset-2' : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        {isVideoUrl(src) ? (
                          <div className="relative h-full w-full">
                            <video src={src} className="h-full w-full object-cover" muted preload="metadata" />
                            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/40">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>
                        ) : (
                          <Image src={src} alt={`${product.title} thumbnail ${index + 1}`} fill sizes="96px" className="object-cover" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="block rounded-xl border border-gray-100 bg-white p-6 shadow-lg lg:hidden">{detailsCardContent}</div>

            <div>
              <h2 className="text-2xl font-bold text-[#404040] sm:text-3xl">{t('description')}</h2>
              <div className="mt-2 h-1 w-16 rounded-full bg-[#EFBA1C]" />
              <p className="mt-4 whitespace-pre-line leading-relaxed text-[#404040]">{product.description}</p>
              <p className="mt-4 leading-relaxed text-gray-600">{t('viewing_text')}</p>
            </div>

            <div className="block rounded-xl border border-gray-100 bg-white p-6 shadow-lg lg:hidden">{requestInfoFormContent}</div>

            {similarProducts.length > 0 && (
              <div className="mt-14">
                <h2 className="text-2xl font-bold text-[#404040] sm:text-3xl">{t('similar_properties')}</h2>
                <div className="mt-2 h-1 w-16 rounded-full bg-[#EFBA1C]" />
                <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {similarProducts.map((item) => {
                    const itemPromo = item.is_promotion && item.promo_price != null
                    const itemPrice = itemPromo ? item.promo_price : item.price
                    return (
                      <article key={item.id} className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl">
                        {item.images && item.images.length > 0 ? (
                          isVideoUrl(item.images[0]) ? (
                            <div className="relative h-40 w-full overflow-hidden">
                              <video src={item.images[0]} className="h-full w-full object-cover" muted autoPlay loop playsInline preload="metadata" />
                            </div>
                          ) : (
                            <div className="relative h-40 w-full overflow-hidden">
                              <Image src={item.images[0]} alt={item.title ?? 'Produit'} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" />
                            </div>
                          )
                        ) : (
                          <div className="flex h-40 w-full items-center justify-center bg-gradient-to-br from-[#404040] to-[#606060]" />
                        )}
                        <div className="p-4">
                          {item.category && (
                            <span className="rounded-full bg-[#404040] px-2.5 py-0.5 text-xs font-medium capitalize text-white">{getCategoryLabel(item.category, locale)}</span>
                          )}
                          <h3 className="mt-2 font-semibold text-[#404040] line-clamp-1">{item.title ?? 'Produit'}</h3>
                          <p className="mt-2 font-bold text-[#EFBA1C]">
                            {itemPrice != null ? `${itemPrice.toLocaleString()} MAD` : t('price_on_request')}
                          </p>
                          <Link href={`/${locale}/products/${item.id}`} className="mt-3 block w-full rounded-lg bg-[#EFBA1C] py-2.5 text-center text-sm font-semibold text-[#404040] transition-colors hover:bg-[#F0C040]">
                            {t('view_details')}
                          </Link>
                        </div>
                      </article>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="hidden rounded-xl border border-gray-100 bg-white p-6 shadow-lg lg:block">{detailsCardContent}</div>
              <div className="hidden rounded-xl border border-gray-100 bg-white p-6 shadow-lg lg:block">{requestInfoFormContent}</div>
            </div>
          </aside>
        </div>
      </section>

      {lightboxOpen && images.length > 0 && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black" onClick={() => setLightboxOpen(false)}>
          <div className="absolute left-1/2 top-5 z-10 -translate-x-1/2 select-none rounded-full bg-white/15 px-4 py-1.5 text-sm text-white backdrop-blur-sm">
            {lightboxIndex + 1} / {images.length}
          </div>
          <button onClick={() => setLightboxOpen(false)} className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2.5 text-white transition-all duration-200 hover:bg-white/25">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setLightboxIndex((prev) => (prev - 1 + images.length) % images.length)
              }}
              className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-all duration-200 hover:bg-white/25"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          {isVideoUrl(images[lightboxIndex]) ? (
            <video src={images[lightboxIndex]} className="max-h-[80vh] max-w-[88vw] rounded-lg shadow-2xl" controls autoPlay playsInline onClick={(e) => e.stopPropagation()} />
          ) : (
            <Image src={images[lightboxIndex]} alt={`${product?.title} photo ${lightboxIndex + 1}`} width={1200} height={800} sizes="88vw" className="max-h-[80vh] max-w-[88vw] select-none rounded-lg object-contain shadow-2xl" onClick={(e) => e.stopPropagation()} />
          )}
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setLightboxIndex((prev) => (prev + 1) % images.length)
              }}
              className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-all duration-200 hover:bg-white/25"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
