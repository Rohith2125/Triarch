import type { Metadata } from 'next'
import AdminGuard from '@/components/AdminGuard'

export const metadata: Metadata = {
  title: 'Admin | Triarch Interiors',
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-[#f8f7f5]">
        {children}
      </div>
    </AdminGuard>
  )
}
