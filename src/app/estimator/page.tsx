import type { Metadata } from 'next'
import EstimatorWizard from '@/components/EstimatorWizard'

export const metadata: Metadata = {
  title: 'Interior Design Price Estimator Hyderabad | Triarch Interiors',
  description:
    'Use Triarch Interiors\' free multi-step estimator to get an indicative budget for your residential interior design project in Hyderabad.',
  alternates: { canonical: 'https://triarchinteriors.com/estimator' },
}

export default function EstimatorPage() {
  return (
    <>
      <section className="pt-32 pb-10 md:pt-40 md:pb-14 bg-white border-b border-[#e8e2d6]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#c4a46b] text-xs font-semibold uppercase tracking-[0.25em] mb-3">
            Budget Planning
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-light text-[#1a1a1a]">
            Get a Free Estimate
          </h1>
          <p className="mt-4 text-[#5a5450] leading-relaxed">
            Answer a few questions and we'll provide an indicative budget range for your project. 
            This is not a final quotation — we'll discuss exact pricing during your consultation.
          </p>
        </div>
      </section>
      <section className="py-16 md:py-24 bg-[#faf8f5]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <EstimatorWizard />
        </div>
      </section>
    </>
  )
}
