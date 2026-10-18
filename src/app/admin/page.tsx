'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LogOut, Users, FolderOpen, Tag, DollarSign, Download } from 'lucide-react'
import type { Lead } from '@/lib/types'

const STATUSES = ['new', 'contacted', 'qualified', 'won', 'lost'] as const
const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-yellow-100 text-yellow-800',
  qualified: 'bg-purple-100 text-purple-800',
  won: 'bg-green-100 text-green-800',
  lost: 'bg-gray-100 text-gray-700',
}

function formatINR(n: number | null) {
  if (!n) return '—'
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
  return `₹${n.toLocaleString('en-IN')}`
}

export default function AdminPage() {
  const [tab, setTab] = useState<'leads' | 'projects' | 'brands' | 'pricing'>('leads')
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Lead | null>(null)
  const supabase = createClient()

  const loadLeads = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
    setLeads(data || [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { loadLeads() }, [loadLeads])

  async function signOut() {
    await supabase.auth.signOut()
    window.location.reload()
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from('leads').update({ status }).eq('id', id)
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: status as Lead['status'] } : l))
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status: status as Lead['status'] } : prev)
  }

  function exportCSV() {
    const headers = ['ID','Name','Phone','Email','PIN','BHK','SqFt','Type','Rooms','Budget','Est Low','Est High','Status','Source','Date']
    const rows = leads.map(l => [
      l.id,
      `"${l.name.replace(/"/g, '""')}"`,
      l.phone,
      l.email,
      l.pin_code,
      l.bhk || '',
      l.sqft || '',
      l.project_type || '',
      (l.room_types || []).join('; '),
      l.budget_range || '',
      l.estimate_low || '',
      l.estimate_high || '',
      l.status,
      l.source || '',
      new Date(l.created_at).toLocaleDateString('en-IN'),
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `triarch-leads-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-[#e8e2d6] px-6 py-4 flex items-center justify-between">
        <img src="/logo.png" alt="Triarch Admin" className="h-8 w-auto" />
        <button
          id="admin-signout"
          onClick={signOut}
          className="flex items-center gap-1.5 text-xs text-[#5a5450] hover:text-[#1a1a1a] transition-colors"
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-48 bg-white border-r border-[#e8e2d6] min-h-[calc(100vh-56px)]">
          <nav className="p-3 space-y-1">
            {[
              { key: 'leads', label: 'Leads', icon: Users },
              { key: 'projects', label: 'Projects', icon: FolderOpen },
              { key: 'brands', label: 'Brands', icon: Tag },
              { key: 'pricing', label: 'Pricing', icon: DollarSign },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                id={`admin-tab-${key}`}
                onClick={() => setTab(key as typeof tab)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm rounded transition-colors ${
                  tab === key ? 'bg-[#f5f0e8] text-[#c4a46b] font-medium' : 'text-[#5a5450] hover:text-[#1a1a1a] hover:bg-[#faf8f5]'
                }`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 p-6">
          {tab === 'leads' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="font-display text-2xl text-[#1a1a1a]">Leads ({leads.length})</h1>
                <button
                  id="export-leads"
                  onClick={exportCSV}
                  className="flex items-center gap-1.5 border border-[#e8e2d6] text-xs font-medium px-3 py-2 hover:border-[#c4a46b] hover:text-[#c4a46b] transition-colors"
                >
                  <Download size={13} /> Export CSV
                </button>
              </div>

              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-14 shimmer rounded" />
                  ))}
                </div>
              ) : leads.length === 0 ? (
                <div className="text-center py-20 text-[#8a8178] text-sm">
                  No leads yet. They will appear here once visitors submit enquiries.
                </div>
              ) : (
                <div className="bg-white border border-[#e8e2d6] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-[#faf8f5] border-b border-[#e8e2d6]">
                          <th className="text-left px-4 py-3 text-xs text-[#8a8178] font-medium">Name</th>
                          <th className="text-left px-4 py-3 text-xs text-[#8a8178] font-medium">Phone</th>
                          <th className="text-left px-4 py-3 text-xs text-[#8a8178] font-medium">BHK</th>
                          <th className="text-left px-4 py-3 text-xs text-[#8a8178] font-medium">Budget</th>
                          <th className="text-left px-4 py-3 text-xs text-[#8a8178] font-medium">Estimate</th>
                          <th className="text-left px-4 py-3 text-xs text-[#8a8178] font-medium">Status</th>
                          <th className="text-left px-4 py-3 text-xs text-[#8a8178] font-medium">Date</th>
                          <th className="px-4 py-3" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#f0ece4]">
                        {leads.map((lead) => (
                          <tr key={lead.id} className="hover:bg-[#faf8f5] transition-colors">
                            <td className="px-4 py-3 font-medium text-[#1a1a1a]">{lead.name}</td>
                            <td className="px-4 py-3 text-[#5a5450]">
                              <a href={`tel:${lead.phone}`} className="hover:text-[#c4a46b]">{lead.phone}</a>
                            </td>
                            <td className="px-4 py-3 text-[#5a5450]">{lead.bhk || '—'}</td>
                            <td className="px-4 py-3 text-[#5a5450]">{lead.budget_range ? `₹${lead.budget_range}L` : '—'}</td>
                            <td className="px-4 py-3 text-[#5a5450]">
                              {lead.estimate_low ? `${formatINR(lead.estimate_low)}–${formatINR(lead.estimate_high)}` : '—'}
                            </td>
                            <td className="px-4 py-3">
                              <select
                                value={lead.status}
                                onChange={e => updateStatus(lead.id, e.target.value)}
                                className={`text-xs px-2 py-1 rounded-full border-0 outline-none cursor-pointer ${STATUS_COLORS[lead.status]}`}
                              >
                                {STATUSES.map(s => (
                                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-4 py-3 text-[#8a8178] text-xs">
                              {new Date(lead.created_at).toLocaleDateString('en-IN')}
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => setSelected(lead)}
                                className="text-xs text-[#c4a46b] hover:underline"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'projects' && (
            <div>
              <h1 className="font-display text-2xl text-[#1a1a1a] mb-2">Projects</h1>
              <p className="text-sm text-[#5a5450] mb-6">Manage your project portfolio. Connect a Supabase project to enable live editing.</p>
              <div className="bg-white border border-[#e8e2d6] p-8 text-center text-[#8a8178]">
                <FolderOpen size={32} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm">Project management requires Supabase setup. Configure your environment variables to enable this section.</p>
              </div>
            </div>
          )}

          {tab === 'brands' && (
            <div>
              <h1 className="font-display text-2xl text-[#1a1a1a] mb-2">Brands</h1>
              <p className="text-sm text-[#5a5450] mb-6">Manage brands and materials shown on the public site.</p>
              <div className="bg-white border border-[#e8e2d6] p-8 text-center text-[#8a8178]">
                <Tag size={32} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm">Brands management requires Supabase setup. Configure your environment variables to enable this section.</p>
              </div>
            </div>
          )}

          {tab === 'pricing' && (
            <div>
              <h1 className="font-display text-2xl text-[#1a1a1a] mb-2">Pricing Rules</h1>
              <p className="text-sm text-[#5a5450] mb-6">Edit indicative rates used by the estimator. Requires Supabase setup.</p>
              <div className="bg-white border border-[#e8e2d6] p-8 text-center text-[#8a8178]">
                <DollarSign size={32} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm">Pricing management requires Supabase setup. Configure your environment variables to enable this section.</p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Lead detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="p-6 border-b border-[#e8e2d6] flex items-center justify-between">
              <h2 className="font-display text-lg text-[#1a1a1a]">{selected.name}</h2>
              <button onClick={() => setSelected(null)} className="text-[#8a8178] hover:text-[#1a1a1a] text-xl">×</button>
            </div>
            <div className="p-6 space-y-3 text-sm">
              {[
                ['Phone', selected.phone],
                ['Email', selected.email],
                ['PIN Code', selected.pin_code],
                ['BHK', selected.bhk],
                ['Area', selected.sqft ? `${selected.sqft} sq ft` : null],
                ['Type', selected.project_type],
                ['Rooms', (selected.room_types || []).join(', ')],
                ['Budget Range', selected.budget_range ? `₹${selected.budget_range}L` : null],
                ['Estimate', selected.estimate_low ? `${formatINR(selected.estimate_low)} – ${formatINR(selected.estimate_high)}` : null],
                ['Source', selected.source],
                ['Status', selected.status],
                ['Submitted', new Date(selected.created_at).toLocaleString('en-IN')],
              ].map(([label, value]) => value ? (
                <div key={String(label)} className="flex gap-4">
                  <span className="text-[#8a8178] w-24 flex-shrink-0">{label}</span>
                  <span className="text-[#1a1a1a] font-medium">{value}</span>
                </div>
              ) : null)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
