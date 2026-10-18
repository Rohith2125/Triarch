'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Session } from '@supabase/supabase-js'

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => setSession(sess))
    return () => sub.subscription.unsubscribe()
  }, [])

  async function signIn(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) setError(err.message)
    setLoading(false)
  }

  if (session === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#c4a46b] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f5] p-4">
        <div className="bg-white border border-[#e8e2d6] p-8 w-full max-w-sm">
          <img src="/logo.png" alt="Triarch Interiors" className="h-10 w-auto mb-8" />
          <h1 className="font-display text-2xl text-[#1a1a1a] mb-6">Admin Sign In</h1>
          <form onSubmit={signIn} className="space-y-4">
            <div>
              <label htmlFor="admin-email" className="block text-xs text-[#5a5450] mb-1.5">Email</label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full border border-[#e8e2d6] px-3 py-2.5 text-sm outline-none focus:border-[#c4a46b]"
              />
            </div>
            <div>
              <label htmlFor="admin-password" className="block text-xs text-[#5a5450] mb-1.5">Password</label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full border border-[#e8e2d6] px-3 py-2.5 text-sm outline-none focus:border-[#c4a46b]"
              />
            </div>
            {error && <p className="text-red-600 text-xs">{error}</p>}
            <button
              type="submit"
              id="admin-sign-in"
              disabled={loading}
              className="w-full bg-[#1a1a1a] text-white py-3 text-sm font-medium hover:bg-[#c4a46b] disabled:opacity-60 transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
