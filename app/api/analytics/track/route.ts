import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { getSupabaseServer } from '@/lib/supabaseServer'

export const runtime = 'nodejs'

const ALLOWED_EVENTS = new Set([
  'page_view',
  'vehicle_view',
  'whatsapp_click',
  'call_click',
  'maps_click',
  'share_click',
])

function sha256(input: string) {
  return crypto.createHash('sha256').update(input).digest('hex')
}

function getClientIp(req: Request) {
  const xf = req.headers.get('x-forwarded-for')
  if (xf) return xf.split(',')[0].trim()
  const real = req.headers.get('x-real-ip')
  if (real) return real.trim()
  return null
}

async function readJsonBody(req: Request): Promise<any | null> {
  try {
    const ct = req.headers.get('content-type') || ''
    // sendBeacon a veces manda text/plain
    const text = await req.text()
    if (!text) return null
    return JSON.parse(text)
  } catch {
    return null
  }
}

export async function POST(req: Request) {
  try {
    const body = await readJsonBody(req)
    if (!body) return NextResponse.json({ ok: false, error: 'empty_body' }, { status: 400 })

    const event_type = String(body.event_type || '')
    if (!ALLOWED_EVENTS.has(event_type)) {
      return NextResponse.json({ ok: false, error: 'invalid_event_type' }, { status: 400 })
    }

    const salt = process.env.ANALYTICS_SALT || 'dev_salt_change_me'
    const ip = getClientIp(req)
    const ip_hash = ip ? sha256(`${salt}:${ip}`) : null

    const user_agent = req.headers.get('user-agent') || null

    const row = {
      event_type,
      path: body.path ?? null,
      session_id: body.session_id ?? null,
      vehicle_id: body.vehicle_id ?? null,
      vehicle_slug: body.vehicle_slug ?? null,
      phone: body.phone ?? null,
      location: body.location ?? null,
      referrer: body.referrer ?? null,
      utm_source: body.utm_source ?? null,
      utm_medium: body.utm_medium ?? null,
      utm_campaign: body.utm_campaign ?? null,
      user_agent,
      ip_hash,
      meta: body.meta ?? {},
    }

    const supabase = getSupabaseServer()
    const { error } = await supabase.from('analytics_events').insert(row)

    if (error) {
      return NextResponse.json({ ok: false, error: 'db_insert_failed' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, error: 'unknown' }, { status: 500 })
  }
}
