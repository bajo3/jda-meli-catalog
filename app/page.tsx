'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#111118] to-[#2b0b3a] px-4">
      <div className="max-w-5xl text-center space-y-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-5xl font-extrabold text-white"
        >
          Encuentra tu próximo vehículo
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-2xl mx-auto text-slate-300 text-base md:text-lg"
        >
          Explora nuestro catálogo actualizado desde Mercado Libre y descubre autos y camionetas al mejor precio.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/catalogo"
            className="inline-block rounded-xl bg-fuchsia-600 px-6 py-3 text-base font-semibold text-white hover:bg-fuchsia-500 transition"
          >
            Ver catálogo
          </Link>

          <a
            href="https://wa.me/5492494XXXXXX"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-xl border border-fuchsia-600 px-6 py-3 text-base font-semibold text-fuchsia-300 hover:bg-fuchsia-800/40 transition"
          >
            Consultar por WhatsApp
          </a>
        </motion.div>
      </div>
    </main>
  );
}
