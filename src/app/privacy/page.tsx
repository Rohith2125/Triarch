import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Triarch Interiors',
  description: 'How Triarch Interiors collects, uses, and protects your personal information.',
  robots: { index: false },
}

export default function PrivacyPage() {
  return (
    <div className="pt-32 pb-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl md:text-4xl font-light text-[#1a1a1a] mb-8">Privacy Policy</h1>
      <div className="prose prose-sm text-[#5a5450] space-y-6">
        <p className="text-[#8a8178] text-sm">Last updated: October 2026</p>
        <section>
          <h2 className="font-display text-xl text-[#1a1a1a] mb-3">What we collect</h2>
          <p>When you submit an enquiry through our website, we collect your name, phone number, email address, and PIN code. If you use the price estimator, we also collect your project requirements (BHK, area, room types, and budget range) to help us respond to your enquiry.</p>
        </section>
        <section>
          <h2 className="font-display text-xl text-[#1a1a1a] mb-3">How we use it</h2>
          <p>We use your information solely to respond to your enquiry about interior design services and to follow up regarding your project. We do not sell or share your personal information with third parties for marketing purposes.</p>
        </section>
        <section>
          <h2 className="font-display text-xl text-[#1a1a1a] mb-3">Data retention</h2>
          <p>We retain enquiry data for the period necessary to respond to your request and manage the business relationship. You may contact us to request deletion of your information.</p>
        </section>
        <section>
          <h2 className="font-display text-xl text-[#1a1a1a] mb-3">Security</h2>
          <p>We store your information securely and restrict access to authorised staff only. We use HTTPS and follow reasonable security practices to protect your data.</p>
        </section>
        <section>
          <h2 className="font-display text-xl text-[#1a1a1a] mb-3">Contact</h2>
          <p>For any questions about your data or to request deletion, please contact us via WhatsApp at +91 79939 76742.</p>
        </section>
      </div>
    </div>
  )
}
