// lib/fetchVehicles.ts
import { getValidAccessToken } from './meliAuth';

export type Vehicle = {
  meli_item_id: string;
  slug: string;
  title: string;
  brand: string | null;
  model: string | null;
  year: number | null;
  price: number | null;
  currency: string | null;
  permalink: string | null;
  thumbnail: string | null;
  pictures: string[];
};

/**
 * Pide a Mercado Libre los IDs de los items activos de un seller.
 */
async function listActiveItemIds(
  sellerId: string,
  accessToken: string
): Promise<string[]> {
  const url = `https://api.mercadolibre.com/users/${sellerId}/items/search?status=active`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('Error al listar items activos:', res.status, text);
    throw new Error(
      `No se pudieron listar los items activos de ML (${res.status})`
    );
  }

  const data = await res.json();
  const results: string[] = data.results ?? [];
  return results;
}

/**
 * Pide el detalle de un item a Mercado Libre.
 */
async function getItem(itemId: string, accessToken: string): Promise<any> {
  const url = `https://api.mercadolibre.com/items/${itemId}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`Error al obtener item ${itemId}:`, res.status, text);
    throw new Error(`No se pudo obtener el item ${itemId} (${res.status})`);
  }

  return res.json();
}

/**
 * Convierte la respuesta cruda de ML en nuestro tipo Vehicle.
 */
function transformItemToVehicle(raw: any): Vehicle {
  const meli_item_id = raw.id;
  const slug = meli_item_id.toLowerCase(); // por ahora usamos el ID como slug

  const brand = raw.attributes?.find(
    (a: any) => a.id === 'BRAND' || a.id === 'VEHICLE_BRAND'
  )?.value_name ?? null;

  const model = raw.attributes?.find(
    (a: any) => a.id === 'MODEL' || a.id === 'VEHICLE_MODEL'
  )?.value_name ?? null;

  const yearAttr = raw.attributes?.find(
    (a: any) => a.id === 'VEHICLE_YEAR' || a.id === 'YEAR'
  );
  const year = yearAttr ? Number(yearAttr.value_name) || null : null;

  const pictures: string[] = Array.isArray(raw.pictures)
    ? raw.pictures.map((p: any) => p.url).filter(Boolean)
    : [];

  return {
    meli_item_id,
    slug,
    title: raw.title,
    brand,
    model,
    year,
    price: raw.price ?? null,
    currency: raw.currency_id ?? null,
    permalink: raw.permalink ?? null,
    thumbnail: raw.thumbnail ?? null,
    pictures,
  };
}

/**
 * Función principal: trae todos los autos activos del seller configurado
 * en MELI_USER_ID, usando un access_token válido (se renueva solo).
 */
export async function fetchVehiclesFromMeli(): Promise<Vehicle[]> {
  const sellerId = process.env.MELI_USER_ID;
  if (!sellerId) {
    throw new Error('Falta MELI_USER_ID en .env.local');
  }

  const accessToken = await getValidAccessToken();
  const itemIds = await listActiveItemIds(sellerId, accessToken);

  const vehicles: Vehicle[] = [];

  for (const itemId of itemIds) {
    try {
      const raw = await getItem(itemId, accessToken);
      const v = transformItemToVehicle(raw);
      vehicles.push(v);
    } catch (err) {
      console.error('Error procesando item', itemId, err);
    }
  }

  return vehicles;
}
