import Link from 'next/link'
import { getSupabaseServer } from '@/lib/supabaseServer'

type SearchParams = Record<string, string | string[] | undefined>

function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

function parseDateAR(dateStr: string, kind: 'start' | 'endExclusive'): Date | null {
  // Interpretamos fechas del input (YYYY-MM-DD) como horario Argentina (-03:00)
  // start: 00:00:00-03:00
  // endExclusive: día siguiente 00:00:00-03:00
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null
  const base = new Date(`${dateStr}T00:00:00-03:00`)
  if (Number.isNaN(base.getTime())) return null
  if (kind === 'endExclusive') {
    const d = new Date(base)
    d.setDate(d.getDate() + 1)
    return d
  }
  return base
}

function parseRange(sp: SearchParams) {
  const fromRaw = typeof sp.from === 'string' ? sp.from : null
  const toRaw = typeof sp.to === 'string' ? sp.to : null

  // Rango custom (tiene prioridad)
  if (fromRaw || toRaw) {
    const start = fromRaw ? parseDateAR(fromRaw, 'start') : null
    const end = toRaw ? parseDateAR(toRaw, 'endExclusive') : null

    const finalStart = start ?? daysAgo(7)
    const finalEnd = end ?? new Date()

    const label = fromRaw && toRaw ? `Rango ${fromRaw} → ${toRaw}` : fromRaw ? `Desde ${fromRaw}` : `Hasta ${toRaw}`
    return { start: finalStart, end: finalEnd, label, fromRaw, toRaw }
  }

  const rangeRaw = typeof sp.range === 'string' ? sp.range : '7'

  if (rangeRaw === 'today') {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const end = new Date()
    return { start, end, label: 'Hoy', fromRaw: null, toRaw: null }
  }

  const n = Number(rangeRaw)
  const days = Number.isFinite(n) && n > 0 ? n : 7
  const end = new Date()
  const start = daysAgo(days)
  return { start, end, label: `Últimos ${days} días`, fromRaw: null, toRaw: null }
}

function nfmt(n: number | bigint | null | undefined) {
  const v = typeof n === 'bigint' ? Number(n) : n ?? 0
  return new Intl.NumberFormat('es-AR').format(v)
}

function pfmt(x: number | null | undefined) {
  const v = typeof x === 'number' && Number.isFinite(x) ? x : 0
  return `${(v * 100).toFixed(1)}%`
}

export default async function AdminAnalyticsPage({ searchParams }: { searchParams: SearchParams }) {
  const { start, end, label, fromRaw, toRaw } = parseRange(searchParams)
  const supabase = getSupabaseServer()

  const [summaryRes, topVehiclesRes, sourcesRes, funnelRes, locationsRes, whatsappRes, referrersRes] = await Promise.all([
    supabase.rpc('analytics_summary', { p_start: start.toISOString(), p_end: end.toISOString() }),
    supabase.rpc('analytics_top_vehicles', { p_start: start.toISOString(), p_end: end.toISOString(), p_limit: 20 }),
    supabase.rpc('analytics_top_sources', { p_start: start.toISOString(), p_end: end.toISOString(), p_limit: 20 }),
    supabase.rpc('analytics_funnel', { p_start: start.toISOString(), p_end: end.toISOString() }),
    supabase.rpc('analytics_top_locations', { p_start: start.toISOString(), p_end: end.toISOString(), p_limit: 25 }),
    supabase.rpc('analytics_whatsapp_by_phone', { p_start: start.toISOString(), p_end: end.toISOString() }),
    supabase.rpc('analytics_top_referrers', { p_start: start.toISOString(), p_end: end.toISOString(), p_limit: 20 }),
  ])

  const kpi = (Array.isArray(summaryRes.data) && summaryRes.data[0]) ? summaryRes.data[0] : {
    page_views: 0,
    vehicle_views: 0,
    whatsapp_clicks: 0,
    call_clicks: 0,
    maps_clicks: 0,
    share_clicks: 0,
    sessions: 0,
  }

  const topVehicles = Array.isArray(topVehiclesRes.data) ? topVehiclesRes.data : []
  const sources = Array.isArray(sourcesRes.data) ? sourcesRes.data : []
  const locations = Array.isArray(locationsRes.data) ? locationsRes.data : []
  const whatsappByPhone = Array.isArray(whatsappRes.data) ? whatsappRes.data : []
  const referrers = Array.isArray(referrersRes.data) ? referrersRes.data : []

  const f = (Array.isArray(funnelRes.data) && funnelRes.data[0]) ? funnelRes.data[0] : null

  return (
    <main className="min-h-screen bg-[#05030a] text-slate-100 px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Panel de Analítica</h1>
            <p className="text-sm text-slate-400">
              {label} • {start.toLocaleString('es-AR')} → {end.toLocaleString('es-AR')}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href="/admin/analytics?range=today" className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/5">Hoy</Link>
            <Link href="/admin/analytics?range=7" className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/5">7 días</Link>
            <Link href="/admin/analytics?range=30" className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/5">30 días</Link>
            <Link href="/admin/analytics?range=90" className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/5">90 días</Link>
            <Link href="/catalogo" className="rounded-lg border border-fuchsia-500/30 bg-fuchsia-500/10 px-3 py-1.5 text-xs font-semibold text-fuchsia-200 hover:bg-fuchsia-500/20">Ir al catálogo</Link>
          </div>
        </header>

        {/* Rango personalizado */}
        <section className="rounded-2xl border border-white/10 bg-[#0b0b12] p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">Rango personalizado</h2>
              <p className="text-xs text-slate-400 mt-1">Elegí desde/hasta (Argentina). Se aplica al panel completo.</p>
            </div>
            <form method="get" action="/admin/analytics" className="flex flex-wrap items-end gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-slate-400">Desde</label>
                <input
                  type="date"
                  name="from"
                  defaultValue={fromRaw ?? ''}
                  className="h-9 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-slate-200"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-slate-400">Hasta</label>
                <input
                  type="date"
                  name="to"
                  defaultValue={toRaw ?? ''}
                  className="h-9 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-slate-200"
                />
              </div>
              <button type="submit" className="h-9 rounded-lg border border-fuchsia-500/30 bg-fuchsia-500/10 px-4 text-sm font-semibold text-fuchsia-200 hover:bg-fuchsia-500/20">
                Aplicar
              </button>
              <Link href="/admin/analytics?range=7" className="h-9 inline-flex items-center rounded-lg border border-white/10 px-4 text-sm text-slate-200 hover:bg-white/5">
                Limpiar
              </Link>
            </form>
          </div>
        </section>

        {/* KPIs */}
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
          <KpiCard title="Sesiones" value={nfmt(kpi.sessions)} />
          <KpiCard title="Page views" value={nfmt(kpi.page_views)} />
          <KpiCard title="Fichas vistas" value={nfmt(kpi.vehicle_views)} />
          <KpiCard title="Clicks WhatsApp" value={nfmt(kpi.whatsapp_clicks)} />
          <KpiCard title="Clicks llamar" value={nfmt(kpi.call_clicks)} />
          <KpiCard title="Clicks Maps" value={nfmt(kpi.maps_clicks)} />
          <KpiCard title="Compartidos" value={nfmt(kpi.share_clicks)} />
        </section>

        {/* Embudo */}
        <section className="rounded-2xl border border-white/10 bg-[#0b0b12] p-5">
          <h2 className="text-sm font-semibold text-white">Embudo (sesiones)</h2>
          <p className="text-xs text-slate-400 mt-1">Catálogo → Ficha → WhatsApp (por session_id)</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <FunnelCard title="Sesiones que vieron Catálogo" value={nfmt(f?.catalog_sessions ?? 0)} />
            <FunnelCard title="Sesiones que llegaron a Ficha" value={nfmt(f?.vehicle_sessions ?? 0)} />
            <FunnelCard title="Sesiones que clickearon WhatsApp" value={nfmt(f?.whatsapp_sessions ?? 0)} />
          </div>
        </section>

        {/* Top autos + conversiones */}
        <section className="rounded-2xl border border-white/10 bg-[#0b0b12] p-5">
          <h2 className="text-sm font-semibold text-white">Top vehículos (vistas + conversiones)</h2>
          <p className="text-xs text-slate-400 mt-1">Conversión: clicks/visitas y sesiones WhatsApp/sesiones que vieron ficha</p>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-xs">
              <thead className="text-slate-400">
                <tr className="border-b border-white/10">
                  <th className="py-2 pr-3">Auto</th>
                  <th className="py-2 px-3 text-right">Vistas</th>
                  <th className="py-2 px-3 text-right">Clicks WA</th>
                  <th className="py-2 px-3 text-right">Conv (click)</th>
                  <th className="py-2 px-3 text-right">Sesiones ficha</th>
                  <th className="py-2 px-3 text-right">Sesiones WA</th>
                  <th className="py-2 pl-3 text-right">Conv (sesión)</th>
                </tr>
              </thead>
              <tbody>
                {topVehicles.map((r: any) => {
                  const href = r.slug ? `/catalogo/${r.slug}` : null
                  return (
                    <tr key={r.vehicle_id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-2 pr-3">
                        {href ? (
                          <Link href={href} className="text-fuchsia-200 hover:underline">
                            {r.title}
                          </Link>
                        ) : (
                          <span className="text-slate-200">{r.title}</span>
                        )}
                        <div className="text-[10px] text-slate-500">{r.vehicle_id}</div>
                      </td>
                      <td className="px-3 py-2 text-right text-slate-200">{nfmt(r.views)}</td>
                      <td className="px-3 py-2 text-right text-slate-200">{nfmt(r.whatsapp_clicks)}</td>
                      <td className="px-3 py-2 text-right text-slate-200">{pfmt(r.conv_click_rate)}</td>
                      <td className="px-3 py-2 text-right text-slate-200">{nfmt(r.sessions_viewed)}</td>
                      <td className="px-3 py-2 text-right text-slate-200">{nfmt(r.sessions_whatsapp)}</td>
                      <td className="pl-3 py-2 text-right text-slate-200">{pfmt(r.conv_session_rate)}</td>
                    </tr>
                  )
                })}
                {topVehicles.length === 0 && (
                  <tr>
                    <td className="px-3 py-3 text-slate-400" colSpan={7}>
                      Todavía no hay datos. Abrí el catálogo y algunas fichas para empezar a registrar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* WhatsApp por número + CTA performance */}
        <section className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-white/10 bg-[#0b0b12] p-5">
            <h2 className="text-sm font-semibold text-white">WhatsApp por número</h2>
            <p className="text-xs text-slate-400 mt-1">Clicks y sesiones (útil para ver si conviene priorizar uno)</p>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-slate-400">
                  <tr className="border-b border-white/10">
                    <th className="py-2 pr-3">Número</th>
                    <th className="py-2 px-3 text-right">Clicks</th>
                    <th className="py-2 pl-3 text-right">Sesiones</th>
                  </tr>
                </thead>
                <tbody>
                  {whatsappByPhone.map((r: any) => (
                    <tr key={r.phone} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-2 pr-3 text-slate-200">{r.phone}</td>
                      <td className="px-3 py-2 text-right text-slate-200">{nfmt(r.clicks)}</td>
                      <td className="pl-3 py-2 text-right text-slate-200">{nfmt(r.sessions)}</td>
                    </tr>
                  ))}
                  {whatsappByPhone.length === 0 && (
                    <tr>
                      <td className="px-3 py-3 text-slate-400" colSpan={3}>
                        Sin datos todavía.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#0b0b12] p-5">
            <h2 className="text-sm font-semibold text-white">CTAs por ubicación</h2>
            <p className="text-xs text-slate-400 mt-1">Dónde rinden mejor los botones (header, ficha, contacto, footer, etc.)</p>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-xs">
                <thead className="text-slate-400">
                  <tr className="border-b border-white/10">
                    <th className="py-2 pr-3">Ubicación</th>
                    <th className="py-2 px-3 text-right">Total</th>
                    <th className="py-2 px-3 text-right">WhatsApp</th>
                    <th className="py-2 px-3 text-right">Llamar</th>
                    <th className="py-2 px-3 text-right">Maps</th>
                    <th className="py-2 pl-3 text-right">Compartir</th>
                  </tr>
                </thead>
                <tbody>
                  {locations.map((r: any) => (
                    <tr key={r.location} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-2 pr-3 text-slate-200">{r.location}</td>
                      <td className="px-3 py-2 text-right text-slate-200">{nfmt(r.total_clicks)}</td>
                      <td className="px-3 py-2 text-right text-slate-200">{nfmt(r.whatsapp_clicks)}</td>
                      <td className="px-3 py-2 text-right text-slate-200">{nfmt(r.call_clicks)}</td>
                      <td className="px-3 py-2 text-right text-slate-200">{nfmt(r.maps_clicks)}</td>
                      <td className="pl-3 py-2 text-right text-slate-200">{nfmt(r.share_clicks)}</td>
                    </tr>
                  ))}
                  {locations.length === 0 && (
                    <tr>
                      <td className="px-3 py-3 text-slate-400" colSpan={6}>
                        Sin datos todavía.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </section>

        {/* Fuentes UTM */}
        <section className="rounded-2xl border border-white/10 bg-[#0b0b12] p-5">
          <h2 className="text-sm font-semibold text-white">Fuentes / Campañas (UTM)</h2>
          <p className="text-xs text-slate-400 mt-1">utm_source / utm_medium / utm_campaign (se calcula sobre page_view)</p>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead className="text-slate-400">
                <tr className="border-b border-white/10">
                  <th className="py-2 pr-3">Source</th>
                  <th className="py-2 px-3">Medium</th>
                  <th className="py-2 px-3">Campaign</th>
                  <th className="py-2 px-3 text-right">Sesiones</th>
                  <th className="py-2 pl-3 text-right">Page views</th>
                </tr>
              </thead>
              <tbody>
                {sources.map((r: any, i: number) => (
                  <tr key={`${r.utm_source}-${r.utm_medium}-${r.utm_campaign}-${i}`} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-2 pr-3 text-slate-200">{r.utm_source}</td>
                    <td className="px-3 py-2 text-slate-200">{r.utm_medium}</td>
                    <td className="px-3 py-2 text-slate-200">{r.utm_campaign}</td>
                    <td className="px-3 py-2 text-right text-slate-200">{nfmt(r.sessions)}</td>
                    <td className="pl-3 py-2 text-right text-slate-200">{nfmt(r.page_views)}</td>
                  </tr>
                ))}
                {sources.length === 0 && (
                  <tr>
                    <td className="px-3 py-3 text-slate-400" colSpan={5}>
                      Sin datos todavía. Tip: usá UTMs en links de Instagram/Ads (utm_source=instagram, utm_campaign=...).
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Referrers */}
        <section className="rounded-2xl border border-white/10 bg-[#0b0b12] p-5">
          <h2 className="text-sm font-semibold text-white">Referrers (dominio)</h2>
          <p className="text-xs text-slate-400 mt-1">Útil para ver Instagram/Google aunque no uses UTMs</p>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400">
                <tr className="border-b border-white/10">
                  <th className="py-2 pr-3">Referrer</th>
                  <th className="py-2 px-3 text-right">Sesiones</th>
                  <th className="py-2 pl-3 text-right">Page views</th>
                </tr>
              </thead>
              <tbody>
                {referrers.map((r: any) => (
                  <tr key={r.referrer_domain} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-2 pr-3 text-slate-200">{r.referrer_domain}</td>
                    <td className="px-3 py-2 text-right text-slate-200">{nfmt(r.sessions)}</td>
                    <td className="pl-3 py-2 text-right text-slate-200">{nfmt(r.page_views)}</td>
                  </tr>
                ))}
                {referrers.length === 0 && (
                  <tr>
                    <td className="px-3 py-3 text-slate-400" colSpan={3}>
                      Sin datos todavía.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="pt-4 text-xs text-slate-500">
          <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
            <span>Eventos se guardan en Supabase (tabla <code className="text-slate-300">analytics_events</code>).</span>
            <span className="text-slate-500/80">Tip: compartí links con UTMs para medir campañas.</span>
          </div>
        </footer>
      </div>
    </main>
  )
}

function KpiCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0b0b12] p-4">
      <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">{title}</p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
    </div>
  )
}

function FunnelCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-xs text-slate-300">{title}</p>
      <p className="mt-1 text-2xl font-bold text-fuchsia-200">{value}</p>
    </div>
  )
}
