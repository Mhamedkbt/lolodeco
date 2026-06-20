'use client'

import { FormEvent, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { TestimonialsSlider } from "@/components/TestimonialsSlider";
import { useTranslations } from 'next-intl'

export const dynamic = 'force-dynamic'

export default function ContactPage() {
  const t = useTranslations("contact");
  const [formSent, setFormSent] = useState(false)
  const [formSending, setFormSending] = useState(false)
  const [formError, setFormError] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const contactInfo = [
    {
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
        </svg>
      ),
      label: t('phone'),
      links: [{ text: '0660546352', href: 'tel:0660546352' }],
    },
    {
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
      ),
      label: t('email'),
      links: [{ text: 'lolodeco11@gmail.com', href: 'mailto:lolodeco11@gmail.com' }],
    },
    {
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
      ),
      label: t('location'),
      links: [{ text: t('location_value') }],
    },
  ]

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormSending(true)
    setFormError('')

    const { error } = await supabase.from('messages').insert({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      message: message.trim(),
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
    setName('')
    setPhone('')
    setEmail('')
    setMessage('')
  }

  return (
    <div>
      <section className="bg-[#f8f8f8] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="text-3xl font-bold text-[#404040] sm:text-4xl lg:text-5xl">
            {t('contact_us')}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            {t('ready_to_find')}
          </p>
        </div>
      </section>

      <section className="bg-white px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="text-2xl font-bold text-[#404040] sm:text-3xl">
              {t('send_message')}
            </h2>
            <div className="mt-2 h-1 w-16 rounded-full bg-[#EFBA1C]" />
            <p className="mt-4 text-gray-600">
              {t('fill_out_form')}
            </p>

            {formSent ? (
              <div className="mt-8 rounded-xl border border-green-200 bg-green-50 p-6 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="font-semibold text-green-800">{t('thank_you')}</p>
                <p className="mt-2 text-sm text-green-700">{t('message_sent_success')}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                {formError && (
                  <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                    <p className="text-sm text-red-600">{formError}</p>
                  </div>
                )}
                <div>
                  <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-[#404040]">{t('name')}</label>
                  <input id="name" type="text" required placeholder={t('name_placeholder')} value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-gray-200 px-4 py-3 text-[#404040] placeholder:text-gray-400 focus:border-[#EFBA1C] focus:outline-none focus:ring-2 focus:ring-[#EFBA1C]/30" />
                </div>
                <div>
                  <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-[#404040]">{t('phone')}</label>
                  <input id="phone" type="tel" required placeholder="06 XX XX XX XX" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-lg border border-gray-200 px-4 py-3 text-[#404040] placeholder:text-gray-400 focus:border-[#EFBA1C] focus:outline-none focus:ring-2 focus:ring-[#EFBA1C]/30" />
                </div>
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[#404040]">{t('email')}</label>
                  <input id="email" type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-gray-200 px-4 py-3 text-[#404040] placeholder:text-gray-400 focus:border-[#EFBA1C] focus:outline-none focus:ring-2 focus:ring-[#EFBA1C]/30" />
                </div>
                <div>
                  <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-[#404040]">{t('message')}</label>
                  <textarea id="message" required rows={5} placeholder={t('message_placeholder')} value={message} onChange={(e) => setMessage(e.target.value)} className="w-full resize-none rounded-lg border border-gray-200 px-4 py-3 text-[#404040] placeholder:text-gray-400 focus:border-[#EFBA1C] focus:outline-none focus:ring-2 focus:ring-[#EFBA1C]/30" />
                </div>
                <button type="submit" disabled={formSending} className="w-full rounded-lg bg-[#EFBA1C] px-6 py-3.5 text-base font-semibold text-[#404040] transition-colors hover:bg-[#F0C040] focus:outline-none focus:ring-2 focus:ring-[#EFBA1C] focus:ring-offset-2 sm:w-auto sm:px-10 disabled:opacity-60 disabled:cursor-not-allowed">
                  {formSending ? t('sending') : t('send_button')}
                </button>
              </form>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[#404040] sm:text-3xl">{t('get_in_touch')}</h2>
            <div className="mt-2 h-1 w-16 rounded-full bg-[#EFBA1C]" />
            <p className="mt-4 text-gray-600">{t('reach_out')}</p>

            <div className="mt-8 space-y-4">
              {contactInfo.map((item) => (
                <div key={item.label} className="flex items-start gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-md">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#404040] text-[#EFBA1C]">{item.icon}</div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">{item.label}</p>
                    {item.links.map((link) =>
                      'href' in link ? (
                        <a key={link.text} href={link.href} className="mt-0.5 block text-base font-semibold text-[#404040] transition-colors hover:text-[#EFBA1C]">{link.text}</a>
                      ) : (
                        <p key={link.text} className="mt-0.5 text-base font-semibold text-[#404040]">{link.text}</p>
                      )
                    )}
                  </div>
                </div>
              ))}

              <a href="https://wa.me/212660546352" target="_blank" rel="noopener noreferrer" className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 py-4 text-base font-semibold text-white shadow-md transition-colors hover:bg-[#20bd5a]">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                {t('chat_whatsapp')}
              </a>
            </div>
          </div>
        </div>
      </section>

      <TestimonialsSlider />
    </div>
  )
}
