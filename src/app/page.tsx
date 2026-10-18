import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, MapPin, Phone, CheckCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Premium Interior Design in Hyderabad | Triarch Interiors',
  description:
    'Triarch Interiors — end-to-end residential interior design across Hyderabad. Explore completed projects, get an indicative estimate, and book a consultation.',
  alternates: { canonical: 'https://triarchinteriors.com' },
}

const services = [
  { icon: '🏠', title: 'Living Room Design', desc: 'Curated spaces that balance comfort and sophistication.' },
  { icon: '🛏', title: 'Bedroom Interiors', desc: 'Restful retreats with bespoke wardrobes and ambient lighting.' },
  { icon: '🍽', title: 'Modular Kitchens', desc: 'Functional, elegant kitchens tailored to how you cook.' },
  { icon: '📚', title: 'Study & Pooja Rooms', desc: 'Purpose-built spaces for focus, reflection, and prayer.' },
  { icon: '🚿', title: 'Bathroom Design', desc: 'Refined bathroom aesthetics with quality fittings.' },
  { icon: '🏗', title: 'Full-Home Interiors', desc: 'Complete end-to-end design across every room.' },
]

const process = [
  { step: '01', title: 'Consultation', desc: 'We understand your vision, lifestyle, and budget.' },
  { step: '02', title: 'Design', desc: 'Our team crafts layouts, moodboards, and material selections.' },
  { step: '03', title: 'Execution', desc: 'We coordinate vendors, supervise work, and maintain quality.' },
  { step: '04', title: 'Handover', desc: 'Your space is delivered complete, on time, and on budget.' },
]

const sampleProjects = [
  {
    title: '3BHK — Gachibowli',
    desc: 'Contemporary open-plan living with walnut accents and city views.',
    image: '/project-3bhk.jpg',
    bhk: '3BHK',
    sqft: '1850 sq ft',
    type: 'New Home',
    slug: 'gachibowli-3bhk',
  },
  {
    title: 'Kitchen Renovation — Jubilee Hills',
    desc: 'High-gloss modular kitchen with gold hardware and quartz countertops.',
    image: '/project-kitchen.jpg',
    bhk: 'Kitchen',
    sqft: '220 sq ft',
    type: 'Renovation',
    slug: 'jubilee-hills-kitchen',
  },
  {
    title: 'Master Bedroom — Banjara Hills',
    desc: 'Warm walnut panelling, cove lighting, and bespoke wardrobe.',
    image: '/project-bedroom.jpg',
    bhk: '2BHK',
    sqft: '180 sq ft',
    type: 'New Home',
    slug: 'banjara-hills-bedroom',
  },
]

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative min-h-screen flex items-center">
        <div className="absolute inset-0">
          <Image
            src="/hero.jpg"
            alt="Premium interior design in Hyderabad by Triarch Interiors"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 hero-overlay" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-40">
          <div className="max-w-2xl">
            <p className="text-[#c4a46b] text-xs font-semibold uppercase tracking-[0.3em] mb-4">
              Hyderabad's Premium Interior Studio
            </p>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-light text-white leading-tight mb-6">
              Where Architecture<br />
              <em className="italic text-[#c4a46b]">Meets Living</em>
            </h1>
            <p className="text-white/80 text-base md:text-lg leading-relaxed mb-10 max-w-lg">
              End-to-end residential interior design crafted for Hyderabad homes. 
              From concept to handover — we do it all.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/estimator"
                id="hero-estimator-cta"
                className="inline-flex items-center justify-center gap-2 bg-[#c4a46b] text-white font-medium px-7 py-4 hover:bg-[#b8955a] transition-colors text-sm"
              >
                Get Free Estimate
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/projects"
                className="inline-flex items-center justify-center gap-2 border border-white/40 text-white font-medium px-7 py-4 hover:border-white/70 hover:bg-white/10 transition-colors text-sm"
              >
                View Our Work
              </Link>
            </div>
          </div>
        </div>
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce">
          <div className="w-px h-8 bg-white/40" />
          <div className="w-1 h-1 rounded-full bg-white/40" />
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="bg-white border-b border-[#e8e2d6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-center justify-center md:justify-between gap-6 text-sm text-[#5a5450]">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-[#c4a46b]" />
              End-to-End Service
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-[#c4a46b]" />
              Premium Brands & Materials
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-[#c4a46b]" />
              On-Time Delivery
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-[#c4a46b]" />
              Serving All of Hyderabad
            </div>
            <div className="flex items-center gap-2">
              <Phone size={16} className="text-[#c4a46b]" />
              <a href="tel:+917993976742" className="hover:text-[#c4a46b] transition-colors">
                +91 79939 76742
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* PORTFOLIO PREVIEW */}
      <section className="py-20 md:py-28 bg-[#faf8f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[#c4a46b] text-xs font-semibold uppercase tracking-[0.25em] mb-3">Our Work</p>
            <h2 className="font-display text-3xl md:text-4xl font-light text-[#1a1a1a]">
              Selected Projects
            </h2>
            <div className="section-divider mt-4 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {sampleProjects.map((project) => (
              <Link
                key={project.slug}
                href={`/projects/${project.slug}`}
                className="group block bg-white card-hover overflow-hidden border border-[#e8e2d6]"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-[#c4a46b] text-white text-xs font-medium px-2.5 py-1">
                    {project.type}
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-3 text-xs text-[#8a8178] mb-2">
                    <span className="bg-[#f5f0e8] px-2 py-0.5">{project.bhk}</span>
                    <span>{project.sqft}</span>
                  </div>
                  <h3 className="font-display text-lg font-medium text-[#1a1a1a] mb-1.5">
                    {project.title}
                  </h3>
                  <p className="text-sm text-[#5a5450] leading-relaxed">{project.desc}</p>
                  <div className="mt-4 flex items-center gap-1 text-[#c4a46b] text-sm font-medium">
                    View Project <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 border border-[#1a1a1a] text-[#1a1a1a] font-medium px-7 py-3 hover:bg-[#1a1a1a] hover:text-white transition-colors text-sm"
            >
              View All Projects <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ESTIMATOR CTA */}
      <section className="py-20 md:py-28 bg-[#1a1a1a] relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <Image src="/hero.jpg" alt="" fill className="object-cover" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#c4a46b] text-xs font-semibold uppercase tracking-[0.25em] mb-4">
            Plan Your Budget
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-light text-white mb-5">
            Get an Indicative Estimate
          </h2>
          <p className="text-white/60 text-base max-w-xl mx-auto mb-10 leading-relaxed">
            Answer a few questions about your home — BHK, square footage, rooms — and 
            we'll give you a rough budget range to help you plan.
          </p>
          <Link
            href="/estimator"
            id="section-estimator-cta"
            className="inline-flex items-center gap-2 bg-[#c4a46b] text-white font-medium px-8 py-4 hover:bg-[#b8955a] transition-colors"
          >
            Start Free Estimate <ArrowRight size={16} />
          </Link>
          <p className="mt-5 text-white/40 text-xs">
            Indicative only. Not a final quotation.
          </p>
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-20 md:py-28 bg-[#faf8f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[#c4a46b] text-xs font-semibold uppercase tracking-[0.25em] mb-3">What We Do</p>
            <h2 className="font-display text-3xl md:text-4xl font-light text-[#1a1a1a]">
              Our Services
            </h2>
            <div className="section-divider mt-4 mx-auto" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => (
              <div key={s.title} className="bg-white p-7 border border-[#e8e2d6] hover:border-[#c4a46b] transition-colors group">
                <div className="text-3xl mb-4">{s.icon}</div>
                <h3 className="font-display text-lg font-medium text-[#1a1a1a] mb-2 group-hover:text-[#c4a46b] transition-colors">
                  {s.title}
                </h3>
                <p className="text-sm text-[#5a5450] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="py-20 md:py-28 bg-white border-y border-[#e8e2d6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[#c4a46b] text-xs font-semibold uppercase tracking-[0.25em] mb-3">How We Work</p>
            <h2 className="font-display text-3xl md:text-4xl font-light text-[#1a1a1a]">
              Our Design Process
            </h2>
            <div className="section-divider mt-4 mx-auto" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {process.map((p, i) => (
              <div key={p.step} className="relative">
                {i < process.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-[calc(50%+30px)] right-[-calc(50%-30px)] h-px bg-[#e8e2d6]" />
                )}
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full border border-[#c4a46b] flex items-center justify-center mx-auto mb-5">
                    <span className="text-[#c4a46b] font-display text-sm font-medium">{p.step}</span>
                  </div>
                  <h3 className="font-display text-lg font-medium text-[#1a1a1a] mb-2">{p.title}</h3>
                  <p className="text-sm text-[#5a5450] leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BRANDS TEASER */}
      <section className="py-16 md:py-20 bg-[#faf8f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#c4a46b] text-xs font-semibold uppercase tracking-[0.25em] mb-4">
            Quality You Can Trust
          </p>
          <h2 className="font-display text-2xl md:text-3xl font-light text-[#1a1a1a] mb-3">
            Premium Brands & Materials
          </h2>
          <p className="text-[#5a5450] text-sm max-w-md mx-auto mb-8">
            We work with trusted brands in laminates, hardware, tiles, sanitary ware, and lighting.
          </p>
          <Link
            href="/brands"
            className="inline-flex items-center gap-2 text-[#c4a46b] font-medium text-sm border-b border-[#c4a46b] pb-0.5 hover:border-[#b8955a] hover:text-[#b8955a] transition-colors"
          >
            Explore Brands <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* CONTACT CTA */}
      <section className="py-20 md:py-28 bg-[#f5f0e8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-light text-[#1a1a1a] mb-5">
            Ready to Transform Your Home?
          </h2>
          <p className="text-[#5a5450] text-base max-w-lg mx-auto mb-10 leading-relaxed">
            Talk to our team today. We serve residential projects across Hyderabad — 
            from Gachibowli to Jubilee Hills, Banjara Hills to HITEC City.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-[#1a1a1a] text-white font-medium px-7 py-4 hover:bg-[#c4a46b] transition-colors text-sm"
            >
              Book a Consultation
            </Link>
            <a
              href="https://wa.me/917993976742?text=Hello%2C%20I%20am%20interested%20in%20interior%20design%20services"
              target="_blank"
              rel="noopener noreferrer"
              id="home-whatsapp-cta"
              className="inline-flex items-center justify-center gap-2 border border-[#1a1a1a] text-[#1a1a1a] font-medium px-7 py-4 hover:bg-[#1a1a1a] hover:text-white transition-colors text-sm"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
