import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, MapPin, CheckCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Us | Triarch Interiors',
  description:
    'Learn about Triarch Interiors — our approach to residential interior design, our services, and why homeowners across Hyderabad trust us.',
  alternates: { canonical: 'https://triarchinteriors.com/about' },
}

const values = [
  { title: 'Design Integrity', desc: 'Every design decision is intentional — from materials to spatial flow.' },
  { title: 'Transparency', desc: 'We provide clear estimates, honest timelines, and no hidden surprises.' },
  { title: 'Craftsmanship', desc: 'We hold our execution to the same standard as our design.' },
  { title: 'Client-Centric', desc: 'Your brief, your home — our job is to serve your vision, not ours.' },
]

export default function AboutPage() {
  return (
    <>
      {/* PAGE HEADER */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 bg-white border-b border-[#e8e2d6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[#c4a46b] text-xs font-semibold uppercase tracking-[0.25em] mb-3">About Us</p>
          <h1 className="font-display text-4xl md:text-5xl font-light text-[#1a1a1a] max-w-xl">
            Design Studio with an Architectural Soul
          </h1>
        </div>
      </section>

      {/* STORY */}
      <section className="py-20 md:py-28 bg-[#faf8f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 md:gap-20 items-center">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-light text-[#1a1a1a] mb-6">
              Who We Are
            </h2>
            <div className="space-y-4 text-[#5a5450] leading-relaxed">
              <p>
                Triarch Interiors is a residential interior design studio based in Hyderabad, Telangana. 
                We specialise in end-to-end home interiors — from initial concept and space planning through to 
                execution, vendor coordination, and final handover.
              </p>
              <p>
                Our name reflects our approach: drawing on architectural principles to create homes that are 
                not just beautiful, but structurally considered, purposefully designed, and built to last.
              </p>
              <p>
                We work with homeowners across Hyderabad — whether you are moving into a new apartment and 
                want to design it from scratch, or renovating specific rooms in your existing home.
              </p>
            </div>
            <div className="mt-8 flex items-center gap-2 text-sm text-[#2d2d2d]">
              <MapPin size={15} className="text-[#c4a46b]" />
              Serving Hyderabad, Telangana — including Gachibowli, HITEC City, Banjara Hills, Jubilee Hills, Kondapur, Manikonda, and surrounding areas.
            </div>
          </div>
          <div className="relative aspect-[4/3] rounded-none overflow-hidden">
            <Image
              src="/project-3bhk.jpg"
              alt="Premium interior design work by Triarch Interiors"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* WHAT WE DO */}
      <section className="py-20 md:py-28 bg-white border-y border-[#e8e2d6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[#c4a46b] text-xs font-semibold uppercase tracking-[0.25em] mb-3">Services</p>
            <h2 className="font-display text-3xl md:text-4xl font-light text-[#1a1a1a]">
              What We Offer
            </h2>
            <div className="section-divider mt-4 mx-auto" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              'Full-home interior design',
              'Living room & dining room design',
              'Modular kitchen design & fit-out',
              'Master & kids bedroom design',
              'Custom wardrobes & storage',
              'Study room & home office design',
              'Pooja room design',
              'Bathroom interiors',
              'New-home and renovation projects',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 p-5 bg-[#faf8f5] border border-[#e8e2d6]">
                <CheckCircle size={16} className="text-[#c4a46b] mt-0.5 flex-shrink-0" />
                <span className="text-sm text-[#2d2d2d]">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="py-20 md:py-28 bg-[#faf8f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[#c4a46b] text-xs font-semibold uppercase tracking-[0.25em] mb-3">Our Values</p>
            <h2 className="font-display text-3xl md:text-4xl font-light text-[#1a1a1a]">
              The Way We Work
            </h2>
            <div className="section-divider mt-4 mx-auto" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((v) => (
              <div key={v.title} className="text-center">
                <h3 className="font-display text-lg font-medium text-[#1a1a1a] mb-3">{v.title}</h3>
                <div className="section-divider mb-4" style={{margin: '0 auto 1rem'}} />
                <p className="text-sm text-[#5a5450] leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl font-light text-white mb-5">
            Start Your Project With Us
          </h2>
          <p className="text-white/60 text-sm max-w-md mx-auto mb-8">
            Tell us about your home and requirements. We'll get back to you promptly to discuss next steps.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/estimator"
              className="inline-flex items-center justify-center gap-2 bg-[#c4a46b] text-white font-medium px-7 py-4 hover:bg-[#b8955a] transition-colors text-sm"
            >
              Get an Estimate <ArrowRight size={14} />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 border border-white/30 text-white font-medium px-7 py-4 hover:border-white/60 transition-colors text-sm"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
