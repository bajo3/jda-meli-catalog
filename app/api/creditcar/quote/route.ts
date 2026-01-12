import { NextResponse } from 'next/server';

function asNumber(x: any): number | null {
  if (x == null) return null;
  const n =
    typeof x === 'number'
      ? x
      : Number(String(x).replace(/[^0-9.,-]/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const price = asNumber(body.price);
    const amountToFinance = asNumber(body.amountToFinance);

    // En Creditcar tu parámetro es "modelo" (ej: 2018). Aceptamos varios nombres por compatibilidad.
    const modelo =
      asNumber(body.modelo) ??
      asNumber(body.year) ??
      asNumber(body.vehicleYear) ??
      asNumber(body.autoYear);

    if (price == null || price <= 0) {
      return NextResponse.json({ ok: false, error: 'Precio inválido.' }, { status: 400 });
    }
    if (amountToFinance == null || amountToFinance < 0) {
      return NextResponse.json({ ok: false, error: 'Monto a financiar inválido.' }, { status: 400 });
    }
    if (modelo == null || modelo < 1900) {
      return NextResponse.json({ ok: false, error: 'Modelo/año inválido.' }, { status: 400 });
    }

    // Regla comercial: máximo 40% financiado => entrega mínima 60%
    const maxFinance = price * 0.4;
    if (amountToFinance > maxFinance + 0.01) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Entrega mínima 60% (financiación máxima 40% del valor del vehículo).',
          limits: { maxFinance, minDownPayment: price - maxFinance },
        },
        { status: 400 },
      );
    }

    const base = process.env.CREDITCAR_API_URL;
    if (!base) {
      return NextResponse.json(
        { ok: false, error: 'Falta configurar CREDITCAR_API_URL en el entorno.' },
        { status: 500 },
      );
    }

    // Creditcar real: GET {base}?monto=...&modelo=...
    const url = new URL(base);
    url.searchParams.set('monto', String(Math.round(amountToFinance)));
    url.searchParams.set('modelo', String(Math.round(modelo)));

    const headers: Record<string, string> = {
      Accept: 'application/json',
      'User-Agent': 'Mozilla/5.0',
    };

    const apiKey = process.env.CREDITCAR_API_KEY;
    if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

    const resp = await fetch(url.toString(), {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    // Parse robusto (si Creditcar devuelve texto/HTML, lo vemos en el error)
    const text = await resp.text();
    let data: any = null;
    try {
      data = JSON.parse(text);
    } catch {
      data = { rawText: text?.slice(0, 500) };
    }

    if (!resp.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Error en Creditcar.',
          creditcar: {
            status: resp.status,
            url: url.toString(),
            data,
          },
        },
        { status: 502 },
      );
    }

    // Normalización (soporta varias formas)
    const raw = Array.isArray(data)
      ? data
      : Array.isArray(data?.quote?.raw)
        ? data.quote.raw
        : Array.isArray(data?.raw)
          ? data.raw
          : Array.isArray(data?.options)
            ? data.options
            : [];

    // SOLO estos plazos
    const allowed = new Set([6, 12, 18, 24]);

    const options = (Array.isArray(raw) ? raw : [])
      .map((it: any) => ({
        plazo: asNumber(it?.plazo ?? it?.term ?? it?.months),
        cuota: asNumber(it?.cuota ?? it?.payment ?? it?.installment),
        inclusion: asNumber(it?.inclusion) ?? 0,
      }))
      .filter((x: any) => x.plazo != null && x.cuota != null && allowed.has(Number(x.plazo)))
      .sort((a: any, b: any) => Number(a.plazo) - Number(b.plazo))
      .map((x: any) => ({
        plazo: Number(x.plazo),
        cuota: String(x.cuota),
        inclusion: Number(x.inclusion ?? 0),
      }));

    return NextResponse.json({
      ok: true,
      price,
      amountToFinance,
      modelo,
      options,
      summaryText: data?.quote?.summaryText ?? data?.summaryText ?? null,
    });
  } catch (error: any) {
    console.error('Creditcar quote ERROR:', error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
