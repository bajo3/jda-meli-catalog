'use client'

import type React from 'react'
import { track, type TrackPayload } from '@/lib/analyticsClient'

type Props = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  trackEvent?: Omit<TrackPayload, 'path'>
}

export default function TrackLink({ trackEvent, onClick, href, ...rest }: Props) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    try {
      if (trackEvent) {
        track({
          ...trackEvent,
          path: `${window.location.pathname}${window.location.search}`,
          meta: {
            ...(trackEvent.meta ?? {}),
            href: typeof href === 'string' ? href : null,
          },
        })
      }
    } catch {
      // no-op
    }
    onClick?.(e)
  }

  return <a href={href} onClick={handleClick} {...rest} />
}
