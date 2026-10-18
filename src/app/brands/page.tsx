import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Brands & Materials | Triarch Interiors Hyderabad',
  description:
    'Explore the premium brands and materials Triarch Interiors uses — laminates, hardware, tiles, sanitary ware, paints, and more for residential interiors in Hyderabad.',
  alternates: { canonical: 'https://triarchinteriors.com/brands' },
}

const brands = [
  {
    category: 'Laminates & Boards',
    items: [
      { name: 'Greenply', desc: 'Premium plywood and MDF for furniture and cabinetry construction.' },
      { name: 'Merino', desc: 'High-pressure laminates in a wide range of textures and finishes.' },
      { name: 'Greenlam', desc: 'Designer laminates for surfaces, shutters, and wall cladding.' },
    ],
  },
  {
    category: 'Hardware & Fittings',
    items: [
      { name: 'Hafele', desc: 'German precision hardware — hinges, channels, handles, and kitchen fittings.' },
      { name: 'Hettich', desc: 'Quality drawer systems, soft-close channels, and wardrobe hardware.' },
      { name: 'Blum', desc: 'Premium Austrian hardware for smooth, durable cabinet mechanisms.' },
    ],
  },
  {
    category: 'Tiles & Stone',
    items: [
      { name: 'Kajaria', desc: 'India\u2019s leading tile manufacturer — floors, walls, and bathroom tiles.' },
      { name: 'Somany', desc: 'A wide range of vitrified and ceramic tiles for every application.' },
      { name: 'Johnson Tiles', desc: 'Trusted tiles for kitchens, bathrooms, and living spaces.' },
    ],
  },
  {
    category: 'Sanitary Ware',
    items: [
      { name: 'Kohler', desc: 'Premium sanitary ware and bathroom fittings.' },
      { name: 'Duravit', desc: 'Designer bathroom solutions with European craftsmanship.' },
      { name: 'Jaquar', desc: 'Complete bathroom solutions from taps to showers to sanitary ware.' },
    ],
  },
  {
    category: 'Paints & Surfaces',
    items: [
      { name: 'Asian Paints', desc: 'Premium interior paints, textures, and wallcovering solutions.' },
      { name: 'Berger', desc: 'Quality wall and wood finishes for interiors.' },
    ],
  },
  {
    category: 'Lighting',
    items: [
      { name: 'Philips', desc: 'Energy-efficient LED lighting solutions for all spaces.' },
      { name: 'Havells', desc: 'Decorative and functional lighting for Indian homes.' },
    ],
  },
]

export default function BrandsPage() {
  return (
    <>
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 bg-white border-b border-[#e8e2d6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[#c4a46b] text-xs font-semibold uppercase tracking-[0.25em] mb-3">Quality Assured</p>
          <h1 className="font-display text-4xl md:text-5xl font-light text-[#1a1a1a] max-w-xl">
            Brands &amp; Materials
          </h1>
          <p className="mt-4 text-[#5a5450] max-w-lg leading-relaxed">
            We work with trusted, quality brands across laminates, hardware, tiles, sanitary ware, paints, and lighting. 
            The actual brands specified depend on project scope, budget, and client preferences.
          </p>
          <p className="mt-3 text-xs text-[#8a8178]">
            * Brand logos and listings are for reference only. Working with a brand does not imply an exclusive partnership or endorsement unless stated.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-[#faf8f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          {brands.map((cat) => (
            <div key={cat.category}>
              <h2 className="font-display text-xl font-medium text-[#1a1a1a] mb-1">
                {cat.category}
              </h2>
              <div className="section-divider mb-6" />
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {cat.items.map((brand) => (
                  <div
                    key={brand.name}
                    className="bg-white p-6 border border-[#e8e2d6] flex flex-col gap-2 hover:border-[#c4a46b] transition-colors"
                  >
                    <h3 className="font-display text-base font-medium text-[#1a1a1a]">{brand.name}</h3>
                    <p className="text-sm text-[#5a5450] leading-relaxed">{brand.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
