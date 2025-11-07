import { createClient } from '@supabase/supabase-js';
import Image from 'next/image';

/**
 * Catalogue page
 *
 * This page reads the list of vehicles from Supabase and renders
 * them in a responsive grid.  It runs entirely on the server so
 * sensitive environment variables remain private.  Make sure to
 * configure `NEXT_PUBLIC_SUPABASE_URL` and
 * `NEXT_PUBLIC_SUPABASE_ANON_KEY` in your `.env.local` so that
 * client‑side code can access Supabase if needed.  The anonymous
 * key is safe to expose because it has limited privileges and is
 * subject to row level security rules【296182528277160†L178-L210】.
 */
export default async function CatalogoPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, anonKey);
  const { data: vehicles, error } = await supabase.from('vehicles').select('*').order('price');
  if (error) {
    throw new Error(error.message);
  }
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Catálogo de Vehículos</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles?.map((vehicle) => (
          <a key={vehicle.id} href={`/${vehicle.slug}`} className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition">
            {vehicle.pictures && vehicle.pictures.length > 0 ? (
              <Image
                src={vehicle.pictures[0]}
                alt={vehicle.title}
                width={400}
                height={300}
                className="object-cover w-full h-48"
              />
            ) : (
              <div className="w-full h-48 bg-gray-200" />
            )}
            <div className="p-4">
              <h2 className="font-semibold text-lg mb-2">{vehicle.title}</h2>
              <p className="text-sm text-gray-600">{vehicle.brand || 'Sin marca'} • {vehicle.year || 'Sin año'}</p>
              {vehicle.price !== null && (
                <p className="text-xl font-bold mt-2">${vehicle.price.toLocaleString('es-AR')}</p>
              )}
            </div>
          </a>
        ))}
      </div>
    </main>
  );
}