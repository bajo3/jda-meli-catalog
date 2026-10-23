import { NextResponse } from 'next/server';

// Sólo servía a la importación desde Mercado Libre, que quedó desactivada.
export async function GET() {
  return NextResponse.json(
    { ok: false, error: 'Importación desde Mercado Libre desactivada: el catálogo lo actualiza JD-Auto.' },
    { status: 410 },
  );
}

export const POST = GET;
