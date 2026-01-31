"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { CONTACT, waLink } from "@/lib/siteConfig";

/**
 * 👉 Notas rápidas
 * - Requiere Tailwind y Framer Motion (ya lo usás).
 * - No agrega dependencias extra.
 * - Incluye: spotlight que sigue el mouse, blobs animados, sparkles,
 *   parallax leve, botones magnéticos, shine en cards, marquee de marcas.
 * - Cambiá rutas de imágenes si hace falta (logo, agencia, logos de marcas).
 */

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-clip bg-[#05030a]">
      {/* BACKGROUND FX */}
      <BackgroundFX />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-12 px-4 py-10 lg:py-16">
        {/* LOGO ARRIBA */}
        <div className="flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative h-14 w-auto md:h-16"
          >
            <Image
              src="/jda-logo.png"
              alt="Jesús Díaz Automotores"
              width={260}
              height={80}
              className="h-full w-auto object-contain drop-shadow-[0_2px_24px_rgba(244,114,182,0.25)]"
              priority
            />
          </motion.div>
        </div>

        {/* HERO PRINCIPAL */}
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          {/* LADO IZQ: TEXTO + CTA */}
          <div className="space-y-6 text-center lg:text-left">
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-fuchsia-500/40 bg-fuchsia-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-fuchsia-200 shadow-[0_0_30px_rgba(244,114,182,0.25)]"
            >
              Catálogo siempre actualizado
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.45, delay: 0.05 }}
              className="text-4xl font-black text-white md:text-5xl lg:text-6xl"
            >
              Tu próximo <span className="animated-gradient-text">auto</span> está
              esperándote en Jesús Díaz Automotores
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mx-auto max-w-xl text-sm text-slate-300 md:text-base"
            >
              Un catálogo siempre actualizado, unidades seleccionadas y una atención cercana para ayudarte a elegir con tranquilidad.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="flex flex-col items-center gap-3 sm:flex-row sm:justify-start"
            >
              <Magnetic>
                <Link
                  href="/catalogo"
                  className="group relative inline-block rounded-xl bg-fuchsia-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-800/40 transition hover:scale-[1.02] active:scale-[0.99]"
                >
                  <Shine>Ver catálogo de vehículos</Shine>
                </Link>
              </Magnetic>

              <Magnetic intensity={18}>
                <a
                  href={waLink(CONTACT.whatsapp.primary, "Hola! Quiero cotizar mi próximo auto.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block rounded-xl border border-fuchsia-500/70 px-7 py-3 text-sm font-semibold text-fuchsia-200 transition hover:bg-fuchsia-900/30 hover:shadow-[0_0_30px_rgba(244,114,182,0.2)]"
                >
                  Consultar por WhatsApp
                </a>
              </Magnetic>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-3 flex flex-col items-center gap-2 text-xs text-slate-400 sm:flex-row sm:justify-start"
            >
              <span>• Unidades seleccionadas y revisadas</span>
              <span className="hidden sm:inline">•</span>
              <span>• Publicaciones claras y transparentes</span>
            </motion.div>
          </div>

          {/* LADO DER: FOTO AGENCIA */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative mx-auto w-full max-w-md"
          >
            <HoverGlowCard>
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-fuchsia-500/50 bg-black/40">
                {/* Glow de color */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-fuchsia-700/30 via-transparent to-blue-500/20 mix-blend-screen" />
                <Image
                  src="/agencia.jpg"
                  alt="Frente de Jesús Díaz Automotores"
                  fill
                  className="object-cover"
                  priority
                />
                <Sparkles />
              </div>
            </HoverGlowCard>

            {/* Etiquetas flotantes */}
            <div className="pointer-events-none absolute -left-2 -bottom-3 rounded-2xl border border-slate-700 bg-black/70 px-4 py-2 text-xs text-slate-200 shadow-lg backdrop-blur">
              Más de <span className="font-semibold text-fuchsia-300">40</span> unidades en stock
            </div>
          </motion.div>
        </div>

        {/* MARQUEE MARCAS */}
        <BrandMarquee />

        {/* SECCIÓN DE BENEFICIOS */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="grid gap-4 rounded-3xl border border-slate-700/80 bg-black/40 p-5 text-left shadow-xl shadow-black/60 sm:grid-cols-3"
        >
          {[
            {
              k: "Transparencia",
              t: "Información clara",
              d: "Datos de cada unidad, km, año, fotos reales y fotos reales y precios actualizados.",
            },
            { k: "Confianza", t: "Asesoramiento real", d: "Te acompañamos en todo el proceso de compra para que sientas seguridad en tu decisión." },
            { k: "Facilidad", t: "Todo desde tu celu", d: "Mirá el catálogo, elegí las unidades que te interesan y escribinos directo por WhatsApp." },
          ].map((c) => (
            <CardShine key={c.k}>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-fuchsia-300">{c.k}</p>
                <p className="text-sm font-semibold text-slate-50">{c.t}</p>
                <p className="text-xs text-slate-400">{c.d}</p>
              </div>
            </CardShine>
          ))}
        </motion.section>
      </div>

      {/* CURSOR SPOTLIGHT */}
      <Spotlight />

      {/* Inline styles (keyframes/utilidades) */}
      <style jsx global>{`
        .animated-gradient-text {
          background: linear-gradient(90deg, #f472b6, #60a5fa, #a78bfa, #f472b6);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          background-size: 300% 100%;
          animation: jda-gradient 8s ease-in-out infinite;
          text-shadow: 0 4px 40px rgba(96, 165, 250, 0.25);
        }
        @keyframes jda-gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .marquee-track { animation: marquee 22s linear infinite; }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </main>
  );
}

/* ===================== FX COMPONENTS ===================== */

function BackgroundFX() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      {/* Degradado base */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#05030a] via-[#12081f] to-[#2b0b3a]" />
      {/* Blobs suaves */}
      <div className="absolute left-1/2 top-16 h-80 w-80 -translate-x-1/2 rounded-full bg-fuchsia-600/25 blur-3xl" />
      <div className="absolute right-[10%] top-[30%] h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="absolute left-[8%] bottom-[15%] h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
      {/* Grain sutil */}
    </div>
  );
}

function Sparkles() {
  // Pequeños destellos con CSS puro
  return (
    <div className="pointer-events-none absolute inset-0">
      {Array.from({ length: 14 }).map((_, i) => (
        <span
          key={i}
          className="absolute h-[2px] w-[2px] animate-ping rounded-full bg-white/70"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDuration: `${2 + Math.random() * 3}s`,
          }}
        />
      ))}
    </div>
  );
}

function Shine({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative inline-flex overflow-hidden">
      <span className="relative z-10">{children}</span>
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent blur-sm transition group-hover:translate-x-full" />
    </span>
  );
}

function Magnetic({ children, intensity = 12 }: { children: React.ReactNode; intensity?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useTransform(mx, (v) => v);
  const y = useTransform(my, (v) => v);

  return (
    <motion.div
      ref={ref}
      style={{ x, y }}
      onMouseMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        mx.set((dx / (r.width / 2)) * intensity);
        my.set((dy / (r.height / 2)) * intensity);
      }}
      onMouseLeave={() => {
        mx.set(0);
        my.set(0);
      }}
      className="[transform-style:preserve-3d]"
    >
      {children}
    </motion.div>
  );
}

function HoverGlowCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="group relative">
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-fuchsia-500/30 via-violet-500/30 to-blue-500/30 opacity-0 blur-xl transition duration-300 group-hover:opacity-100" />
      <div className="relative rounded-3xl ring-1 ring-white/10">{children}</div>
    </div>
  );
}

function CardShine({ children }: { children: React.ReactNode }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-700/80 bg-black/40 p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
      <div className="pointer-events-none absolute -inset-1 opacity-0 blur-xl transition duration-300 group-hover:opacity-100" style={{ background: "conic-gradient(from 180deg at 50% 50%, rgba(244,114,182,0.18), rgba(99,102,241,0.18), rgba(59,130,246,0.18), rgba(244,114,182,0.18))" }} />
      <div className="relative">{children}</div>
    </div>
  );
}

function Spotlight() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <div className="spotlight" />
      <style jsx>{`
        .spotlight {
          position: absolute;
          inset: -10rem;
          background: radial-gradient(600px 300px at var(--mx, 50%) var(--my, 30%), rgba(168, 85, 247, 0.18), transparent 60%),
                      radial-gradient(400px 240px at calc(var(--mx, 50%) + 10%) calc(var(--my, 30%) + 5%), rgba(59, 130, 246, 0.12), transparent 60%);
          mask-image: radial-gradient(500px 240px at var(--mx, 50%) var(--my, 30%), black 40%, transparent 70%);
        }
      `}</style>
      <MouseVars />
    </div>
  );
}

function MouseVars() {
  // Actualiza variables CSS para spotlight
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      document.documentElement.style.setProperty("--mx", `${e.clientX}px`);
      document.documentElement.style.setProperty("--my", `${e.clientY}px`);
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);
  return null;
}

function BrandMarquee() {
  const base = [
    { src: "/brands/chevrolet.png", alt: "Chevrolet" },
    { src: "/brands/volkswagen.png", alt: "Volkswagen" },
    { src: "/brands/ford.png", alt: "Ford" },
    { src: "/brands/fiat.png", alt: "Fiat" },
    { src: "/brands/renault.png", alt: "Renault" },
    { src: "/brands/toyota.png", alt: "Toyota" },
  ];

  const containerRef = React.useRef<HTMLDivElement>(null);
  const seqRef = React.useRef<HTMLUListElement>(null);
  const [copies, setCopies] = React.useState(3); // evita huecos

  React.useEffect(() => {
    const fit = () => {
      const containerW = containerRef.current?.offsetWidth || 0;
      const seqW = seqRef.current?.scrollWidth || 0;
      if (!containerW || !seqW) return;
      // Track total >= 2× contenedor → loop sin espacios
      const needed = Math.max(2, Math.ceil((containerW * 2) / seqW) + 1);
      setCopies(needed);
    };
    fit();
    const ro = new ResizeObserver(fit);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const track = Array.from({ length: copies }).flatMap(() => base);

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-3xl border border-slate-800/70 bg-black/30 py-4"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="flex items-center opacity-80 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <ul
          ref={seqRef}
          className="marquee-track flex items-center gap-8 px-6"
          style={{ animationDuration: `${Math.max(18, track.length * 2)}s` }}
        >
          {track.map((l, i) => (
            <li key={i} className="shrink-0">
              <Image
                src={l.src}
                alt={l.alt}
                width={92}
                height={36}
                className="h-6 w-auto opacity-80 transition-transform duration-500 hover:scale-110 hover:opacity-100"
              />
            </li>
          ))}
        </ul>
      </div>

      {/* estilos del marquee (pueden ir acá o en el <style jsx global> del Home) */}
      <style jsx global>{`
        .marquee-track {
          animation-name: marquee;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee-track {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
