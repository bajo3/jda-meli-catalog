// app/api/vehicles/sync/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { fetchVehiclesFromMeli } from '../../../../lib/fetchVehicles';

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      'Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local'
    );
  }

  return createClient(url, serviceKey);
}

export async function GET() {
  try {
    const supabase = getAdminSupabase();

    // 1) Traer vehículos desde Mercado Libre
    const vehicles = await fetchVehiclesFromMeli();

    if (vehicles.length === 0) {
      return NextResponse.json({
        ok: true,
        message: 'No se encontraron vehículos activos en Mercado Libre',
        count: 0,
      });
    }

    // 2) Mapear al esquema de la tabla "vehicles" en Supabase
    const rows = vehicles.map((v) => ({
      meli_item_id: v.meli_item_id,
      slug: v.slug,
      title: v.title,
      brand: v.brand,
      model: v.model,
      year: v.year,
      price: v.price,
      currency: v.currency,
      permalink: v.permalink,
      thumbnail: v.thumbnail,
      pictures: v.pictures,
    }));

    // 3) Upsert en Supabase (basado en meli_item_id único)
    const { error } = await supabase
      .from('vehicles')
      .upsert(rows, { onConflict: 'meli_item_id' });

    if (error) {
      console.error('Error al upsert vehicles en Supabase:', error);
      throw error;
    }

    return NextResponse.json({
      ok: true,
      count: rows.length,
      message: 'Sincronización completada',
    });
  } catch (error: any) {
    console.error('Error en /api/vehicles/sync:', error);
    return NextResponse.json(
      { ok: false, error: error.message ?? 'Error desconocido' },
      { status: 500 }
    );
  }
}

// si querés también POST:
export const POST = GET;
