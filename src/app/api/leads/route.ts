import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Basic honeypot + rate limiting via simple in-memory store (single instance)
const recentSubmissions = new Map<string, number>()
const RATE_LIMIT_MS = 30000 // 30 seconds per IP

function getIP(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Honeypot field check
    if (body.website) {
      return NextResponse.json({ error: 'Invalid submission' }, { status: 400 })
    }

    // Rate limit
    const ip = getIP(req)
    const now = Date.now()
    const last = recentSubmissions.get(ip)
    if (last && now - last < RATE_LIMIT_MS) {
      return NextResponse.json({ error: 'Please wait before submitting again.' }, { status: 429 })
    }
    recentSubmissions.set(ip, now)

    // Validate required fields
    const { name, phone, email, pin_code } = body
    const errors: Record<string, string> = {}

    if (!name?.trim()) errors.name = 'Name is required.'
    if (!/^[6-9]\d{9}$/.test(String(phone || '').replace(/\s/g, '')))
      errors.phone = 'Invalid phone number.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '')))
      errors.email = 'Invalid email address.'
    if (!/^\d{6}$/.test(String(pin_code || '')))
      errors.pin_code = 'Invalid PIN code.'

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ error: 'Validation failed', fields: errors }, { status: 422 })
    }

    // Optional sqft validation
    if (body.sqft !== null && body.sqft !== undefined) {
      const sqft = parseFloat(body.sqft)
      if (isNaN(sqft) || sqft <= 0 || sqft > 50000) {
        return NextResponse.json({ error: 'Invalid area value.' }, { status: 422 })
      }
    }

    const supabase = await createClient()

    const leadData = {
      name: name.trim(),
      phone: String(phone).trim(),
      email: String(email).trim().toLowerCase(),
      pin_code: String(pin_code).trim(),
      bhk: body.bhk || null,
      sqft: body.sqft ? parseFloat(body.sqft) : null,
      project_type: body.project_type || null,
      room_types: body.room_types || null,
      budget_range: body.budget_range || null,
      estimate_low: body.estimate_low || null,
      estimate_high: body.estimate_high || null,
      source: body.source || 'website',
      status: 'new',
    }

    const { error: dbError } = await supabase.from('leads').insert([leadData])

    if (dbError) {
      console.error('[Lead API] DB error:', dbError.message)
      return NextResponse.json(
        { error: 'Failed to save your enquiry. Please try again or contact us directly.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err) {
    console.error('[Lead API] Unexpected error:', err)
    return NextResponse.json({ error: 'Unexpected server error.' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}
