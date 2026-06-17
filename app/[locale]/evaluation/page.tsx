'use client'

import { FormEvent, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { TestimonialsSlider } from "@/components/TestimonialsSlider";
import { useTranslations } from 'next-intl'

export const dynamic = 'force-dynamic'

const isVideoFile = (file: File): boolean => file.type.startsWith('video/')

const inputClassName =
  'w-full rounded-lg border border-gray-200 px-4 py-3 text-[#1a2b4a] placeholder:text-gray-400 focus:border-[#c9a84c] focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/30'

const labelClassName = 'mb-1.5 block text-sm font-medium text-[#1a2b4a]'

const stepIcons = [
  (
    <svg
      className="h-7 w-7"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
      />
    </svg>
  ),
  (
    <svg
      className="h-7 w-7"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 11.25v1.5m3-1.5v1.5m-3-6.75h.008v.008H12V8.25zm3 0h.008v.008H15V8.25z"
      />
    </svg>
  ),
  (
    <svg
      className="h-7 w-7"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.023.55m0 0l-4.66 2.51m16.5 1.615a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.844a2.25 2.25 0 011.183-1.981l7.5-4.031a2.25 2.25 0 012.134 0l7.5 4.031a2.25 2.25 0 011.183 1.98V19.5z"
      />
    </svg>
  ),
]

const stepKeys = [
  { title: 'step1_title', description: 'step1_desc' },
  { title: 'step2_title', description: 'step2_desc' },
  { title: 'step3_title', description: 'step3_desc' },
] as const

export default function EvaluationPage() {
  const t = useTranslations("evaluation");
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formSent, setFormSent] = useState(false)
  const [formSending, setFormSending] = useState(false)
  const [formError, setFormError] = useState('')
  const [uploadProgress, setUploadProgress] = useState('')

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [propertyType, setPropertyType] = useState('')
  const [city, setCity] = useState('')
  const [surface, setSurface] = useState('')
  const [desiredPrice, setDesiredPrice] = useState('')
  const [notes, setNotes] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files ?? [])
    if (newFiles.length === 0) return

    setSelectedFiles((prev) => {
      const existing = prev.map((f) => `${f.name}-${f.size}`)
      const filtered = newFiles.filter(
        (f) => !existing.includes(`${f.name}-${f.size}`)
      )
      return [...prev, ...filtered]
    })

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormSending(true)
    setFormError('')
    setUploadProgress('')

    // eslint-disable-next-line prefer-const
    let photoUrls: string[] = []

    if (selectedFiles.length > 0) {
      setUploadProgress(t('upload_progress', { count: selectedFiles.length }))

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('evaluations')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
          })

        if (uploadError) {
          console.error('Upload error:', uploadError)
          setFormError(t('upload_error'))
          setFormSending(false)
          setUploadProgress('')
          return
        }

        const { data: urlData } = supabase.storage
          .from('evaluations')
          .getPublicUrl(fileName)

        if (urlData?.publicUrl) {
          photoUrls.push(urlData.publicUrl)
        }

        setUploadProgress(t('uploaded_progress', { current: i + 1, total: selectedFiles.length }))
      }
    }

    setUploadProgress(t('saving_request'))

    const { error: insertError } = await supabase
      .from('evaluations')
      .insert({
        name: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        type: propertyType,
        location: city.trim(),
        surface: surface ? parseFloat(surface) : null,
        desired_price: desiredPrice ? parseFloat(desiredPrice) : null,
        notes: notes.trim() || null,
        photos: photoUrls.length > 0 ? photoUrls : [],
        status: 'pending',
      })

    if (insertError) {
      console.error('Insert error:', insertError)
      setFormError(t('submit_error'))
      setFormSending(false)
      setUploadProgress('')
      return
    }

    setFormSent(true)
    setFormSending(false)
    setUploadProgress('')

    setFullName('')
    setPhone('')
    setEmail('')
    setPropertyType('')
    setCity('')
    setSurface('')
    setDesiredPrice('')
    setNotes('')
    setSelectedFiles([])
  }

  return (
    <div>
      <section className="bg-[#1a2b4a] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            {t('request_evaluation')}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-300">
            {t('discover_value')}
          </p>
        </div>
      </section>

      <section className="bg-white px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-2xl">
          {formSent ? (
            <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
                <svg
                  className="h-7 w-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              </div>
              <p className="mt-4 text-xl font-semibold text-green-800">
                {t('request_submitted')}
              </p>
              <p className="mt-2 text-gray-600">
                {t('thank_you_evaluation')}
              </p>
              <button
                onClick={() => setFormSent(false)}
                className="mt-6 rounded-lg border border-green-300 px-6 py-2.5 text-sm font-medium text-green-700 hover:bg-green-100 transition-colors"
              >
                {t('submit_another')}
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg sm:p-8"
            >
              <div className="space-y-5">
                <div>
                  <label htmlFor="fullName" className={labelClassName}>
                    {t('full_name')}
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    required
                    placeholder={t('name_placeholder')}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={inputClassName}
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="phone" className={labelClassName}>
                      {t('phone')}
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      required
                      placeholder={t('phone_placeholder')}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={inputClassName}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className={labelClassName}>
                      {t('email')}
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      placeholder={t('email_placeholder')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputClassName}
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="propertyType" className={labelClassName}>
                      {t('property_type')}
                    </label>
                    <select
                      id="propertyType"
                      required
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                      className={inputClassName}
                    >
                      <option value="">{t('select_type')}</option>
                      <option value="apartment">{t('apartment')}</option>
                      <option value="villa">{t('villa')}</option>
                      <option value="land">{t('land')}</option>
                      <option value="commercial">{t('commercial')}</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="city" className={labelClassName}>
                      {t('city_location')}
                    </label>
                    <input
                      id="city"
                      type="text"
                      required
                      placeholder={t('city_placeholder')}
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className={inputClassName}
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="surface" className={labelClassName}>
                      {t('surface')}
                    </label>
                    <input
                      id="surface"
                      type="number"
                      required
                      min={1}
                      placeholder={t('surface_placeholder')}
                      value={surface}
                      onChange={(e) => setSurface(e.target.value)}
                      className={inputClassName}
                    />
                  </div>
                  <div>
                    <label htmlFor="desiredPrice" className={labelClassName}>
                      {t('desired_price')}
                    </label>
                    <input
                      id="desiredPrice"
                      type="number"
                      min={0}
                      placeholder={t('price_placeholder')}
                      value={desiredPrice}
                      onChange={(e) => setDesiredPrice(e.target.value)}
                      className={inputClassName}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="notes" className={labelClassName}>
                    {t('additional_notes')}
                  </label>
                  <textarea
                    id="notes"
                    rows={4}
                    placeholder={t('notes_placeholder')}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className={`${inputClassName} resize-none`}
                  />
                </div>

                <div>
  <label className={labelClassName}>
    {t('upload_photos')}
  </label>

  <div
    className="relative w-full rounded-lg border-2 border-dashed border-gray-200 
               bg-gray-50 px-4 py-6 text-center hover:border-[#c9a84c] 
               hover:bg-[#c9a84c]/5 transition-all duration-200 cursor-pointer"
    onClick={() => fileInputRef.current?.click()}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto h-8 w-8 text-gray-400 mb-2"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
      />
    </svg>
    <p className="text-sm font-medium text-[#1a2b4a]">
      {t('upload_click')}
    </p>
    <p className="text-xs text-gray-500 mt-1">
      {t('upload_hint')}
    </p>
    <input
      ref={fileInputRef}
      name="photos"
      type="file"
      accept="image/*"
      multiple
      className="hidden"
      onChange={handleFileChange}
    />
  </div>

  {selectedFiles.length > 0 && (
    <div className="mt-3">
      <div className="flex flex-wrap gap-2">
        {selectedFiles.map((file, index) => (
          <div
            key={`${file.name}-${file.size}-${index}`}
            className="relative h-20 w-20 overflow-visible rounded-lg 
                       border-2 border-gray-200 flex-shrink-0 bg-white"
          >
            {/* Wrapper to handle rounded corners inside overflow-visible block */}
            <div className="w-full h-full rounded-md overflow-hidden relative">
              {isVideoFile(file) ? (
                <div className="relative h-full w-full bg-gray-900 
                                flex items-center justify-center overflow-hidden">
                  <video
                    src={URL.createObjectURL(file)}
                    className="h-full w-full object-cover"
                    muted
                    preload="metadata"
                  />
                  <div className="absolute inset-0 flex items-center 
                                  justify-center bg-black/40">
                    <svg xmlns="http://www.w3.org/2000/svg"
                         className="w-5 h-5 text-white" fill="currentColor"
                         viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 text-center
                                  bg-black/60 text-white text-[10px] py-0.5 font-medium">
                    {t('video')}
                  </div>
                </div>
              ) : (
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Preview ${index + 1}`}
                  className="h-full w-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                />
              )}

              {/* Number Badge */}
              <div className="absolute top-1 left-1 bg-black/50 text-white 
                              text-[10px] rounded-full w-4 h-4 flex items-center 
                              justify-center font-medium">
                {index + 1}
              </div>
            </div>

            {/* Absolute Fixed Delete Button - Visible constantly without hover */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                removeFile(index)
              }}
              className="absolute -top-1.5 -right-1.5 bg-red-500 hover:bg-red-600 text-white 
                         rounded-full w-5 h-5 flex items-center justify-center shadow-md 
                         transition-colors z-20"
              title={t('remove_file')}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="h-20 w-20 rounded-lg border-2 border-dashed border-gray-300 
                     flex flex-col items-center justify-center gap-1
                     hover:border-[#c9a84c] hover:bg-[#c9a84c]/5 
                     transition-all duration-200 flex-shrink-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span className="text-xs text-gray-400">{t('add_more')}</span>
        </button>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <p className="text-xs text-gray-500">
          {(() => {
            const videoCount = selectedFiles.filter(f => f.type.startsWith('video/')).length
            const imageCount = selectedFiles.length - videoCount
            const parts = []
            if (imageCount > 0) parts.push(t('photos_only', { count: imageCount }))
            if (videoCount > 0) parts.push(t('videos_only', { count: videoCount }))
            return parts.length === 2
              ? t('photos_selected', { images: parts[0], videos: parts[1] })
              : parts.join(' + ')
          })()}
        </p>
        <button
          type="button"
          onClick={() => {
            setSelectedFiles([])
            if (fileInputRef.current) fileInputRef.current.value = ''
          }}
          className="text-xs text-red-500 hover:text-red-700 
                     font-medium transition-colors"
        >
          {t('remove_all')}
        </button>
      </div>
    </div>
  )}
</div>

                {formError && (
                  <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                    <p className="text-sm text-red-600 font-medium">{formError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={formSending}
                  className="w-full rounded-lg bg-[#c9a84c] px-6 py-4 text-lg font-bold text-[#1a2b4a] shadow-md transition-colors hover:bg-[#d4b85e] focus:outline-none focus:ring-2 focus:ring-[#c9a84c] focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {formSending ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="h-5 w-5 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      {uploadProgress || t('submitting')}
                    </span>
                  ) : (
                    t('submit_evaluation')
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="mt-16">
            <h2 className="text-center text-2xl font-bold text-[#1a2b4a] sm:text-3xl">
              {t('how_it_works')}
            </h2>
            <div className="mx-auto mt-2 h-1 w-16 rounded-full bg-[#c9a84c]" />

            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {stepKeys.map((step, index) => (
                <div
                  key={step.title}
                  className="rounded-xl border border-gray-100 bg-white p-6 text-center shadow-md"
                >
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#1a2b4a] text-[#c9a84c]">
                    {stepIcons[index]}
                  </div>
                  <span className="mt-4 inline-block rounded-full bg-[#c9a84c]/15 px-3 py-0.5 text-xs font-semibold text-[#c9a84c]">
                    {t('step')} {index + 1}
                  </span>
                  <h3 className="mt-3 text-lg font-bold text-[#1a2b4a]">
                    {t(step.title)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">
                    {t(step.description)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* testimonials slider */}
      <TestimonialsSlider />

    </div>
  )
}

