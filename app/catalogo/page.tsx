// app/catalogo/page.tsx
import { createClient } from '@supabase/supabase-js';
import CatalogoClient from './CatalogoClient';

// Always render fresh data so the catalog stays updated.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export type Vehicle = {
  id: string;
  title: string;
  brand: string | null;
  year: number | null;
  price: number | null;
  slug: string | null;
  pictures: string[] | null;
  permalink: string | null;
};

export default async function CatalogoPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local');
  }

  const supabase = createClient(supabaseUrl, anonKey);

  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .order('price', { ascending: true });

  if (error) {
    console.error('Error al leer vehicles:', error);
    throw new Error('No se pudieron cargar los vehículos');
  }

  const vehicles = (data ?? []) as Vehicle[];

  return <CatalogoClient vehicles={vehicles} />;
}
