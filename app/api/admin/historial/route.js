import { NextResponse } from 'next/server';
import { crearEntradaHistorial, getHistorialByPaciente } from '@/lib/sheets';

function checkAuth(request) {
  return request.headers.get('x-admin-password') === process.env.ADMIN_PASSWORD;
}

export async function GET(request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const telefono = searchParams.get('telefono');
    if (!slug || !telefono) {
      return NextResponse.json({ error: 'slug y telefono son requeridos' }, { status: 400 });
    }
    const historial = await getHistorialByPaciente(telefono, slug);
    return NextResponse.json({ historial });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

export async function POST(request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { profesional_slug, paciente_telefono, paciente_nombre, nota, fecha } = body;
    if (!profesional_slug || !paciente_telefono || !nota) {
      return NextResponse.json(
        { error: 'profesional_slug, paciente_telefono y nota son requeridos' },
        { status: 400 }
      );
    }
    const entrada = await crearEntradaHistorial({
      profesional_slug, paciente_telefono, paciente_nombre, nota, fecha,
    });
    return NextResponse.json({ entrada });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
