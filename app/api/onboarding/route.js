import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { crearSolicitud } from '@/lib/sheets';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
    const foto = formData.get('foto');

    if (!nombre || !especialidad || !telefono || !email) {
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
      descripcion, obras_sociales, duracion_turno, color_marca, foto_url,
    });

    if (process.env.N8N_WEBHOOK_URL) {
      fetch(process.env.N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'onboarding',
          ...solicitud,
        }),
      }).catch(err => console.error('[onboarding] n8n webhook falló:', err?.message));
    }

    return NextResponse.json({ success: true, id: solicitud.id });
  } catch (err) {
    console.error('[onboarding] ERROR:', err?.message || err);
    return NextResponse.json({ error: 'Error al enviar la solicitud' }, { status: 500 });
  }
}
