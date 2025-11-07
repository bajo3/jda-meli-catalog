// lib/meliAuth.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface MeliToken {
  access_token: string;
  refresh_token: string;
  expires_at: number; // epoch milliseconds
}

const TABLE_NAME = 'meli_tokens';
const ROW_ID = 'main';

let supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
      throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local');
    }
    supabase = createClient(url, serviceKey);
  }
  return supabase;
}

async function loadToken(): Promise<MeliToken | null> {
  const client = getSupabase();
  const { data, error } = await client
    .from(TABLE_NAME)
    .select('*')
    .eq('id', ROW_ID)
    .maybeSingle();

  if (error) {
    console.error('Error al leer meli_tokens:', error);
    throw error;
  }

  if (!data) return null;

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Number(data.expires_at),
  };
}

async function saveToken(token: MeliToken): Promise<void> {
  const client = getSupabase();
  const { error } = await client
    .from(TABLE_NAME)
    .upsert(
      {
        id: ROW_ID,
        access_token: token.access_token,
        refresh_token: token.refresh_token,
        expires_at: token.expires_at,
      },
      { onConflict: 'id' }
    );

  if (error) {
    console.error('Error al guardar meli_tokens:', error);
    throw error;
  }
}

/**
 * Llama al endpoint de Mercado Libre para obtener un nuevo access_token
 * usando un refresh_token.
 */
async function requestNewAccessToken(refreshToken: string): Promise<MeliToken> {
  const appId = process.env.MELI_APP_ID;
  const appSecret = process.env.MELI_APP_SECRET;

    console.log('DEBUG MELI_APP_ID:', process.env.MELI_APP_ID);
  console.log(
    'DEBUG MELI_APP_SECRET prefix:',
    process.env.MELI_APP_SECRET?.slice(0, 4)
  );
  console.log(
    'DEBUG MELI_REFRESH_TOKEN suffix:',
    process.env.MELI_REFRESH_TOKEN?.slice(-10)
  );

  if (!appId || !appSecret) {
    throw new Error('Faltan MELI_APP_ID o MELI_APP_SECRET en .env.local');
  }

  const body = new URLSearchParams();
  body.set('grant_type', 'refresh_token');
  body.set('client_id', appId);
  body.set('client_secret', appSecret);
  body.set('refresh_token', refreshToken);

  const res = await fetch('https://api.mercadolibre.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
    
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('Error al refrescar token en ML:', res.status, text);
    throw new Error(`No se pudo refrescar el token de Mercado Libre (${res.status})`);
  }

  const data = await res.json();

  const expiresAt = Date.now() + Number(data.expires_in) * 1000;

  return {
    access_token: data.access_token,
    // algunos flujos devuelven un refresh_token nuevo, otros no
    refresh_token: data.refresh_token ?? refreshToken,
    expires_at: expiresAt,
  };
}

/**
 * Si el token guardado está vigente, lo devuelve.
 * Si falta o está vencido (o a 5 minutos de vencer), lo renueva.
 */
export async function refreshAccessToken(): Promise<MeliToken> {
  const existing = await loadToken();
  const now = Date.now();
  const buffer = 5 * 60 * 1000; // 5 minutos

  if (existing && existing.expires_at && existing.expires_at > now + buffer) {
    // Token sigue vigente
    return existing;
  }

  // Si no tenemos token en la tabla, usamos el que pusiste en .env
  const initialRefreshToken = process.env.MELI_REFRESH_TOKEN;
  const refreshToken = existing?.refresh_token || initialRefreshToken;

  if (!refreshToken) {
    throw new Error('No hay refresh_token disponible (ni en DB ni en MELI_REFRESH_TOKEN)');
  }

  const newToken = await requestNewAccessToken(refreshToken);
  await saveToken(newToken);
  return newToken;
}

/**
 * Helper para obtener siempre un access_token válido.
 */
export async function getValidAccessToken(): Promise<string> {
  const token = await refreshAccessToken();
  return token.access_token;
}
