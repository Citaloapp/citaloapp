import { NextResponse } from 'next/server';
import { crearServicio } from '@/lib/sheets';

function checkAuth(request) {
  return request.headers.get('x-admin-password') === process.env.ADMIN_PASSWORD;
}

export async function POST(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  try {
    const body = await request.json();
    const { profesional_slug, nombre, duracion_minutos } = body;
    if (!profesional_slug || !nombre || !duracion_minutos) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }
    const servicio = await crearServicio(body);
    return NextResponse.json({ servicio });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
