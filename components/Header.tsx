'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)

  // Bloquear scroll del body cuando el menú está abierto en mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const closeMenu = () => setIsOpen(false)

  const links = [
    { href: '/', label: 'Inicio' },
    { href: '/catalogo', label: 'Catálogo' },
    { href: '/nosotros', label: 'Nosotros' },
    { href: '/contacto', label: 'Contacto' },
  ]

  return (
    <header className="bg-[#05030a] border-b border-fuchsia-800/40 sticky top-0 z-40">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        {/* Logo / Brand */}
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-white">
          <Image
            src="/jda-logo.png"
            alt="Jesús Díaz Automotores"
            width={120}
            height={40}
            className="h-8 w-auto object-contain"
            priority
          />
        </Link>

        {/* NAV LINKS - DESKTOP */}
        <nav className="hidden md:flex items-center gap-8 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-slate-300 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* BOTÓN HAMBURGUESA - MOBILE */}
        <button
          className="md:hidden flex flex-col items-end justify-center gap-[5px]"
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
                <div className="flex items-center gap-2">
                  <Image
                    src="/jda-logo.png"
                    alt="Jesús Díaz Automotores"
                    width={130}
                    height={42}
                    className="h-9 w-auto object-contain"
                  />
                </div>
                <button
                  onClick={closeMenu}
                  className="rounded-full border border-white/30 bg-black/40 px-3 py-1 text-xs font-medium text-slate-100 hover:bg-black/70 transition"
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
                className="flex flex-col items-start gap-4 mt-8"
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
                      className="text-2xl font-semibold text-slate-50 tracking-wide hover:text-fuchsia-300 transition"
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
                  Autos seleccionados, atención personalizada y catálogo conectado a Mercado Libre.
                </p>

                <a
                  href="https://wa.me/5492494XXXXXX"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex w-full items-center justify-center rounded-2xl bg-fuchsia-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-800/40 hover:bg-fuchsia-500 transition"
                  onClick={closeMenu}
                >
                  💬 Escribinos por WhatsApp
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
