import type { Metadata } from 'next'
import ContactForm from '@/components/ContactForm'
import { Phone, MapPin, MessageCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contact Triarch Interiors | Interior Design Hyderabad',
  description:
    'Get in touch with Triarch Interiors — book a consultation for residential interior design in Hyderabad. Call, WhatsApp, or fill in our contact form.',
  alternates: { canonical: 'https://triarchinteriors.com/contact' },
}

export default function ContactPage() {
  return (
    <>
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 bg-white border-b border-[#e8e2d6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[#c4a46b] text-xs font-semibold uppercase tracking-[0.25em] mb-3">Let's Talk</p>
          <h1 className="font-display text-4xl md:text-5xl font-light text-[#1a1a1a] max-w-xl">
            Contact Us
          </h1>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-[#faf8f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 md:gap-20">
          {/* Contact info */}
          <div>
            <h2 className="font-display text-2xl font-light text-[#1a1a1a] mb-8">Get in Touch</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#f5f0e8] flex items-center justify-center flex-shrink-0">
                  <Phone size={18} className="text-[#c4a46b]" />
                </div>
                <div>
                  <p className="text-xs text-[#8a8178] uppercase tracking-wider mb-1">Phone</p>
                  <a href="tel:+917993976742" className="text-[#1a1a1a] font-medium hover:text-[#c4a46b] transition-colors">
                    +91 79939 76742
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#f5f0e8] flex items-center justify-center flex-shrink-0">
                  <MessageCircle size={18} className="text-[#c4a46b]" />
                </div>
                <div>
                  <p className="text-xs text-[#8a8178] uppercase tracking-wider mb-1">WhatsApp</p>
                  <a
                    href="https://wa.me/917993976742?text=Hello%2C%20I%20would%20like%20to%20enquire%20about%20interior%20design%20services"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#1a1a1a] font-medium hover:text-[#c4a46b] transition-colors"
                  >
                    Chat on WhatsApp
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#f5f0e8] flex items-center justify-center flex-shrink-0">
                  <MapPin size={18} className="text-[#c4a46b]" />
                </div>
                <div>
                  <p className="text-xs text-[#8a8178] uppercase tracking-wider mb-1">Service Area</p>
                  <p className="text-[#1a1a1a]">Hyderabad, Telangana</p>
                  <a
                    href="https://maps.app.goo.gl/jrUbQCYLKLQ6ZUuX7"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#c4a46b] hover:text-[#b8955a] transition-colors mt-1 block"
                  >
                    View on Google Maps →
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-10 p-5 bg-white border border-[#e8e2d6]">
              <p className="text-sm text-[#5a5450] leading-relaxed">
                We serve residential projects across Hyderabad — Gachibowli, HITEC City, Banjara Hills, 
                Jubilee Hills, Kondapur, Manikonda, Miyapur, Begumpet, and surrounding areas.
              </p>
            </div>
          </div>

          {/* Form */}
          <div>
            <h2 className="font-display text-2xl font-light text-[#1a1a1a] mb-8">Send an Enquiry</h2>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  )
}
