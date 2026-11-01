'use client'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MapPin, Phone, MessageCircle } from 'lucide-react'

export default function Footer() {
  const pathname = usePathname()
  if (pathname?.startsWith('/admin')) {
    return null
  }
  return (
    <footer className="bg-[#1a1a1a] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Image
              src="/logo.svg"
              alt="Triarch Interiors"
              width={160}
              height={78}
              className="h-10 w-auto mb-5 brightness-0 invert"
            />
            <p className="text-[#a09890] text-sm leading-relaxed max-w-sm">
              End-to-end residential interior design across Hyderabad. 
              We craft spaces that reflect your lifestyle and elevate everyday living.
            </p>
            <div className="mt-6 flex items-center gap-4">
              <a
                href="https://wa.me/917993976742?text=Hello%2C%20I%20am%20interested%20in%20interior%20design%20services"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#25d366] text-white text-sm font-medium px-4 py-2.5 hover:bg-[#20bc5a] transition-colors"
                aria-label="WhatsApp Triarch Interiors"
              >
                <MessageCircle size={16} />
                WhatsApp Us
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-[#c4a46b] text-xs font-semibold uppercase tracking-widest mb-5">
              Quick Links
            </h3>
            <ul className="space-y-3 text-sm text-[#a09890]">
              {[
                { href: '/projects', label: 'Our Projects' },
                { href: '/estimator', label: 'Price Estimator' },
                { href: '/brands', label: 'Brands & Materials' },
                { href: '/about', label: 'About Us' },
                { href: '/contact', label: 'Contact' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-[#c4a46b] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-[#c4a46b] text-xs font-semibold uppercase tracking-widest mb-5">
              Contact
            </h3>
            <ul className="space-y-4 text-sm text-[#a09890]">
              <li className="flex items-start gap-3">
                <Phone size={15} className="mt-0.5 flex-shrink-0 text-[#c4a46b]" />
                <a href="tel:+917993976742" className="hover:text-white transition-colors">
                  +91 79939 76742
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={15} className="mt-0.5 flex-shrink-0 text-[#c4a46b]" />
                <a
                  href="https://maps.app.goo.gl/jrUbQCYLKLQ6ZUuX7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Hyderabad, Telangana
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#2d2d2d] flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[#5a5450]">
          <p>© {new Date().getFullYear()} Triarch Interiors. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-[#c4a46b] transition-colors">
              Privacy Policy
            </Link>
            <a
              href="https://maps.app.goo.gl/jrUbQCYLKLQ6ZUuX7"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#c4a46b] transition-colors"
            >
              Find Us on Maps
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
