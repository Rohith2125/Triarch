'use client'
import { useState } from 'react'
import { CheckCircle, AlertTriangle } from 'lucide-react'

interface FormState {
  name: string
  phone: string
  email: string
  pinCode: string
  message: string
}

export default function ContactForm() {
  const [form, setForm] = useState<FormState>({ name: '', phone: '', email: '', pinCode: '', message: '' })
  const [errors, setErrors] = useState<Partial<FormState>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')

  function validate(): boolean {
    const e: Partial<FormState> = {}
    if (!form.name.trim()) e.name = 'Name is required.'
    if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\s/g, '')))
      e.phone = 'Please enter a valid 10-digit Indian mobile number.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Please enter a valid email address.'
    if (!/^\d{6}$/.test(form.pinCode))
      e.pinCode = 'Please enter a valid 6-digit PIN code.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    setSubmitError('')
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim().toLowerCase(),
          pin_code: form.pinCode.trim(),
          source: 'website-contact',
        }),
      })
      if (!res.ok) throw new Error('Submission failed.')
      setSubmitted(true)
    } catch {
      setSubmitError('Something went wrong. Please try calling or WhatsApp us directly.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-12 px-6 bg-white border border-[#e8e2d6]">
        <CheckCircle size={40} className="text-[#c4a46b] mx-auto mb-4" />
        <h3 className="font-display text-xl text-[#1a1a1a] mb-2">Message Received!</h3>
        <p className="text-sm text-[#5a5450]">We'll be in touch shortly. You can also reach us on WhatsApp for a quicker response.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {[
        { id: 'contact-name', label: 'Full Name', type: 'text', field: 'name', placeholder: 'Your name' },
        { id: 'contact-phone', label: 'Mobile Number', type: 'tel', field: 'phone', placeholder: '10-digit number' },
        { id: 'contact-email', label: 'Email Address', type: 'email', field: 'email', placeholder: 'your@email.com' },
        { id: 'contact-pin', label: 'PIN Code', type: 'text', field: 'pinCode', placeholder: '6-digit PIN' },
      ].map(({ id, label, type, field, placeholder }) => (
        <div key={id}>
          <label htmlFor={id} className="block text-sm font-medium text-[#2d2d2d] mb-1.5">
            {label} <span className="text-red-500">*</span>
          </label>
          <input
            id={id}
            type={type}
            placeholder={placeholder}
            value={form[field as keyof FormState]}
            onChange={(e) => setForm(f => ({ ...f, [field]: e.target.value }))}
            className={`w-full border px-4 py-3 text-sm outline-none transition-colors ${
              errors[field as keyof FormState] ? 'border-red-400' : 'border-[#e8e2d6] focus:border-[#c4a46b]'
            }`}
          />
          {errors[field as keyof FormState] && (
            <p className="mt-1 text-red-600 text-xs">{errors[field as keyof FormState]}</p>
          )}
        </div>
      ))}
      <div>
        <label htmlFor="contact-message" className="block text-sm font-medium text-[#2d2d2d] mb-1.5">
          Tell us about your project (optional)
        </label>
        <textarea
          id="contact-message"
          rows={4}
          placeholder="e.g. 2BHK in Gachibowli, looking for full-home design..."
          value={form.message}
          onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
          className="w-full border border-[#e8e2d6] px-4 py-3 text-sm outline-none transition-colors focus:border-[#c4a46b] resize-none"
        />
      </div>

      {submitError && (
        <div className="p-4 bg-red-50 border border-red-200 flex items-start gap-2">
          <AlertTriangle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-800">{submitError}</p>
        </div>
      )}

      <p className="text-xs text-[#8a8178]">
        By submitting, you agree that Triarch Interiors can contact you about your enquiry. See our{' '}
        <a href="/privacy" className="underline hover:text-[#c4a46b]">Privacy Policy</a>.
      </p>

      <button
        type="submit"
        id="contact-submit"
        disabled={submitting}
        className="w-full bg-[#1a1a1a] text-white font-medium py-4 text-sm hover:bg-[#c4a46b] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {submitting ? 'Sending...' : 'Send Enquiry'}
      </button>
    </form>
  )
}
