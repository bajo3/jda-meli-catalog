'use client';

import { useEffect, useState } from 'react';
import type React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';

type Props = {
  vehicle: any;
};

export default function VehicleDetailClient({ vehicle }: Props) {
  const pictures: string[] = Array.isArray(vehicle.pictures)
    ? vehicle.pictures
    : [];

  const [activeIndex, setActiveIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const mainPicture = pictures[activeIndex] ?? pictures[0] ?? null;

  // Debug opcional
  console.log('Vehicle desde Supabase:', vehicle);

  // Cerrar modal con ESC
  useEffect(() => {
    if (!isModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isModalOpen]);

  // 🔧 LEER EN MAYÚSCULA O MINÚSCULA (por si la columna en Postgres es km/motor/etc.)
  const rawKm = vehicle.Km ?? vehicle.km;
  const km: number | null =
    typeof rawKm === 'number'
      ? rawKm
      : rawKm
        ? Number(String(rawKm).replace(/\D/g, ''))
        : null;

  const motor: string | null = vehicle.Motor ?? vehicle.motor ?? null;

  const caja: string | null =
    vehicle.Caja ??
    vehicle.caja ??
    vehicle.Transmission ??
    vehicle.transmission ??
    null;

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

  return (
    <main className="min-h-screen bg-[#05030a] text-slate-100 px-4 py-8 md:py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        {/* Migas */}
        <nav className="text-xs text-slate-400">
          <Link href="/catalogo" className="text-fuchsia-400 hover:underline">
            Catálogo
          </Link>
          <span className="mx-1">›</span>
          <span>{vehicle.title}</span>
        </nav>

        {/* Layout responsive: columna en mobile, dos columnas en desktop */}
        <div className="flex flex-col items-start gap-8 lg:flex-row">
          {/* ================= IZQUIERDA: GALERÍA ================= */}
          <section className="w-full space-y-4 lg:w-1/2">
            <div className="flex justify-center">
              {/* CONTENEDOR FIJO */}
              <div className="relative w-full max-w-[560px] aspect-[4/3] overflow-hidden rounded-xl border border-fuchsia-600/60 bg-black">
                <AnimatePresence mode="wait">
                  {mainPicture ? (
                    <motion.div
                      key={activeIndex}
                      className="absolute inset-0 cursor-zoom-in"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => setIsModalOpen(true)}
                    >
                      <Image
                        src={mainPicture}
                        alt={vehicle.title}
                        fill
                        className="object-cover"
                        sizes="(min-width: 1024px) 560px, (min-width: 640px) 90vw, 100vw"
                        quality={95}
                        unoptimized
                        priority
                      />
                    </motion.div>
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
            </div>

            <div className="px-3 pt-1 text-center text-[0.7rem] text-slate-200">
              Asesores 2494-587046 / 2494-541756
            </div>

            {/* Miniaturas */}
            {pictures.length > 1 && (
              <div className="custom-scrollbar flex gap-2 overflow-x-auto pb-1">
                {pictures.map((pic, idx) => {
                  const isActive = idx === activeIndex;
                  return (
                    <motion.button
                      key={idx}
                      type="button"
                      whileHover={{ scale: 1.03 }}
                      onClick={() => setActiveIndex(idx)}
                      className={`relative flex-shrink-0 h-16 w-24 sm:h-20 sm:w-28 overflow-hidden rounded-lg border bg-black ${
                        isActive
                          ? 'border-fuchsia-400 ring-2 ring-fuchsia-500'
                          : 'border-fuchsia-700/40'
                      }`}
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

          {/* ================= DERECHA: FICHA ================= */}
          <motion.aside
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full rounded-2xl border border-fuchsia-700/50 bg-gradient-to-b from-[#111118] to-[#2b0b3a] p-6 shadow-lg shadow-black/50 lg:w-1/2 flex flex-col gap-4"
          >
            <div>
              <h1 className="text-2xl font-bold text-white">{vehicle.title}</h1>
              <p className="mt-1 text-sm text-slate-400">
                {vehicle.brand ?? 'Marca'} • {vehicle.year ?? 'Año'}{' '}
                {vehicle.category ? `• ${vehicle.category}` : ''}
              </p>
            </div>

            {/* CARACTERÍSTICAS */}
            <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <p className="text-slate-400">Kilometraje</p>
                <p className="font-semibold">
                  {km !== null
                    ? `${km.toLocaleString('es-AR')} km`
                    : 'A consultar'}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Motor</p>
                <p className="font-semibold">{motor ?? '-'}</p>
              </div>
              <div>
                <p className="text-slate-400">Año</p>
                <p className="font-semibold">{vehicle.year ?? '-'}</p>
              </div>
              <div>
                <p className="text-slate-400">Transmisión</p>
                <p className="font-semibold">{caja ?? '-'}</p>
              </div>
              <div>
                <p className="text-slate-400">Combustible</p>
                <p className="font-semibold">{combustible ?? '-'}</p>
              </div>
              <div>
                <p className="text-slate-400">Puertas</p>
                <p className="font-semibold">
                  {puertas !== null ? puertas : '-'}
                </p>
              </div>
            </div>

            {/* PRECIO */}
            {vehicle.price != null && (
              <div className="mt-3">
                <p className="text-xs text-slate-400 uppercase tracking-wide">
                  Precio
                </p>
                <p className="text-2xl font-bold text-white">
                  $
                  {vehicle.price.toLocaleString('es-AR', {
                    maximumFractionDigits: 0,
                  })}
                </p>
              </div>
            )}

            {/* BOTONES */}
            <div className="mt-auto flex flex-col gap-3">
              <motion.a
                whileTap={{ scale: 0.97 }}
                href={`https://wa.me/5492494XXXXXX?text=Hola! Estoy interesado en el ${encodeURIComponent(
                  vehicle.title,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full rounded-xl bg-fuchsia-600 py-2 text-center text-sm font-semibold text-white hover:bg-fuchsia-500 transition"
              >
                💬 Consultar
              </motion.a>
              <motion.button
                whileTap={{ scale: 0.97 }}
                className="w-full rounded-xl border border-slate-600 py-2 text-sm text-slate-300 hover:bg-slate-800 transition"
              >
                🔗 Compartir
              </motion.button>
            </div>
          </motion.aside>
        </div>
      </div>

      {/* MODAL FOTO GRANDE */}
      <AnimatePresence>
        {isModalOpen && mainPicture && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              className="relative max-w-[90vw] max-h-[90vh] rounded-xl overflow-hidden border border-fuchsia-500 bg-black"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e: React.MouseEvent<HTMLDivElement>) =>
                e.stopPropagation()
              }
            >
              <div className="relative w-[80vw] max-w-4xl aspect-[16/9] md:w-[70vw]">
                <Image
                  src={mainPicture}
                  alt={vehicle.title}
                  fill
                  className="object-contain"
                  sizes="100vw"
                />
              </div>

              <button
                type="button"
                className="absolute right-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-slate-100 hover:bg-black"
                onClick={() => setIsModalOpen(false)}
              >
                ✕ Cerrar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
