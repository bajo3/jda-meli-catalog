'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { CONTACT, waLink } from '@/lib/siteConfig'
import { track } from '@/lib/analyticsClient'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // Bloquear scroll del body + emitir evento global
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''

    window.dispatchEvent(new CustomEvent('nav:open', { detail: isOpen }))

    document.documentElement.classList.toggle('nav-open', isOpen)

    return () => {
      document.body.style.overflow = ''
      document.documentElement.classList.remove('nav-open')
    }
  }, [isOpen])

  const closeMenu = () => setIsOpen(false)

  const links = [
    { href: '/', label: 'Inicio' },
    { href: '/catalogo', label: 'Catálogo' },
    { href: '/nosotros', label: 'Nosotros' },
    { href: '/contacto', label: 'Contacto' },
  ]

  const isLinkActive = (href: string) => {
    if (href === '/') return pathname === '/'
    // para que /catalogo/[slug] siga marcando Catálogo
    return pathname.startsWith(href)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-fuchsia-800/40 bg-[#05030a] md:bg-[#05030a]/90 md:backdrop-blur-md">
      {/* glow superior sutil */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-fuchsia-500/40 to-transparent" />

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:py-4">
        {/* Logo / Brand */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/jda-logo.png"
            alt="Jesús Díaz Automotores"
            width={140}
            height={44}
            className="h-9 w-auto object-contain drop-shadow-[0_0_15px_rgba(244,114,182,0.5)]"
            priority
          />
          <div className="hidden flex-col leading-tight sm:flex">
            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-fuchsia-300">
              Jesús Díaz Automotores
            </span>
            <span className="text-xs text-slate-400">
             Unidades 0KM · Autos seleccionados 
            </span>
          </div>
        </Link>

        {/* NAV LINKS - DESKTOP */}
        <nav className="hidden items-center gap-6 text-sm md:flex">
          {links.map((link) => {
            const active = isLinkActive(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-1 transition-colors ${
                  active
                    ? 'font-semibold text-fuchsia-200'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {/* pill sutil solo para el link activo */}
                {active && (
                  <span className="pointer-events-none absolute inset-x-0 -bottom-1 h-[2px] rounded-full bg-gradient-to-r from-fuchsia-500 via-violet-400 to-blue-400 opacity-80" />
                )}
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* CTA DESKTOP */}
        <div className="hidden items-center gap-2 md:flex">
          <a
            href={waLink(CONTACT.whatsapp.primary, 'Hola! Quiero cotizar mi próximo auto.')}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              track({
                event_type: 'whatsapp_click',
                phone: CONTACT.whatsapp.primary,
                location: 'header_cta',
              })
            }
            className="inline-flex items-center gap-2 rounded-full border border-fuchsia-500/60 bg-fuchsia-600/10 px-3 py-1.5 text-xs font-semibold text-fuchsia-100 shadow-[0_0_20px_rgba(244,114,182,0.35)] transition hover:bg-fuchsia-500/30 hover:border-fuchsia-400"
          >
            <span className="text-base">💬</span>
            <span>¡Cotiza tu próximo auto!</span>
          </a>
        </div>

        {/* BOTÓN HAMBURGUESA - MOBILE */}
        <button
          className="flex flex-col items-end justify-center gap-[5px] md:hidden"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Abrir menú"
        >
          <span
            className={`block h-[2px] w-6 bg-white transition-all duration-300 ${
              isOpen ? 'translate-y-[7px] rotate-45' : ''
            }`}
          />
          <span
            className={`block h-[2px] w-5 bg-white transition-opacity duration-200 ${
              isOpen ? 'opacity-0' : 'opacity-100'
            }`}
          />
          <span
            className={`block h-[2px] w-6 bg-white transition-all duration-300 ${
              isOpen ? '-translate-y-[7px] -rotate-45' : ''
            }`}
          />
        </button>
      </div>

      {/* OVERLAY FULLSCREEN MOBILE */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-[#05030a] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Glow / fondo sofisticado */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(236,72,153,0.35),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(59,130,246,0.25),_transparent_55%)] opacity-90" />

            <div className="relative flex h-full flex-col justify-between px-6 py-7">
              {/* Top: logo + botón cerrar */}
              <div className="flex items-center justify-between">
                <Image
                  src="/jda-logo.png"
                  alt="Jesús Díaz Automotores"
                  width={130}
                  height={42}
                  className="h-9 w-auto object-contain"
                />
                <button
                  onClick={closeMenu}
                  className="rounded-full border border-white/30 bg-black/40 px-3 py-1 text-xs font-medium text-slate-100 transition hover:bg-black/70"
                >
                  Cerrar
                </button>
              </div>

              {/* Middle: links grandes animados */}
              <motion.ul
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { staggerChildren: 0.06 },
                  },
                }}
                className="mt-8 flex flex-col items-start gap-4"
              >
                {links.map((link, index) => (
                  <motion.li
                    key={link.href}
                    variants={{
                      hidden: { opacity: 0, x: 20 },
                      visible: { opacity: 1, x: 0 },
                    }}
                  >
                    <Link
                      href={link.href}
                      onClick={closeMenu}
                      className="text-2xl font-semibold tracking-wide text-slate-50 transition hover:text-fuchsia-300"
                    >
                      <span className="mr-2 text-xs text-fuchsia-300/80">
                        {index + 1}.
                      </span>
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </motion.ul>

              {/* Bottom: info + CTA */}
              <div className="space-y-3 text-sm text-slate-200">
                <p className="text-xs uppercase tracking-[0.18em] text-fuchsia-200">
                  Jesús Díaz Automotores
                </p>
                <p className="text-xs text-slate-300">
                  Autos seleccionados, atención personalizada y catálogo
                  online actualizado.
                </p>

                <a
                  href={waLink(CONTACT.whatsapp.primary, 'Hola! Quiero cotizar mi próximo auto.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex w-full items-center justify-center rounded-2xl bg-fuchsia-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-800/40 transition hover:bg-fuchsia-500"
                  onClick={() => {
                    track({ event_type: 'whatsapp_click', phone: CONTACT.whatsapp.primary, location: 'mobile_menu' })
                    closeMenu()
                  }}
                >
                  💬 Escribinos por WhatsApp
                </a>

                <a
                  href={waLink(CONTACT.whatsapp.secondary, 'Hola! Quiero cotizar mi próximo auto.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
                  onClick={() => {
                    track({ event_type: 'whatsapp_click', phone: CONTACT.whatsapp.secondary, location: 'mobile_menu' })
                    closeMenu()
                  }}
                >
                  💬 WhatsApp 2
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
