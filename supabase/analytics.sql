-- supabase/analytics.sql
-- Panel interno de analítica (GA4-like, pero propio) para JDA
-- Incluye: KPIs, top autos, conversiones, WhatsApp por número, CTAs por ubicación, fuentes UTM, referrers y embudo.
--
-- Cómo usar:
-- 1) Supabase -> SQL Editor
-- 2) Pegá y ejecutá este script (se puede correr varias veces)

begin;

-- Tabla de eventos (log crudo)
create table if not exists public.analytics_events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  event_type text not null,
  path text null,
  session_id text null,
  vehicle_id text null,
  vehicle_slug text null,
  phone text null,
  location text null,
  referrer text null,
  utm_source text null,
  utm_medium text null,
  utm_campaign text null,
  user_agent text null,
  ip_hash text null,
  meta jsonb not null default '{}'::jsonb
);

-- Índices
create index if not exists analytics_events_created_at_idx
  on public.analytics_events (created_at desc);

create index if not exists analytics_events_event_type_idx
  on public.analytics_events (event_type);

create index if not exists analytics_events_vehicle_id_idx
  on public.analytics_events (vehicle_id);

create index if not exists analytics_events_session_id_idx
  on public.analytics_events (session_id);

create index if not exists analytics_events_phone_idx
  on public.analytics_events (phone);

create index if not exists analytics_events_location_idx
  on public.analytics_events (location);

create index if not exists analytics_events_utm_idx
  on public.analytics_events (utm_source, utm_medium, utm_campaign);

-- Seguridad: solo server (service role) puede escribir/leer
alter table public.analytics_events enable row level security;

-- (Sin policies) => el cliente público no puede leer/escribir.
-- El sitio inserta con SUPABASE_SERVICE_ROLE_KEY desde /api/analytics/track.

-- =========================
-- KPI / SUMMARY
-- =========================
create or replace function public.analytics_summary(p_start timestamptz, p_end timestamptz)
returns table(
  page_views bigint,
  vehicle_views bigint,
  whatsapp_clicks bigint,
  call_clicks bigint,
  maps_clicks bigint,
  share_clicks bigint,
  sessions bigint
)
language sql
stable
as $$
  select
    count(*) filter (where event_type = 'page_view')::bigint as page_views,
    count(*) filter (where event_type = 'vehicle_view')::bigint as vehicle_views,
    count(*) filter (where event_type = 'whatsapp_click')::bigint as whatsapp_clicks,
    count(*) filter (where event_type = 'call_click')::bigint as call_clicks,
    count(*) filter (where event_type = 'maps_click')::bigint as maps_clicks,
    count(*) filter (where event_type = 'share_click')::bigint as share_clicks,
    count(distinct session_id) filter (where session_id is not null)::bigint as sessions
  from public.analytics_events
  where created_at >= p_start
    and created_at <  p_end;
$$;

-- =========================
-- TOP VEHICLES + CONVERSIONES
-- (views, clicks, sesiones, tasa)
-- =========================
create or replace function public.analytics_top_vehicles(p_start timestamptz, p_end timestamptz, p_limit int default 10)
returns table(
  vehicle_id text,
  title text,
  slug text,
  views bigint,
  whatsapp_clicks bigint,
  sessions_viewed bigint,
  sessions_whatsapp bigint,
  conv_click_rate double precision,
  conv_session_rate double precision,
  last_view timestamptz
)
language sql
stable
as $$
  with views as (
    select
      ae.vehicle_id,
      max(ae.vehicle_slug) as any_slug,
      count(*)::bigint as views,
      count(distinct ae.session_id)::bigint as sessions_viewed,
      max(ae.created_at) as last_view
    from public.analytics_events ae
    where ae.event_type = 'vehicle_view'
      and ae.vehicle_id is not null
      and ae.created_at >= p_start
      and ae.created_at <  p_end
    group by ae.vehicle_id
  ),
  wac as (
    select
      ae.vehicle_id,
      count(*)::bigint as whatsapp_clicks,
      count(distinct ae.session_id)::bigint as sessions_whatsapp
    from public.analytics_events ae
    where ae.event_type = 'whatsapp_click'
      and ae.vehicle_id is not null
      and ae.created_at >= p_start
      and ae.created_at <  p_end
    group by ae.vehicle_id
  )
  select
    v.vehicle_id,
    coalesce(c.title, v.vehicle_id) as title,
    coalesce(c.slug, v.any_slug) as slug,
    v.views,
    coalesce(w.whatsapp_clicks, 0)::bigint as whatsapp_clicks,
    v.sessions_viewed,
    coalesce(w.sessions_whatsapp, 0)::bigint as sessions_whatsapp,
    case when v.views > 0
      then (coalesce(w.whatsapp_clicks,0)::double precision / v.views::double precision)
      else 0 end as conv_click_rate,
    case when v.sessions_viewed > 0
      then (coalesce(w.sessions_whatsapp,0)::double precision / v.sessions_viewed::double precision)
      else 0 end as conv_session_rate,
    v.last_view
  from views v
  left join public.vehicles c
    on c.id = v.vehicle_id
  left join wac w
    on w.vehicle_id = v.vehicle_id
  order by v.views desc, whatsapp_clicks desc
  limit greatest(p_limit, 1);
$$;

-- =========================
-- FUENTES UTM (source/medium/campaign)
-- =========================
create or replace function public.analytics_top_sources(p_start timestamptz, p_end timestamptz, p_limit int default 10)
returns table(
  utm_source text,
  utm_medium text,
  utm_campaign text,
  sessions bigint,
  page_views bigint
)
language sql
stable
as $$
  select
    coalesce(nullif(ae.utm_source, ''), '(direct)') as utm_source,
    coalesce(nullif(ae.utm_medium, ''), '(none)') as utm_medium,
    coalesce(nullif(ae.utm_campaign, ''), '(none)') as utm_campaign,
    count(distinct ae.session_id)::bigint as sessions,
    count(*)::bigint as page_views
  from public.analytics_events ae
  where ae.event_type = 'page_view'
    and ae.created_at >= p_start
    and ae.created_at <  p_end
    and ae.session_id is not null
  group by 1,2,3
  order by sessions desc, page_views desc
  limit greatest(p_limit, 1);
$$;

-- =========================
-- REFERRERS (dominio)
-- =========================
create or replace function public.analytics_top_referrers(p_start timestamptz, p_end timestamptz, p_limit int default 10)
returns table(
  referrer_domain text,
  sessions bigint,
  page_views bigint
)
language sql
stable
as $$
  with pv as (
    select
      ae.session_id,
      ae.referrer
    from public.analytics_events ae
    where ae.event_type = 'page_view'
      and ae.created_at >= p_start
      and ae.created_at <  p_end
      and ae.session_id is not null
  ),
  norm as (
    select
      session_id,
      case
        when referrer is null or referrer = '' then '(direct)'
        else lower(regexp_replace(referrer, '^https?://([^/]+).*$','\1'))
      end as referrer_domain
    from pv
  )
  select
    referrer_domain,
    count(distinct session_id)::bigint as sessions,
    count(*)::bigint as page_views
  from norm
  group by 1
  order by sessions desc, page_views desc
  limit greatest(p_limit, 1);
$$;

-- =========================
-- CTA PERFORMANCE (por ubicación)
-- =========================
create or replace function public.analytics_top_locations(p_start timestamptz, p_end timestamptz, p_limit int default 15)
returns table(
  location text,
  whatsapp_clicks bigint,
  call_clicks bigint,
  maps_clicks bigint,
  share_clicks bigint,
  total_clicks bigint
)
language sql
stable
as $$
  select
    coalesce(nullif(ae.location, ''), '(unknown)') as location,
    count(*) filter (where ae.event_type = 'whatsapp_click')::bigint as whatsapp_clicks,
    count(*) filter (where ae.event_type = 'call_click')::bigint as call_clicks,
    count(*) filter (where ae.event_type = 'maps_click')::bigint as maps_clicks,
    count(*) filter (where ae.event_type = 'share_click')::bigint as share_clicks,
    count(*)::bigint as total_clicks
  from public.analytics_events ae
  where ae.event_type in ('whatsapp_click','call_click','maps_click','share_click')
    and ae.created_at >= p_start
    and ae.created_at <  p_end
  group by 1
  order by total_clicks desc, whatsapp_clicks desc
  limit greatest(p_limit, 1);
$$;

-- =========================
-- WHATSAPP POR NÚMERO
-- =========================
create or replace function public.analytics_whatsapp_by_phone(p_start timestamptz, p_end timestamptz)
returns table(
  phone text,
  clicks bigint,
  sessions bigint
)
language sql
stable
as $$
  select
    coalesce(nullif(ae.phone, ''), '(unknown)') as phone,
    count(*)::bigint as clicks,
    count(distinct ae.session_id)::bigint as sessions
  from public.analytics_events ae
  where ae.event_type = 'whatsapp_click'
    and ae.created_at >= p_start
    and ae.created_at <  p_end
  group by 1
  order by clicks desc, sessions desc;
$$;

-- =========================
-- EMBUDO (sesiones): catálogo -> ficha -> WhatsApp
-- =========================
create or replace function public.analytics_funnel(p_start timestamptz, p_end timestamptz)
returns table(
  catalog_sessions bigint,
  vehicle_sessions bigint,
  whatsapp_sessions bigint
)
language sql
stable
as $$
  with base as (
    select
      ae.session_id,
      bool_or(ae.event_type = 'page_view' and ae.path like '/catalogo%') as saw_catalog,
      bool_or(ae.event_type = 'vehicle_view') as saw_vehicle,
      bool_or(ae.event_type = 'whatsapp_click') as did_whatsapp
    from public.analytics_events ae
    where ae.created_at >= p_start
      and ae.created_at <  p_end
      and ae.session_id is not null
    group by ae.session_id
  )
  select
    count(*) filter (where saw_catalog)::bigint as catalog_sessions,
    count(*) filter (where saw_catalog and saw_vehicle)::bigint as vehicle_sessions,
    count(*) filter (where saw_catalog and saw_vehicle and did_whatsapp)::bigint as whatsapp_sessions
  from base;
$$;

commit;
