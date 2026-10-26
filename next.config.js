/** @type {import('next').NextConfig} */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
let supabaseHostname = '*.supabase.co'

if (supabaseUrl) {
  try {
    supabaseHostname = new URL(supabaseUrl).hostname
  } catch {
    // Mantener el patrón de Supabase para que el build no dependa de una URL válida.
  }
}

const nextConfig = {
  images: {
    // `domains` esta deprecado -> remotePatterns
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'http2.mlstatic.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.mlstatic.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: supabaseHostname,
        pathname: '/storage/v1/object/public/**',
      },
    ],

    // === CONTROL DE CUOTA DE IMAGE OPTIMIZATION ===
    // Cada combinacion unica de (src + width + quality + format) = 1 transformacion.
    // Reduciendo la cantidad de anchos generados se reduce el multiplicador por imagen.

    // Default de Next: [640,750,828,1080,1200,1920,2048,3840] = 8 variantes por imagen.
    deviceSizes: [640, 1080, 1920],
    // Default: [16,32,48,64,96,128,256,384]
    imageSizes: [128, 256],

    // Un solo formato (avif duplicaria el conteo)
    formats: ['image/webp'],

    // 31 dias. Si el cache expira, la misma imagen se vuelve a transformar y a contar.
    minimumCacheTTL: 2678400,
  },
};

module.exports = nextConfig;
