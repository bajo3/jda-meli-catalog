import { createClient } from '@supabase/supabase-js';
import VehicleDetailClient from './VehicleDetailClient';

type PageProps = {
  params: { slug: string };
};

// ⚠️ IMPORTANTE: usamos el ANON KEY para leer (no el service role)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function Page({ params }: PageProps) {
  // Traemos TODAS las columnas de la fila
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('slug', params.slug)
    .maybeSingle();

  if (error) {
    console.error('Error cargando vehículo:', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Error cargando el vehículo
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Vehículo no encontrado
      </div>
    );
  }

  // Debug fuerte del lado del server (se ve en la consola de Node)
  console.log('Vehicle desde Supabase (server):', data);

  return <VehicleDetailClient vehicle={data} />;
}
