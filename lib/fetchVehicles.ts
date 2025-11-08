import { getValidAccessToken } from './meliAuth';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import slugify from 'slugify';

/**
 * Normalized vehicle record stored in Supabase.  Only the fields that
 * matter to the catalogue are persisted.  Feel free to extend this
 * interface if you need additional information such as kilometers or
 * description.
 */
export interface Vehicle {
  id: string;
  title: string;
  brand: string | null;
  year: number | null;
  price: number | null;
  slug: string;
  pictures: string[];
  permalink: string;
}

/**
 * Derives brand and year from the attributes array returned by the
 * Mercado Libre API.  Attributes are objects with `id`, `name` and
 * `value_name` fields.  For vehicles the attribute IDs for brand and
 * year are usually `BRAND` and `VEHICLE_YEAR` but this function
 * attempts to find them by name as well.
 */
function extractVehicleDetails(attributes: any[]): {
  brand: string | null;
  year: number | null;
} {
  let brand: string | null = null;
  let year: number | null = null;
  for (const attr of attributes || []) {
    const key = (attr.id || attr.name || '').toString().toUpperCase();
    if (!brand && (key.includes('BRAND') || key.includes('MARCA'))) {
      brand = attr.value_name;
    }
    if (!year && (key.includes('YEAR') || key.includes('ANO') || key.includes('AÑO'))) {
      const parsed = parseInt(attr.value_name);
      year = isNaN(parsed) ? null : parsed;
    }
  }
  return { brand, year };
}

/**
 * Converts an item returned from the Mercado Libre API into our
 * internal `Vehicle` format.  It uses the `attributes` array to
 * extract brand and year and uses the `title` to create a slug.
 */
function normalizeItem(item: any): Vehicle {
  const { brand, year } = extractVehicleDetails(item.attributes || []);
  const slug = slugify(item.title, { lower: true, strict: true });
  const pictures: string[] = [];
  if (Array.isArray(item.pictures)) {
    for (const pic of item.pictures) {
      if (pic && pic.url) pictures.push(pic.url);
    }
  }
  return {
    id: item.id,
    title: item.title,
    brand: brand,
    year: year,
    price: item.price ?? null,
    slug,
    pictures,
    permalink: item.permalink,
  };
}

/**
 * Creates a Supabase client with the service role key.  See
 * meliAuth.ts for a discussion on why this key must remain on the
 * server【296182528277160†L178-L210】.
 */
function getSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

/**
 * Fetches the list of active items for a seller and upserts them into
 * Supabase.  This function iterates through all pages of the
 * `/users/{user_id}/items/search` endpoint.  Once all item IDs are
 * collected it fetches the item details in batches of 20 using the
 * `/items?ids=` endpoint and writes the normalized records into the
 * `vehicles` table via upsert.  The Mercado Libre API call uses
 * the `access_token` obtained from `meliAuth.ts`.  Example of
 * calling the search endpoint: a GET request to
 * `https://api.mercadolibre.com/users/239258430/items/search` with
 * `status=active` and an access token returns a list of item IDs【450025776094339†L129-L139】.
 */
export async function fetchAndStoreVehicles(): Promise<{ count: number }> {
  const supabase = getSupabase();
  const accessToken = await getValidAccessToken();
  const userId = process.env.MELI_USER_ID;
  if (!userId) {
    throw new Error('MELI_USER_ID must be defined');
  }
  const allItemIds: string[] = [];
  let offset = 0;
  const limit = 50;
  while (true) {
    const searchUrl = new URL(`https://api.mercadolibre.com/users/${userId}/items/search`);
    searchUrl.searchParams.set('status', 'active');
    searchUrl.searchParams.set('limit', limit.toString());
    searchUrl.searchParams.set('offset', offset.toString());
    // We can use access token either via query param or Authorization header.  The
    // StackOverflow example uses a query param【450025776094339†L129-L139】.
    searchUrl.searchParams.set('access_token', accessToken);
    const searchResp = await fetch(searchUrl.toString());
    if (!searchResp.ok) {
      throw new Error(`Failed to fetch items: ${searchResp.status} ${searchResp.statusText}`);
    }
    const searchData = await searchResp.json();
    const results: string[] = searchData.results || [];
    allItemIds.push(...results);
    if (results.length < limit) {
      break;
    }
    offset += limit;
  }
  // Batch fetch details using /items?ids=id1,id2,...  (max 20 ids per request is typical)
  const vehicles: Vehicle[] = [];
  const batchSize = 20;
  for (let i = 0; i < allItemIds.length; i += batchSize) {
    const batchIds = allItemIds.slice(i, i + batchSize);
    const detailsUrl = new URL('https://api.mercadolibre.com/items');
    detailsUrl.searchParams.set('ids', batchIds.join(','));
    // optionally request only the fields we care about to reduce payload
    detailsUrl.searchParams.set('attributes', 'id,title,price,attributes,pictures,permalink');
    const detailsResp = await fetch(detailsUrl.toString());
    if (!detailsResp.ok) {
      throw new Error(`Failed to fetch item details: ${detailsResp.status} ${detailsResp.statusText}`);
    }
    const detailsData = await detailsResp.json();
    for (const itemWrapper of detailsData) {
      const item = itemWrapper.body || itemWrapper; // API may wrap item under .body
      vehicles.push(normalizeItem(item));
    }
  }
  // Upsert into Supabase
  const { error } = await supabase.from('vehicles').upsert(vehicles, {
    onConflict: 'id',
  });
  if (error) {
    throw error;
  }
  return { count: vehicles.length };
}