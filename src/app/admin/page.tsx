'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  LogOut,
  Users,
  FolderOpen,
  Tag,
  DollarSign,
  Download,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
} from 'lucide-react'
import type { Lead, Project, Brand, PricingRuleDB } from '@/lib/types'

const STATUSES = ['new', 'contacted', 'qualified', 'won', 'lost'] as const
const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-yellow-100 text-yellow-800',
  qualified: 'bg-purple-100 text-purple-800',
  won: 'bg-green-100 text-green-800',
  lost: 'bg-gray-100 text-gray-700',
}

function formatINR(n: number | null | undefined) {
  if (!n) return '—'
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)} Cr`
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
  return `₹${n.toLocaleString('en-IN')}`
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function AdminPage() {
  const [tab, setTab] = useState<'leads' | 'projects' | 'brands' | 'pricing'>('leads')
  const supabase = useMemo(() => createClient(), [])

  // Action notification toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }, [])

  // ==========================================
  // 1. LEADS STATE & ACTIONS
  // ==========================================
  const [leads, setLeads] = useState<Lead[]>([])
  const [loadingLeads, setLoadingLeads] = useState(true)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [leadSearch, setLeadSearch] = useState('')
  const [leadStatusFilter, setLeadStatusFilter] = useState<string>('all')

  const loadLeads = useCallback(async () => {
    setLoadingLeads(true)
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) {
      showToast('Error loading leads: ' + error.message, 'error')
    } else {
      setLeads(data || [])
    }
    setLoadingLeads(false)
  }, [supabase, showToast])

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from('leads').update({ status }).eq('id', id)
    if (error) {
      showToast('Failed to update status: ' + error.message, 'error')
      return
    }
    setLeads(prev => prev.map(l => (l.id === id ? { ...l, status: status as Lead['status'] } : l)))
    if (selectedLead?.id === id) {
      setSelectedLead(prev => (prev ? { ...prev, status: status as Lead['status'] } : prev))
    }
    showToast('Lead status updated.')
  }

  async function deleteLead(id: string, name: string) {
    if (!window.confirm(`Are you sure you want to permanently delete lead "${name}"?`)) return
    const { error } = await supabase.from('leads').delete().eq('id', id)
    if (error) {
      showToast('Failed to delete lead: ' + error.message, 'error')
      return
    }
    setLeads(prev => prev.filter(l => l.id !== id))
    if (selectedLead?.id === id) setSelectedLead(null)
    showToast(`Lead "${name}" deleted successfully.`)
  }

  function exportCSV() {
    const headers = [
      'ID',
      'Name',
      'Phone',
      'Email',
      'PIN',
      'BHK',
      'SqFt',
      'Type',
      'Rooms',
      'Budget',
      'Est Low',
      'Est High',
      'Status',
      'Source',
      'Notes',
      'Date',
    ]
    const rows = leads.map(l => [
      l.id,
      `"${(l.name || '').replace(/"/g, '""')}"`,
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
      `"${(l.notes || '').replace(/"/g, '""')}"`,
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

  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      const matchesSearch =
        l.name?.toLowerCase().includes(leadSearch.toLowerCase()) ||
        l.phone?.includes(leadSearch) ||
        l.email?.toLowerCase().includes(leadSearch.toLowerCase()) ||
        l.pin_code?.includes(leadSearch)
      const matchesStatus = leadStatusFilter === 'all' || l.status === leadStatusFilter
      return matchesSearch && matchesStatus
    })
  }, [leads, leadSearch, leadStatusFilter])

  // ==========================================
  // 2. PROJECTS STATE & ACTIONS
  // ==========================================
  const [projects, setProjects] = useState<Project[]>([])
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [projectSearch, setProjectSearch] = useState('')
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null)
  const [isNewProject, setIsNewProject] = useState(false)
  const [savingProject, setSavingProject] = useState(false)
  const [projectFormError, setProjectFormError] = useState('')

  // Form helpers for array inputs
  const [projectRoomsText, setProjectRoomsText] = useState('')
  const [projectBrandsText, setProjectBrandsText] = useState('')
  const [projectGalleryText, setProjectGalleryText] = useState('')

  const loadProjects = useCallback(async () => {
    setLoadingProjects(true)
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) {
      showToast('Error loading projects: ' + error.message, 'error')
    } else {
      setProjects(data || [])
    }
    setLoadingProjects(false)
  }, [supabase, showToast])

  function openNewProjectModal() {
    setIsNewProject(true)
    setProjectFormError('')
    setProjectRoomsText('')
    setProjectBrandsText('')
    setProjectGalleryText('')
    setEditingProject({
      title: '',
      slug: '',
      description: '',
      bhk: '3BHK',
      sqft: 1500,
      project_type: 'new-home',
      cover_image: '/project-3bhk.jpg',
      location: 'Hyderabad',
      is_published: true,
      room_types: [],
      brands_used: [],
      gallery_images: [],
    })
  }

  function openEditProjectModal(project: Project) {
    setIsNewProject(false)
    setProjectFormError('')
    setProjectRoomsText((project.room_types || []).join(', '))
    setProjectBrandsText((project.brands_used || []).join(', '))
    setProjectGalleryText((project.gallery_images || []).join('\n'))
    setEditingProject({ ...project })
  }

  async function togglePublishProject(project: Project) {
    const nextState = !project.is_published
    const { error } = await supabase
      .from('projects')
      .update({ is_published: nextState })
      .eq('id', project.id)
    if (error) {
      showToast('Failed to update project status: ' + error.message, 'error')
      return
    }
    setProjects(prev =>
      prev.map(p => (p.id === project.id ? { ...p, is_published: nextState } : p))
    )
    showToast(`Project "${project.title}" ${nextState ? 'published' : 'moved to drafts'}.`)
  }

  async function deleteProject(id: string, title: string) {
    if (!window.confirm(`Are you sure you want to permanently delete project "${title}"?`)) return
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) {
      showToast('Failed to delete project: ' + error.message, 'error')
      return
    }
    setProjects(prev => prev.filter(p => p.id !== id))
    showToast(`Project "${title}" deleted successfully.`)
  }

  async function handleSaveProject(e: React.FormEvent) {
    e.preventDefault()
    if (!editingProject) return
    setProjectFormError('')

    if (!editingProject.title?.trim()) {
      setProjectFormError('Project title is required.')
      return
    }
    const cleanSlug = editingProject.slug?.trim() || slugify(editingProject.title)
    if (!cleanSlug) {
      setProjectFormError('Project slug is required.')
      return
    }

    setSavingProject(true)
    const roomTypes = projectRoomsText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
    const brandsUsed = projectBrandsText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
    const galleryImages = projectGalleryText
      .split(/[\n,]/)
      .map(s => s.trim())
      .filter(Boolean)

    const payload = {
      title: editingProject.title.trim(),
      slug: cleanSlug,
      description: editingProject.description?.trim() || null,
      bhk: editingProject.bhk || null,
      sqft: editingProject.sqft ? Number(editingProject.sqft) : null,
      project_type: editingProject.project_type || 'new-home',
      cover_image: editingProject.cover_image?.trim() || null,
      location: editingProject.location?.trim() || null,
      room_types: roomTypes.length > 0 ? roomTypes : null,
      brands_used: brandsUsed.length > 0 ? brandsUsed : null,
      gallery_images: galleryImages.length > 0 ? galleryImages : null,
      seo_title: editingProject.seo_title?.trim() || null,
      seo_description: editingProject.seo_description?.trim() || null,
      is_published: !!editingProject.is_published,
    }

    if (isNewProject) {
      const { data, error } = await supabase
        .from('projects')
        .insert([payload])
        .select()
        .single()
      if (error) {
        setProjectFormError(error.message)
        setSavingProject(false)
        return
      }
      setProjects(prev => [data, ...prev])
      showToast(`Project "${payload.title}" created successfully.`)
    } else {
      const { data, error } = await supabase
        .from('projects')
        .update(payload)
        .eq('id', editingProject.id)
        .select()
        .single()
      if (error) {
        setProjectFormError(error.message)
        setSavingProject(false)
        return
      }
      setProjects(prev => prev.map(p => (p.id === data.id ? data : p)))
      showToast(`Project "${payload.title}" updated successfully.`)
    }

    setSavingProject(false)
    setEditingProject(null)
  }

  const filteredProjects = useMemo(() => {
    return projects.filter(
      p =>
        p.title.toLowerCase().includes(projectSearch.toLowerCase()) ||
        p.slug.toLowerCase().includes(projectSearch.toLowerCase()) ||
        p.location?.toLowerCase().includes(projectSearch.toLowerCase()) ||
        p.bhk?.toLowerCase().includes(projectSearch.toLowerCase())
    )
  }, [projects, projectSearch])

  // ==========================================
  // 3. BRANDS STATE & ACTIONS
  // ==========================================
  const [brands, setBrands] = useState<Brand[]>([])
  const [loadingBrands, setLoadingBrands] = useState(false)
  const [brandSearch, setBrandSearch] = useState('')
  const [editingBrand, setEditingBrand] = useState<Partial<Brand> | null>(null)
  const [isNewBrand, setIsNewBrand] = useState(false)
  const [savingBrand, setSavingBrand] = useState(false)
  const [brandFormError, setBrandFormError] = useState('')

  const loadBrands = useCallback(async () => {
    setLoadingBrands(true)
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .order('category', { ascending: true })
    if (error) {
      showToast('Error loading brands: ' + error.message, 'error')
    } else {
      setBrands(data || [])
    }
    setLoadingBrands(false)
  }, [supabase, showToast])

  function openNewBrandModal() {
    setIsNewBrand(true)
    setBrandFormError('')
    setEditingBrand({
      name: '',
      category: 'Hardware & Fittings',
      description: '',
      logo_url: '',
      is_active: true,
    })
  }

  function openEditBrandModal(brand: Brand) {
    setIsNewBrand(false)
    setBrandFormError('')
    setEditingBrand({ ...brand })
  }

  async function toggleBrandActive(brand: Brand) {
    const nextState = !brand.is_active
    const { error } = await supabase
      .from('brands')
      .update({ is_active: nextState })
      .eq('id', brand.id)
    if (error) {
      showToast('Failed to update brand status: ' + error.message, 'error')
      return
    }
    setBrands(prev => prev.map(b => (b.id === brand.id ? { ...b, is_active: nextState } : b)))
    showToast(`Brand "${brand.name}" set to ${nextState ? 'Active' : 'Inactive'}.`)
  }

  async function deleteBrand(id: string, name: string) {
    if (!window.confirm(`Are you sure you want to permanently delete brand "${name}"?`)) return
    const { error } = await supabase.from('brands').delete().eq('id', id)
    if (error) {
      showToast('Failed to delete brand: ' + error.message, 'error')
      return
    }
    setBrands(prev => prev.filter(b => b.id !== id))
    showToast(`Brand "${name}" deleted successfully.`)
  }

  async function handleSaveBrand(e: React.FormEvent) {
    e.preventDefault()
    if (!editingBrand) return
    setBrandFormError('')

    if (!editingBrand.name?.trim()) {
      setBrandFormError('Brand name is required.')
      return
    }
    if (!editingBrand.category?.trim()) {
      setBrandFormError('Brand category is required.')
      return
    }

    setSavingBrand(true)
    const payload = {
      name: editingBrand.name.trim(),
      category: editingBrand.category.trim(),
      description: editingBrand.description?.trim() || null,
      logo_url: editingBrand.logo_url?.trim() || null,
      is_active: editingBrand.is_active !== false,
    }

    if (isNewBrand) {
      const { data, error } = await supabase
        .from('brands')
        .insert([payload])
        .select()
        .single()
      if (error) {
        setBrandFormError(error.message)
        setSavingBrand(false)
        return
      }
      setBrands(prev => [...prev, data])
      showToast(`Brand "${payload.name}" added successfully.`)
    } else {
      const { data, error } = await supabase
        .from('brands')
        .update(payload)
        .eq('id', editingBrand.id)
        .select()
        .single()
      if (error) {
        setBrandFormError(error.message)
        setSavingBrand(false)
        return
      }
      setBrands(prev => prev.map(b => (b.id === data.id ? data : b)))
      showToast(`Brand "${payload.name}" updated successfully.`)
    }

    setSavingBrand(false)
    setEditingBrand(null)
  }

  const filteredBrands = useMemo(() => {
    return brands.filter(
      b =>
        b.name.toLowerCase().includes(brandSearch.toLowerCase()) ||
        b.category.toLowerCase().includes(brandSearch.toLowerCase()) ||
        b.description?.toLowerCase().includes(brandSearch.toLowerCase())
    )
  }, [brands, brandSearch])

  // ==========================================
  // 4. PRICING RULES STATE & ACTIONS
  // ==========================================
  const [pricingRules, setPricingRules] = useState<PricingRuleDB[]>([])
  const [loadingPricing, setLoadingPricing] = useState(false)
  const [editingPricing, setEditingPricing] = useState<Partial<PricingRuleDB> | null>(null)
  const [isNewPricing, setIsNewPricing] = useState(false)
  const [savingPricing, setSavingPricing] = useState(false)
  const [pricingFormError, setPricingFormError] = useState('')

  const loadPricing = useCallback(async () => {
    setLoadingPricing(true)
    const { data, error } = await supabase
      .from('pricing_rules')
      .select('*')
      .order('project_type', { ascending: true })
      .order('rate_per_sqft', { ascending: false })
    if (error) {
      showToast('Error loading pricing rules: ' + error.message, 'error')
    } else {
      setPricingRules(data || [])
    }
    setLoadingPricing(false)
  }, [supabase, showToast])

  function openNewPricingModal() {
    setIsNewPricing(true)
    setPricingFormError('')
    setEditingPricing({
      name: '',
      bhk: '3BHK',
      project_type: 'new-home',
      rate_per_sqft: 1100,
      is_active: true,
    })
  }

  function openEditPricingModal(rule: PricingRuleDB) {
    setIsNewPricing(false)
    setPricingFormError('')
    setEditingPricing({ ...rule })
  }

  async function togglePricingActive(rule: PricingRuleDB) {
    const nextState = !rule.is_active
    const { error } = await supabase
      .from('pricing_rules')
      .update({ is_active: nextState })
      .eq('id', rule.id)
    if (error) {
      showToast('Failed to update pricing rule: ' + error.message, 'error')
      return
    }
    setPricingRules(prev => prev.map(r => (r.id === rule.id ? { ...r, is_active: nextState } : r)))
    showToast(`Pricing rule "${rule.name}" set to ${nextState ? 'Active' : 'Inactive'}.`)
  }

  async function deletePricingRule(id: string, name: string) {
    if (!window.confirm(`Are you sure you want to permanently delete pricing rule "${name}"?`)) return
    const { error } = await supabase.from('pricing_rules').delete().eq('id', id)
    if (error) {
      showToast('Failed to delete pricing rule: ' + error.message, 'error')
      return
    }
    setPricingRules(prev => prev.filter(r => r.id !== id))
    showToast(`Pricing rule "${name}" deleted successfully.`)
  }

  async function handleSavePricing(e: React.FormEvent) {
    e.preventDefault()
    if (!editingPricing) return
    setPricingFormError('')

    if (!editingPricing.name?.trim()) {
      setPricingFormError('Rule name is required.')
      return
    }
    if (!editingPricing.bhk?.trim()) {
      setPricingFormError('BHK type is required.')
      return
    }
    if (!editingPricing.rate_per_sqft || Number(editingPricing.rate_per_sqft) <= 0) {
      setPricingFormError('Rate per sq ft must be greater than 0.')
      return
    }

    setSavingPricing(true)
    const payload = {
      name: editingPricing.name.trim(),
      bhk: editingPricing.bhk.trim(),
      project_type: editingPricing.project_type || 'new-home',
      rate_per_sqft: Number(editingPricing.rate_per_sqft),
      is_active: editingPricing.is_active !== false,
    }

    if (isNewPricing) {
      const { data, error } = await supabase
        .from('pricing_rules')
        .insert([payload])
        .select()
        .single()
      if (error) {
        setPricingFormError(error.message)
        setSavingPricing(false)
        return
      }
      setPricingRules(prev => [data, ...prev])
      showToast(`Pricing rule "${payload.name}" added successfully.`)
    } else {
      const { data, error } = await supabase
        .from('pricing_rules')
        .update(payload)
        .eq('id', editingPricing.id)
        .select()
        .single()
      if (error) {
        setPricingFormError(error.message)
        setSavingPricing(false)
        return
      }
      setPricingRules(prev => prev.map(r => (r.id === data.id ? data : r)))
      showToast(`Pricing rule "${payload.name}" updated successfully.`)
    }

    setSavingPricing(false)
    setEditingPricing(null)
  }

  // Load data based on current tab
  useEffect(() => {
    if (tab === 'leads' && leads.length === 0) loadLeads()
    if (tab === 'projects' && projects.length === 0) loadProjects()
    if (tab === 'brands' && brands.length === 0) loadBrands()
    if (tab === 'pricing' && pricingRules.length === 0) loadPricing()
  }, [tab, loadLeads, loadProjects, loadBrands, loadPricing, leads.length, projects.length, brands.length, pricingRules.length])

  async function signOut() {
    try {
      await Promise.race([
        supabase.auth.signOut(),
        new Promise(resolve => setTimeout(resolve, 2000)),
      ])
    } catch (err) {
      console.warn('Sign out warning:', err)
    } finally {
      if (typeof window !== 'undefined') {
        try {
          localStorage.clear()
          sessionStorage.clear()
        } catch {}
        window.location.href = '/admin'
      }
    }
  }

  return (
    <div className="min-h-screen">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded shadow-lg text-sm flex items-center gap-2 transition-all ${
            toast.type === 'success' ? 'bg-[#1a1a1a] text-white border border-[#c4a46b]' : 'bg-red-800 text-white'
          }`}
        >
          {toast.type === 'success' ? <Check size={16} className="text-[#c4a46b]" /> : <AlertCircle size={16} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-[#e8e2d6] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="Triarch Admin" className="h-8 w-auto" />
          <span className="text-xs uppercase tracking-wider text-[#c4a46b] font-medium border-l border-[#e8e2d6] pl-3">
            Management Portal
          </span>
        </div>
        <button
          id="admin-signout"
          type="button"
          onClick={signOut}
          className="flex items-center gap-1.5 text-xs text-[#5a5450] hover:text-[#1a1a1a] transition-colors cursor-pointer px-3 py-1.5 rounded hover:bg-[#faf8f5] border border-transparent hover:border-[#e8e2d6]"
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-56 bg-white border-r border-[#e8e2d6] min-h-[calc(100vh-65px)]">
          <nav className="p-3 space-y-1">
            {[
              { key: 'leads', label: 'Leads & Enquiries', icon: Users, count: leads.length },
              { key: 'projects', label: 'Projects Portfolio', icon: FolderOpen, count: projects.length },
              { key: 'brands', label: 'Partner Brands', icon: Tag, count: brands.length },
              { key: 'pricing', label: 'Pricing Rules', icon: DollarSign, count: pricingRules.length },
            ].map(({ key, label, icon: Icon, count }) => (
              <button
                key={key}
                id={`admin-tab-${key}`}
                onClick={() => setTab(key as typeof tab)}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded transition-colors ${
                  tab === key
                    ? 'bg-[#f5f0e8] text-[#c4a46b] font-medium'
                    : 'text-[#5a5450] hover:text-[#1a1a1a] hover:bg-[#faf8f5]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={16} />
                  <span>{label}</span>
                </div>
                {count > 0 && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      tab === key ? 'bg-[#c4a46b] text-white' : 'bg-[#f0ece4] text-[#8a8178]'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 max-w-7xl">
          {/* ==================================================== */}
          {/* TAB 1: LEADS                                         */}
          {/* ==================================================== */}
          {tab === 'leads' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="font-display text-2xl text-[#1a1a1a]">Leads ({filteredLeads.length})</h1>
                  <p className="text-xs text-[#8a8178] mt-1">Customer enquiries from website contact form & cost estimator.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={loadLeads}
                    title="Refresh leads"
                    className="p-2 border border-[#e8e2d6] text-[#5a5450] hover:text-[#1a1a1a] hover:border-[#c4a46b]"
                  >
                    <RefreshCw size={14} className={loadingLeads ? 'animate-spin' : ''} />
                  </button>
                  <button
                    id="export-leads"
                    onClick={exportCSV}
                    className="flex items-center gap-1.5 border border-[#e8e2d6] text-xs font-medium px-3 py-2 hover:border-[#c4a46b] hover:text-[#c4a46b] transition-colors bg-white"
                  >
                    <Download size={13} /> Export CSV
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3 top-3 text-[#8a8178]" />
                  <input
                    type="text"
                    placeholder="Search leads by name, phone, email, PIN..."
                    value={leadSearch}
                    onChange={e => setLeadSearch(e.target.value)}
                    className="w-full bg-white border border-[#e8e2d6] pl-9 pr-4 py-2 text-sm outline-none focus:border-[#c4a46b]"
                  />
                </div>
                <select
                  value={leadStatusFilter}
                  onChange={e => setLeadStatusFilter(e.target.value)}
                  className="bg-white border border-[#e8e2d6] px-3 py-2 text-sm outline-none focus:border-[#c4a46b]"
                >
                  <option value="all">All Statuses</option>
                  {STATUSES.map(s => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {loadingLeads ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-14 shimmer rounded bg-white" />
                  ))}
                </div>
              ) : filteredLeads.length === 0 ? (
                <div className="bg-white border border-[#e8e2d6] text-center py-20 text-[#8a8178] text-sm">
                  {leads.length === 0 ? 'No leads yet. They will appear here once visitors submit enquiries.' : 'No leads match your filter.'}
                </div>
              ) : (
                <div className="bg-white border border-[#e8e2d6] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-[#faf8f5] border-b border-[#e8e2d6]">
                          <th className="text-left px-4 py-3 text-xs text-[#8a8178] font-medium">Name</th>
                          <th className="text-left px-4 py-3 text-xs text-[#8a8178] font-medium">Phone & Email</th>
                          <th className="text-left px-4 py-3 text-xs text-[#8a8178] font-medium">BHK & SqFt</th>
                          <th className="text-left px-4 py-3 text-xs text-[#8a8178] font-medium">Estimate</th>
                          <th className="text-left px-4 py-3 text-xs text-[#8a8178] font-medium">Status</th>
                          <th className="text-left px-4 py-3 text-xs text-[#8a8178] font-medium">Date</th>
                          <th className="text-right px-4 py-3 text-xs text-[#8a8178] font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#f0ece4]">
                        {filteredLeads.map(lead => (
                          <tr key={lead.id} className="hover:bg-[#faf8f5] transition-colors">
                            <td className="px-4 py-3 font-medium text-[#1a1a1a]">
                              <div>{lead.name}</div>
                              <div className="text-xs text-[#8a8178]">PIN: {lead.pin_code}</div>
                            </td>
                            <td className="px-4 py-3 text-[#5a5450]">
                              <div>
                                <a href={`tel:${lead.phone}`} className="hover:text-[#c4a46b] font-medium">
                                  {lead.phone}
                                </a>
                              </div>
                              <div className="text-xs text-[#8a8178]">{lead.email}</div>
                            </td>
                            <td className="px-4 py-3 text-[#5a5450]">
                              <div>{lead.bhk || '—'}</div>
                              <div className="text-xs text-[#8a8178]">{lead.sqft ? `${lead.sqft} sq ft` : '—'}</div>
                            </td>
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
                                  <option key={s} value={s}>
                                    {s.charAt(0).toUpperCase() + s.slice(1)}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-4 py-3 text-[#8a8178] text-xs">
                              {new Date(lead.created_at).toLocaleDateString('en-IN')}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setSelectedLead(lead)}
                                  className="text-xs px-2 py-1 border border-[#e8e2d6] text-[#c4a46b] hover:border-[#c4a46b] transition-colors"
                                >
                                  View
                                </button>
                                <button
                                  onClick={() => deleteLead(lead.id, lead.name)}
                                  title="Delete lead"
                                  className="p-1 text-red-400 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
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

          {/* ==================================================== */}
          {/* TAB 2: PROJECTS                                      */}
          {/* ==================================================== */}
          {tab === 'projects' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="font-display text-2xl text-[#1a1a1a]">Projects ({filteredProjects.length})</h1>
                  <p className="text-xs text-[#8a8178] mt-1">Manage project showcase, details, images, and publication status.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={loadProjects}
                    title="Refresh projects"
                    className="p-2 border border-[#e8e2d6] text-[#5a5450] hover:text-[#1a1a1a] hover:border-[#c4a46b] bg-white"
                  >
                    <RefreshCw size={14} className={loadingProjects ? 'animate-spin' : ''} />
                  </button>
                  <button
                    onClick={openNewProjectModal}
                    className="flex items-center gap-1.5 bg-[#1a1a1a] text-white text-xs font-medium px-4 py-2 hover:bg-[#c4a46b] transition-colors shadow-sm"
                  >
                    <Plus size={14} /> Add Project
                  </button>
                </div>
              </div>

              {/* Search */}
              <div className="mb-4">
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-3 text-[#8a8178]" />
                  <input
                    type="text"
                    placeholder="Search projects by title, slug, BHK, or location..."
                    value={projectSearch}
                    onChange={e => setProjectSearch(e.target.value)}
                    className="w-full bg-white border border-[#e8e2d6] pl-9 pr-4 py-2 text-sm outline-none focus:border-[#c4a46b]"
                  />
                </div>
              </div>

              {loadingProjects ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-16 shimmer rounded bg-white" />
                  ))}
                </div>
              ) : filteredProjects.length === 0 ? (
                <div className="bg-white border border-[#e8e2d6] text-center py-16 px-4">
                  <FolderOpen size={36} className="mx-auto mb-3 text-[#c4a46b] opacity-60" />
                  <p className="font-display text-lg text-[#1a1a1a] mb-1">No Projects Found</p>
                  <p className="text-xs text-[#8a8178] mb-4">
                    {projects.length === 0
                      ? 'You have not added any projects yet. Click below to add your first project showcase.'
                      : 'No projects match your search.'}
                  </p>
                  <button
                    onClick={openNewProjectModal}
                    className="inline-flex items-center gap-1.5 bg-[#1a1a1a] text-white text-xs font-medium px-4 py-2 hover:bg-[#c4a46b] transition-colors"
                  >
                    <Plus size={14} /> Add New Project
                  </button>
                </div>
              ) : (
                <div className="bg-white border border-[#e8e2d6] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-[#faf8f5] border-b border-[#e8e2d6]">
                          <th className="text-left px-4 py-3 text-xs text-[#8a8178] font-medium">Project</th>
                          <th className="text-left px-4 py-3 text-xs text-[#8a8178] font-medium">BHK & SqFt</th>
                          <th className="text-left px-4 py-3 text-xs text-[#8a8178] font-medium">Type & Location</th>
                          <th className="text-left px-4 py-3 text-xs text-[#8a8178] font-medium">Rooms</th>
                          <th className="text-left px-4 py-3 text-xs text-[#8a8178] font-medium">Status</th>
                          <th className="text-right px-4 py-3 text-xs text-[#8a8178] font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#f0ece4]">
                        {filteredProjects.map(project => (
                          <tr key={project.id} className="hover:bg-[#faf8f5] transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                {project.cover_image ? (
                                  <img
                                    src={project.cover_image}
                                    alt={project.title}
                                    className="w-12 h-12 object-cover rounded border border-[#e8e2d6]"
                                    onError={e => {
                                      ;(e.target as HTMLImageElement).src = '/hero.jpg'
                                    }}
                                  />
                                ) : (
                                  <div className="w-12 h-12 bg-[#f5f0e8] flex items-center justify-center text-[#c4a46b] rounded border border-[#e8e2d6]">
                                    <FolderOpen size={18} />
                                  </div>
                                )}
                                <div>
                                  <div className="font-medium text-[#1a1a1a]">{project.title}</div>
                                  <div className="text-xs text-[#8a8178] font-mono">/{project.slug}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-[#5a5450]">
                              <div>{project.bhk || '—'}</div>
                              <div className="text-xs text-[#8a8178]">{project.sqft ? `${project.sqft} sq ft` : '—'}</div>
                            </td>
                            <td className="px-4 py-3 text-[#5a5450]">
                              <div className="capitalize">{project.project_type?.replace('-', ' ') || 'New Home'}</div>
                              <div className="text-xs text-[#8a8178]">{project.location || '—'}</div>
                            </td>
                            <td className="px-4 py-3 text-xs text-[#5a5450] max-w-[180px] truncate">
                              {(project.room_types || []).join(', ') || '—'}
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => togglePublishProject(project)}
                                title="Click to toggle publish status"
                                className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
                                  project.is_published
                                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                {project.is_published ? (
                                  <>
                                    <Eye size={12} /> Published
                                  </>
                                ) : (
                                  <>
                                    <EyeOff size={12} /> Draft
                                  </>
                                )}
                              </button>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => openEditProjectModal(project)}
                                  title="Edit project"
                                  className="p-1.5 text-[#5a5450] hover:text-[#c4a46b] hover:bg-[#f5f0e8] rounded transition-colors"
                                >
                                  <Edit2 size={15} />
                                </button>
                                <button
                                  onClick={() => deleteProject(project.id, project.title)}
                                  title="Delete project"
                                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
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

          {/* ==================================================== */}
          {/* TAB 3: BRANDS                                        */}
          {/* ==================================================== */}
          {tab === 'brands' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="font-display text-2xl text-[#1a1a1a]">Brands & Materials ({filteredBrands.length})</h1>
                  <p className="text-xs text-[#8a8178] mt-1">Manage partner brand directory shown across client proposals and the website.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={loadBrands}
                    title="Refresh brands"
                    className="p-2 border border-[#e8e2d6] text-[#5a5450] hover:text-[#1a1a1a] hover:border-[#c4a46b] bg-white"
                  >
                    <RefreshCw size={14} className={loadingBrands ? 'animate-spin' : ''} />
                  </button>
                  <button
                    onClick={openNewBrandModal}
                    className="flex items-center gap-1.5 bg-[#1a1a1a] text-white text-xs font-medium px-4 py-2 hover:bg-[#c4a46b] transition-colors shadow-sm"
                  >
                    <Plus size={14} /> Add Brand
                  </button>
                </div>
              </div>

              {/* Search */}
              <div className="mb-4">
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-3 text-[#8a8178]" />
                  <input
                    type="text"
                    placeholder="Search brands by name, category, or description..."
                    value={brandSearch}
                    onChange={e => setBrandSearch(e.target.value)}
                    className="w-full bg-white border border-[#e8e2d6] pl-9 pr-4 py-2 text-sm outline-none focus:border-[#c4a46b]"
                  />
                </div>
              </div>

              {loadingBrands ? (
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-14 shimmer rounded bg-white" />
                  ))}
                </div>
              ) : filteredBrands.length === 0 ? (
                <div className="bg-white border border-[#e8e2d6] text-center py-16 px-4">
                  <Tag size={36} className="mx-auto mb-3 text-[#c4a46b] opacity-60" />
                  <p className="font-display text-lg text-[#1a1a1a] mb-1">No Brands Found</p>
                  <p className="text-xs text-[#8a8178] mb-4">
                    {brands.length === 0
                      ? 'No partner brands recorded yet. Add your brand partners to showcase quality.'
                      : 'No brands match your search query.'}
                  </p>
                  <button
                    onClick={openNewBrandModal}
                    className="inline-flex items-center gap-1.5 bg-[#1a1a1a] text-white text-xs font-medium px-4 py-2 hover:bg-[#c4a46b] transition-colors"
                  >
                    <Plus size={14} /> Add Brand
                  </button>
                </div>
              ) : (
                <div className="bg-white border border-[#e8e2d6] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-[#faf8f5] border-b border-[#e8e2d6]">
                          <th className="text-left px-4 py-3 text-xs text-[#8a8178] font-medium">Brand Name</th>
                          <th className="text-left px-4 py-3 text-xs text-[#8a8178] font-medium">Category</th>
                          <th className="text-left px-4 py-3 text-xs text-[#8a8178] font-medium">Description</th>
                          <th className="text-left px-4 py-3 text-xs text-[#8a8178] font-medium">Status</th>
                          <th className="text-right px-4 py-3 text-xs text-[#8a8178] font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#f0ece4]">
                        {filteredBrands.map(brand => (
                          <tr key={brand.id} className="hover:bg-[#faf8f5] transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2.5">
                                {brand.logo_url && (
                                  <img
                                    src={brand.logo_url}
                                    alt={brand.name}
                                    className="w-6 h-6 object-contain"
                                    onError={e => {
                                      ;(e.target as HTMLImageElement).style.display = 'none'
                                    }}
                                  />
                                )}
                                <span className="font-medium text-[#1a1a1a]">{brand.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-xs bg-[#f5f0e8] text-[#8a8178] px-2.5 py-1 rounded">
                                {brand.category}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-[#5a5450] max-w-sm truncate">
                              {brand.description || '—'}
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => toggleBrandActive(brand)}
                                title="Click to toggle status"
                                className={`text-xs px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
                                  brand.is_active
                                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                {brand.is_active ? 'Active' : 'Inactive'}
                              </button>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => openEditBrandModal(brand)}
                                  title="Edit brand"
                                  className="p-1.5 text-[#5a5450] hover:text-[#c4a46b] hover:bg-[#f5f0e8] rounded transition-colors"
                                >
                                  <Edit2 size={15} />
                                </button>
                                <button
                                  onClick={() => deleteBrand(brand.id, brand.name)}
                                  title="Delete brand"
                                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
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

          {/* ==================================================== */}
          {/* TAB 4: PRICING RULES                                 */}
          {/* ==================================================== */}
          {tab === 'pricing' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="font-display text-2xl text-[#1a1a1a]">Pricing Rules ({pricingRules.length})</h1>
                  <p className="text-xs text-[#8a8178] mt-1">Configure indicative per sq ft interior calculation rates used in the Cost Estimator.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={loadPricing}
                    title="Refresh pricing rules"
                    className="p-2 border border-[#e8e2d6] text-[#5a5450] hover:text-[#1a1a1a] hover:border-[#c4a46b] bg-white"
                  >
                    <RefreshCw size={14} className={loadingPricing ? 'animate-spin' : ''} />
                  </button>
                  <button
                    onClick={openNewPricingModal}
                    className="flex items-center gap-1.5 bg-[#1a1a1a] text-white text-xs font-medium px-4 py-2 hover:bg-[#c4a46b] transition-colors shadow-sm"
                  >
                    <Plus size={14} /> Add Pricing Rule
                  </button>
                </div>
              </div>

              {loadingPricing ? (
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-14 shimmer rounded bg-white" />
                  ))}
                </div>
              ) : pricingRules.length === 0 ? (
                <div className="bg-white border border-[#e8e2d6] text-center py-16 px-4">
                  <DollarSign size={36} className="mx-auto mb-3 text-[#c4a46b] opacity-60" />
                  <p className="font-display text-lg text-[#1a1a1a] mb-1">No Pricing Rules Found</p>
                  <p className="text-xs text-[#8a8178] mb-4">
                    Add standard rates per square foot for BHK types and project configurations.
                  </p>
                  <button
                    onClick={openNewPricingModal}
                    className="inline-flex items-center gap-1.5 bg-[#1a1a1a] text-white text-xs font-medium px-4 py-2 hover:bg-[#c4a46b] transition-colors"
                  >
                    <Plus size={14} /> Add Pricing Rule
                  </button>
                </div>
              ) : (
                <div className="bg-white border border-[#e8e2d6] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-[#faf8f5] border-b border-[#e8e2d6]">
                          <th className="text-left px-4 py-3 text-xs text-[#8a8178] font-medium">Rule Name</th>
                          <th className="text-left px-4 py-3 text-xs text-[#8a8178] font-medium">BHK</th>
                          <th className="text-left px-4 py-3 text-xs text-[#8a8178] font-medium">Project Type</th>
                          <th className="text-left px-4 py-3 text-xs text-[#8a8178] font-medium">Rate / Sq Ft</th>
                          <th className="text-left px-4 py-3 text-xs text-[#8a8178] font-medium">Status</th>
                          <th className="text-right px-4 py-3 text-xs text-[#8a8178] font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#f0ece4]">
                        {pricingRules.map(rule => (
                          <tr key={rule.id} className="hover:bg-[#faf8f5] transition-colors">
                            <td className="px-4 py-3 font-medium text-[#1a1a1a]">{rule.name}</td>
                            <td className="px-4 py-3 text-[#5a5450]">{rule.bhk}</td>
                            <td className="px-4 py-3 text-[#5a5450] capitalize">
                              <span className="text-xs bg-[#f5f0e8] text-[#8a8178] px-2.5 py-1 rounded">
                                {rule.project_type?.replace('-', ' ')}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-mono font-medium text-[#c4a46b]">
                              ₹{Number(rule.rate_per_sqft).toLocaleString('en-IN')} / sq ft
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => togglePricingActive(rule)}
                                title="Click to toggle status"
                                className={`text-xs px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
                                  rule.is_active
                                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                {rule.is_active ? 'Active' : 'Inactive'}
                              </button>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => openEditPricingModal(rule)}
                                  title="Edit rate"
                                  className="p-1.5 text-[#5a5450] hover:text-[#c4a46b] hover:bg-[#f5f0e8] rounded transition-colors"
                                >
                                  <Edit2 size={15} />
                                </button>
                                <button
                                  onClick={() => deletePricingRule(rule.id, rule.name)}
                                  title="Delete rule"
                                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
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
        </main>
      </div>

      {/* ==================================================== */}
      {/* MODAL 1: LEAD DETAIL VIEW                            */}
      {/* ==================================================== */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg max-h-[85vh] overflow-y-auto rounded shadow-xl">
            <div className="p-6 border-b border-[#e8e2d6] flex items-center justify-between bg-[#faf8f5]">
              <div>
                <h2 className="font-display text-lg text-[#1a1a1a]">{selectedLead.name}</h2>
                <p className="text-xs text-[#8a8178]">Lead details & enquiry info</p>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="text-[#8a8178] hover:text-[#1a1a1a] text-xl p-1"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-3 text-sm">
              {[
                ['Phone', selectedLead.phone],
                ['Email', selectedLead.email],
                ['PIN Code', selectedLead.pin_code],
                ['BHK', selectedLead.bhk],
                ['Area', selectedLead.sqft ? `${selectedLead.sqft} sq ft` : null],
                ['Type', selectedLead.project_type],
                ['Rooms', (selectedLead.room_types || []).join(', ')],
                ['Budget Range', selectedLead.budget_range ? `₹${selectedLead.budget_range}L` : null],
                ['Estimate', selectedLead.estimate_low ? `${formatINR(selectedLead.estimate_low)} – ${formatINR(selectedLead.estimate_high)}` : null],
                ['Source', selectedLead.source],
                ['Status', selectedLead.status],
                ['Message / Notes', selectedLead.notes],
                ['Submitted', new Date(selectedLead.created_at).toLocaleString('en-IN')],
              ].map(([label, value]) =>
                value ? (
                  <div key={String(label)} className="flex gap-4">
                    <span className="text-[#8a8178] w-32 flex-shrink-0 text-xs uppercase tracking-wider">{label}</span>
                    <span className="text-[#1a1a1a] font-medium break-words flex-1">{value}</span>
                  </div>
                ) : null
              )}
            </div>
            <div className="p-4 bg-[#faf8f5] border-t border-[#e8e2d6] flex justify-between items-center">
              <button
                onClick={() => deleteLead(selectedLead.id, selectedLead.name)}
                className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
              >
                <Trash2 size={14} /> Delete Lead
              </button>
              <button
                onClick={() => setSelectedLead(null)}
                className="text-xs bg-[#1a1a1a] text-white px-4 py-2 hover:bg-[#c4a46b] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 2: PROJECT ADD / EDIT                          */}
      {/* ==================================================== */}
      {editingProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded shadow-xl">
            <div className="p-5 border-b border-[#e8e2d6] flex items-center justify-between bg-[#faf8f5]">
              <div>
                <h2 className="font-display text-lg text-[#1a1a1a]">
                  {isNewProject ? 'Add New Project' : `Edit: ${editingProject.title}`}
                </h2>
                <p className="text-xs text-[#8a8178]">Portfolio project details & gallery showcase</p>
              </div>
              <button
                onClick={() => setEditingProject(null)}
                className="text-[#8a8178] hover:text-[#1a1a1a] p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="p-6 space-y-4 text-sm">
              {projectFormError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle size={15} />
                  <span>{projectFormError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#2d2d2d] mb-1">
                    Project Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 3BHK — Gachibowli"
                    value={editingProject.title || ''}
                    onChange={e => {
                      const title = e.target.value
                      setEditingProject(p => ({
                        ...p,
                        title,
                        // auto-populate slug only if creating new and user hasn't changed it manually
                        slug: isNewProject && (!p?.slug || p.slug === slugify(p.title || '')) ? slugify(title) : p?.slug,
                      }))
                    }}
                    className="w-full border border-[#e8e2d6] px-3 py-2 text-sm outline-none focus:border-[#c4a46b]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#2d2d2d] mb-1">
                    URL Slug <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. gachibowli-3bhk"
                    value={editingProject.slug || ''}
                    onChange={e => setEditingProject(p => ({ ...p, slug: slugify(e.target.value) }))}
                    className="w-full border border-[#e8e2d6] px-3 py-2 text-sm outline-none focus:border-[#c4a46b] font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#2d2d2d] mb-1">BHK / Config</label>
                  <input
                    type="text"
                    placeholder="e.g. 3BHK, 2BHK, Kitchen"
                    value={editingProject.bhk || ''}
                    onChange={e => setEditingProject(p => ({ ...p, bhk: e.target.value }))}
                    className="w-full border border-[#e8e2d6] px-3 py-2 text-sm outline-none focus:border-[#c4a46b]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#2d2d2d] mb-1">Carpet Area (sq ft)</label>
                  <input
                    type="number"
                    placeholder="e.g. 1850"
                    value={editingProject.sqft || ''}
                    onChange={e => setEditingProject(p => ({ ...p, sqft: e.target.value ? Number(e.target.value) : null }))}
                    className="w-full border border-[#e8e2d6] px-3 py-2 text-sm outline-none focus:border-[#c4a46b]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#2d2d2d] mb-1">Project Type</label>
                  <select
                    value={editingProject.project_type || 'new-home'}
                    onChange={e => setEditingProject(p => ({ ...p, project_type: e.target.value as Project['project_type'] }))}
                    className="w-full border border-[#e8e2d6] px-3 py-2 text-sm outline-none focus:border-[#c4a46b] bg-white"
                  >
                    <option value="new-home">New Home</option>
                    <option value="renovation">Renovation</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#2d2d2d] mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Gachibowli, Hyderabad"
                    value={editingProject.location || ''}
                    onChange={e => setEditingProject(p => ({ ...p, location: e.target.value }))}
                    className="w-full border border-[#e8e2d6] px-3 py-2 text-sm outline-none focus:border-[#c4a46b]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#2d2d2d] mb-1">Cover Image URL</label>
                  <input
                    type="text"
                    placeholder="e.g. /project-3bhk.jpg or https://..."
                    value={editingProject.cover_image || ''}
                    onChange={e => setEditingProject(p => ({ ...p, cover_image: e.target.value }))}
                    className="w-full border border-[#e8e2d6] px-3 py-2 text-sm outline-none focus:border-[#c4a46b]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#2d2d2d] mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Summary of the design approach, client brief, and aesthetic highlights..."
                  value={editingProject.description || ''}
                  onChange={e => setEditingProject(p => ({ ...p, description: e.target.value }))}
                  className="w-full border border-[#e8e2d6] px-3 py-2 text-sm outline-none focus:border-[#c4a46b]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#2d2d2d] mb-1">
                  Room Types Designed (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="Living Room, Dining, Modular Kitchen, Master Bedroom, Study Room"
                  value={projectRoomsText}
                  onChange={e => setProjectRoomsText(e.target.value)}
                  className="w-full border border-[#e8e2d6] px-3 py-2 text-sm outline-none focus:border-[#c4a46b]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#2d2d2d] mb-1">
                  Brands / Materials Used (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="Greenply, Hafele, Asian Paints, Kajaria"
                  value={projectBrandsText}
                  onChange={e => setProjectBrandsText(e.target.value)}
                  className="w-full border border-[#e8e2d6] px-3 py-2 text-sm outline-none focus:border-[#c4a46b]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#2d2d2d] mb-1">
                  Gallery Image URLs (one per line or comma-separated)
                </label>
                <textarea
                  rows={2}
                  placeholder="/project-3bhk.jpg&#10;/project-bedroom.jpg&#10;/project-kitchen.jpg"
                  value={projectGalleryText}
                  onChange={e => setProjectGalleryText(e.target.value)}
                  className="w-full border border-[#e8e2d6] px-3 py-2 text-sm outline-none focus:border-[#c4a46b] font-mono text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  id="project-is-published"
                  type="checkbox"
                  checked={!!editingProject.is_published}
                  onChange={e => setEditingProject(p => ({ ...p, is_published: e.target.checked }))}
                  className="w-4 h-4 text-[#c4a46b] accent-[#c4a46b] cursor-pointer"
                />
                <label htmlFor="project-is-published" className="text-xs font-medium text-[#2d2d2d] cursor-pointer">
                  Publish this project immediately on public website
                </label>
              </div>

              <div className="p-4 bg-[#faf8f5] border-t border-[#e8e2d6] -mx-6 -mb-6 mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="px-4 py-2 border border-[#e8e2d6] text-xs text-[#5a5450] hover:text-[#1a1a1a]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProject}
                  className="px-5 py-2 bg-[#1a1a1a] text-white text-xs font-medium hover:bg-[#c4a46b] disabled:opacity-50 transition-colors"
                >
                  {savingProject ? 'Saving...' : isNewProject ? 'Create Project' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 3: BRAND ADD / EDIT                            */}
      {/* ==================================================== */}
      {editingBrand && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded shadow-xl">
            <div className="p-5 border-b border-[#e8e2d6] flex items-center justify-between bg-[#faf8f5]">
              <div>
                <h2 className="font-display text-lg text-[#1a1a1a]">
                  {isNewBrand ? 'Add Partner Brand' : `Edit: ${editingBrand.name}`}
                </h2>
                <p className="text-xs text-[#8a8178]">Brand specifications and category grouping</p>
              </div>
              <button
                onClick={() => setEditingBrand(null)}
                className="text-[#8a8178] hover:text-[#1a1a1a] p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveBrand} className="p-6 space-y-4 text-sm">
              {brandFormError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle size={15} />
                  <span>{brandFormError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[#2d2d2d] mb-1">
                  Brand Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hafele, Greenply, Asian Paints"
                  value={editingBrand.name || ''}
                  onChange={e => setEditingBrand(b => ({ ...b, name: e.target.value }))}
                  className="w-full border border-[#e8e2d6] px-3 py-2 text-sm outline-none focus:border-[#c4a46b]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#2d2d2d] mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={editingBrand.category || 'Hardware & Fittings'}
                  onChange={e => setEditingBrand(b => ({ ...b, category: e.target.value }))}
                  className="w-full border border-[#e8e2d6] px-3 py-2 text-sm outline-none focus:border-[#c4a46b] bg-white"
                >
                  <option value="Hardware & Fittings">Hardware & Fittings</option>
                  <option value="Laminates & Boards">Laminates & Boards</option>
                  <option value="Tiles & Stone">Tiles & Stone</option>
                  <option value="Sanitary Ware">Sanitary Ware</option>
                  <option value="Paints & Surfaces">Paints & Surfaces</option>
                  <option value="Lighting">Lighting</option>
                  <option value="Electricals & Automation">Electricals & Automation</option>
                  <option value="Furnishings & Fabrics">Furnishings & Fabrics</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#2d2d2d] mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Precision German hardware — hinges, channels, handles, and kitchen fittings."
                  value={editingBrand.description || ''}
                  onChange={e => setEditingBrand(b => ({ ...b, description: e.target.value }))}
                  className="w-full border border-[#e8e2d6] px-3 py-2 text-sm outline-none focus:border-[#c4a46b]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#2d2d2d] mb-1">Logo URL (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. https://... or /logo-hafele.png"
                  value={editingBrand.logo_url || ''}
                  onChange={e => setEditingBrand(b => ({ ...b, logo_url: e.target.value }))}
                  className="w-full border border-[#e8e2d6] px-3 py-2 text-sm outline-none focus:border-[#c4a46b]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  id="brand-is-active"
                  type="checkbox"
                  checked={editingBrand.is_active !== false}
                  onChange={e => setEditingBrand(b => ({ ...b, is_active: e.target.checked }))}
                  className="w-4 h-4 text-[#c4a46b] accent-[#c4a46b] cursor-pointer"
                />
                <label htmlFor="brand-is-active" className="text-xs font-medium text-[#2d2d2d] cursor-pointer">
                  Active (show this brand on public website)
                </label>
              </div>

              <div className="p-4 bg-[#faf8f5] border-t border-[#e8e2d6] -mx-6 -mb-6 mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingBrand(null)}
                  className="px-4 py-2 border border-[#e8e2d6] text-xs text-[#5a5450] hover:text-[#1a1a1a]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingBrand}
                  className="px-5 py-2 bg-[#1a1a1a] text-white text-xs font-medium hover:bg-[#c4a46b] disabled:opacity-50 transition-colors"
                >
                  {savingBrand ? 'Saving...' : isNewBrand ? 'Add Brand' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 4: PRICING RULE ADD / EDIT                     */}
      {/* ==================================================== */}
      {editingPricing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded shadow-xl">
            <div className="p-5 border-b border-[#e8e2d6] flex items-center justify-between bg-[#faf8f5]">
              <div>
                <h2 className="font-display text-lg text-[#1a1a1a]">
                  {isNewPricing ? 'Add Pricing Rule' : `Edit: ${editingPricing.name}`}
                </h2>
                <p className="text-xs text-[#8a8178]">Rate per sq ft configuration for cost calculator</p>
              </div>
              <button
                onClick={() => setEditingPricing(null)}
                className="text-[#8a8178] hover:text-[#1a1a1a] p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePricing} className="p-6 space-y-4 text-sm">
              {pricingFormError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle size={15} />
                  <span>{pricingFormError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[#2d2d2d] mb-1">
                  Rule Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 3BHK New Home - Standard"
                  value={editingPricing.name || ''}
                  onChange={e => setEditingPricing(r => ({ ...r, name: e.target.value }))}
                  className="w-full border border-[#e8e2d6] px-3 py-2 text-sm outline-none focus:border-[#c4a46b]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#2d2d2d] mb-1">
                    BHK Config <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editingPricing.bhk || '3BHK'}
                    onChange={e => setEditingPricing(r => ({ ...r, bhk: e.target.value }))}
                    className="w-full border border-[#e8e2d6] px-3 py-2 text-sm outline-none focus:border-[#c4a46b] bg-white"
                  >
                    <option value="1BHK">1BHK</option>
                    <option value="2BHK">2BHK</option>
                    <option value="3BHK">3BHK</option>
                    <option value="4BHK+">4BHK+</option>
                    <option value="Kitchen">Kitchen</option>
                    <option value="Villa">Villa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#2d2d2d] mb-1">
                    Project Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editingPricing.project_type || 'new-home'}
                    onChange={e => setEditingPricing(r => ({ ...r, project_type: e.target.value }))}
                    className="w-full border border-[#e8e2d6] px-3 py-2 text-sm outline-none focus:border-[#c4a46b] bg-white"
                  >
                    <option value="new-home">New Home</option>
                    <option value="renovation">Renovation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#2d2d2d] mb-1">
                  Rate per Sq Ft (₹ INR) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-[#8a8178]">₹</span>
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="1100"
                    value={editingPricing.rate_per_sqft || ''}
                    onChange={e => setEditingPricing(r => ({ ...r, rate_per_sqft: Number(e.target.value) }))}
                    className="w-full border border-[#e8e2d6] pl-7 pr-3 py-2 text-sm outline-none focus:border-[#c4a46b]"
                  />
                </div>
                <p className="text-xs text-[#8a8178] mt-1">Calculates base cost as (Carpet Area × Rate per sq ft)</p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  id="pricing-is-active"
                  type="checkbox"
                  checked={editingPricing.is_active !== false}
                  onChange={e => setEditingPricing(r => ({ ...r, is_active: e.target.checked }))}
                  className="w-4 h-4 text-[#c4a46b] accent-[#c4a46b] cursor-pointer"
                />
                <label htmlFor="pricing-is-active" className="text-xs font-medium text-[#2d2d2d] cursor-pointer">
                  Active (apply in calculation formulas)
                </label>
              </div>

              <div className="p-4 bg-[#faf8f5] border-t border-[#e8e2d6] -mx-6 -mb-6 mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPricing(null)}
                  className="px-4 py-2 border border-[#e8e2d6] text-xs text-[#5a5450] hover:text-[#1a1a1a]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPricing}
                  className="px-5 py-2 bg-[#1a1a1a] text-white text-xs font-medium hover:bg-[#c4a46b] disabled:opacity-50 transition-colors"
                >
                  {savingPricing ? 'Saving...' : isNewPricing ? 'Add Pricing Rule' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
