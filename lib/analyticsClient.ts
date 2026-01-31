'use client'

export type AnalyticsEventType =
  | 'page_view'
  | 'vehicle_view'
  | 'whatsapp_click'
  | 'call_click'
  | 'maps_click'
  | 'share_click'

export type TrackPayload = {
  event_type: AnalyticsEventType
  path?: string | null
  session_id?: string | null
  vehicle_id?: string | null
  vehicle_slug?: string | null
  phone?: string | null
  location?: string | null
  referrer?: string | null
  utm_source?: string | null
  utm_medium?: string | null
  utm_campaign?: string | null
  meta?: Record<string, any> | null
}

const SESSION_KEY = 'jda_session_id_v1'

function getOrCreateSessionId(): string {
  try {
    const existing = sessionStorage.getItem(SESSION_KEY)
    if (existing) return existing

    // crypto.randomUUID() es lo mejor; fallback para browsers viejos.
    const id =
      (typeof crypto !== 'undefined' && 'randomUUID' in crypto && (crypto as any).randomUUID())
      || `sess_${Math.random().toString(16).slice(2)}_${Date.now()}`
    sessionStorage.setItem(SESSION_KEY, id)
    return id
  } catch {
    return `sess_${Math.random().toString(16).slice(2)}_${Date.now()}`
  }
}

function readUTM() {
  try {
    const sp = new URLSearchParams(window.location.search)
    const utm_source = sp.get('utm_source')
    const utm_medium = sp.get('utm_medium')
    const utm_campaign = sp.get('utm_campaign')
    return { utm_source, utm_medium, utm_campaign }
  } catch {
    return { utm_source: null, utm_medium: null, utm_campaign: null }
  }
}

export function track(payload: TrackPayload) {
  try {
    const session_id = payload.session_id ?? getOrCreateSessionId()
    const path = payload.path ?? `${window.location.pathname}${window.location.search}`
    const referrer = payload.referrer ?? (document.referrer || null)
    const utm = readUTM()

    const body = {
      ...payload,
      session_id,
      path,
      referrer,
      utm_source: payload.utm_source ?? utm.utm_source,
      utm_medium: payload.utm_medium ?? utm.utm_medium,
      utm_campaign: payload.utm_campaign ?? utm.utm_campaign,
      meta: payload.meta ?? null,
    }

    // sendBeacon es ideal para no bloquear navegación / abrir WhatsApp
    if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
      const blob = new Blob([JSON.stringify(body)], { type: 'application/json' })
      navigator.sendBeacon('/api/analytics/track', blob)
      return
    }

    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(() => {})
  } catch {
    // no-op
  }
}

export function getSessionId() {
  return getOrCreateSessionId()
}
