'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { track } from '@/lib/analyticsClient'

/**
 * Trackea page_view al cambiar ruta (App Router).
 * Se monta una vez en layout y registra cada navegación SPA.
 */
export default function AnalyticsTracker() {
  const pathname = usePathname()
  const search = useSearchParams()

  useEffect(() => {
    // evitamos mandar nada si todavía no hay path (casos raros)
    if (!pathname) return
    const qs = search?.toString()
    const full = qs ? `${pathname}?${qs}` : pathname

    track({
      event_type: 'page_view',
      path: full,
      location: 'route_change',
    })
  }, [pathname, search])

  return null
}
