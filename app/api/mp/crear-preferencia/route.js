import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { crearSolicitud } from '@/lib/sheets';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://citaloapp.com.ar';

const PRECIOS_PLANES = {
  'Plan Profesional': 17999,
  'Plan Consultorio': 39999,
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
    const foto = formData.get('foto');

    if (!nombre || !especialidad || !telefono || !email || !plan_elegido) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
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
      foto_url, servicios, slug_deseado, plan_elegido,
      estado: 'pendiente_pago',
    });

    const precioUnitario = PRECIOS_PLANES[plan_elegido] || 10000;

    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        items: [{
          title: `Citalo — Plan ${plan_elegido}`,
          quantity: 1,
          currency_id: 'ARS',
          unit_price: precioUnitario,
        }],
        payer: { email },
        back_urls: {
          success: `${BASE_URL}/onboarding/success?solicitud_id=${solicitud.id}`,
          failure: `${BASE_URL}/onboarding/failure?solicitud_id=${solicitud.id}`,
          pending: `${BASE_URL}/onboarding/success?solicitud_id=${solicitud.id}`,
        },
        auto_return: 'approved',
        external_reference: solicitud.id,
        notification_url: `${BASE_URL}/api/mp/webhook`,
      }),
    });

    if (!mpRes.ok) {
      const mpErr = await mpRes.json();
      console.error('[mp/crear-preferencia] Error MP:', mpErr);
      return NextResponse.json({ error: 'Error al crear preferencia de pago' }, { status: 500 });
    }

    const mpData = await mpRes.json();

    return NextResponse.json({ init_point: mpData.init_point, solicitud_id: solicitud.id });
  } catch (err) {
    console.error('[mp/crear-preferencia] ERROR:', err?.message || err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
