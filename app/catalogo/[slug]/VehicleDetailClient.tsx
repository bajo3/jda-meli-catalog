'use client';

import { useEffect, useRef, useState } from 'react';
import type React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import FinancingSimulator from '@/components/FinancingSimulator';
import { formatVehiclePrice } from '@/lib/vehiclePrice';
import { CONTACT, waLink } from '@/lib/siteConfig';
import { track } from '@/lib/analyticsClient';

type Props = {
  vehicle: any;
};

export default function VehicleDetailClient({ vehicle }: Props) {
  const pictures: string[] = Array.isArray(vehicle.pictures) ? vehicle.pictures : [];
  const [activeIndex, setActiveIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const mainPicture = pictures[activeIndex] ?? pictures[0] ?? null;

  const goNext = () =>
    setActiveIndex((i) => (pictures.length ? (i + 1) % pictures.length : i));
  const goPrev = () =>
    setActiveIndex((i) => (pictures.length ? (i - 1 + pictures.length) % pictures.length : i));

  // Cerrar modal/Esc y navegar con flechas
  useEffect(() => {
    if (!isModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModalOpen(false);
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen, activeIndex, pictures.length]);

  // Touch swipe en modal
  const touchStartX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => (touchStartX.current = e.touches[0].clientX);
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) (dx < 0 ? goNext() : goPrev());
    touchStartX.current = null;
  };

  // Datos flexibles
  const rawKm = vehicle.Km ?? vehicle.km;
  const km: number | null =
    typeof rawKm === 'number' ? rawKm : rawKm ? Number(String(rawKm).replace(/\D/g, '')) : null;
  const motor: string | null = vehicle.Motor ?? vehicle.motor ?? null;
  const caja: string | null =
    vehicle.Caja ?? vehicle.caja ?? vehicle.Transmission ?? vehicle.transmission ?? null;
  const combustible: string | null =
    vehicle.Combustible ??
    vehicle.combustible ??
    vehicle.Fuel ??
    vehicle.fuel ??
    vehicle.fuel_type ??
    null;
  const rawPuertas = vehicle.Puertas ?? vehicle.puertas ?? vehicle.doors;
  const puertas: number | null =
    typeof rawPuertas === 'number'
      ? rawPuertas
      : rawPuertas
        ? Number(String(rawPuertas).replace(/\D/g, ''))
        : null;

  const status: string | undefined = vehicle.status ?? vehicle.estado;

  // Track: vista de ficha
  useEffect(() => {
    track({
      event_type: 'vehicle_view',
      vehicle_id: vehicle?.id ?? null,
      vehicle_slug: vehicle?.slug ?? null,
      location: 'vehicle_page',
      meta: { title: vehicle?.title ?? null },
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicle?.id])

  const handleShare = async () => {
    const url = `${location.origin}/catalogo/${vehicle?.slug ?? ''}`
    const title = vehicle?.title ?? 'Vehículo'

    let method: 'native' | 'clipboard' | 'none' = 'none'
    try {
      if (navigator.share) {
        await navigator.share({ title, url })
        method = 'native'
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url)
        method = 'clipboard'
        alert('Link copiado al portapapeles')
      }
    } catch {
      // no-op
    }

    track({
      event_type: 'share_click',
      vehicle_id: vehicle?.id ?? null,
      vehicle_slug: vehicle?.slug ?? null,
      location: 'vehicle_share',
      meta: { method, url },
    })
  }

  return (
    <main className="relative min-h-screen text-slate-100 px-4 py-8 md:py-10">
      {/* Fondo texturizado premium */}
      <div
        className="
        pointer-events-none 
        fixed inset-0 -z-10 
        bg-[#05030a]
        bg-[radial-gradient(circle_at_top,_rgba(255,0,128,0.12),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(0,140,255,0.12),_transparent_60%)]
        before:absolute before:inset-0 
        before:bg-[url('/textures/noise.png')] 
        before:opacity-[0.08] 
        before:mix-blend-overlay
      "
      />

      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        {/* Migas */}
        <nav className="text-xs text-slate-400">
          <Link href="/catalogo" className="text-fuchsia-400 hover:underline">
            Catálogo
          </Link>
          <span className="mx-1">›</span>
          <span className="text-slate-300 line-clamp-1">{vehicle.title}</span>
        </nav>

        {/* Layout */}
        <div className="flex flex-col items-start gap-8 lg:flex-row">
          {/* IZQUIERDA: GALERÍA */}
          <section className="w-full space-y-4 lg:w-1/2">
            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              {/* Glow alrededor de la caja */}
              <div className="pointer-events-none absolute -inset-2 -z-10 rounded-3xl bg-gradient-to-tr from-fuchsia-600/30 via-transparent to-blue-500/25 opacity-60 blur-2xl" />
              <div className="relative w-full max-w-[560px] mx-auto aspect-[4/3] overflow-hidden rounded-2xl border border-fuchsia-600/70 bg-[#080812] shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
                {/* líneas diagonales suaves */}
                <div className="pointer-events-none absolute inset-[-40%] opacity-[0.09] mix-blend-soft-light bg-[radial-gradient(circle_at_top,_rgba(248,250,252,0.35),_transparent_60%),repeating-linear-gradient(135deg,rgba(148,163,184,0.55)_0px,rgba(148,163,184,0.35)_1px,transparent_1px,transparent_10px)]" />

                <AnimatePresence mode="wait">
                  {mainPicture ? (
                    <motion.button
                      key={activeIndex}
                      type="button"
                      className="absolute inset-0"
                      initial={{ opacity: 0.15, scale: 1.02 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      onClick={() => setIsModalOpen(true)}
                      aria-label="Ampliar imagen"
                    >
                      <Image
                        src={mainPicture}
                        alt={vehicle.title}
                        fill
                        className="object-cover"
                        sizes="(min-width:1024px) 560px, (min-width:640px) 90vw, 100vw"
                        // Lower quality improves first-load performance with no visible loss in most cases.
                        quality={75}
                        priority
                      />
                      {/* banda inferior para lectura del auto */}
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
                      <div className="pointer-events-none absolute left-4 bottom-3 flex flex-col gap-0.5 text-left">
                        <p className="text-[0.7rem] uppercase tracking-[0.18em] text-fuchsia-200/90">
                          Jesús Díaz Automotores
                        </p>
                        <p className="text-xs text-slate-100/90 line-clamp-1">
                          {vehicle.brand} {vehicle.model ?? ''} {vehicle.version ?? ''}
                        </p>
                      </div>
                    </motion.button>
                  ) : (
                    <motion.div
                      key="empty"
                      className="absolute inset-0 flex items-center justify-center text-xs text-slate-500"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      Sin foto
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Etiqueta de asesores */}
              <div className="mt-2 flex items-center justify-center text-[0.7rem] text-slate-300 gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-fuchsia-500/40 bg-black/60 px-3 py-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Asesores +54 9 2494 587046 / +54 9 2494 630646
                </span>
              </div>
            </motion.div>

            {/* Miniaturas */}
            {pictures.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">

                {pictures.map((pic, idx) => {
                  const isActive = idx === activeIndex;
                  return (
                    <motion.button
                      key={idx}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setActiveIndex(idx)}
                      className={`relative flex-shrink-0 h-16 w-24 sm:h-20 sm:w-28 overflow-hidden rounded-lg border bg-black ${isActive
                        ? 'border-fuchsia-400 ring-2 ring-fuchsia-500'
                        : 'border-fuchsia-700/40'
                        }`}
                      aria-label={`Ver imagen ${idx + 1}`}
                    >
                      <Image
                        src={pic}
                        alt={`${vehicle.title} ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="120px"
                      />
                    </motion.button>
                  );
                })}
              </div>
            )}

            <div className="pt-2 text-center">
              <Link
                href="/catalogo"
                className="text-sm text-fuchsia-400 hover:text-fuchsia-200 hover:underline"
              >
                ← Volver al catálogo
              </Link>
            </div>
          </section>

          {/* DERECHA: FICHA */}
          <motion.aside
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full rounded-2xl border border-fuchsia-700/60 bg-gradient-to-b from-[#111118] via-[#151528] to-[#2b0b3a] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.85)] lg:w-1/2 flex flex-col gap-4"
          >
            {/* Header con estado + título */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <StatusBadge status={status} />
              </div>

              <h1 className="text-2xl font-semibold text-white md:text-3xl">
                {vehicle.title}
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                {vehicle.brand ?? 'Marca'} • {vehicle.year ?? 'Año'}{' '}
                {vehicle.category ? `• ${vehicle.category}` : ''}
              </p>

              {/* Chips rápidos */}
              <div className="mt-3 flex flex-wrap gap-2 text-[0.7rem]">
                {km !== null && (
                  <QuickChip icon="📍" label={`${km.toLocaleString('es-AR')} km`} />
                )}
                {caja && <QuickChip icon="⚙️" label={caja} />}
                {combustible && <QuickChip icon="⛽" label={combustible} />}
                {puertas && <QuickChip icon="🚪" label={`${puertas} puertas`} />}
              </div>
            </div>

            {/* Línea separadora */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-fuchsia-500/40 to-transparent my-2" />

            {/* CARACTERÍSTICAS */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <Spec
                label="Kilometraje"
                value={
                  km !== null ? `${km.toLocaleString('es-AR')} km` : 'A consultar'
                }
              />
              <Spec label="Motor" value={motor ?? '-'} />
              <Spec label="Año" value={vehicle.year ?? '-'} />
              <Spec label="Transmisión" value={caja ?? '-'} />
              <Spec label="Combustible" value={combustible ?? '-'} />
              <Spec label="Puertas" value={puertas ?? '-'} />
            </div>

            {/* PRECIO */}
            {vehicle.price != null && (
              <div className="mt-4 rounded-xl bg-black/40 p-3 border border-fuchsia-700/60">
                <p className="text-[0.7rem] text-slate-400 uppercase tracking-[0.2em]">
                  Precio final
                </p>
                <p className="mt-1 text-2xl font-bold text-white">
                  {formatVehiclePrice(vehicle.price).text}
                </p>
                <p className="mt-1 text-[0.7rem] text-slate-500">
                  Confirmar vigencia y condiciones con un asesor.
                </p>
              </div>
            )}

            {/* FINANCIACIÓN */}
            {vehicle.price != null && (
              <FinancingSimulator
                price={vehicle.price}
                title={vehicle.title}
                year={vehicle.year}
              />

            )}

            {/* Notas / descripción si existe */}
            {vehicle.description && (
              <div className="mt-2 rounded-lg bg-black/30 p-3 text-xs text-slate-300 border border-white/5 max-h-32 overflow-auto">
                {vehicle.description}
              </div>
            )}

            {/* BOTONES */}
            <div className="mt-auto flex flex-col gap-3 pt-2">
              <motion.a
                whileTap={{ scale: 0.97 }}
                href={waLink(CONTACT.whatsapp.primary, `Hola! Estoy interesado en el ${vehicle.title}`)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  track({
                    event_type: 'whatsapp_click',
                    phone: CONTACT.whatsapp.primary,
                    vehicle_id: vehicle?.id ?? null,
                    vehicle_slug: vehicle?.slug ?? null,
                    location: 'vehicle_cta',
                    meta: { title: vehicle?.title ?? null },
                  })
                }
                className="block w-full rounded-xl bg-fuchsia-600 py-2.5 text-center text-sm font-semibold text-white shadow-lg shadow-fuchsia-800/40 hover:bg-fuchsia-500 transition"
              >
                💬 Consultar por este vehículo
              </motion.a>

              <motion.button
                whileTap={{ scale: 0.97 }}
                className="w-full rounded-xl border border-slate-600 py-2 text-sm text-slate-300 hover:bg-slate-800 transition"
                onClick={handleShare}
              >
                🔗 Compartir ficha
              </motion.button>
            </div>
          </motion.aside>
        </div>
      </div>

      {/* MODAL / VIEWER */}
      <AnimatePresence>
        {isModalOpen && mainPicture && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              className="relative h-full w-full rounded-none overflow-hidden bg-[#050712] md:h-auto md:max-h-[92vh] md:max-w-[96vw] md:rounded-xl border border-fuchsia-500/40"
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              {/* Barra superior */}
              <div className="absolute inset-x-0 top-0 z-20 flex items-start justify-between p-2">
                <span className="rounded-full bg-black/70 px-2.5 py-1 text-[0.7rem] text-slate-200">
                  {activeIndex + 1} / {pictures.length}
                </span>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-slate-100 hover:bg-black"
                  aria-label="Cerrar"
                >
                  ✕ Cerrar
                </button>
              </div>

              {/* CONTENIDO: foto grande + miniaturas afuera abajo */}
              <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-3 md:p-4">
                {/* Foto grande */}
                <div className="relative w-full max-w-[1200px] h-[70vh] mx-auto md:h-[70vh]">
                  <Image
                    key={activeIndex}
                    src={pictures[activeIndex]}
                    alt={`${vehicle.title} grande`}
                    fill
                    className="object-contain"
                    sizes="100vw"
                    quality={80}
                    priority
                  />

                  {/* Zonas click izquierda / derecha solo sobre la foto */}
                  {pictures.length > 1 && (
                    <>
                      <button
                        aria-label="Anterior"
                        onClick={goPrev}
                        className="absolute left-0 top-0 h-full w-[18%] md:w-[14%] cursor-w-resize bg-gradient-to-r from-black/10 to-transparent"
                      />
                      <button
                        aria-label="Siguiente"
                        onClick={goNext}
                        className="absolute right-0 top-0 h-full w-[18%] md:w-[14%] cursor-e-resize bg-gradient-to-l from-black/10 to-transparent"
                      />
                    </>
                  )}
                </div>

                {/* Miniaturas ABAJO, por fuera de la foto */}
                {pictures.length > 1 && (
                  <div className="w-full max-w-[1200px]">
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {pictures.map((p, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveIndex(i)}
                          className={`relative h-14 w-20 flex-shrink-0 overflow-hidden rounded-md border ${i === activeIndex
                            ? 'border-fuchsia-400 ring-1 ring-fuchsia-500'
                            : 'border-white/20'
                            }`}
                          aria-label={`Ir a imagen ${i + 1}`}
                        >
                          <Image
                            src={p}
                            alt={`thumb ${i + 1}`}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


    </main>
  );
}

/* --- helpers visuales --- */

function Spec({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[0.7rem] uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-slate-50">{value}</p>
    </div>
  );
}

function QuickChip({ icon, label }: { icon: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/40 px-2.5 py-1 text-[0.7rem] text-slate-200">
      <span>{icon}</span>
      <span className="truncate max-w-[120px]">{label}</span>
    </span>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const s = (status ?? 'disponible').toLowerCase();
  const map: Record<
    string,
    { label: string; className: string }
  > = {
    disponible: {
      label: 'Disponible',
      className: 'bg-emerald-900/50 text-emerald-300 border-emerald-500/40',
    },
    reserva: {
      label: 'Reservado',
      className: 'bg-amber-900/40 text-amber-200 border-amber-500/50',
    },
    vendido: {
      label: 'Vendido',
      className: 'bg-rose-900/50 text-rose-200 border-rose-500/50',
    },
  };

  const conf = map[s] ?? map.disponible;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.7rem] font-medium ${conf.className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
      {conf.label}
    </span>
  );
}
