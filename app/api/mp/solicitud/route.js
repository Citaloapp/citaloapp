import { NextResponse } from 'next/server';
import { getSolicitudByPreapprovalId } from '@/lib/sheets';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const preapproval_id = searchParams.get('preapproval_id');

  if (!preapproval_id) {
    return NextResponse.json({ error: 'Falta preapproval_id' }, { status: 400 });
  }

  // Buscar en MP el external_reference de este preapproval
  const mpRes = await fetch(`https://api.mercadopago.com/preapproval/${preapproval_id}`, {
    headers: { 'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}` },
  });

  if (!mpRes.ok) {
    return NextResponse.json({ error: 'Preapproval no encontrado' }, { status: 404 });
  }

  const preapproval = await mpRes.json();
  const solicitudId = preapproval.external_reference;

  if (!solicitudId) {
    return NextResponse.json({ error: 'Sin external_reference' }, { status: 404 });
  }

  // Buscar la solicitud en Sheets
  const { getSolicitudById } = await import('@/lib/sheets');
  const solicitud = await getSolicitudById(solicitudId);

  if (!solicitud) {
    return NextResponse.json({ error: 'Solicitud no encontrada' }, { status: 404 });
  }

  return NextResponse.json(solicitud);
}
