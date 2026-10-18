'use client'
import { useState } from 'react'
import { ArrowRight, ArrowLeft, CheckCircle, AlertTriangle, Phone } from 'lucide-react'
import { calculateEstimate, formatINR, BUDGET_RANGES, type BHKType, type ProjectType } from '@/lib/pricing'

const BHK_OPTIONS: BHKType[] = ['1BHK', '2BHK', '3BHK', '4BHK+']
const PROJECT_TYPES: { value: ProjectType; label: string; desc: string }[] = [
  { value: 'new-home', label: 'New Home', desc: 'Brand new flat/house with bare walls' },
  { value: 'renovation', label: 'Renovation', desc: 'Updating or replacing existing interiors' },
]
const ROOM_OPTIONS = [
  'Living Room', 'Dining Room', 'Master Bedroom', 'Bedroom 2', 'Bedroom 3',
  'Modular Kitchen', 'Study Room', 'Pooja Room', 'Kids Room', 'Bathroom',
]

interface FormState {
  bhk: BHKType | ''
  sqft: string
  rooms: string[]
  projectType: ProjectType | ''
  budget: string
  name: string
  phone: string
  email: string
  pinCode: string
}

interface Errors {
  [key: string]: string
}

const TOTAL_STEPS = 5

export default function EstimatorWizard() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormState>({
    bhk: '', sqft: '', rooms: [], projectType: '',
    budget: '', name: '', phone: '', email: '', pinCode: '',
  })
  const [errors, setErrors] = useState<Errors>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const estimate = form.bhk && form.sqft && form.projectType
    ? calculateEstimate(
        form.bhk as BHKType,
        parseFloat(form.sqft),
        form.projectType as ProjectType,
        form.rooms.length
      )
    : null

  function validateStep(s: number): boolean {
    const e: Errors = {}
    if (s === 1 && !form.bhk) e.bhk = 'Please select a configuration.'
    if (s === 2) {
      if (!form.sqft || isNaN(Number(form.sqft)) || Number(form.sqft) <= 0)
        e.sqft = 'Please enter a valid area.'
      if (Number(form.sqft) > 15000) e.sqft = 'Please enter a realistic area in sq ft.'
    }
    if (s === 3 && form.rooms.length === 0) e.rooms = 'Please select at least one room.'
    if (s === 4) {
      if (!form.projectType) e.projectType = 'Please select a project type.'
      if (!form.budget) e.budget = 'Please select a budget range.'
    }
    if (s === 5) {
      if (!form.name.trim()) e.name = 'Name is required.'
      if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\s/g, '')))
        e.phone = 'Please enter a valid 10-digit Indian mobile number.'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        e.email = 'Please enter a valid email address.'
      if (!/^\d{6}$/.test(form.pinCode))
        e.pinCode = 'Please enter a valid 6-digit PIN code.'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function next() {
    if (validateStep(step)) setStep(s => Math.min(s + 1, TOTAL_STEPS))
  }
  function back() { setStep(s => Math.max(s - 1, 1)); setErrors({}) }

  function toggleRoom(room: string) {
    setForm(f => ({
      ...f,
      rooms: f.rooms.includes(room) ? f.rooms.filter(r => r !== room) : [...f.rooms, room],
    }))
  }

  async function handleSubmit() {
    if (!validateStep(5)) return
    setSubmitting(true)
    setSubmitError('')
    try {
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim().toLowerCase(),
        pin_code: form.pinCode.trim(),
        bhk: form.bhk,
        sqft: form.sqft ? parseFloat(form.sqft) : null,
        project_type: form.projectType,
        room_types: form.rooms,
        budget_range: form.budget,
        estimate_low: estimate?.hasMatch ? estimate.low : null,
        estimate_high: estimate?.hasMatch ? estimate.high : null,
        source: 'website-estimator',
      }
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Submission failed.')
      }
      setSubmitted(true)
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="bg-white border border-[#e8e2d6] p-10 text-center">
        <CheckCircle size={48} className="text-[#c4a46b] mx-auto mb-5" />
        <h2 className="font-display text-2xl font-medium text-[#1a1a1a] mb-3">
          Thank You, {form.name}!
        </h2>
        <p className="text-[#5a5450] mb-6 leading-relaxed">
          We've received your enquiry and will be in touch shortly to discuss your project.
        </p>
        {estimate?.hasMatch && (
          <div className="bg-[#f5f0e8] p-5 mb-6 text-left">
            <p className="text-xs text-[#8a8178] uppercase tracking-wider mb-1">Your Indicative Estimate</p>
            <p className="font-display text-2xl text-[#c4a46b] font-medium">
              {formatINR(estimate.low)} – {formatINR(estimate.high)}
            </p>
            <p className="text-xs text-[#8a8178] mt-2">
              Based on {form.bhk}, {form.sqft} sq ft, {form.projectType === 'new-home' ? 'new home' : 'renovation'}.
            </p>
          </div>
        )}
        <p className="text-xs text-[#8a8178] mb-6">
          This is an indicative estimate based on the information provided, not a final quotation. 
          Final pricing depends on site assessment, design choices, material selection, and scope confirmation.
        </p>
        <a
          href="https://wa.me/917993976742?text=Hello%2C%20I%20just%20submitted%20an%20estimate%20on%20your%20website"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#25d366] text-white px-5 py-3 text-sm font-medium hover:bg-[#20bc5a] transition-colors"
        >
          Continue on WhatsApp
        </a>
      </div>
    )
  }

  return (
    <div className="bg-white border border-[#e8e2d6]">
      {/* Progress */}
      <div className="px-6 pt-6 pb-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[#8a8178]">Step {step} of {TOTAL_STEPS}</span>
          <span className="text-xs text-[#8a8178]">{Math.round((step / TOTAL_STEPS) * 100)}%</span>
        </div>
        <div className="h-1 bg-[#f0ece4] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#c4a46b] transition-all duration-300"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>

      <div className="p-6 md:p-8">
        {/* STEP 1: BHK */}
        {step === 1 && (
          <div>
            <h2 className="font-display text-2xl font-medium text-[#1a1a1a] mb-2">
              What's your home configuration?
            </h2>
            <p className="text-sm text-[#8a8178] mb-6">Select the number of bedrooms</p>
            <div className="grid grid-cols-2 gap-3">
              {BHK_OPTIONS.map((b) => (
                <button
                  key={b}
                  id={`bhk-${b}`}
                  onClick={() => setForm(f => ({ ...f, bhk: b }))}
                  className={`py-5 text-sm font-medium border-2 transition-all ${
                    form.bhk === b
                      ? 'border-[#c4a46b] bg-[#c4a46b] text-white'
                      : 'border-[#e8e2d6] text-[#2d2d2d] hover:border-[#c4a46b]'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
            {errors.bhk && <p className="mt-2 text-red-600 text-xs">{errors.bhk}</p>}
          </div>
        )}

        {/* STEP 2: SQFT */}
        {step === 2 && (
          <div>
            <h2 className="font-display text-2xl font-medium text-[#1a1a1a] mb-2">
              Approximate carpet area?
            </h2>
            <p className="text-sm text-[#8a8178] mb-6">Enter the total area in square feet</p>
            <div>
              <input
                id="sqft-input"
                type="number"
                min={100}
                max={15000}
                placeholder="e.g. 1200"
                value={form.sqft}
                onChange={(e) => setForm(f => ({ ...f, sqft: e.target.value }))}
                className={`w-full border-2 px-4 py-4 text-lg outline-none transition-colors ${
                  errors.sqft ? 'border-red-400' : 'border-[#e8e2d6] focus:border-[#c4a46b]'
                }`}
              />
              <p className="mt-1.5 text-xs text-[#8a8178]">Carpet area in sq ft (typically 70–80% of super built-up area)</p>
              {errors.sqft && <p className="mt-1 text-red-600 text-xs">{errors.sqft}</p>}
            </div>
          </div>
        )}

        {/* STEP 3: ROOMS */}
        {step === 3 && (
          <div>
            <h2 className="font-display text-2xl font-medium text-[#1a1a1a] mb-2">
              Which rooms need designing?
            </h2>
            <p className="text-sm text-[#8a8178] mb-6">Select all that apply</p>
            <div className="grid grid-cols-2 gap-2.5">
              {ROOM_OPTIONS.map((room) => (
                <button
                  key={room}
                  id={`room-${room.replace(/\s/g, '-').toLowerCase()}`}
                  onClick={() => toggleRoom(room)}
                  className={`py-3 px-3 text-sm border-2 text-left transition-all ${
                    form.rooms.includes(room)
                      ? 'border-[#c4a46b] bg-[#fdf9f4] text-[#c4a46b] font-medium'
                      : 'border-[#e8e2d6] text-[#2d2d2d] hover:border-[#c4a46b]'
                  }`}
                >
                  {room}
                </button>
              ))}
            </div>
            {errors.rooms && <p className="mt-2 text-red-600 text-xs">{errors.rooms}</p>}
          </div>
        )}

        {/* STEP 4: TYPE + BUDGET */}
        {step === 4 && (
          <div className="space-y-8">
            <div>
              <h2 className="font-display text-2xl font-medium text-[#1a1a1a] mb-2">
                New home or renovation?
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {PROJECT_TYPES.map((pt) => (
                  <button
                    key={pt.value}
                    id={`project-type-${pt.value}`}
                    onClick={() => setForm(f => ({ ...f, projectType: pt.value }))}
                    className={`p-5 text-left border-2 transition-all ${
                      form.projectType === pt.value
                        ? 'border-[#c4a46b] bg-[#fdf9f4]'
                        : 'border-[#e8e2d6] hover:border-[#c4a46b]'
                    }`}
                  >
                    <p className="font-medium text-[#1a1a1a] text-sm">{pt.label}</p>
                    <p className="text-xs text-[#8a8178] mt-1">{pt.desc}</p>
                  </button>
                ))}
              </div>
              {errors.projectType && <p className="mt-2 text-red-600 text-xs">{errors.projectType}</p>}
            </div>
            <div>
              <h2 className="font-display text-xl font-medium text-[#1a1a1a] mb-2">
                Budget range in mind?
              </h2>
              <p className="text-xs text-[#8a8178] mb-4">
                This helps us understand your expectations. Your selected budget is not the calculated estimate.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {BUDGET_RANGES.map((br) => (
                  <button
                    key={br.value}
                    id={`budget-${br.value}`}
                    onClick={() => setForm(f => ({ ...f, budget: br.value }))}
                    className={`py-3 px-2 text-sm border-2 transition-all ${
                      form.budget === br.value
                        ? 'border-[#c4a46b] bg-[#c4a46b] text-white font-medium'
                        : 'border-[#e8e2d6] text-[#2d2d2d] hover:border-[#c4a46b]'
                    }`}
                  >
                    {br.label}
                  </button>
                ))}
              </div>
              {errors.budget && <p className="mt-2 text-red-600 text-xs">{errors.budget}</p>}
            </div>

            {/* Estimate preview */}
            {estimate?.hasMatch && (
              <div className="bg-[#f5f0e8] p-5 border border-[#e8e2d6]">
                <p className="text-xs text-[#8a8178] uppercase tracking-wider mb-1">Indicative Estimate</p>
                <p className="font-display text-2xl text-[#c4a46b] font-medium">
                  {formatINR(estimate.low)} – {formatINR(estimate.high)}
                </p>
                <p className="text-xs text-[#8a8178] mt-2">
                  Based on {form.bhk}, {form.sqft} sq ft — provisional market rates, subject to confirmation.
                </p>
              </div>
            )}
          </div>
        )}

        {/* STEP 5: CONTACT */}
        {step === 5 && (
          <div>
            <h2 className="font-display text-2xl font-medium text-[#1a1a1a] mb-2">
              Where should we send the details?
            </h2>
            <p className="text-sm text-[#8a8178] mb-6">
              We'll use these details to contact you about your enquiry.
            </p>

            {/* Estimate summary */}
            {estimate?.hasMatch && (
              <div className="bg-[#f5f0e8] p-4 mb-6 border border-[#e8e2d6]">
                <p className="text-xs text-[#8a8178] mb-1">Your estimate: <strong className="text-[#c4a46b]">{formatINR(estimate.low)} – {formatINR(estimate.high)}</strong></p>
                <p className="text-xs text-[#8a8178]">Indicative only — not a final quotation.</p>
              </div>
            )}
            {!estimate?.hasMatch && (
              <div className="bg-amber-50 border border-amber-200 p-4 mb-6 flex items-start gap-2">
                <AlertTriangle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-800">
                  We weren't able to calculate an estimate for your inputs. Our team will provide a tailored quote after speaking with you.
                </p>
              </div>
            )}

            <div className="space-y-4">
              {[
                { id: 'name', label: 'Full Name', type: 'text', placeholder: 'Your name', field: 'name' },
                { id: 'phone', label: 'Mobile Number', type: 'tel', placeholder: '10-digit mobile number', field: 'phone' },
                { id: 'email', label: 'Email Address', type: 'email', placeholder: 'your@email.com', field: 'email' },
                { id: 'pinCode', label: 'PIN Code', type: 'text', placeholder: '6-digit PIN code', field: 'pinCode' },
              ].map(({ id, label, type, placeholder, field }) => (
                <div key={id}>
                  <label htmlFor={id} className="block text-sm font-medium text-[#2d2d2d] mb-1.5">
                    {label} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={id}
                    type={type}
                    placeholder={placeholder}
                    value={form[field as keyof FormState] as string}
                    onChange={(e) => setForm(f => ({ ...f, [field]: e.target.value }))}
                    className={`w-full border px-4 py-3 text-sm outline-none transition-colors ${
                      errors[field] ? 'border-red-400' : 'border-[#e8e2d6] focus:border-[#c4a46b]'
                    }`}
                  />
                  {errors[field] && <p className="mt-1 text-red-600 text-xs">{errors[field]}</p>}
                </div>
              ))}
            </div>

            <p className="mt-4 text-xs text-[#8a8178] leading-relaxed">
              By submitting, you agree that Triarch Interiors can contact you regarding your enquiry. 
              Your information will not be shared with third parties. See our{' '}
              <a href="/privacy" className="underline hover:text-[#c4a46b]">Privacy Policy</a>.
            </p>

            {submitError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 flex items-start gap-2">
                <AlertTriangle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-red-800">{submitError}</p>
                  <p className="text-xs text-red-600 mt-1">
                    Alternatively,{' '}
                    <a
                      href="https://wa.me/917993976742"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      contact us on WhatsApp
                    </a>{' '}
                    or call{' '}
                    <a href="tel:+917993976742" className="underline flex items-center inline-flex gap-1">
                      <Phone size={12} />+91 79939 76742
                    </a>
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* NAVIGATION */}
        <div className={`mt-8 flex ${step > 1 ? 'justify-between' : 'justify-end'}`}>
          {step > 1 && (
            <button
              onClick={back}
              className="inline-flex items-center gap-2 text-sm text-[#5a5450] hover:text-[#1a1a1a] transition-colors"
            >
              <ArrowLeft size={14} /> Back
            </button>
          )}
          {step < TOTAL_STEPS ? (
            <button
              id="estimator-next"
              onClick={next}
              className="inline-flex items-center gap-2 bg-[#1a1a1a] text-white px-6 py-3 text-sm font-medium hover:bg-[#c4a46b] transition-colors"
            >
              Continue <ArrowRight size={14} />
            </button>
          ) : (
            <button
              id="estimator-submit"
              onClick={handleSubmit}
              disabled={submitting}
              className="inline-flex items-center gap-2 bg-[#c4a46b] text-white px-8 py-3 text-sm font-medium hover:bg-[#b8955a] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Submitting...' : 'Submit Enquiry'}
              {!submitting && <ArrowRight size={14} />}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
