import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight, MapPin } from 'lucide-react'

const projects: Record<string, {
  title: string; slug: string; desc: string; longDesc: string; bhk: string;
  sqft: number; type: string; rooms: string[]; brands: string[];
  location: string; image: string; gallery: string[];
  seoTitle: string; seoDesc: string;
}> = {
  'gachibowli-3bhk': {
    title: '3BHK Apartment — Gachibowli',
    slug: 'gachibowli-3bhk',
    desc: 'Contemporary open-plan living with walnut accents and city views.',
    longDesc: 'A complete 3BHK interior covering living room, open kitchen, master bedroom, two additional bedrooms, and study. The brief was contemporary but warm — achieved through walnut veneer panelling, cream upholstery, marble-look flooring, and brass hardware throughout. Full-height glazing in the living room captures Hyderabad skyline views.',
    bhk: '3BHK',
    sqft: 1850,
    type: 'New Home',
    rooms: ['Living Room', 'Dining', 'Modular Kitchen', 'Master Bedroom', 'Bedrooms', 'Study Room'],
    brands: ['Greenply', 'Hafele', 'Asian Paints'],
    location: 'Gachibowli, Hyderabad',
    image: '/project-3bhk.jpg',
    gallery: ['/project-3bhk.jpg', '/project-bedroom.jpg', '/project-kitchen.jpg'],
    seoTitle: '3BHK Interior Design Gachibowli Hyderabad | Triarch Interiors',
    seoDesc: 'Contemporary 3BHK home interior by Triarch Interiors in Gachibowli, Hyderabad — 1850 sq ft of warm walnut and cream with full-home design.',
  },
  'jubilee-hills-kitchen': {
    title: 'Kitchen Renovation — Jubilee Hills',
    slug: 'jubilee-hills-kitchen',
    desc: 'High-gloss modular kitchen with gold hardware and quartz countertops.',
    longDesc: 'A complete kitchen transformation in a villa in Jubilee Hills. The client wanted a premium look with practical storage — achieved with full-height gloss-white lacquer shutters, brass/gold hardware, a waterfall-edge quartz island, and marble herringbone tile backsplash. Under-cabinet LED strips and diamond-cage pendants complete the look.',
    bhk: 'Kitchen',
    sqft: 220,
    type: 'Renovation',
    rooms: ['Modular Kitchen'],
    brands: ['Hettich', 'Hafele', 'Duravit'],
    location: 'Jubilee Hills, Hyderabad',
    image: '/project-kitchen.jpg',
    gallery: ['/project-kitchen.jpg', '/project-3bhk.jpg'],
    seoTitle: 'Modular Kitchen Design Jubilee Hills Hyderabad | Triarch Interiors',
    seoDesc: 'Premium modular kitchen renovation in Jubilee Hills, Hyderabad by Triarch Interiors — high-gloss lacquer, quartz island, and gold hardware.',
  },
  'banjara-hills-bedroom': {
    title: 'Master Bedroom — Banjara Hills',
    slug: 'banjara-hills-bedroom',
    desc: 'Warm walnut panelling, cove lighting, and bespoke wardrobe design.',
    longDesc: 'A master bedroom designed around warmth and rest. Dark walnut wall panelling forms a dramatic backdrop to the upholstered king-size bed. Cove lighting in the tray ceiling creates a soft glow at night. A full-wall bespoke wardrobe with soft-close shutters and internal fittings completes the suite.',
    bhk: '2BHK',
    sqft: 180,
    type: 'New Home',
    rooms: ['Bedroom', 'Custom Wardrobe'],
    brands: ['Greenply', 'Hettich', 'Asian Paints'],
    location: 'Banjara Hills, Hyderabad',
    image: '/project-bedroom.jpg',
    gallery: ['/project-bedroom.jpg', '/project-3bhk.jpg'],
    seoTitle: 'Master Bedroom Interior Design Banjara Hills Hyderabad | Triarch Interiors',
    seoDesc: 'Warm walnut master bedroom with custom wardrobe and cove lighting by Triarch Interiors in Banjara Hills, Hyderabad.',
  },
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const project = projects[slug]
  if (!project) return { title: 'Project Not Found' }
  return {
    title: project.seoTitle,
    description: project.seoDesc,
    alternates: { canonical: `https://triarchinteriors.com/projects/${slug}` },
  }
}

export function generateStaticParams() {
  return Object.keys(projects).map((slug) => ({ slug }))
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params
  const project = projects[slug]
  if (!project) notFound()

  return (
    <>
      {/* HERO */}
      <section className="pt-16 md:pt-20 relative">
        <div className="relative h-[55vh] md:h-[65vh] overflow-hidden">
          <Image
            src={project.image}
            alt={`${project.title} — interior design by Triarch Interiors`}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/10" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 max-w-7xl mx-auto">
            <Link href="/projects" className="inline-flex items-center gap-1 text-white/70 hover:text-white text-sm mb-4 transition-colors">
              <ArrowLeft size={14} /> All Projects
            </Link>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="bg-[#c4a46b] text-white text-xs font-medium px-2.5 py-1">{project.type}</span>
              <span className="bg-white/20 text-white text-xs px-2.5 py-1">{project.bhk}</span>
            </div>
            <h1 className="font-display text-3xl md:text-5xl font-light text-white">
              {project.title}
            </h1>
          </div>
        </div>
      </section>

      {/* PROJECT DETAILS */}
      <section className="py-16 md:py-24 bg-[#faf8f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-12">
          <div className="md:col-span-2">
            <p className="text-[#5a5450] text-base leading-relaxed mb-8">{project.longDesc}</p>
            
            {/* Gallery */}
            <div className="grid grid-cols-2 gap-3">
              {project.gallery.slice(1).map((img, i) => (
                <div key={i} className="relative aspect-[4/3] overflow-hidden">
                  <Image src={img} alt={`${project.title} — view ${i + 2}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white p-6 border border-[#e8e2d6]">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-[#c4a46b] mb-5">Project Facts</h2>
              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="text-[#8a8178] mb-1">Configuration</dt>
                  <dd className="font-medium text-[#1a1a1a]">{project.bhk}</dd>
                </div>
                <div>
                  <dt className="text-[#8a8178] mb-1">Area</dt>
                  <dd className="font-medium text-[#1a1a1a]">{project.sqft.toLocaleString()} sq ft</dd>
                </div>
                <div>
                  <dt className="text-[#8a8178] mb-1">Project Type</dt>
                  <dd className="font-medium text-[#1a1a1a]">{project.type}</dd>
                </div>
                <div>
                  <dt className="text-[#8a8178] mb-1">Rooms Covered</dt>
                  <dd className="font-medium text-[#1a1a1a]">{project.rooms.join(', ')}</dd>
                </div>
                <div>
                  <dt className="text-[#8a8178] mb-1">Location</dt>
                  <dd className="font-medium text-[#1a1a1a] flex items-center gap-1">
                    <MapPin size={13} className="text-[#c4a46b]" /> {project.location}
                  </dd>
                </div>
              </dl>
            </div>

            {project.brands.length > 0 && (
              <div className="bg-white p-6 border border-[#e8e2d6]">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-[#c4a46b] mb-4">Brands Used</h2>
                <div className="flex flex-wrap gap-2">
                  {project.brands.map((b) => (
                    <span key={b} className="text-xs bg-[#f5f0e8] text-[#5a5450] px-3 py-1.5">{b}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-[#1a1a1a] p-6">
              <p className="text-white text-sm mb-4">Want a similar design for your home?</p>
              <Link
                href="/estimator"
                className="block text-center bg-[#c4a46b] text-white font-medium py-3 text-sm hover:bg-[#b8955a] transition-colors mb-3"
              >
                Get an Estimate
              </Link>
              <Link
                href="/contact"
                className="block text-center border border-white/30 text-white text-sm py-3 hover:bg-white/10 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* NAV */}
      <div className="py-10 bg-white border-t border-[#e8e2d6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-[#5a5450] hover:text-[#c4a46b] transition-colors">
            <ArrowLeft size={14} /> All Projects
          </Link>
          <Link href="/estimator" className="inline-flex items-center gap-2 text-sm font-medium text-[#c4a46b]">
            Get Estimate <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </>
  )
}
