import { NextResponse } from 'next/server';
import { fetchAndStoreVehicles } from '../../../../lib/fetchVehicles';

export async function GET() {
  try {
    const { count } = await fetchAndStoreVehicles();

    return NextResponse.json({
      ok: true,
      count,
      message: 'Sincronización completada',
    });
  } catch (error: any) {
    console.error('Error en /api/vehicles/sync:', error);

    return NextResponse.json(
      {
        ok: false,
        error: error?.message ?? 'Error desconocido',
      },
      { status: 500 }
    );
  }
}

export const POST = GET;
