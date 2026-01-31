// lib/siteConfig.ts
// Centraliza datos y textos de contacto para mantener consistencia en toda la web.

export const CONTACT = {
  whatsapp: {
    primary: '5492494587046',
    secondary: '5492494630646',
  },
  phones: {
    // Formato E.164 para links tel:
    primary: '+5492494587046',
    secondary: '+5492494630646',
  },
  email: 'jesusdiazautomotores@gmail.com',
  address: {
    line1: 'Piedrabuena 1578, Tandil',
    line2: 'Colectora Macaya esq. México',
    // Formato compacto para UI
    full: 'Piedrabuena 1578, Tandil / Colectora Macaya esq. México',
    // Query sin tildes para Google Maps
    mapsQuery: 'Piedrabuena 1578, Tandil, Colectora Macaya esq Mexico',
  },
  hours: {
    weekdays: 'Lunes a viernes: 8:30 a 12:30 · 16:00 a 20:00',
    saturday: 'Sábados: 9:00 a 13:00',
    sunday: 'Domingos: cerrado',
  },
} as const;

export function waLink(number: string, text?: string) {
  const base = `https://wa.me/${number}`;
  if (!text) return base;
  return `${base}?text=${encodeURIComponent(text)}`;
}

export const MAPS = {
  embedSrc: `https://maps.google.com/maps?q=${encodeURIComponent(
    CONTACT.address.mapsQuery,
  )}&output=embed`,
  openUrl: `https://maps.google.com/?q=${encodeURIComponent(
    CONTACT.address.mapsQuery,
  )}`,
} as const;
