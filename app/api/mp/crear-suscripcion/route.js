import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { crearSolicitud } from '@/lib/sheets';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const dynamic = 'force-dynamic';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://citaloapp.com.ar';

const PREAPPROVAL_PLAN_IDS = {
  'Plan Profesional': 'a0ae01368917415999d6edf57971b1fa',
  'Plan Consultorio': '2f78e4ba04b947f1ab7a08e5c6556c40',
};

export async function POST(request) {
  try {
    const formData = await request.formData();
    const nombre = formData.get('nombre') || '';
    const especialidad = formData.get('especialidad') || '';
    const matricula = formData.get('matricula') || '';
    const telefono = formData.get('telefono') || '';
    const email = formData.get('email') || '';
    const descripcion = formData.get('descripcion') || '';
    const obras_sociales = formData.get('obras_sociales') || '';
    const duracion_turno = formData.get('duracion_turno') || '30';
    const color_marca = formData.get('color_marca') || '#0ea5e9';
    const servicios = formData.get('servicios') || '[]';
    const slug_deseado = formData.get('slug_deseado') || '';
    const plan_elegido = formData.get('plan_elegido') || '';
    const horarios = formData.get('horarios') || '';
    const card_token_id = formData.get('card_token_id') || '';
    const foto = formData.get('foto');

    if (!nombre || !especialidad || !telefono || !email || !plan_elegido) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    if (!card_token_id) {
      return NextResponse.json({ error: 'Faltan datos de la tarjeta' }, { status: 400 });
    }

    const preapprovalPlanId = PREAPPROVAL_PLAN_IDS[plan_elegido];
    if (!preapprovalPlanId) {
      return NextResponse.json({ error: 'Plan no válido' }, { status: 400 });
    }

    let foto_url = '';
    if (foto && foto.size > 0) {
      const bytes = await foto.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: 'citaloapp/solicitudes', transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }] },
          (error, res) => { if (error) reject(error); else resolve(res); }
        ).end(buffer);
      });
      foto_url = result.secure_url;
    }

    const solicitud = await crearSolicitud({
      nombre, especialidad, matricula, telefono, email,
      descripcion, obras_sociales, duracion_turno, color_marca,
      foto_url, servicios, slug_deseado, plan_elegido, horarios,
      estado: 'pendiente_pago',
    });

    const mpRes = await fetch('https://api.mercadopago.com/preapproval', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        preapproval_plan_id: preapprovalPlanId,
        reason: `Citalo — Plan ${plan_elegido}`,
        external_reference: solicitud.id,
        payer_email: email,
        card_token_id: card_token_id,
        status: 'authorized',
        back_url: `${BASE_URL}/onboarding/success?solicitud_id=${solicitud.id}`,
      }),
    });

    if (!mpRes.ok) {
      const mpErr = await mpRes.json();
      console.error('[mp/crear-suscripcion] Error MP:', mpErr);
      return NextResponse.json({ error: mpErr.message || 'Error al crear la suscripción' }, { status: 500 });
    }

    const mpData = await mpRes.json();
    return NextResponse.json({ init_point: mpData.init_point, solicitud_id: solicitud.id, status: mpData.status });
  } catch (err) {
    console.error('[mp/crear-suscripcion] ERROR:', err?.message || err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
