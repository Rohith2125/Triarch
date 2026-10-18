import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-[#faf8f5]">
      <p className="text-[#c4a46b] text-xs font-semibold uppercase tracking-widest mb-4">404</p>
      <h1 className="font-display text-4xl font-light text-[#1a1a1a] mb-4">Page Not Found</h1>
      <p className="text-[#5a5450] text-sm mb-8">The page you're looking for doesn't exist or may have moved.</p>
      <Link href="/" className="bg-[#1a1a1a] text-white px-6 py-3 text-sm font-medium hover:bg-[#c4a46b] transition-colors">
        Back to Home
      </Link>
    </div>
  )
}
