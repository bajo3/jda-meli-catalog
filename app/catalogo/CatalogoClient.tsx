// app/catalogo/CatalogoClient.tsx
'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Vehicle } from '../catalogo/page';
import FilterDock from '@/components/FilterDock';
import { SkeletonGrid } from '@/components/Skeleton';
import ResultStats from '@/components/ResultStats';
import SortMenu from '@/components/SortMenu';
import FilterChips, { QuickFilters } from '@/components/FilterChips';
import FilterSheet, { AdvancedFilters } from '@/components/FilterSheet';
import VehicleCard from '@/components/VehicleCard';
import { formatVehiclePrice } from '@/lib/vehiclePrice';

type Props = { vehicles: Vehicle[] };

export default function CatalogoClient({ vehicles }: Props) {
  const router = useRouter();
  // ===== estado base
  const [search, setSearch] = useState('');
  const [brand, setBrand] = useState<'all' | string>('all');

  // orden + vista + densidad
  const [sort, setSort] = useState<'price-asc' | 'price-desc' | 'year-desc' | 'km-asc' | 'recent'>('price-asc');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [density, setDensity] = useState<'comfy' | 'compact'>('comfy');

  // filtros rápidos
  const [quick, setQuick] = useState<QuickFilters>({});

  // filtros avanzados
  const [adv, setAdv] = useState<AdvancedFilters>({
    transmission: new Set(),
    fuel: new Set(),
    state: new Set(['disponible']),
  });
  const [openSheet, setOpenSheet] = useState(false);

  // transición para shimmer
  const [isPending, startTransition] = useTransition();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 300);
    return () => clearTimeout(t);
  }, []);

  // Keep the catalog fresh while the user is browsing (no manual refresh needed).
  // This re-renders the Server Component and pulls the latest vehicles from Supabase.
  useEffect(() => {
    const refresh = () => {
      startTransition(() => {
        router.refresh();
      });
    };

    const onVisibility = () => {
      if (document.visibilityState === 'visible') refresh();
    };

    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', onVisibility);

    // Also refresh periodically so the catalog stays updated even if the user stays on the page.
    const interval = window.setInterval(refresh, 60_000);

    return () => {
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', onVisibility);
      window.clearInterval(interval);
    };
  }, [router, startTransition]);
  const showSkeleton = !ready || isPending;

  // marcas únicas
  const brands = useMemo(() => {
    const set = new Set<string>();
    for (const v of vehicles) if (v.brand) set.add(v.brand);
    return Array.from(set).sort();
  }, [vehicles]);

  // aplicar filtros
  const filtered = useMemo(() => {
    let list = vehicles.slice();

    // búsqueda
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((v) => `${v.title ?? ''} ${v.brand ?? ''}`.toLowerCase().includes(q));
    }

    // marca
    if (brand !== 'all') list = list.filter((v) => v.brand === brand);

    // quick filters
    list = list.filter((v) => {
      const year = v.year ?? 0;
      const km = (v as any).Km ?? (v as any).km ?? 0;
      const fuel = (v as any).Combustible ?? (v as any).fuel ?? (v as any).fuel_type ?? '';
      const caja = (v as any).Caja ?? (v as any).transmission ?? '';
      const state = (v as any).state ?? 'disponible';

      if (quick.used && (v as any).estado !== 'USADO') return false;
      if (quick.zeroKm && (v as any).estado !== '0KM' && year !== new Date().getFullYear()) return false;
      if (quick.automatic && !/autom/i.test(String(caja))) return false;
      if (quick.fuelNafta && !/nafta|gasolina/i.test(String(fuel))) return false;
      if (quick.fuelDiesel && !/diesel|di[eé]sel/i.test(String(fuel))) return false;
      if (quick.kmMax != null && km && km > quick.kmMax) return false;
      if (quick.yearMin != null && year && year < quick.yearMin) return false;

      // advanced
      const price = v.price ?? 0;
      if (adv.priceMin != null && price < adv.priceMin) return false;
      if (adv.priceMax != null && price > adv.priceMax) return false;
      if (adv.yearMin != null && year && year < adv.yearMin) return false;
      if (adv.yearMax != null && year && year > adv.yearMax) return false;
      if (adv.kmMax != null && km && km > adv.kmMax) return false;
      if (adv.transmission.size && ![...adv.transmission].some(t => new RegExp(t, 'i').test(String(caja)))) return false;
      if (adv.fuel.size && ![...adv.fuel].some(f => new RegExp(f, 'i').test(String(fuel)))) return false;
      if (adv.state.size && !adv.state.has(state)) return false;

      return true;
    });

    // sort
    list.sort((a, b) => {
      const pa = a.price ?? 0; const pb = b.price ?? 0;
      const ya = a.year ?? 0; const yb = b.year ?? 0;
      const kma = (a as any).Km ?? (a as any).km ?? 0;
      const kmb = (b as any).Km ?? (b as any).km ?? 0;

      switch (sort) {
        case 'price-asc': return pa - pb;
        case 'price-desc': return pb - pa;
        case 'year-desc': return yb - ya;
        case 'km-asc': return kma - kmb;
        case 'recent': return (b as any).created_at?.localeCompare?.((a as any).created_at ?? '') ?? 0;
        default: return 0;
      }
    });

    return list;
  }, [vehicles, search, brand, quick, adv, sort]);

  // helpers
  const activeAdvCount =
    (adv.priceMin ? 1 : 0) +
    (adv.priceMax ? 1 : 0) +
    (adv.yearMin ? 1 : 0) +
    (adv.yearMax ? 1 : 0) +
    (adv.kmMax ? 1 : 0) +
    adv.transmission.size +
    adv.fuel.size +
    adv.state.size -
    (adv.state.has('disponible') ? 1 : 0);

  const clearAll = () => {
    startTransition(() => {
      setSearch('');
      setBrand('all');
      setSort('price-asc');
      setView('grid');
      setDensity('comfy');
      setQuick({});
      setAdv({ transmission: new Set(), fuel: new Set(), state: new Set(['disponible']) });
    });
  };

  return (
    <main className="min-h-screen bg-[#05030a] text-slate-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 md:py-8">
        {/* Header + acciones */}
        <header className="flex flex-col gap-3 border-b border-fuchsia-700/40 pb-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white md:text-3xl">Catálogo de vehículos</h1>
            <p className="mt-1 text-sm text-slate-400">Catálogo online actualizado.</p>
          </div>

          <div className="flex flex-col gap-2 md:items-end">
            <ResultStats total={filtered.length} activeCount={activeAdvCount} onClear={clearAll} />
            <SortMenu
              sort={sort}
              onSort={(v) => startTransition(() => setSort(v))}
              view={view}
              onView={(v) => setView(v)}
              density={density}
              onDensity={(v) => setDensity(v)}
            />
          </div>
        </header>

        {/* Chips rápidos */}
        <FilterChips value={quick} onChange={(v) => startTransition(() => setQuick(v))} />

        {/* Barra filtros + búsqueda + marca + abrir sheet */}
        <section className="flex flex-col gap-3 rounded-xl bg-[#111118] p-3 shadow-md shadow-black/40 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center">
            <input
              type="text"
              placeholder="Buscar por modelo, marca..."
              value={search}
              onChange={(e) => startTransition(() => setSearch(e.target.value))}
              className="w-full rounded-lg border border-fuchsia-700/40 bg-[#05030a] px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 md:max-w-xs"
            />
            <select
              className="w-full rounded-lg border border-fuchsia-700/40 bg-[#05030a] px-3 py-2 text-sm text-slate-100 outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 md:w-44"
              value={brand}
              onChange={(e) => startTransition(() => setBrand(e.target.value))}
            >
              <option value="all">Todas las marcas</option>
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setOpenSheet(true)}
              className="rounded-lg border border-fuchsia-500 bg-fuchsia-500/10 px-3 py-2 text-sm font-semibold text-fuchsia-200 hover:bg-fuchsia-500/20"
            >
              Filtros
            </button>
          </div>
        </section>

        {/* Grid / Lista */}
        {showSkeleton ? (
          <SkeletonGrid count={12} />
        ) : filtered.length === 0 ? (
          <div className="mt-10 flex flex-col items-center gap-3 py-10">
            <p className="text-sm text-slate-400">No se encontraron vehículos con los filtros.</p>
            <button
              onClick={clearAll}
              className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 hover:bg-white/5"
            >
              Limpiar filtros
            </button>
          </div>
        ) : view === 'grid' ? (
          // GRID — Solo se renderiza si hay resultados
          <section
            className={`grid gap-4 sm:grid-cols-2 ${
              density === 'compact' ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
            }`}
          >
            {filtered.map((v) => {
              const cover = v.pictures?.[0] || '/placeholder-car.jpg';
              const priceFmt = formatVehiclePrice(v.price).text;
              const meta = `${v.brand || '—'}${v.year ? ` · ${v.year}` : ''}`;
              const km = (v as any).Km ?? (v as any).km;
              const fuel = (v as any).Combustible ?? (v as any).fuel ?? (v as any).fuel_type;
              const caja = (v as any).Caja ?? (v as any).transmission;

              const badges = [
                (v as any).estado?.toUpperCase?.(),
                km != null ? `${Number(km).toLocaleString('es-AR')} KM` : null,
                fuel ? String(fuel).toUpperCase() : null,
                caja ? String(caja).toUpperCase() : null,
              ].filter(Boolean) as string[];

              const state = ((v as any).state as 'disponible' | 'reserva' | 'vendido') ?? 'disponible';

              return (
                <div key={v.id}>
                  <VehicleCard
                    title={v.title}
                    href={v.slug ? `/catalogo/${v.slug}` : '#'}
                    cover={cover}
                    price={priceFmt}
                    meta={meta}
                    badges={badges}
                    ribbon={state}
                    dense={density === 'compact'}
                  />
                </div>
              );
            })}
          </section>
        ) : (
          // LISTA — Solo aparece si hay resultados
          <section className="flex flex-col gap-3">
            {filtered.map((v) => {
              const cover = v.pictures?.[0] || '/placeholder-car.jpg';
              const priceFmt = formatVehiclePrice(v.price).text;
              const meta = `${v.brand || '—'}${v.year ? ` · ${v.year}` : ''}`;
              return (
                <Link
                  key={v.id}
                  href={v.slug ? `/catalogo/${v.slug}` : '#'}
                  className="flex gap-3 rounded-xl border border-white/10 bg-[#111118] p-3 hover:bg-white/[0.02]"
                >
                  <div className="relative h-24 w-32 overflow-hidden rounded-lg">
                    <Image src={cover} alt={v.title} fill className="object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-white line-clamp-2">{v.title}</h3>
                      <span className="whitespace-nowrap text-right text-base font-bold text-fuchsia-400">
                        {priceFmt}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{meta}</p>
                  </div>
                </Link>
              );
            })}
          </section>
        )}
      </div>

      {/* Filter Dock (mobile) */}
      <FilterDock visible>
        <button
          onClick={() => setOpenSheet(true)}
          className="rounded-xl border border-fuchsia-500 bg-fuchsia-500/10 px-3 py-1.5 text-xs font-semibold text-fuchsia-200"
        >
          Filtros
        </button>
        <button
          onClick={() => setSort((s) => (s === 'price-asc' ? 'price-desc' : 'price-asc'))}
          className="rounded-xl border border-white/10 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/5"
        >
          {sort === 'price-asc' ? '↑ Precio' : '↓ Precio'}
        </button>
        <div className="relative">
          <select
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="rounded-xl border border-white/10 bg-transparent px-3 py-1.5 text-xs text-slate-200"
          >
            <option value="all">Todas</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setView((v) => (v === 'grid' ? 'list' : 'grid'))}
          className="rounded-xl border border-white/10 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/5"
        >
          {view === 'grid' ? 'Lista' : 'Grid'}
        </button>
      </FilterDock>

      {/* Sheet de filtros avanzados */}
      <FilterSheet
        open={openSheet}
        onOpenChange={setOpenSheet}
        value={adv}
        onChange={setAdv}
        onApply={() => {}}
        onClear={() =>
          setAdv({ transmission: new Set(), fuel: new Set(), state: new Set(['disponible']) })
        }
      />
    </main>
  );
}
