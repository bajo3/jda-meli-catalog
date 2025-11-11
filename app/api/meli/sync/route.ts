import { NextResponse } from 'next/server';
import { fetchAndStoreVehicles } from '@/lib/fetchVehicles';

export async function GET() {
  try {
    const result = await fetchAndStoreVehicles();
    console.log('Sync MELI OK:', result);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error('Sync MELI ERROR:', error);
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 500 },
    );
  }
}
