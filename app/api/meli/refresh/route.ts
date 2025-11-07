import { NextResponse } from 'next/server';
import { refreshAccessToken } from '@/lib/meliAuth';

export async function GET() {
  try {
    const token = await refreshAccessToken();
    return NextResponse.json({
      ok: true,
      expires_at: token.expires_at,
      now: Date.now(),
    });
  } catch (error: any) {
    console.error('Error en /api/meli/refresh:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Error desconocido' },
      { status: 500 }
    );
  }
}

// también podés permitir POST si querés
export const POST = GET;
