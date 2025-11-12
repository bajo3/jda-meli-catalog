'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#05030a] via-[#12081f] to-[#2b0b3a] px-4">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 py-10 lg:py-16">
        {/* LOGO ARRIBA */}
        <div className="flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative h-14 w-auto md:h-16"
          >
            <Image
              src="/jda-logo.png" // ⬅️ ajustá si tiene otro nombre
              alt="Jesús Díaz Automotores"
              width={260}
              height={80}
              className="h-full w-auto object-contain"
              priority
            />
          </motion.div>
        </div>

        {/* HERO PRINCIPAL: TEXTO + FOTO AGENCIA */}
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          {/* LADO IZQUIERDO: TEXTO + CTA */}
          <div className="space-y-6 text-center lg:text-left">
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="inline-flex items-center gap-2 rounded-full border border-fuchsia-500/40 bg-fuchsia-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-fuchsia-200"
            >
              Catálogo conectado a Mercado Libre
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="text-3xl font-extrabold text-white md:text-4xl lg:text-5xl"
            >
              Tu próximo <span className="text-fuchsia-400">auto</span> está
              esperándote en Jesús Díaz Automotores
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="mx-auto max-w-xl text-sm text-slate-300 md:text-base"
            >
              Un catálogo siempre actualizado, unidades seleccionadas y una
              atención cercana para ayudarte a elegir con tranquilidad.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col items-center gap-3 sm:flex-row sm:justify-start"
            >
              <Link
                href="/catalogo"
                className="inline-block rounded-xl bg-fuchsia-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-800/40 hover:bg-fuchsia-500 transition"
              >
                Ver catálogo de vehículos
              </Link>

              <a
                href="https://wa.me/5492494621182"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-xl border border-fuchsia-500/70 px-7 py-3 text-sm font-semibold text-fuchsia-200 hover:bg-fuchsia-900/30 transition"
              >
                Consultar por WhatsApp
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="mt-3 flex flex-col items-center gap-2 text-xs text-slate-400 sm:flex-row sm:justify-start"
            >
              <span>• Unidades seleccionadas y revisadas</span>
              <span className="hidden sm:inline">•</span>
              <span>• Publicaciones claras y transparentes</span>
            </motion.div>
          </div>

          {/* LADO DERECHO: FOTO AGENCIA */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="relative mx-auto w-full max-w-md"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-fuchsia-500/50 bg-black/40 shadow-xl shadow-black/60">
              {/* Glow de color */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-fuchsia-700/30 via-transparent to-blue-500/20 mix-blend-screen" />
              <Image
                src="/agencia.jpg" // ⬅️ ajustá si tiene otro nombre
                alt="Frente de Jesús Díaz Automotores"
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Etiquetas flotantes */}
            <div className="pointer-events-none absolute -left-2 -bottom-3 rounded-2xl border border-slate-700 bg-black/70 px-4 py-2 text-xs text-slate-200 shadow-lg shadow-black/70 backdrop-blur">
              Más de <span className="font-semibold text-fuchsia-300">X</span>{' '}
              unidades en stock
            </div>
            <div className="pointer-events-none absolute -right-3 top-3 rounded-2xl border border-fuchsia-500 bg-black/80 px-4 py-2 text-xs font-semibold text-fuchsia-100 shadow-lg shadow-black/70 backdrop-blur">
              Atención personalizada
            </div>
          </motion.div>
        </div>

        {/* SECCIÓN DE BENEFICIOS / DESTACADOS */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="grid gap-4 rounded-3xl border border-slate-700/80 bg-black/40 p-5 text-left shadow-xl shadow-black/60 sm:grid-cols-3"
        >
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-fuchsia-300">
              Transparencia
            </p>
            <p className="text-sm font-semibold text-slate-50">
              Información clara
            </p>
            <p className="text-xs text-slate-400">
              Datos de cada unidad, km, año, fotos reales y precios actualizados
              desde Mercado Libre.
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-fuchsia-300">
              Confianza
            </p>
            <p className="text-sm font-semibold text-slate-50">
              Asesoramiento real
            </p>
            <p className="text-xs text-slate-400">
              Te acompañamos en todo el proceso de compra para que sientas
              seguridad en tu decisión.
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-fuchsia-300">
              Facilidad
            </p>
            <p className="text-sm font-semibold text-slate-50">
              Todo desde tu celu
            </p>
            <p className="text-xs text-slate-400">
              Mirá el catálogo, elegí las unidades que te interesan y escribinos
              directo por WhatsApp.
            </p>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
