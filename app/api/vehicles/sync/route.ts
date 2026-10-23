import { NextResponse } from 'next/server';

// El catálogo lo escribe sólo JD-Auto: la importación desde Mercado Libre quedó desactivada.
export async function GET() {
  return NextResponse.json(
    { ok: false, error: 'Importación desde Mercado Libre desactivada: el catálogo lo actualiza JD-Auto.' },
    { status: 410 },
  );
}

export const POST = GET;
