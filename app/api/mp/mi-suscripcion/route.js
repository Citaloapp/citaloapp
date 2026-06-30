import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const res = await fetch(
    'https://api.mercadopago.com/preapproval/search?external_reference=SOL-1782606292206',
    { headers: { 'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}` } }
  );
  const data = await res.json();
  return NextResponse.json(data);
}
