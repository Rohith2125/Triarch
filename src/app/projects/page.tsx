import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Interior Design Projects in Hyderabad | Triarch Interiors',
  description:
    'Browse completed residential interior design projects by Triarch Interiors — covering 1BHK, 2BHK, 3BHK, kitchen renovations, and full-home interiors across Hyderabad.',
  alternates: { canonical: 'https://triarchinteriors.com/projects' },
}

const projects = [
  {
    title: '3BHK — Gachibowli',
    desc: 'Contemporary open-plan living with walnut accents and city views. Full-home interior with modular kitchen.',
    image: '/project-3bhk.jpg',
    bhk: '3BHK',
    sqft: '1850 sq ft',
    type: 'New Home',
    slug: 'gachibowli-3bhk',
    rooms: ['Living Room', 'Bedrooms', 'Kitchen', 'Study Room'],
  },
  {
    title: 'Kitchen Renovation — Jubilee Hills',
    desc: 'High-gloss modular kitchen with gold hardware, quartz countertops, and island seating.',
    image: '/project-kitchen.jpg',
    bhk: 'Kitchen',
    sqft: '220 sq ft',
    type: 'Renovation',
    slug: 'jubilee-hills-kitchen',
    rooms: ['Modular Kitchen'],
  },
  {
    title: 'Master Bedroom — Banjara Hills',
    desc: 'Warm walnut panelling, cove lighting, custom wardrobe, and upholstered headboard.',
    image: '/project-bedroom.jpg',
    bhk: '2BHK',
    sqft: '180 sq ft',
    type: 'New Home',
    slug: 'banjara-hills-bedroom',
    rooms: ['Bedroom', 'Wardrobe'],
  },
]

export default function ProjectsPage() {
  return (
    <>
      {/* PAGE HEADER */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 bg-white border-b border-[#e8e2d6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[#c4a46b] text-xs font-semibold uppercase tracking-[0.25em] mb-3">Portfolio</p>
          <h1 className="font-display text-4xl md:text-5xl font-light text-[#1a1a1a] max-w-xl">
            Our Projects
          </h1>
          <p className="mt-4 text-[#5a5450] max-w-xl">
            A selection of completed residential interior design projects across Hyderabad. 
            Note: These are sample entries — real project photography will be published as work is approved for display.
          </p>
        </div>
      </section>

      {/* PROJECTS GRID */}
      <section className="py-16 md:py-24 bg-[#faf8f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {projects.map((project) => (
              <Link
                key={project.slug}
                href={`/projects/${project.slug}`}
                className="group block bg-white card-hover overflow-hidden border border-[#e8e2d6]"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={project.image}
                    alt={`${project.title} — interior design by Triarch Interiors`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-[#c4a46b] text-white text-xs font-medium px-2.5 py-1">
                    {project.type}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
                    <span className="text-white font-medium text-sm flex items-center gap-1">
                      View Project <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#8a8178] mb-3">
                    <span className="bg-[#f5f0e8] px-2 py-0.5">{project.bhk}</span>
                    <span>{project.sqft}</span>
                  </div>
                  <h2 className="font-display text-lg font-medium text-[#1a1a1a] mb-2">
                    {project.title}
                  </h2>
                  <p className="text-sm text-[#5a5450] leading-relaxed mb-3">{project.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {project.rooms.map((r) => (
                      <span key={r} className="text-xs text-[#8a8178] border border-[#e8e2d6] px-2 py-0.5">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-16 text-center p-10 bg-white border border-[#e8e2d6]">
            <p className="text-[#8a8178] text-sm mb-4">
              More projects coming soon. These are sample entries — we're building our portfolio.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-[#c4a46b] font-medium text-sm border-b border-[#c4a46b] pb-0.5"
            >
              Enquire about a similar project <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
