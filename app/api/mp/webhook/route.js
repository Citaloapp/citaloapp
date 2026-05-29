import { NextResponse } from 'next/server';
import { getSolicitudById, actualizarEstadoSolicitud, crearProfesionalActivo, guardarPaymentIdSolicitud } from '@/lib/sheets';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://citaloapp.com.ar';

async function procesarPagoAprobado(paymentId) {
  const paymentRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { 'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}` },
  });

  if (!paymentRes.ok) return;
  const payment = await paymentRes.json();

  if (payment.status !== 'approved') return;

  const solicitudId = payment.external_reference;
  if (!solicitudId) return;

  const solicitud = await getSolicitudById(solicitudId);
  if (!solicitud) {
    console.error('[mp/webhook] Solicitud no encontrada:', solicitudId);
    return;
  }

  // Evitar duplicados: mismo payment_id ya procesado
  if (solicitud.payment_id === String(paymentId)) return;

  // Evitar duplicados: solicitud ya activa por otro pago
  if (solicitud.estado === 'activo') return;

  const slug = solicitud.slug_deseado || `prof-${Date.now()}`;

  await crearProfesionalActivo({
    slug,
    nombre: solicitud.nombre,
    especialidad: solicitud.especialidad,
    matricula: solicitud.matricula,
    foto_url: solicitud.foto_url,
    descripcion: solicitud.descripcion,
    telefono_whatsapp: solicitud.telefono,
    calendar_id: '',
    color_marca: solicitud.color_marca,
    obras_sociales: solicitud.obras_sociales,
    duracion_turno_minutos: solicitud.duracion_turno,
  });

  await actualizarEstadoSolicitud(solicitudId, 'activo');
  await guardarPaymentIdSolicitud(solicitudId, String(paymentId));

  if (process.env.N8N_WEBHOOK_URL) {
    fetch(process.env.N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        evento: 'profesional_registrado',
        profesional_nombre: solicitud.nombre,
        profesional_email: solicitud.email,
        profesional_telefono: solicitud.telefono,
        profesional_slug: slug,
        link_turnos: `${BASE_URL}/${slug}`,
        plan: solicitud.plan_elegido,
        fecha_registro: new Date().toISOString(),
      }),
    }).catch(err => console.error('[mp/webhook] n8n webhook falló:', err?.message));
  }

  console.log('[mp/webhook] Profesional creado:', slug);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { type, data } = body;

    if (type === 'payment' && data?.id) {
      await procesarPagoAprobado(data.id);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[mp/webhook] ERROR:', err?.message || err);
    return NextResponse.json({ error: 'Error procesando webhook' }, { status: 500 });
  }
}

// MP también usa GET para notificaciones IPN legacy
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const topic = searchParams.get('topic');
  const id = searchParams.get('id');

  if (topic === 'payment' && id) {
    await procesarPagoAprobado(id).catch(err =>
      console.error('[mp/webhook GET] Error:', err?.message)
    );
  }

  return NextResponse.json({ received: true });
}
